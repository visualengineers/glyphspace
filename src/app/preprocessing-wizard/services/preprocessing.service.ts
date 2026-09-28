import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import {
  PreprocessingState,
  ProcessingProgress,
  HistoryStatus,
  createInitialState,
} from '../models/preprocessing-state';
import { DataProfile, ColumnStatistics } from '../models/column-statistics';
import { ColumnConfig, CleaningConfig, ProjectionConfig } from '../models/column-config';
import { DataType, OutlierMethod } from '../models/data-type.enum';
import { DataProcessorService } from '../../services/data-processor';
import { DataLoaderService } from '../../services/data-loader.service';
import { LAST_STEP_INDEX, WizardStepId, stepIdAt, stepIndex } from '../shared/constants/step-info';
import { HistorySnapshot, UndoRedoInfo, copySnapshot, describeDiff } from './history-diff';
import { colorScaleForFeature, columnDefaultsFor, createDefaultColumnConfig } from './column-defaults';
import {
  ProcessedCollection,
  buildProcessingConfig,
  predictEncodedFeatureNames,
  storeProjectionPositions,
} from './processing-config';
import { STORAGE_KEY, deserializeState, serializeState } from './wizard-storage';

export type { UndoRedoInfo } from './history-diff';

interface HistoryEntry {
  id: number; // stable id of the recorded action (kept across undo/redo), see undoIfLatest
  label: string; // human-readable description of the action this snapshot precedes
  snapshot: HistorySnapshot;
}

/** One column's share of a multi-column action (see updateColumnConfigs). */
export interface ColumnConfigChange {
  columnName: string;
  updates: Partial<ColumnConfig>;
}

/**
 * Derived per-column values computed from the data rather than chosen by the user.
 * They are written without an undo entry (see updateColumnMetadata).
 */
export type ColumnMetadataUpdate = Partial<Pick<ColumnConfig, 'outlierCount'>>;

@Injectable({
  providedIn: 'root',
})
export class PreprocessingService {
  private stateSubject = new BehaviorSubject<PreprocessingState>(createInitialState());
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
  private nextHistoryId = 1;

  // In-flight processData() run; a second call joins it instead of starting a
  // parallel worker job (re-entrancy guard).
  private activeProcessingRun: Promise<void> | null = null;

  // Number of runs currently holding state.isProcessing (see holdProcessing).
  // Counted so a caller can keep the flag up across several phases while
  // processData() inside it takes and releases its own hold.
  private processingHolds = 0;

  // Uploads whose profiling is in flight. They are not in the state yet, but
  // must survive any worker-file prune that runs meanwhile.
  private uploadsInFlight = new Set<string>();

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

  get currentState(): PreprocessingState {
    return this.stateSubject.getValue();
  }

  /** Id of the step currently shown (state keeps its index into WIZARD_STEPS). */
  get currentStepId(): WizardStepId {
    return stepIdAt(this.currentState.currentStep) ?? 'upload';
  }

  // Step navigation by id; the index stored in state is derived from WIZARD_STEPS.
  public goToStep(step: WizardStepId): void {
    this.goToStepIndex(stepIndex(step));
  }

  // A6: navigate to a step and remember an anchor id so the target step can
  // scroll the relevant setting into view after it renders.
  public goToStepWithScroll(step: WizardStepId, targetId: string): void {
    this.goToStep(step);
    this.scrollTargetSubject.next(targetId);
  }

  private goToStepIndex(index: number): void {
    if (index >= 0 && index <= LAST_STEP_INDEX) {
      this.updateState({ currentStep: index });
    }
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
    this.goToStepIndex(this.currentState.currentStep + 1);
  }

  public previousStep(): void {
    this.goToStepIndex(this.currentState.currentStep - 1);
  }

  // Data loading and profiling
  public async loadCSV(file: File): Promise<DataProfile> {
    const fileName = file.name;
    const release = this.holdProcessing();
    this.uploadsInFlight.add(fileName);
    this.updateState({ error: null });

    try {
      // Send the file to the worker for profiling; this also writes it into the Pyodide FS.
      const profile: DataProfile = await this.dataProcessor.profileData(fileName, await file.arrayBuffer());
      this.adoptLoadedFile(fileName, profile);
      return profile;
    } catch (error: unknown) {
      this.updateState({ error: this.toErrorMessage(error, 'Failed to load data file') });
      throw error;
    } finally {
      release();
      this.uploadsInFlight.delete(fileName);
      // The previous upload stays referenced by the undo history; anything no
      // longer referenced (e.g. this file, if loading failed) is removed.
      this.pruneWorkerFiles();
    }
  }

  /** Install a freshly profiled file as one undoable "File loaded/replaced" action. */
  private adoptLoadedFile(fileName: string, profile: DataProfile): void {
    const columnConfigs = new Map<string, ColumnConfig>();
    profile.columns.forEach((col: ColumnStatistics) => {
      columnConfigs.set(col.name, createDefaultColumnConfig(col));
    });

    // Generate unique dataset name and timestamp
    const baseName = fileName.replace(/\.csv$/i, '');
    const datasetName = this.getUniqueDatasetName(baseName);
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');

    // A4: snapshot the prior data before it is replaced, so a re-upload is undoable.
    this.pushHistory(this.currentState.dataProfile !== null ? 'File replaced' : 'File loaded');

    this.updateState({ dataProfile: profile, rawFileName: fileName, columnConfigs, datasetName, timestamp });
    this.saveStateToStorage();
  }

  /**
   * Returns the smart-default configuration values for a column, derived from its
   * original data type (see DATA_TYPE_CONFIG). Used by Step 3 to detect deviations
   * and offer a reversible "reset to default" control.
   */
  public getColumnDefaults(columnName: string): Partial<ColumnConfig> | null {
    const config = this.currentState.columnConfigs.get(columnName);
    return config ? columnDefaultsFor(config) : null;
  }

  // Column configuration
  public updateColumnConfig(columnName: string, updates: Partial<ColumnConfig>): void {
    this.pushHistory('Column settings changed');
    this.applyColumnConfig(columnName, updates);
  }

  /**
   * Apply one user action that touches several columns (e.g. "Apply to same type")
   * as a single undo entry: history is pushed once, then every change is applied
   * without further history. An empty batch records nothing.
   */
  public updateColumnConfigs(changes: ColumnConfigChange[], label: string): void {
    if (changes.length === 0) return;
    this.pushHistory(label);
    const configs = new Map(this.currentState.columnConfigs);
    for (const { columnName, updates } of changes) {
      const existing = configs.get(columnName);
      if (existing) {
        configs.set(columnName, { ...existing, ...updates });
      }
    }
    this.updateState({ columnConfigs: configs });
    this.saveStateToStorage();
  }

  /**
   * Store derived per-column values (e.g. a detected outlierCount) WITHOUT an undo
   * entry. They are recomputed from the data, not chosen by the user, so recording
   * them would fill the history (and clear redo) just by opening Step 3.
   */
  public updateColumnMetadata(columnName: string, updates: ColumnMetadataUpdate): void {
    this.applyColumnConfig(columnName, updates);
  }

  // Applies a column-config change without touching the undo history. Used both by
  // the public updateColumnConfig (which pushes first) and by other actions that
  // manage their own history entry, so a single action never records twice.
  private applyColumnConfig(columnName: string, updates: Partial<ColumnConfig>): void {
    const existing = this.currentState.columnConfigs.get(columnName);
    if (!existing) return;

    const configs = new Map(this.currentState.columnConfigs);
    configs.set(columnName, { ...existing, ...updates });
    this.updateState({ columnConfigs: configs });
    this.saveStateToStorage();
  }

  /** Copy of the column configs; `update` returns the config itself or a changed copy. */
  private mapColumnConfigs(update: (config: ColumnConfig, name: string) => ColumnConfig): Map<string, ColumnConfig> {
    return new Map(Array.from(this.currentState.columnConfigs, ([name, config]) => [name, update(config, name)]));
  }

  public setColorFeature(columnName: string): void {
    // Exactly one column carries the color flag.
    const configs = this.mapColumnConfigs((config, name) =>
      config.isColorFeature === (name === columnName) ? config : { ...config, isColorFeature: name === columnName }
    );

    // Match the color mode (and, if needed, the default scale) to the column's type.
    const { colorScaleMode, colorScaleId } = colorScaleForFeature(
      configs.get(columnName),
      this.currentState.colorScaleId
    );

    this.updateState({ columnConfigs: configs, colorScaleMode, colorScaleId });
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
    // Store a copy, never the caller's array. The glyph step edits its local selection
    // array in place (splice/push); if we kept that reference, later in-place edits
    // would silently mutate the service state and corrupt undo snapshots taken
    // before the next pushHistory.
    this.updateState({ glyphFeatures: [...features] });
    this.saveStateToStorage();
  }

  public getPreviewFeatureNames(): string[] {
    // Returns predicted feature names after encoding
    return predictEncodedFeatureNames(this.currentState);
  }

  public toggleColumnEnabled(columnName: string): void {
    const config = this.currentState.columnConfigs.get(columnName);
    if (config) {
      this.pushHistory(config.enabled ? 'Column deselected' : 'Column selected');
      this.applyColumnConfig(columnName, { enabled: !config.enabled });
      this.validateDependentReferences();
    }
  }

  /**
   * Set the enabled state for a specific set of columns in one update. Used by
   * Step 2 range-select (shift-click) and "select all filtered".
   */
  public setColumnsEnabled(columnNames: string[], enabled: boolean): void {
    this.pushHistory('Column selection changed');
    const targets = new Set(columnNames);
    this.applyEnabled((config, name) => (targets.has(name) ? enabled : config.enabled));
  }

  public selectAllColumns(): void {
    this.pushHistory('All columns selected');
    this.applyEnabled(() => true);
  }

  public deselectAllColumns(): void {
    this.pushHistory('All columns deselected');
    this.applyEnabled(config => config.originalType === DataType.ID && config.enabled);
  }

  /** Sets each column's `enabled` flag (history is pushed by the caller). */
  private applyEnabled(enabledFor: (config: ColumnConfig, name: string) => boolean): void {
    const configs = this.mapColumnConfigs((config, name) => {
      const enabled = enabledFor(config, name);
      return enabled === config.enabled ? config : { ...config, enabled };
    });
    this.updateState({ columnConfigs: configs });
    this.validateDependentReferences();
    this.saveStateToStorage();
  }

  /**
   * A4/cross-field: after any change to which columns are enabled, remove references
   * that would otherwise dangle on now-disabled columns. Concretely: a disabled
   * column can no longer be the color feature, and glyph/tooltip mappings drop
   * features whose underlying column is disabled. If the color feature was cleared,
   * the color scale falls back to the numeric default so the review/glyph step UI does
   * not keep showing a scale for a column that is gone.
   *
   * Runs after the enable change (and after pushHistory captured the pre-change
   * snapshot), so a single undo reverts both the enable change and this cleanup as
   * one atomic action, while the redo snapshot holds the already-cleaned state.
   */
  private validateDependentReferences(): void {
    // Drop color-feature flag from disabled columns.
    let colorFeatureCleared = false;
    const configs = this.mapColumnConfigs(config => {
      if (config.enabled || !config.isColorFeature) return config;
      colorFeatureCleared = true;
      return { ...config, isColorFeature: false };
    });

    // Glyph/tooltip mappings may only reference features of still-enabled columns.
    // predictEncodedFeatureNames() already restricts itself to enabled columns and
    // handles one-hot expansion, so it is the source of truth for valid names.
    const validFeatures = new Set(predictEncodedFeatureNames(this.currentState));
    const glyphFeatures = this.currentState.glyphFeatures.filter(f => validFeatures.has(f));
    const tooltipFeatures = this.currentState.tooltipFeatures.filter(f => validFeatures.has(f));
    const glyphChanged = glyphFeatures.length !== this.currentState.glyphFeatures.length;
    const tooltipChanged = tooltipFeatures.length !== this.currentState.tooltipFeatures.length;

    if (!colorFeatureCleared && !glyphChanged && !tooltipChanged) {
      return;
    }

    const updates: Partial<PreprocessingState> = { columnConfigs: configs };
    if (glyphChanged) updates.glyphFeatures = glyphFeatures;
    if (tooltipChanged) updates.tooltipFeatures = tooltipFeatures;
    // When the color feature is gone, reset the color scale to the numeric default.
    if (colorFeatureCleared) {
      updates.colorScaleId = 0;
      updates.colorScaleMode = 'continuous';
    }

    this.updateState(updates);
    this.saveStateToStorage();
  }

  // Cleaning configuration
  public updateCleaningConfig(updates: Partial<CleaningConfig>): void {
    this.pushHistory('Cleaning settings changed');
    this.updateState({
      cleaningConfig: { ...this.currentState.cleaningConfig, ...updates },
    });
    this.saveStateToStorage();
  }

  // Projection configuration (methods + parameters). One call = one undo entry, so
  // callers must commit completed changes only (e.g. slider release, not each tick).
  public updateProjectionConfig(updates: Partial<ProjectionConfig>, label = 'Projection settings changed'): void {
    this.pushHistory(label);
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
  /**
   * Run the preprocessing pipeline in the worker. Re-entrancy guard: while a run is
   * in flight, further calls join that run (same promise) instead of starting a
   * second, parallel worker job; callers still wait for the actual result.
   */
  public processData(): Promise<void> {
    if (this.activeProcessingRun) {
      return this.activeProcessingRun;
    }
    const run = this.runProcessing().finally(() => {
      this.activeProcessingRun = null;
    });
    this.activeProcessingRun = run;
    return run;
  }

  private async runProcessing(): Promise<void> {
    // Validate that we have the necessary metadata
    if (!this.currentState.rawFileName || !this.currentState.dataProfile) {
      throw new Error('No data file loaded. Please upload a file first.');
    }

    const release = this.holdProcessing();
    this.updateState({ processingProgress: 0, error: null });

    try {
      // Build configuration object
      const config = buildProcessingConfig(this.currentState);

      // File is already in Pyodide FS from loadCSV() - no need to re-upload
      // Send to worker for processing (use rawFileName which is the actual CSV file in Pyodide FS)
      const result = await this.dataProcessor.processWithConfig(this.currentState.rawFileName, config);

      this.updateState({ processedDataset: result, processingProgress: 100 });
      this.saveStateToStorage();
    } catch (error: unknown) {
      this.updateState({ error: this.toErrorMessage(error, 'Processing failed') });
      throw error;
    } finally {
      release();
    }
  }

  /**
   * Keep `isProcessing` true until `task` settles. processData() only covers the
   * worker run; a caller whose run has further phases (the review step computes
   * the primary FastMap projection afterwards) wraps the whole run in this, so
   * undo/redo stay blocked until the primary result is complete.
   */
  public async whileProcessing<T>(task: () => Promise<T>): Promise<T> {
    const release = this.holdProcessing();
    try {
      return await task();
    } finally {
      release();
    }
  }

  /**
   * Raise `isProcessing` and return a release function. Holds are counted: the
   * flag drops only when the last hold is released. Releasing twice is a no-op.
   */
  private holdProcessing(): () => void {
    this.processingHolds++;
    if (!this.currentState.isProcessing) {
      this.updateState({ isProcessing: true });
    }
    let released = false;
    return () => {
      if (released) return;
      released = true;
      this.processingHolds = Math.max(0, this.processingHolds - 1);
      if (this.processingHolds === 0 && this.currentState.isProcessing) {
        this.updateState({ isProcessing: false });
      }
    };
  }

  /** Extract a human-readable message from an unknown thrown value without
   *  discarding string rejections (the old `instanceof Error` check dropped
   *  the real worker cause and fell back to a generic string). */
  private toErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string' && error.trim().length > 0) return error;
    return fallback;
  }

  /** Clear a lingering processing error. The error flag lives in the root
   *  singleton state and previously survived closing/reopening the wizard,
   *  so a stale "Processing failed" reappeared on re-entry (P-S5-03). */
  public clearError(): void {
    if (this.currentState.error !== null) {
      this.updateState({ error: null });
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

    storeProjectionPositions(state.processedDataset as unknown as ProcessedCollection, method, positions);

    // Update state to trigger any observers
    this.updateState({ processedDataset: state.processedDataset });
  }

  // State management
  private updateState(updates: Partial<PreprocessingState>): void {
    this.stateSubject.next({ ...this.currentState, ...updates });
  }

  public resetState(): void {
    // A run that is still in flight keeps the processing flag until it settles.
    this.stateSubject.next({ ...createInitialState(), isProcessing: this.processingHolds > 0 });
    this.undoStack = [];
    this.redoStack = [];
    this.emitHistoryStatus();
    this.clearStateFromStorage();
    this.pruneWorkerFiles();
  }

  // ── Worker FS cleanup ───────────────────────────────────────────────────
  // The Pyodide worker keeps every uploaded file (reprocessing and undoing a
  // re-upload need it) and deletes those the main thread no longer references.

  /** Unique uploaded file names still referenced by the state, the undo/redo history or a running upload. */
  private referencedFileNames(): string[] {
    const snapshots = [
      this.currentState,
      ...this.undoStack.map(e => e.snapshot),
      ...this.redoStack.map(e => e.snapshot),
    ];
    const names = snapshots.map(s => s.rawFileName).filter((name): name is string => name !== null);
    return Array.from(new Set([...names, ...this.uploadsInFlight]));
  }

  /**
   * Ask the worker to delete every uploaded file that is no longer referenced.
   * Fire-and-forget: a failed prune only leaves a stale file in worker memory,
   * so it is logged rather than surfaced to the user.
   */
  private pruneWorkerFiles(): void {
    const keep = this.referencedFileNames();
    const logFailure = (error: unknown): void =>
      console.error('[PreprocessingService] Failed to prune unused worker files', { keep }, error);
    try {
      this.dataProcessor.pruneFiles(keep).catch(logFailure);
    } catch (error: unknown) {
      logFailure(error);
    }
  }

  /** Prune when dropped history entries were the last reference to an uploaded file. */
  private pruneIfOrphaned(dropped: HistoryEntry[]): void {
    const referenced = new Set(this.referencedFileNames());
    const orphaned = dropped.some(e => e.snapshot.rawFileName !== null && !referenced.has(e.snapshot.rawFileName));
    if (orphaned) {
      this.pruneWorkerFiles();
    }
  }

  // ── A4: Undo/Redo history ────────────────────────────────────────────────

  /**
   * Record a snapshot of the current state before a state-changing action runs.
   * `label` describes the action (e.g. "Recommended features applied") and drives
   * the toolbar tooltip. Pushing a new action clears the redo stack, as usual.
   * Granularity is per completed action (one call per action), never per keystroke.
   * Returns the entry id, which undoIfLatest() uses to target exactly this action.
   */
  public pushHistory(label: string): number {
    const id = this.nextHistoryId++;
    const pushed = [...this.undoStack, { id, label, snapshot: this.captureSnapshot() }];
    // Entries beyond MAX_HISTORY are evicted (oldest first); the redo stack is invalidated.
    const evicted = pushed.slice(0, Math.max(0, pushed.length - this.MAX_HISTORY));
    const dropped = [...evicted, ...this.redoStack];
    this.undoStack = pushed.slice(evicted.length);
    this.redoStack = [];
    this.emitHistoryStatus();
    this.pruneIfOrphaned(dropped);
    return id;
  }

  public get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /** Id of the action that undo() would revert next, or null if there is none. */
  public get latestHistoryId(): number | null {
    return this.undoStack.length > 0 ? this.undoStack[this.undoStack.length - 1].id : null;
  }

  /**
   * Target-specific undo for confirmation toasts: reverts the action with the given
   * id only if it is still the most recent one. Returns false (and changes nothing)
   * if other actions were recorded since, it was already undone, or processing runs.
   */
  public undoIfLatest(id: number): boolean {
    if (this.latestHistoryId !== id) return false;
    return this.undo() !== null;
  }

  /**
   * Revert the most recent action; returns info about the change, or null.
   * A no-op while processing runs, so a restore can never race the worker run.
   */
  public undo(): UndoRedoInfo | null {
    if (this.currentState.isProcessing) return null;
    const entry = this.undoStack.pop();
    if (!entry) return null;

    // Diff the current (about-to-be-reverted) state against the target snapshot to
    // name the setting that changes, before we replace the state.
    const before = this.captureSnapshot();
    const info = describeDiff(entry.label, before, entry.snapshot);

    // Preserve the current state on the redo stack under the same id and label so
    // redo can re-apply the reverted action.
    this.redoStack.push({ id: entry.id, label: entry.label, snapshot: before });
    this.restoreSnapshot(entry.snapshot);
    this.emitHistoryStatus();
    this.stateRestoredSubject.next();
    this.saveStateToStorage();
    return info;
  }

  /**
   * Re-apply the most recently undone action; returns info about the change, or
   * null. A no-op while processing runs.
   */
  public redo(): UndoRedoInfo | null {
    if (this.currentState.isProcessing) return null;
    const entry = this.redoStack.pop();
    if (!entry) return null;

    const before = this.captureSnapshot();
    const info = describeDiff(entry.label, before, entry.snapshot);

    this.undoStack.push({ id: entry.id, label: entry.label, snapshot: before });
    this.restoreSnapshot(entry.snapshot);
    this.emitHistoryStatus();
    this.stateRestoredSubject.next();
    this.saveStateToStorage();
    return info;
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
    return copySnapshot(this.currentState);
  }

  /** Install a snapshot, deep-copying again so the stored entry stays pristine. */
  private restoreSnapshot(snap: HistorySnapshot): void {
    this.updateState(copySnapshot(snap));
  }

  // Persistence (versioned; see wizard-storage.ts for the format and migration)
  private saveStateToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeState(this.currentState)));
    } catch (error) {
      console.warn('Failed to save state to localStorage:', error);
    }
  }

  private loadStateFromStorage(): void {
    try {
      const restored = deserializeState(localStorage.getItem(STORAGE_KEY));
      if (restored) {
        this.updateState(restored);
      }
    } catch (error) {
      console.warn('Failed to load state from localStorage:', error);
    }
  }

  private clearStateFromStorage(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
