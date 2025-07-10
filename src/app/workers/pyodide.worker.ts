/// <reference lib="webworker" />

import { DatasetCollection } from '../shared/interfaces/dataset-collection';
import { WorkerReply, WorkerRequest } from '../shared/interfaces/pyodide-messages';

// -- Load Pyodide from CDN --

// @ts-ignore
const pyodideModule = await import('https://cdn.jsdelivr.net/pyodide/v0.28.0/full/pyodide.mjs');

const pyodideReady = (async () => {
  const pyodide = await pyodideModule.loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.28.0/full/'
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
            const pyCode = await fetch('/assets/processor.py').then(res => res.text());
            pyodide.FS.writeFile('processor.py', pyCode);
          }

          const dataset: DatasetCollection = await pyodide.runPythonAsync(`
            import json, processor
            processor.process_csv_file("${fileName}")
          `).then(JSON.parse);

          postMessage(<WorkerReply>{ type: 'processed', dataset });
          break;
        }
        case 'getJson': {
          const { file } = ev.data;
          const text = pyodide.FS.readFile(file, { encoding: 'utf8' });
          postMessage(<WorkerReply>{ type: 'json', file, data: JSON.parse(text) });
          break;
        }
        case "unzip": {
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

            // ✅ Ensure the directory now exists
            if (!(pyodide.FS as any).analyzePath(`/${zipName}`).exists) {
              throw new Error(`Unpack failed: folder /${zipName} not found`);
            }

            const files = (pyodide.FS as any).readdir(`/${zipName}`);
            const images = files.filter((f: string) =>
              /\.(png|jpe?g|webp)$/i.test(f)
            );

            postMessage({ type: "unzipped", folder: zipName, images });

          } catch (err: any) {
            postMessage({ type: "error", message: `Unzip failed: ${err.message}` });
          }
          break;
        }
        case "getThumb": {
          const filePath = ev.data.file;
          try {
            const data = (pyodide.FS as any).readFile(`/${filePath}`, { encoding: 'binary' });
            postMessage({
              type: "thumb",
              file: filePath,
              data: data.buffer
            }, [data.buffer]);
          } catch (err: any) {
            postMessage({ type: "error", message: `Thumbnail error: ${err.message}` });
          }
          break;
        }
      }
    } catch (err: any) {
      postMessage(<WorkerReply>{ type: 'error', message: err.message ?? String(err) });
    }
  });
};
