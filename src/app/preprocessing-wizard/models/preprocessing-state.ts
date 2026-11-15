import { DataProfile } from './column-statistics';
import { ColumnConfig, CleaningConfig, ProjectionConfig, CleaningResult } from './column-config';
import { ProcessedCollection } from './processed-collection';

export interface PreprocessingState {
  // Index into WIZARD_STEPS (0 = upload … 5 = review). Resolve it through the
  // step-id helpers in shared/constants/step-info.ts instead of comparing numbers.
  currentStep: number;
  // Furthest step index the user has opened for the current file; the stepper
  // offers the steps up to the one after it (see shared/step-validity.ts).
  furthestStep: number;

  // Data
  // Name of the uploaded file, as the user chose it (shown in the wizard and
  // the base of the dataset name).
  rawFileName: string | null;
  // Name under which the upload is kept in the worker's file system and the
  // file store: the file name, made unique when an upload with that name is
  // still referenced (the undo history may need both).
  uploadKey: string | null;
  dataProfile: DataProfile | null;
  // The settings were restored after a page reload, but the uploaded file could
  // not be put back into the worker: it has to be uploaded again (not persisted).
  uploadMissing: boolean;
  // ZIP archive of item images for the Image glyph type (optional); the file
  // itself is kept in the WizardFileStore under this name.
  thumbnailArchiveName: string | null;

  // Configuration
  columnConfigs: Map<string, ColumnConfig>;
  cleaningConfig: CleaningConfig;
  projectionConfig: ProjectionConfig;

  // Results
  cleaningResult: CleaningResult | null;
  // Result of the last processing run, while it still matches the file and the
  // settings it was computed from: any change to them clears it (see
  // PreprocessingService.adoptProcessingResult). Not persisted.
  processedDataset: ProcessedCollection | null;

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
  // Why the last upload failed. Processing errors belong to the processing run
  // (ProcessingRunService), not to the state.
  error: string | null;
}

export interface ProcessingProgress {
  step: string;
  progress: number;
  message: string;
}

/**
 * A4 – Undo/Redo. Status of the history stack, published so the wizard shell can
 * enable/disable the toolbar buttons and show the concrete next action in the
 * tooltip (e.g. "Undo: Recommended features applied (Ctrl+Z)").
 */
export interface HistoryStatus {
  canUndo: boolean;
  canRedo: boolean;
  undoLabel: string | null; // label of the action that Undo would revert
  redoLabel: string | null; // label of the action that Redo would re-apply
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
};

/** State of a wizard with nothing loaded yet. */
export function createInitialState(): PreprocessingState {
  return {
    currentStep: 0,
    furthestStep: 0,
    rawFileName: null,
    uploadKey: null,
    dataProfile: null,
    uploadMissing: false,
    thumbnailArchiveName: null,
    columnConfigs: new Map(),
    cleaningConfig: { ...DEFAULT_CLEANING_CONFIG },
    projectionConfig: { ...DEFAULT_PROJECTION_CONFIG },
    cleaningResult: null,
    processedDataset: null,
    datasetName: '',
    timestamp: '',
    glyphFeatures: [],
    tooltipFeatures: [],
    colorScaleMode: 'continuous',
    colorScaleId: 0,
    isProcessing: false,
    error: null,
  };
}
