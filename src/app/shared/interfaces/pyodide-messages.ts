import { DatasetCollection } from './dataset-collection';

export type WorkerRequest =
  | { type: "process"; fileName: string; buffer: ArrayBuffer }
  | { type: "getJson"; file: string }
  | { type: "unzip"; fileName: string; buffer: ArrayBuffer }
  | { type: "getThumb"; file: string };

export type WorkerReply =
  | { type: "processed"; dataset: DatasetCollection }
  | { type: "json"; file: string; data: any }
  | { type: "unzipped"; folder: string; images: string[] }
  | { type: "thumb"; file: string; data: ArrayBuffer }
  | { type: "error"; message: string };