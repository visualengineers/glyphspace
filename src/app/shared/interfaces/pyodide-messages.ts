import { DatasetCollection } from './dataset-collection';

export type WorkerRequest =
  | { type: 'process'; fileName: string; buffer: ArrayBuffer }
  | { type: 'getJson'; file: string }
  | { type: 'unzip'; fileName: string; buffer: ArrayBuffer }
  | { type: 'getThumb'; file: string }
  // Preprocessing requests
  | { type: 'profileData'; fileName: string; buffer: ArrayBuffer }
  | { type: 'computeHistogram'; fileName: string; columnName: string; bins?: number }
  | { type: 'detectOutliers'; fileName: string; columnName: string; method: string }
  | { type: 'detectDuplicates'; fileName: string; subsetColumns?: string[] }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- config is a dynamic processing configuration object
  | { type: 'cleanData'; fileName: string; config: any }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- config is a dynamic processing configuration object
  | { type: 'processWithConfig'; fileName: string; config: any }
  | { type: 'getProcessedFeatures' };

export type WorkerReply =
  | { type: 'processed'; dataset: DatasetCollection }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- JSON data from worker filesystem is dynamically typed
  | { type: 'json'; file: string; data: any }
  | { type: 'unzipped'; folder: string; images: string[] }
  | { type: 'thumb'; file: string; data: ArrayBuffer }
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- cleaning result from Python is dynamically shaped
  | { type: 'dataCleaned'; result: any }
  | { type: 'processingProgress'; step: string; progress: number; message: string }
  | { type: 'processedFeatures'; data: string };
