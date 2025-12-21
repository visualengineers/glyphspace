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
  oneHotThreshold: number;
}

export interface ProjectionConfig {
  enablePCA: boolean;
  enableTSNE: boolean;
  enableUMAP: boolean;
  enableEPSG: boolean;

  // t-SNE parameters
  tsnePerplexity: number;
  tsneIterations: number;
  tsneLearningRate: number;

  // UMAP parameters
  umapNeighbors: number;
  umapMinDist: number;
  umapMetric: string;
}

export interface CleaningResult {
  rowsRemoved: number;
  columnsAffected: string[];
  outliersCapped: number;
  missingValuesFilled: number;
}
