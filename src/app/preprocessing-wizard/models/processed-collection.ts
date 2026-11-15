/** A projection position as computed on the main thread. */
export interface ProjectionPosition {
  id: string | number;
  x: number;
  y: number;
}

/** A dataset of the processed collection, as far as the wizard uses it. */
export interface ProcessedDataset {
  positions?: Record<string, { id: string; position: { x: number; y: number } }[]>;
}

/**
 * What the worker's processWithConfig returns: a collection with the processed
 * dataset (schema, meta, features; positions are added on the main thread).
 * The dashboard reads the dataset itself through DataLoaderService.
 */
export interface ProcessedCollection {
  selectedDataset?: string;
  datasets?: Record<string, ProcessedDataset | undefined>;
}

/** The collection's selected (or first) dataset, or undefined when it has none. */
export function processedDatasetOf(collection: ProcessedCollection): ProcessedDataset | undefined {
  const key = collection.selectedDataset || Object.keys(collection.datasets ?? {})[0];
  return key ? collection.datasets?.[key] : undefined;
}
