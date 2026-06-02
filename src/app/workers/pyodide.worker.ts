/// <reference lib="webworker" />

import { DatasetCollection } from '../shared/interfaces/dataset-collection';
import { WorkerReply, WorkerRequest } from '../shared/interfaces/pyodide-messages';

// -- Load Pyodide from CDN --

// @ts-expect-error -- dynamic ESM import from CDN
const pyodideModule = await import('https://cdn.jsdelivr.net/pyodide/v0.28.0/full/pyodide.mjs');

const pyodideReady = (async () => {
  const pyodide = await pyodideModule.loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.28.0/full/',
  });

  await pyodide.loadPackage('micropip');
  const micropip = pyodide.pyimport('micropip');
  await micropip.install('pandas');
  await micropip.install('scikit-learn');

  return pyodide;
})();

// -- Ensure serialized task execution --
let executionLock = Promise.resolve();
function runSerialized<T>(fn: () => Promise<T>): Promise<T> {
  const prev = executionLock;
  let resolveNext: () => void;
  executionLock = new Promise(res => (resolveNext = res));
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- resolveNext is assigned synchronously in the Promise constructor above
  return prev.then(() => fn().finally(resolveNext!));
}

// -- Web Worker message handler --
self.onmessage = async (ev: MessageEvent<WorkerRequest>) => {
  const pyodide = await pyodideReady;

  runSerialized(async () => {
    try {
      switch (ev.data.type) {
        case 'process': {
          const { fileName, buffer } = ev.data;
          pyodide.FS.writeFile(fileName, new Uint8Array(buffer));

          // Only load processor.py once
          if (!pyodide.FS.analyzePath('processor.py').exists) {
            const pyCode = await fetch('assets/processor.py').then(res => res.text());
            pyodide.FS.writeFile('processor.py', pyCode);
          }

          const dataset: DatasetCollection = await pyodide
            .runPythonAsync(
              `
            import json, processor
            processor.process_csv_file("${fileName}")
          `
            )
            .then(JSON.parse);

          postMessage({ type: 'processed', dataset } as WorkerReply);
          break;
        }
        case 'getJson': {
          const { file } = ev.data;
          const text = pyodide.FS.readFile(file, { encoding: 'utf8' });
          postMessage({ type: 'json', file, data: JSON.parse(text) } as WorkerReply);
          break;
        }
        case 'unzip': {
          const { fileName, buffer } = ev.data;
          const zipName = fileName.replace(/\.zip$/, '');
          const zipPath = `${zipName}.zip`;
          pyodide.FS.writeFile(zipPath, new Uint8Array(buffer));

          try {
            await pyodide.runPythonAsync(`
              import zipfile, os, shutil

              def unpack_flat(zip_path):
                  base = "/" + os.path.splitext(os.path.basename(zip_path))[0]
                  if os.path.exists(base):
                      shutil.rmtree(base)
                  os.mkdir(base)

                  with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                      for member in zip_ref.namelist():
                          if member.endswith('/'): continue
                          source = zip_ref.open(member)
                          target_path = os.path.join(base, os.path.basename(member))
                          with open(target_path, 'wb') as target:
                              shutil.copyfileobj(source, target)
                  print("Unpacked to", base)

              unpack_flat("${zipPath}")
            `);

            // Ensure the directory now exists
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Pyodide FS API has incomplete type definitions
            if (!(pyodide.FS as any).analyzePath(`/${zipName}`).exists) {
              throw new Error(`Unpack failed: folder /${zipName} not found`);
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Pyodide FS API has incomplete type definitions
            const files = (pyodide.FS as any).readdir(`/${zipName}`);
            const images = files.filter((f: string) => /\.(png|jpe?g|webp)$/i.test(f));

            postMessage({ type: 'unzipped', folder: zipName, images });
          } catch (err: unknown) {
            postMessage({
              type: 'error',
              message: `Unzip failed: ${err instanceof Error ? err.message : String(err)}`,
            });
          }
          break;
        }
        case 'getThumb': {
          const filePath = ev.data.file;
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Pyodide FS API has incomplete type definitions
            const data = (pyodide.FS as any).readFile(`/${filePath}`, { encoding: 'binary' });
            postMessage(
              {
                type: 'thumb',
                file: filePath,
                data: data.buffer,
              },
              [data.buffer]
            );
          } catch (err: unknown) {
            postMessage({
              type: 'error',
              message: `Thumbnail error: ${err instanceof Error ? err.message : String(err)}`,
            });
          }
          break;
        }
        case 'profileData': {
          const { fileName, buffer } = ev.data;
          pyodide.FS.writeFile(fileName, new Uint8Array(buffer));

          // Load preprocessing processor if not already loaded
          if (!pyodide.FS.analyzePath('preprocessing_processor.py').exists) {
            const pyCode = await fetch('assets/preprocessing_processor.py').then(res => res.text());
            pyodide.FS.writeFile('preprocessing_processor.py', pyCode);
          }

          const profileJson = await pyodide.runPythonAsync(`
            import preprocessing_processor
            preprocessing_processor.profile_data("${fileName}")
          `);

          const profile = JSON.parse(profileJson);
          profile.fileSize = buffer.byteLength;

          postMessage({ type: 'dataProfile', profile } as WorkerReply);
          break;
        }
        case 'computeHistogram': {
          const { fileName, columnName, bins = 50 } = ev.data;

          const histogramJson = await pyodide.runPythonAsync(`
            import preprocessing_processor
            preprocessing_processor.compute_histogram("${fileName}", "${columnName}", ${bins})
          `);

          const histogram = JSON.parse(histogramJson);

          postMessage({ type: 'histogram', columnName, data: histogram } as WorkerReply);
          break;
        }
        case 'detectOutliers': {
          const { fileName, columnName, method } = ev.data;

          const outliersJson = await pyodide.runPythonAsync(`
            import preprocessing_processor
            preprocessing_processor.detect_outliers("${fileName}", "${columnName}", "${method}")
          `);

          const outliers = JSON.parse(outliersJson);

          postMessage({ type: 'outliers', columnName, data: outliers } as WorkerReply);
          break;
        }
        case 'detectDuplicates': {
          const { fileName, subsetColumns } = ev.data;

          let pythonCode: string;
          if (subsetColumns && subsetColumns.length > 0) {
            const colsJson = JSON.stringify(subsetColumns);
            pythonCode = `
              import preprocessing_processor
              import json
              preprocessing_processor.detect_duplicates("${fileName}", ${colsJson})
            `;
          } else {
            pythonCode = `
              import preprocessing_processor
              preprocessing_processor.detect_duplicates("${fileName}")
            `;
          }

          const duplicatesJson = await pyodide.runPythonAsync(pythonCode);
          const duplicates = JSON.parse(duplicatesJson);

          postMessage({ type: 'duplicates', data: duplicates } as WorkerReply);
          break;
        }
        case 'processWithConfig': {
          const { fileName, config } = ev.data;

          // Load config-based processor if not already loaded
          if (!pyodide.FS.analyzePath('preprocessing_processor_config.py').exists) {
            const pyCode = await fetch('assets/preprocessing_processor_config.py').then(res => res.text());
            pyodide.FS.writeFile('preprocessing_processor_config.py', pyCode);
          }

          // Set up progress reporting
          const configJson = JSON.stringify(config);

          // Create a global callback function that Python can call
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Pyodide globals API has incomplete type definitions
          (pyodide.globals as any).set('sendProgress', (step: string, progress: number, message: string) => {
            postMessage({
              type: 'processingProgress',
              step: step,
              progress: progress,
              message: message,
            });
          });

          // Define progress callback in Python that uses the global function
          await pyodide.runPythonAsync(`
import preprocessing_processor_config

# Create progress callback that calls the JavaScript function
def progress_callback(step, progress, message=''):
    sendProgress(step, progress, message)

preprocessing_processor_config.set_progress_callback(progress_callback)
          `);

          // Process the file with configuration
          // Optimization: Write result to file instead of returning huge string
          const outputFileName = `${fileName}.result.json`;

          await pyodide.runPythonAsync(`
import preprocessing_processor_config
import json

preprocessing_processor_config.process_with_config(
    "${fileName}",
    '''${configJson.replace(/'/g, "\\'")}''',
    "${outputFileName}"
)
          `);

          // Read the result file directly from FS (more memory efficient than passing through Python->JS FFI)
          const resultText = pyodide.FS.readFile(outputFileName, { encoding: 'utf8' });
          const dataset = JSON.parse(resultText);

          postMessage({ type: 'processed', dataset } as WorkerReply);

          // Cleanup: files are no longer needed after processing
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Pyodide FS API has incomplete type definitions
            if ((pyodide.FS as any).analyzePath(fileName).exists) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Pyodide FS API has incomplete type definitions
              (pyodide.FS as any).unlink(fileName);
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Pyodide FS API has incomplete type definitions
            if ((pyodide.FS as any).analyzePath(outputFileName).exists) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Pyodide FS API has incomplete type definitions
              (pyodide.FS as any).unlink(outputFileName);
            }
          } catch (cleanupErr) {
            console.warn('Failed to cleanup files:', cleanupErr);
          }

          break;
        }
        case 'getProcessedFeatures': {
          // Read processed features CSV exported by Python for JavaScript projections
          try {
            const csvText = pyodide.FS.readFile('processed_features.csv', { encoding: 'utf8' });
            postMessage({ type: 'processedFeatures', data: csvText } as WorkerReply);
          } catch (err: unknown) {
            postMessage({
              type: 'error',
              message: `Failed to read processed features: ${err instanceof Error ? err.message : String(err)}`,
            } as WorkerReply);
          }
          break;
        }
      }
    } catch (err: unknown) {
      postMessage({ type: 'error', message: err instanceof Error ? err.message : String(err) } as WorkerReply);
    }
  });
};
