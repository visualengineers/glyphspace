import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import {
  PreprocessingState,
  ProcessingProgress,
  HistoryStatus,
  DEFAULT_CLEANING_CONFIG,
  DEFAULT_PROJECTION_CONFIG,
} from '../models/preprocessing-state';
import { DataProfile, ColumnStatistics } from '../models/column-statistics';
import { ColumnConfig, CleaningConfig, ProjectionConfig } from '../models/column-config';
import {
  DataType,
  EncodingMethod,
  MissingValueStrategy,
  OutlierStrategy,
  OutlierMethod,
  DATA_TYPE_CONFIG,
} from '../models/data-type.enum';
import { DataProcessorService } from '../../services/data-processor';
import { DataLoaderService } from '../../services/data-loader.service';

/**
 * A4 – Undo/Redo. The subset of PreprocessingState that undo restores. Transient
 * UI fields (currentStep, isProcessing, error, processedDataset, …) are left out
 * so undoing a data-config change never yanks the user to another step or discards
 * an in-flight processing run.
 */
interface HistorySnapshot {
  rawFileName: string | null;
  dataProfile: DataProfile | null;
  columnConfigs: Map<string, ColumnConfig>;
  cleaningConfig: CleaningConfig;
  projectionConfig: ProjectionConfig;
  datasetName: string;
  timestamp: string;
  glyphFeatures: string[];
  tooltipFeatures: string[];
  colorScaleMode: 'continuous' | 'categorical';
  colorScaleId: number;
}

interface HistoryEntry {
  label: string; // human-readable description of the action this snapshot precedes
  snapshot: HistorySnapshot;
}

@Injectable({
  providedIn: 'root',
})
export class PreprocessingService {
  private stateSubject = new BehaviorSubject<PreprocessingState>(this.getInitialState());
  public state$ = this.stateSubject.asObservable();

  private progressSubject = new Subject<ProcessingProgress>();
  public progress$ = this.progressSubject.asObservable();

  // A6: pending scroll anchor id set by the review step's deep-links. The target
  // step component consumes it once after it renders and scrolls into view.
  private scrollTargetSubject = new BehaviorSubject<string | null>(null);

  // ── A4: Undo/Redo history ────────────────────────────────────────────────
  // Full state-snapshot stack over the undoable portion of the preprocessing
  // state. Each completed, state-changing action pushes a snapshot before it
  // runs; undo()/redo() move snapshots between the two stacks and reinstall them.
  private undoStack: HistoryEntry[] = [];
  private redoStack: HistoryEntry[] = [];
  private readonly MAX_HISTORY = 50;

  private historySubject = new BehaviorSubject<HistoryStatus>({
    canUndo: false,
    canRedo: false,
    undoLabel: null,
    redoLabel: null,
  });
  public history$ = this.historySubject.asObservable();

  // Emitted after undo()/redo() reinstall a snapshot so the shell can refresh the
  // currently rendered step (steps read state once in ngOnInit and cache locally).
  private stateRestoredSubject = new Subject<void>();
  public stateRestored$ = this.stateRestoredSubject.asObservable();

  constructor(
    private dataProcessor: DataProcessorService,
    private dataLoader: DataLoaderService
  ) {
    // Load saved state from localStorage if available
    this.loadStateFromStorage();
  }

  /**
   * Generate a unique dataset name by appending (1), (2), etc. if name already exists
   */
  private getUniqueDatasetName(baseName: string): string {
    const existingNames = this.dataLoader.getDataSetNames();
    if (!existingNames.includes(baseName)) {
      return baseName;
    }

    // Find the next available number
    let counter = 1;
    let uniqueName = `${baseName} (${counter})`;
    while (existingNames.includes(uniqueName)) {
      counter++;
      uniqueName = `${baseName} (${counter})`;
    }
    return uniqueName;
  }

  /**
   * Get processing progress updates from worker
   */
  get processingProgress(): Observable<{ step: string; progress: number; message: string }> {
    return this.dataProcessor.processingProgress;
  }

  private getInitialState(): PreprocessingState {
    return {
      currentStep: 0,
      rawFileName: null,
      dataProfile: null,
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
      processingProgress: 0,
      processingStep: '',
      error: null,
    };
  }

  get currentState(): PreprocessingState {
    return this.stateSubject.getValue();
  }

  // Step navigation (5 steps: 0-4)
  public goToStep(step: number): void {
    if (step >= 0 && step <= 4) {
      this.updateState({ currentStep: step });
    }
  }

  // A6: navigate to a step and remember an anchor id so the target step can
  // scroll the relevant setting into view after it renders.
  public goToStepWithScroll(step: number, targetId: string): void {
    this.goToStep(step);
    this.scrollTargetSubject.next(targetId);
  }

  // A6: read and clear the pending scroll anchor. Returns null if none is set.
  public consumeScrollTarget(): string | null {
    const target = this.scrollTargetSubject.getValue();
    if (target) {
      this.scrollTargetSubject.next(null);
    }
    return target;
  }

  public nextStep(): void {
    const current = this.currentState.currentStep;
    if (current < 4) {
      this.goToStep(current + 1);
    }
  }

  public previousStep(): void {
    const current = this.currentState.currentStep;
    if (current > 0) {
      this.goToStep(current - 1);
    }
  }

  // Data loading and profiling
  public async loadCSV(file: File): Promise<DataProfile> {
    this.updateState({ isProcessing: true, error: null });

    try {
      // Load CSV file directly
      const buffer = await file.arrayBuffer();
      const fileName = file.name;

      // Send file to worker for profiling
      const profile = await this.dataProcessor.profileData(fileName, buffer);

      // Initialize column configurations
      const columnConfigs = new Map<string, ColumnConfig>();
      profile.columns.forEach((col: ColumnStatistics) => {
        columnConfigs.set(col.name, this.createDefaultColumnConfig(col));
      });

      // Generate unique dataset name and timestamp
      const baseName = file.name.replace(/\.csv$/i, '');
      const datasetName = this.getUniqueDatasetName(baseName);
      const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');

      // A4: snapshot the prior data before it is replaced, so a re-upload is undoable.
      this.pushHistory(this.currentState.dataProfile !== null ? 'Datei ersetzt' : 'Datei geladen');

      this.updateState({
        dataProfile: profile,
        rawFileName: fileName,
        columnConfigs,
        datasetName,
        timestamp,
        isProcessing: false,
      });

      this.saveStateToStorage();
      return profile;
    } catch (error: unknown) {
      this.updateState({
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Failed to load data file',
      });
      throw error;
    }
  }

  private createDefaultColumnConfig(col: ColumnStatistics): ColumnConfig {
    const capabilities = DATA_TYPE_CONFIG[col.dataType] ?? DATA_TYPE_CONFIG[DataType.Unknown];

    // Smart default: obviously unsuitable columns (mostly missing or constant)
    // start deselected. Users can re-enable them in Step 2 at any time.
    const hasIssues = col.missingPercentage > 50 || col.uniqueCount === 1;

    return {
      name: col.name,
      originalType: col.dataType,
      targetType: col.dataType,
      encodingMethod: capabilities.defaultEncoding,
      scalingMethod: capabilities.defaultScaling,
      includeInProjection: capabilities.defaultIncludeInProjection,
      isColorFeature: false,
      missingValueStrategy: MissingValueStrategy.Keep,
      outlierMethod: OutlierMethod.IQR_1_5,
      outlierStrategy: OutlierStrategy.Keep,
      enabled: !hasIssues,
      hasIssues,
    };
  }

  /**
   * Returns the smart-default configuration values for a column, derived from its
   * original data type (see DATA_TYPE_CONFIG). Used by Step 3 to detect deviations
   * and offer a reversible "reset to default" control.
   */
  public getColumnDefaults(columnName: string): Partial<ColumnConfig> | null {
    const config = this.currentState.columnConfigs.get(columnName);
    if (!config) return null;

    const capabilities = DATA_TYPE_CONFIG[config.originalType] ?? DATA_TYPE_CONFIG[DataType.Unknown];
    return {
      encodingMethod: capabilities.defaultEncoding,
      scalingMethod: capabilities.defaultScaling,
      includeInProjection: capabilities.defaultIncludeInProjection,
      missingValueStrategy: MissingValueStrategy.Keep,
      missingValueFillValue: undefined,
      outlierMethod: OutlierMethod.IQR_1_5,
      outlierStrategy: OutlierStrategy.Keep,
    };
  }

  // Column configuration
  public updateColumnConfig(columnName: string, updates: Partial<ColumnConfig>): void {
    this.pushHistory('Spalteneinstellung geändert');
    this.applyColumnConfig(columnName, updates);
  }

  // Applies a column-config change without touching the undo history. Used both by
  // the public updateColumnConfig (which pushes first) and by other actions that
  // manage their own history entry, so a single action never records twice.
  private applyColumnConfig(columnName: string, updates: Partial<ColumnConfig>): void {
    const configs = this.currentState.columnConfigs;
    const existing = configs.get(columnName);

    if (existing) {
      configs.set(columnName, { ...existing, ...updates });
      this.updateState({ columnConfigs: new Map(configs) });
      this.saveStateToStorage();
    }
  }

  public setColorFeature(columnName: string): void {
    const configs = this.currentState.columnConfigs;

    // Clear previous color feature
    configs.forEach((config, name) => {
      config.isColorFeature = name === columnName;
    });

    // Auto-detect color scale mode based on data type
    const colorConfig = configs.get(columnName);
    let colorScaleMode: 'continuous' | 'categorical' = 'continuous';

    if (colorConfig) {
      // Categorical or Text data types should use categorical color scale
      if (
        colorConfig.originalType === DataType.Categorical ||
        colorConfig.originalType === DataType.Text ||
        colorConfig.targetType === DataType.Categorical ||
        colorConfig.targetType === DataType.Text
      ) {
        colorScaleMode = 'categorical';
      }
      // Numeric data types use continuous color scale
      else if (colorConfig.originalType === DataType.Numeric || colorConfig.targetType === DataType.Numeric) {
        colorScaleMode = 'continuous';
      }
    }

    // Auto-select matching default scale if current scale type doesn't match
    const currentScaleId = this.currentState.colorScaleId;
    let colorScaleId = currentScaleId;
    const isCategorical = colorScaleMode === 'categorical';
    // Default numeric scales: 0-3, categorical scales: 4-5
    const currentIsCategorical = currentScaleId >= 4;
    if (isCategorical !== currentIsCategorical) {
      colorScaleId = isCategorical ? 4 : 0;
    }

    this.updateState({
      columnConfigs: new Map(configs),
      colorScaleMode: colorScaleMode,
      colorScaleId: colorScaleId,
    });
    this.saveStateToStorage();
  }

  public setColorScaleId(id: number): void {
    this.updateState({ colorScaleId: id });
    this.saveStateToStorage();
  }

  // Glyph feature mapping
  public setGlyphFeatures(features: string[]): void {
    // Validate 3-12 features
    if (features.length < 3 || features.length > 12) {
      throw new Error('3-12 glyph features required');
    }
    this.updateState({ glyphFeatures: features });
    this.saveStateToStorage();
  }

  public getPreviewFeatureNames(): string[] {
    // Returns predicted feature names after encoding
    return this.predictEncodedFeatureNames();
  }

  private predictEncodedFeatureNames(): string[] {
    const state = this.currentState;
    const featureNames: string[] = [];

    const enabledCols = Array.from(state.columnConfigs.values()).filter(
      config => config.enabled && config.originalType !== DataType.ID
    );

    for (const col of enabledCols) {
      if (col.encodingMethod === EncodingMethod.OneHot) {
        // Predict one-hot expansion based on unique values from data profile
        const colStats = state.dataProfile?.columns.find(c => c.name === col.name);
        if (colStats && colStats.topValues) {
          // Generate predicted column names: columnName_value
          colStats.topValues.forEach(item => {
            featureNames.push(`${col.name}_${item.value}`);
          });
        }
      } else {
        // Label encoding, numeric, or no encoding - keeps column name
        featureNames.push(col.name);
      }
    }

    return featureNames;
  }

  public toggleColumnEnabled(columnName: string): void {
    const config = this.currentState.columnConfigs.get(columnName);
    if (config) {
      this.pushHistory(config.enabled ? 'Spalte abgewählt' : 'Spalte ausgewählt');
      this.applyColumnConfig(columnName, { enabled: !config.enabled });
    }
  }

  /**
   * Set the enabled state for a specific set of columns in one update. Used by
   * Step 2 range-select (shift-click) and "select all filtered".
   */
  public setColumnsEnabled(columnNames: string[], enabled: boolean): void {
    this.pushHistory('Spaltenauswahl geändert');
    const configs = this.currentState.columnConfigs;
    columnNames.forEach(name => {
      const config = configs.get(name);
      if (config) {
        config.enabled = enabled;
      }
    });
    this.updateState({ columnConfigs: new Map(configs) });
    this.saveStateToStorage();
  }

  public selectAllColumns(): void {
    this.pushHistory('Alle Spalten ausgewählt');
    const configs = this.currentState.columnConfigs;
    configs.forEach(config => (config.enabled = true));
    this.updateState({ columnConfigs: new Map(configs) });
    this.saveStateToStorage();
  }

  public deselectAllColumns(): void {
    this.pushHistory('Alle Spalten abgewählt');
    const configs = this.currentState.columnConfigs;
    configs.forEach(config => {
      if (config.originalType !== DataType.ID) {
        config.enabled = false;
      }
    });
    this.updateState({ columnConfigs: new Map(configs) });
    this.saveStateToStorage();
  }

  // Cleaning configuration
  public updateCleaningConfig(updates: Partial<CleaningConfig>): void {
    this.pushHistory('Bereinigung geändert');
    this.updateState({
      cleaningConfig: { ...this.currentState.cleaningConfig, ...updates },
    });
    this.saveStateToStorage();
  }

  // Projection configuration
  public updateProjectionConfig(updates: Partial<ProjectionConfig>): void {
    this.pushHistory('Projektionsparameter geändert');
    this.updateState({
      projectionConfig: { ...this.currentState.projectionConfig, ...updates },
    });
    this.saveStateToStorage();
  }

  // Outlier detection
  public async detectOutliers(
    columnName: string,
    method: OutlierMethod
  ): Promise<{ outlierCount: number; outlierIndices: number[] }> {
    if (!this.currentState.rawFileName) {
      throw new Error('No data file loaded');
    }

    const result = await this.dataProcessor.detectOutliers(this.currentState.rawFileName, columnName, method);

    return {
      outlierCount: result.outlier_count,
      outlierIndices: result.outlier_indices,
    };
  }

  // Duplicate detection
  public async detectDuplicates(subsetColumns?: string[]): Promise<{
    duplicateCount: number;
    duplicateIndices: number[];
    percentage: number;
    sampleDuplicates: Record<string, unknown>[];
  }> {
    if (!this.currentState.rawFileName) {
      throw new Error('No data file loaded');
    }

    const result = await this.dataProcessor.detectDuplicates(this.currentState.rawFileName, subsetColumns);

    return {
      duplicateCount: result.duplicateCount,
      duplicateIndices: result.duplicateIndices,
      percentage: result.percentage,
      sampleDuplicates: result.sampleDuplicates,
    };
  }

  // Processing
  public async processData(): Promise<void> {
    // Validate that we have the necessary metadata
    if (!this.currentState.rawFileName || !this.currentState.dataProfile) {
      throw new Error('No data file loaded. Please upload a file first.');
    }

    this.updateState({
      isProcessing: true,
      processingProgress: 0,
      error: null,
    });

    try {
      // Build configuration object
      const config = this.buildProcessingConfig();

      // File is already in Pyodide FS from loadCSV() - no need to re-upload
      // Send to worker for processing (use rawFileName which is the actual CSV file in Pyodide FS)
      const result = await this.dataProcessor.processWithConfig(this.currentState.rawFileName, config);

      this.updateState({
        processedDataset: result,
        isProcessing: false,
        processingProgress: 100,
      });

      this.saveStateToStorage();
    } catch (error: unknown) {
      this.updateState({
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Processing failed',
      });
      throw error;
    }
  }

  /**
   * Get processed features CSV exported by Python for JavaScript projections
   */
  public async getProcessedFeaturesCSV(): Promise<string> {
    return await this.dataProcessor.getProcessedFeatures();
  }

  /**
   * Add projection positions to the processed dataset
   * Silently returns if wizard was reset (user moved on)
   */
  public async addProjectionPositions(
    method: string,
    positions: { id: string | number; x: number; y: number }[]
  ): Promise<void> {
    const state = this.currentState;

    // If wizard was reset while background projection was running, silently skip
    // (user has already moved on to dashboard)
    if (!state.processedDataset) {
      return;
    }

    // The dataset structure from worker
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const collection = state.processedDataset as any;
    const datasetKey = collection.selectedDataset || (collection.datasets ? Object.keys(collection.datasets)[0] : null);

    if (!datasetKey || !collection.datasets) {
      throw new Error('Invalid dataset structure');
    }

    const dataset = collection.datasets[datasetKey];

    if (!dataset) {
      throw new Error('Dataset not found');
    }

    // Initialize positions object if it doesn't exist
    if (!dataset.positions) {
      dataset.positions = {};
    }

    // Convert positions to the format expected by DataProvider
    // Format: [{id: x, position: {x: ..., y: ...}}]
    // Always normalize IDs to string for consistency
    dataset.positions[method] = positions.map(p => ({
      id: String(p.id),
      position: { x: p.x, y: p.y },
    }));

    // Update state to trigger any observers
    this.updateState({ processedDataset: collection });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private buildProcessingConfig(): any {
    const state = this.currentState;

    return {
      datasetName: state.datasetName,
      timestamp: state.timestamp,
      columns: Array.from(state.columnConfigs.values()).map(col => ({
        name: col.name,
        enabled: col.enabled,
        dataType: col.targetType,
        encoding: col.encodingMethod,
        scaling: col.scalingMethod,
        includeInProjection: col.includeInProjection,
        isColorFeature: col.isColorFeature,
        missingValueStrategy: col.missingValueStrategy,
        missingValueFillValue: col.missingValueFillValue,
        outlierMethod: col.outlierMethod,
        outlierStrategy: col.outlierStrategy,
      })),
      cleaning: state.cleaningConfig,
      projections: state.projectionConfig,
      // Glyph and tooltip feature mappings
      glyphFeatures: state.glyphFeatures,
      tooltipFeatures: state.tooltipFeatures.length > 0 ? state.tooltipFeatures : null,
      colorScaleMode: state.colorScaleMode,
      colorScaleId: state.colorScaleId,
    };
  }

  // State management
  private updateState(updates: Partial<PreprocessingState>): void {
    this.stateSubject.next({ ...this.currentState, ...updates });
  }

  public resetState(): void {
    this.stateSubject.next(this.getInitialState());
    this.undoStack = [];
    this.redoStack = [];
    this.emitHistoryStatus();
    this.clearStateFromStorage();
  }

  // ── A4: Undo/Redo history ────────────────────────────────────────────────

  /**
   * Record a snapshot of the current state before a state-changing action runs.
   * `label` describes the action (e.g. "Smart Defaults angewendet") and drives the
   * toolbar tooltip. Pushing a new action clears the redo stack, as usual.
   * Granularity is per completed action (one call per action), never per keystroke.
   */
  public pushHistory(label: string): void {
    this.undoStack.push({ label, snapshot: this.captureSnapshot() });
    if (this.undoStack.length > this.MAX_HISTORY) {
      this.undoStack.shift();
    }
    this.redoStack = [];
    this.emitHistoryStatus();
  }

  public get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /** Revert the most recent action; returns its label, or null if nothing to undo. */
  public undo(): string | null {
    const entry = this.undoStack.pop();
    if (!entry) return null;

    // Preserve the current state on the redo stack under the same label so redo
    // can re-apply the reverted action.
    this.redoStack.push({ label: entry.label, snapshot: this.captureSnapshot() });
    this.restoreSnapshot(entry.snapshot);
    this.emitHistoryStatus();
    this.stateRestoredSubject.next();
    this.saveStateToStorage();
    return entry.label;
  }

  /** Re-apply the most recently undone action; returns its label, or null. */
  public redo(): string | null {
    const entry = this.redoStack.pop();
    if (!entry) return null;

    this.undoStack.push({ label: entry.label, snapshot: this.captureSnapshot() });
    this.restoreSnapshot(entry.snapshot);
    this.emitHistoryStatus();
    this.stateRestoredSubject.next();
    this.saveStateToStorage();
    return entry.label;
  }

  private emitHistoryStatus(): void {
    this.historySubject.next({
      canUndo: this.undoStack.length > 0,
      canRedo: this.redoStack.length > 0,
      undoLabel: this.undoStack.length > 0 ? this.undoStack[this.undoStack.length - 1].label : null,
      redoLabel: this.redoStack.length > 0 ? this.redoStack[this.redoStack.length - 1].label : null,
    });
  }

  /** Deep-copy the undoable slice of state so later in-place edits cannot mutate it. */
  private captureSnapshot(): HistorySnapshot {
    const s = this.currentState;
    return {
      rawFileName: s.rawFileName,
      dataProfile: s.dataProfile, // replaced wholesale on re-upload; reference is safe
      columnConfigs: this.cloneColumnConfigs(s.columnConfigs),
      cleaningConfig: { ...s.cleaningConfig },
      projectionConfig: { ...s.projectionConfig },
      datasetName: s.datasetName,
      timestamp: s.timestamp,
      glyphFeatures: [...s.glyphFeatures],
      tooltipFeatures: [...s.tooltipFeatures],
      colorScaleMode: s.colorScaleMode,
      colorScaleId: s.colorScaleId,
    };
  }

  /** Install a snapshot, deep-copying again so the stored entry stays pristine. */
  private restoreSnapshot(snap: HistorySnapshot): void {
    this.updateState({
      rawFileName: snap.rawFileName,
      dataProfile: snap.dataProfile,
      columnConfigs: this.cloneColumnConfigs(snap.columnConfigs),
      cleaningConfig: { ...snap.cleaningConfig },
      projectionConfig: { ...snap.projectionConfig },
      datasetName: snap.datasetName,
      timestamp: snap.timestamp,
      glyphFeatures: [...snap.glyphFeatures],
      tooltipFeatures: [...snap.tooltipFeatures],
      colorScaleMode: snap.colorScaleMode,
      colorScaleId: snap.colorScaleId,
    });
  }

  private cloneColumnConfigs(configs: Map<string, ColumnConfig>): Map<string, ColumnConfig> {
    return new Map(Array.from(configs.entries()).map(([name, config]) => [name, { ...config }]));
  }

  // Persistence
  private saveStateToStorage(): void {
    try {
      const state = this.currentState;
      const serializable = {
        currentStep: state.currentStep,
        dataProfile: state.dataProfile,
        rawFileName: state.rawFileName,
        columnConfigs: Array.from(state.columnConfigs.entries()),
        cleaningConfig: state.cleaningConfig,
        projectionConfig: state.projectionConfig,
        datasetName: state.datasetName,
        timestamp: state.timestamp,
        glyphFeatures: state.glyphFeatures,
        tooltipFeatures: state.tooltipFeatures,
      };

      localStorage.setItem('glyphspace_preprocessing_state', JSON.stringify(serializable));
    } catch (error) {
      console.warn('Failed to save state to localStorage:', error);
    }
  }

  private loadStateFromStorage(): void {
    try {
      const saved = localStorage.getItem('glyphspace_preprocessing_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.updateState({
          currentStep: parsed.currentStep,
          dataProfile: parsed.dataProfile,
          rawFileName: parsed.rawFileName,
          columnConfigs: new Map(parsed.columnConfigs),
          cleaningConfig: parsed.cleaningConfig,
          projectionConfig: parsed.projectionConfig,
          datasetName: parsed.datasetName,
          timestamp: parsed.timestamp,
          glyphFeatures: parsed.glyphFeatures || [],
          tooltipFeatures: parsed.tooltipFeatures || [],
        });
      }
    } catch (error) {
      console.warn('Failed to load state from localStorage:', error);
    }
  }

  private clearStateFromStorage(): void {
    localStorage.removeItem('glyphspace_preprocessing_state');
  }
}
