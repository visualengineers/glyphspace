export interface PositionMap {
  [algorithm: string]: string; // e.g., "pca": "...", "tsne": "..."
}

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
}

export type DatasetCollection = DatasetCollectionEntry[];
