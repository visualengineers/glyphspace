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
  glyphFeatures: string[];      // Array of 5 feature names for glyph rays (ordered)
  tooltipFeatures: string[];    // Array of feature names for tooltips
  colorScaleMode: 'continuous' | 'categorical';  // Auto-detected based on color feature data type

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
  removeDuplicates: false
};

export const DEFAULT_PROJECTION_CONFIG: ProjectionConfig = {
  enablePCA: true,        // Always enabled - runs first for immediate visualization
  enableFastMap: false,   // NEW: FastMap projection (background)
  enableTSNE: false,
  enableUMAP: false,      // Now available via DruidJS (JavaScript)

  tsnePerplexity: 30,
  tsneIterations: 1000,

  umapNeighbors: 15,
  umapMinDist: 0.1
};
