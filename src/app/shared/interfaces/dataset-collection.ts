export type PositionMap = Record<string, string>;

export interface AlgorithmData {
  feature: string;
  meta: string;
  schema: string;
  position: PositionMap;
}

export interface DatasetItem {
  algorithms: AlgorithmData;
  time: string; // e.g., "08072025"
}

export interface DatasetCollectionEntry {
  dataset: string;
  source: string;
  items: DatasetItem[];
  /** Bundled datasets: item images are in assets/thumbnails/<dataset>/ (set by tools/process.py). */
  images?: boolean;
}

export type DatasetCollection = DatasetCollectionEntry[];
