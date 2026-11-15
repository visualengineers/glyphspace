/**
 * Shared projection types used across the application.
 * This is the canonical source for projection-related type definitions.
 */

/**
 * Available projection methods.
 * Used by ProjectionService, projection.worker, and UI components.
 */
export type ProjectionMethod =
  'pca' | 'fastmap' | 'isomap' | 'mds' | 'lle' | 'ltsa' | 'tsne' | 'umap' | 'trimap' | 'topomap' | 'sammon';

/**
 * Result of a projection computation. Item ids are strings, exactly as Python
 * wrote them (an id like "007" must not become 7).
 */
export interface ProjectionResult {
  method: ProjectionMethod;
  positions: { id: string; x: number; y: number }[];
  computeTime: number; // milliseconds
}

/**
 * Configuration options for projection computations.
 */
export interface ProjectionComputeConfig {
  // t-SNE parameters
  perplexity?: number;
  iterations?: number;
  // UMAP parameters
  neighbors?: number;
  minDist?: number;
  // IsoMap, LLE, LTSA parameters
  isomapNeighbors?: number;
  lleNeighbors?: number;
  ltsaNeighbors?: number;
}

/**
 * Request message sent to projection worker.
 */
export interface ProjectionWorkerRequest {
  type: 'compute';
  method: ProjectionMethod;
  features: number[][];
  ids: string[];
  config?: ProjectionComputeConfig;
}

/**
 * Response message from projection worker.
 */
export interface ProjectionWorkerResponse {
  type: 'result' | 'error' | 'progress';
  method?: string;
  positions?: { id: string; x: number; y: number }[];
  computeTime?: number;
  error?: string;
  progress?: number;
  message?: string;
}
