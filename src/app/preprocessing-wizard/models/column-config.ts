import {
  ColumnRole,
  DataType,
  EncodingMethod,
  ScalingMethod,
  MissingValueStrategy,
  OutlierStrategy,
  OutlierMethod,
} from './data-type.enum';

export interface ColumnConfig {
  name: string;
  originalType: DataType;
  targetType: DataType;

  // Feature or metadata (tooltip and search only); see ColumnRole.
  role: ColumnRole;

  // Feature processing (ignored for metadata columns)
  encodingMethod: EncodingMethod;
  scalingMethod: ScalingMethod;
  includeInProjection: boolean;
  isColorFeature: boolean;

  // Data cleaning
  missingValueStrategy: MissingValueStrategy;
  missingValueFillValue?: string;

  outlierMethod: OutlierMethod;
  outlierStrategy: OutlierStrategy;
  outlierCount?: number;

  // UI state
  enabled: boolean;
  hasIssues: boolean;
  issueDescription?: string;
}

/** A selected column that is encoded into features (projection, glyphs, color, filters). */
export function isFeatureColumn(config: Pick<ColumnConfig, 'enabled' | 'role'>): boolean {
  return config.enabled && config.role !== ColumnRole.Metadata;
}

/** A selected column that is only carried along for the tooltip and the text search. */
export function isMetadataColumn(config: Pick<ColumnConfig, 'enabled' | 'role'>): boolean {
  return config.enabled && config.role === ColumnRole.Metadata;
}

export interface CleaningConfig {
  removeDuplicates: boolean;
}

export interface ProjectionConfig {
  // FastMap is always enabled as primary projection (runs immediately)
  // These are optional background projections:
  enablePCA: boolean; // PCA - fast linear projection
  enableIsoMap: boolean; // IsoMap - non-linear manifold, preserves geodesic distances
  enableMDS: boolean; // MDS - classical multidimensional scaling
  enableLLE: boolean; // LLE - locally linear embedding
  enableLTSA: boolean; // LTSA - local tangent space alignment
  enableTSNE: boolean; // t-SNE - preserves local structure (slow)
  enableUMAP: boolean; // UMAP - balances local/global structure (slow)
  enableTriMap: boolean; // TriMap - good for large datasets
  enableTopoMap: boolean; // TopoMap - topology preserving
  enableSammon: boolean; // Sammon mapping

  // IsoMap parameters
  isomapNeighbors: number; // Number of neighbors (default: auto based on dataset size)

  // LLE parameters
  lleNeighbors: number; // Number of neighbors for local reconstruction

  // LTSA parameters
  ltsaNeighbors: number; // Number of neighbors for tangent space

  // t-SNE parameters (DruidJS)
  tsnePerplexity: number;
  tsneIterations: number;

  // UMAP parameters (DruidJS)
  umapNeighbors: number;
  umapMinDist: number;

  // TriMap has no parameters: it runs with DruidJS's defaults.
}

export interface CleaningResult {
  rowsRemoved: number;
  columnsAffected: string[];
  outliersCapped: number;
  missingValuesFilled: number;
}
