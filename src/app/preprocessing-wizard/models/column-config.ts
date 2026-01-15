import {
  DataType,
  EncodingMethod,
  ScalingMethod,
  MissingValueStrategy,
  OutlierStrategy,
  OutlierMethod
} from './data-type.enum';

export interface ColumnConfig {
  name: string;
  originalType: DataType;
  targetType: DataType;

  // Feature processing
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

export interface CleaningConfig {
  removeDuplicates: boolean;
}

export interface ProjectionConfig {
  // IsoMap is always enabled as primary projection (runs immediately)
  // These are optional background projections:
  enablePCA: boolean;         // PCA runs in background
  enableTSNE: boolean;        // t-SNE runs in background (slow)
  enableUMAP: boolean;        // UMAP runs in background (slow)

  // t-SNE parameters (DruidJS)
  tsnePerplexity: number;
  tsneIterations: number;

  // UMAP parameters (DruidJS)
  umapNeighbors: number;
  umapMinDist: number;
}

export interface CleaningResult {
  rowsRemoved: number;
  columnsAffected: string[];
  outliersCapped: number;
  missingValuesFilled: number;
}
