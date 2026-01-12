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
  enablePCA: boolean;         // Always enabled, runs first (foreground)
  enableFastMap: boolean;     // NEW: FastMap projection (background)
  enableTSNE: boolean;        // Now runs in JavaScript (background)
  enableUMAP: boolean;        // Now runs in JavaScript (background)

  // t-SNE parameters (DruidJS)
  tsnePerplexity: number;
  tsneIterations: number;

  // UMAP parameters (DruidJS)
  umapNeighbors: number;
  umapMinDist: number;

  // Deprecated/removed parameters:
  // - tsneLearningRate: Not used by DruidJS t-SNE
  // - umapMetric: DruidJS may not support custom metrics
  // - enableEPSG: Not implementing geographic projection
}

export interface CleaningResult {
  rowsRemoved: number;
  columnsAffected: string[];
  outliersCapped: number;
  missingValuesFilled: number;
}
