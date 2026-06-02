/**
 * Shared projection types used across the application.
 * This is the canonical source for projection-related type definitions.
 */

/**
 * Available projection methods.
 * Used by ProjectionService, projection.worker, and UI components.
 */
export type ProjectionMethod =
  | 'pca'
  | 'fastmap'
  | 'isomap'
  | 'mds'
  | 'lle'
  | 'ltsa'
  | 'tsne'
  | 'umap'
  | 'trimap'
  | 'topomap'
  | 'sammon';

/**
 * Result of a projection computation.
 */
export interface ProjectionResult {
  method: ProjectionMethod;
  positions: { id: string | number; x: number; y: number }[];
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
  // TriMap parameters
  trimapWeightAdj?: number;
}

/**
 * Progress update during projection computation.
 */
export interface ProjectionProgress {
  method: ProjectionMethod;
  progress: number; // 0-100
  message?: string;
}

/**
 * Request message sent to projection worker.
 */
export interface ProjectionWorkerRequest {
  type: 'compute';
  method: ProjectionMethod;
  features: number[][];
  ids: (string | number)[];
  config?: ProjectionComputeConfig;
}

/**
 * Response message from projection worker.
 */
export interface ProjectionWorkerResponse {
  type: 'result' | 'error' | 'progress';
  method?: string;
  positions?: { id: string | number; x: number; y: number }[];
  computeTime?: number;
  error?: string;
  progress?: number;
  message?: string;
}
