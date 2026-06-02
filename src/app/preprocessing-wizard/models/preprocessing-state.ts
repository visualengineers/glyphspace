import { DataProfile } from './column-statistics';
import { ColumnConfig, CleaningConfig, ProjectionConfig, CleaningResult } from './column-config';
import { DatasetCollection } from '../../shared/interfaces/dataset-collection';

export interface PreprocessingState {
  // Current step (0-5)
  currentStep: number;

  // Data
  rawFileName: string | null;
  dataProfile: DataProfile | null;

  // Configuration
  columnConfigs: Map<string, ColumnConfig>;
  cleaningConfig: CleaningConfig;
  projectionConfig: ProjectionConfig;

  // Results
  cleaningResult: CleaningResult | null;
  processedDataset: DatasetCollection | null;

  // Metadata
  datasetName: string;
  timestamp: string;

  // Glyph property mapping
  glyphFeatures: string[]; // Array of 5 feature names for glyph rays (ordered)
  tooltipFeatures: string[]; // Array of feature names for tooltips
  colorScaleMode: 'continuous' | 'categorical'; // Auto-detected based on color feature data type
  colorScaleId: number; // ID of selected color scale from COLOR_SCALES

  // UI state
  isProcessing: boolean;
  processingProgress: number;
  processingStep: string;
  error: string | null;
}

export interface ProcessingProgress {
  step: string;
  progress: number;
  message: string;
}

export const DEFAULT_CLEANING_CONFIG: CleaningConfig = {
  removeDuplicates: false,
};

export const DEFAULT_PROJECTION_CONFIG: ProjectionConfig = {
  // FastMap is always enabled as primary (runs immediately, O(n) complexity)
  // These are optional background projections:
  enablePCA: true, // PCA runs in background - very fast
  enableIsoMap: true, // IsoMap runs in background - fast, preserves geodesic distances
  enableMDS: false, // MDS runs in background - fast
  enableLLE: false, // LLE runs in background - medium
  enableLTSA: false, // LTSA runs in background - medium
  enableTSNE: false, // t-SNE runs in background (slow)
  enableUMAP: false, // UMAP runs in background (slow)
  enableTriMap: false, // TriMap runs in background - medium
  enableTopoMap: false, // TopoMap runs in background - medium
  enableSammon: false, // Sammon runs in background - medium

  // IsoMap parameters (0 = auto based on dataset size)
  isomapNeighbors: 0,

  // LLE parameters (0 = auto)
  lleNeighbors: 0,

  // LTSA parameters (0 = auto)
  ltsaNeighbors: 0,

  // t-SNE parameters
  tsnePerplexity: 30,
  tsneIterations: 1000,

  // UMAP parameters
  umapNeighbors: 15,
  umapMinDist: 0.1,

  // TriMap parameters
  trimapWeightAdj: 500,
};
