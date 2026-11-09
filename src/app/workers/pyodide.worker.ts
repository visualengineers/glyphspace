/// <reference lib="webworker" />

import { DatasetCollection } from '../shared/interfaces/dataset-collection';
import { WorkerReply, WorkerRequest } from '../shared/interfaces/pyodide-messages';
import { PyArg, PyodideCallRuntime, pythonCall, runPythonCall, runPythonJson, unpackZipCall } from './pyodide-calls';
import { InputFileRegistry, PyodideFs, assertSafeFileName, resultFileFor } from './pyodide-files';

// -- Load Pyodide from CDN --

/** The Pyodide release loaded from the CDN (single source of truth). */
const PYODIDE_VERSION = '0.29.5';
const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

/** The subset of the Pyodide API this worker uses. */
interface WorkerPyodide extends PyodideCallRuntime {
  FS: PyodideFs & {
    writeFile(path: string, data: Uint8Array | string): void;
    readFile(path: string, options: { encoding: 'utf8' }): string;
    readFile(path: string, options: { encoding: 'binary' }): Uint8Array<ArrayBuffer>;
    readdir(path: string): string[];
  };
  loadPackage(name: string): Promise<unknown>;
  pyimport(name: 'micropip'): { install(name: string): Promise<unknown> };
}

const pyodideReady = (async (): Promise<WorkerPyodide> => {
  const { loadPyodide } = await import(`${PYODIDE_INDEX_URL}pyodide.mjs`);
  const pyodide: WorkerPyodide = await loadPyodide({ indexURL: PYODIDE_INDEX_URL });

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

// A request as received by the worker. Requests sent via DataProcessorService
// carry a `requestId` that every reply to them must echo back, so the main
// thread can match replies to concurrent requests of the same reply type.
type TaggedWorkerRequest = WorkerRequest & { requestId?: number };
type RequestOf<T extends WorkerRequest['type']> = Extract<WorkerRequest, { type: T }>;
type Reply = (message: WorkerReply, transfer?: Transferable[]) => void;

/** Python modules served from src/assets and written to the FS on first use. */
type PythonModule = 'preprocessing_processor' | 'preprocessing_processor_config';

/** Input files written to the FS; pruned on request (see 'pruneFiles'). */
const inputFiles = new InputFileRegistry();

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

async function ensurePythonModule(pyodide: WorkerPyodide, name: PythonModule): Promise<void> {
  const file = `${name}.py`;
  if (pyodide.FS.analyzePath(file).exists) {
    return;
  }
  const response = await fetch(`assets/${file}`);
  if (!response.ok) {
    throw new Error(`Failed to load ${file}: HTTP ${response.status}`);
  }
  pyodide.FS.writeFile(file, await response.text());
}

/** Writes an uploaded file into the FS and remembers it for pruneFiles. */
function writeInputFile(pyodide: WorkerPyodide, fileName: string, buffer: ArrayBuffer): void {
  assertSafeFileName(fileName);
  pyodide.FS.writeFile(fileName, new Uint8Array(buffer));
  inputFiles.track(fileName);
}

async function handleUnzip(
  pyodide: WorkerPyodide,
  { fileName, buffer }: RequestOf<'unzip'>,
  reply: Reply
): Promise<void> {
  const zipName = fileName.replace(/\.zip$/, '');
  const zipPath = `${zipName}.zip`;
  assertSafeFileName(zipPath);
  pyodide.FS.writeFile(zipPath, new Uint8Array(buffer));

  try {
    await runPythonCall(pyodide, unpackZipCall(zipPath));

    // Ensure the directory now exists
    if (!pyodide.FS.analyzePath(`/${zipName}`).exists) {
      throw new Error(`Unpack failed: folder /${zipName} not found`);
    }
    const images = pyodide.FS.readdir(`/${zipName}`).filter(f => /\.(png|jpe?g|webp)$/i.test(f));
    reply({ type: 'unzipped', folder: zipName, images });
  } catch (err: unknown) {
    reply({ type: 'error', message: `Unzip failed: ${errorMessage(err)}` });
  }
}

function handleGetThumb(pyodide: WorkerPyodide, { file }: RequestOf<'getThumb'>, reply: Reply): void {
  try {
    const data = pyodide.FS.readFile(`/${file}`, { encoding: 'binary' });
    reply({ type: 'thumb', file, data: data.buffer }, [data.buffer]);
  } catch (err: unknown) {
    reply({ type: 'error', message: `Thumbnail error: ${errorMessage(err)}` });
  }
}

async function handleProfileData(
  pyodide: WorkerPyodide,
  { fileName, buffer }: RequestOf<'profileData'>,
  reply: Reply
): Promise<void> {
  writeInputFile(pyodide, fileName, buffer);
  await ensurePythonModule(pyodide, 'preprocessing_processor');

  const call = pythonCall('preprocessing_processor', 'profile_data', [fileName]);
  const profile = (await runPythonJson(pyodide, call)) as Record<string, unknown>;
  reply({ type: 'dataProfile', profile: { ...profile, fileSize: buffer.byteLength } });
}

/** Runs one of preprocessing_processor's JSON-returning analysis functions. */
async function runPreprocessing(pyodide: WorkerPyodide, func: string, args: readonly PyArg[]): Promise<unknown> {
  await ensurePythonModule(pyodide, 'preprocessing_processor');
  return runPythonJson(pyodide, pythonCall('preprocessing_processor', func, args));
}

async function handleProcessWithConfig(
  pyodide: WorkerPyodide,
  { fileName, config }: RequestOf<'processWithConfig'>,
  reply: Reply
): Promise<void> {
  assertSafeFileName(fileName);
  // The config module imports the shared outlier detection from preprocessing_processor.
  await ensurePythonModule(pyodide, 'preprocessing_processor');
  await ensurePythonModule(pyodide, 'preprocessing_processor_config');

  // Python reports progress by calling this JS function (passed as data).
  const sendProgress = (step: string, progress: number, message: string): void =>
    reply({ type: 'processingProgress', step, progress, message });
  await runPythonCall(pyodide, pythonCall('preprocessing_processor_config', 'set_progress_callback', [sendProgress]));

  // Write the result to a file instead of returning a huge string through the FFI.
  const outputFileName = resultFileFor(fileName);
  const args = [fileName, JSON.stringify(config), outputFileName];
  await runPythonCall(pyodide, pythonCall('preprocessing_processor_config', 'process_with_config', args));

  const dataset = JSON.parse(pyodide.FS.readFile(outputFileName, { encoding: 'utf8' })) as DatasetCollection;
  reply({ type: 'processed', dataset });

  // Cleanup: only remove the transient result file. The input CSV must stay in
  // the Pyodide FS -- it is written once at upload (profileData) and reused for
  // every (re)processing run, and the app does not retain the raw bytes to
  // re-write it. Deleting it here caused a FileNotFoundError on the second run /
  // reprocess. Obsolete inputs are removed via 'pruneFiles' instead.
  try {
    if (pyodide.FS.analyzePath(outputFileName).exists) {
      pyodide.FS.unlink(outputFileName);
    }
  } catch (cleanupErr) {
    console.warn('Failed to cleanup files:', cleanupErr);
  }
}

function handleGetProcessedFeatures(pyodide: WorkerPyodide, reply: Reply): void {
  // Read processed features CSV exported by Python for JavaScript projections
  try {
    const csvText = pyodide.FS.readFile('processed_features.csv', { encoding: 'utf8' });
    reply({ type: 'processedFeatures', data: csvText });
  } catch (err: unknown) {
    reply({ type: 'error', message: `Failed to read processed features: ${errorMessage(err)}` });
  }
}

async function handleRequest(pyodide: WorkerPyodide, request: WorkerRequest, reply: Reply): Promise<void> {
  switch (request.type) {
    case 'getJson': {
      const text = pyodide.FS.readFile(request.file, { encoding: 'utf8' });
      return reply({ type: 'json', file: request.file, data: JSON.parse(text) });
    }
    case 'unzip':
      return handleUnzip(pyodide, request, reply);
    case 'getThumb':
      return handleGetThumb(pyodide, request, reply);
    case 'profileData':
      return handleProfileData(pyodide, request, reply);
    case 'computeHistogram': {
      const { fileName, columnName, bins = 50 } = request;
      const data = await runPreprocessing(pyodide, 'compute_histogram', [fileName, columnName, bins]);
      return reply({ type: 'histogram', columnName, data });
    }
    case 'detectOutliers': {
      const { fileName, columnName, method } = request;
      const data = await runPreprocessing(pyodide, 'detect_outliers', [fileName, columnName, method]);
      return reply({ type: 'outliers', columnName, data });
    }
    case 'detectDuplicates': {
      const { fileName, subsetColumns } = request;
      const args = subsetColumns && subsetColumns.length > 0 ? [fileName, subsetColumns] : [fileName];
      return reply({ type: 'duplicates', data: await runPreprocessing(pyodide, 'detect_duplicates', args) });
    }
    case 'processWithConfig':
      return handleProcessWithConfig(pyodide, request, reply);
    case 'getProcessedFeatures':
      return handleGetProcessedFeatures(pyodide, reply);
    case 'pruneFiles':
      return reply({ type: 'filesPruned', removed: inputFiles.prune(request.keep, pyodide.FS) });
  }
}

// -- Web Worker message handler --
self.onmessage = (ev: MessageEvent<TaggedWorkerRequest>) => {
  const request = ev.data;
  const reply: Reply = (message, transfer = []) => postMessage({ ...message, requestId: request.requestId }, transfer);

  runSerialized(async () => {
    try {
      await handleRequest(await pyodideReady, request, reply);
    } catch (err: unknown) {
      reply({ type: 'error', message: errorMessage(err) });
    }
  });
};
