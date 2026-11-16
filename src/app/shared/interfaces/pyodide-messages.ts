import { DatasetCollection } from './dataset-collection';

export type WorkerRequest =
  | { type: 'getJson'; file: string }
  // Unpack the image files of a ZIP archive flat into the folder /<folder>
  | { type: 'unzip'; folder: string; buffer: ArrayBuffer }
  // Delete a folder created by 'unzip'
  | { type: 'removeFolder'; folder: string }
  | { type: 'getThumb'; file: string }
  // Write an input file without profiling it (restores the files of a restarted worker)
  | { type: 'putFile'; fileName: string; buffer: ArrayBuffer }
  // Preprocessing requests
  | { type: 'profileData'; fileName: string; buffer: ArrayBuffer }
  | { type: 'computeHistogram'; fileName: string; columnName: string; bins?: number }
  | { type: 'detectOutliers'; fileName: string; columnName: string; method: string }
  | { type: 'detectDuplicates'; fileName: string; subsetColumns?: string[] }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- config is a dynamic processing configuration object
  | { type: 'processWithConfig'; fileName: string; config: any }
  | { type: 'getProcessedFeatures' }
  // Unlink tracked input files (and their derived result files) not listed in `keep`
  | { type: 'pruneFiles'; keep: string[] };

export type WorkerReply =
  // Lifecycle, sent without a requestId: Pyodide and its packages are loaded, or loading failed
  | { type: 'ready' }
  | { type: 'startupFailed'; message: string }
  // Pyodide failed fatally and can't run any further request; the worker must be replaced
  | { type: 'crashed'; message: string }
  // The worker starts handling the request with this requestId (its timeout starts now)
  | { type: 'started' }
  | { type: 'processed'; dataset: DatasetCollection }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- JSON data from worker filesystem is dynamically typed
  | { type: 'json'; file: string; data: any }
  // `duplicates`: archive entries left out because an earlier entry has the same file name
  | { type: 'unzipped'; folder: string; images: string[]; duplicates: string[] }
  | { type: 'folderRemoved'; folder: string }
  | { type: 'thumb'; file: string; data: ArrayBuffer }
  | { type: 'filePut'; fileName: string }
  | { type: 'error'; message: string }
  // Preprocessing replies
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- profile data from Python is dynamically shaped
  | { type: 'dataProfile'; profile: any }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- histogram data from Python is dynamically shaped
  | { type: 'histogram'; columnName: string; data: any }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- outlier data from Python is dynamically shaped
  | { type: 'outliers'; columnName: string; data: any }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- duplicate data from Python is dynamically shaped
  | { type: 'duplicates'; data: any }
  | { type: 'processingProgress'; step: string; progress: number; message: string }
  | { type: 'processedFeatures'; data: string }
  | { type: 'filesPruned'; removed: string[] };
