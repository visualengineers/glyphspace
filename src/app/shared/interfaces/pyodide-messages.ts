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
  | { type: 'cleanData'; fileName: string; config: any }
  | { type: 'processWithConfig'; fileName: string; config: any }
  | { type: 'getProcessedFeatures' };

export type WorkerReply =
  | { type: 'processed'; dataset: DatasetCollection }
  | { type: 'json'; file: string; data: any }
  | { type: 'unzipped'; folder: string; images: string[] }
  | { type: 'thumb'; file: string; data: ArrayBuffer }
  | { type: 'error'; message: string }
  // Preprocessing replies
  | { type: 'dataProfile'; profile: any }
  | { type: 'histogram'; columnName: string; data: any }
  | { type: 'outliers'; columnName: string; data: any }
  | { type: 'duplicates'; data: any }
  | { type: 'dataCleaned'; result: any }
  | { type: 'processingProgress'; step: string; progress: number; message: string }
  | { type: 'processedFeatures'; data: string };
