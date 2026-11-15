import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import {
  PreprocessingState,
  ProcessingProgress,
  HistoryStatus,
  createInitialState,
} from '../models/preprocessing-state';
import { DataProfile, ColumnStatistics } from '../models/column-statistics';
import { ColumnConfig, CleaningConfig, ProjectionConfig, isFeatureColumn } from '../models/column-config';
import { ColumnRole, DataType, OutlierMethod } from '../models/data-type.enum';
import { ProcessedCollection } from '../models/processed-collection';
import { DataProcessorService } from '../../services/data-processor';
import { DataLoaderService } from '../../services/data-loader.service';
import { LAST_STEP_INDEX, WizardStepId, stepIdAt, stepIndex } from '../shared/constants/step-info';
import { HistorySnapshot, UndoRedoInfo, copySnapshot, describeDiff } from './history-diff';
import { colorScaleForFeature, columnDefaultsFor, createDefaultColumnConfig } from './column-defaults';
import { buildProcessingConfig, predictEncodedFeatureNames } from './processing-config';
import { STORAGE_KEY, deserializeState, serializeState } from './wizard-storage';
import { WizardFileStore } from './wizard-file-store';
import { uniqueDatasetName } from './dataset-name';
import { MAX_GLYPH_AXES, MIN_GLYPH_AXES } from '../../glyph/glyph-axes';

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

/** What loadCSV did with an upload. */
export interface LoadedFile {
  profile: DataProfile;
  /**
   * The undo entry the upload recorded ("File loaded" / "File replaced"), or
   * null when it recorded none: the file lost by a page reload was uploaded
   * again and the restored settings were kept.
   */
  historyId: number | null;
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

  // Number of runs currently holding state.isProcessing (see holdProcessing).
  // Counted so a caller can keep the flag up across several phases while
  // processInWorker() inside it takes and releases its own hold.
  private processingHolds = 0;

  // Uploads whose profiling is in flight. They are not in the state yet, but
  // must survive any worker-file prune that runs meanwhile.
  private uploadsInFlight = new Set<string>();

  // Uploads that a page reload could not put back into the worker. A snapshot
  // that undo/redo restores is about the upload it names, so its uploadMissing
  // follows this set.
  private missingUploads = new Set<string>();

  // Settles once the file restored after a page reload is back in the worker
  // (see restoreUploadedFile); requests that read the file wait for it.
  private uploadRestored: Promise<void> = Promise.resolve();

  // processingInputsKey of the adopted processing result (see adoptProcessingResult).
  private resultInputsKey: string | null = null;
  private inputsKeyCache: { state: PreprocessingState; key: string } | null = null;

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
    private dataLoader: DataLoaderService,
    private fileStore: WizardFileStore
  ) {
    // The wizard is open: start Python now (the worker is created on first need),
    // so it is ready by the time the user has picked a file.
    this.dataProcessor.preload?.();
    // Load saved state from localStorage if available
    this.loadStateFromStorage();
  }

  /** A dataset name not used in the dashboard yet: (1), (2), … appended when needed. */
  private getUniqueDatasetName(baseName: string): string {
    return uniqueDatasetName(baseName, this.dataLoader.getDataSetNames());
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
  // Programmatic: the stepper checks isStepReachable before it calls this, and
  // the steps' Continue buttons check their own settings (canProceed).
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
      this.updateState({ currentStep: index, furthestStep: Math.max(this.currentState.furthestStep, index) });
      // A reload returns to the step shown last, not to the step of the last edit.
      this.saveStateToStorage();
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
  public async loadCSV(file: File): Promise<LoadedFile> {
    const fileName = file.name;
    const uploadKey = this.uploadKeyFor(fileName);
    const release = this.holdProcessing();
    this.uploadsInFlight.add(uploadKey);
    this.updateState({ error: null });

    try {
      // Send the file to the worker for profiling; this also writes it into the Pyodide FS.
      const profiled: DataProfile = await this.dataProcessor.profileData(uploadKey, await file.arrayBuffer());
      // The worker knows the upload by its key; the user knows the file by its name.
      const profile: DataProfile = { ...profiled, fileName };
      const historyId = this.adoptLoadedFile(fileName, uploadKey, profile);
      // Kept so a page reload can put the file back into the worker.
      void this.fileStore.save(uploadKey, file);
      return { profile, historyId };
    } catch (error: unknown) {
      this.updateState({ error: this.toErrorMessage(error, 'Failed to load data file') });
      throw error;
    } finally {
      release();
      this.uploadsInFlight.delete(uploadKey);
      // The previous upload stays referenced by the undo history; anything no
      // longer referenced (e.g. this file, if loading failed) is removed.
      this.pruneWorkerFiles();
    }
  }

  /**
   * The key to store an upload of `fileName` under: the name itself, unless an
   * upload still referenced (by the state, the undo history or a running
   * upload) is stored under it. Uploading a corrected file under the same name
   * must not overwrite the one an undo would go back to.
   */
  private uploadKeyFor(fileName: string): string {
    const taken = new Set(this.referencedFileNames());
    if (!taken.has(fileName)) return fileName;
    const dot = fileName.lastIndexOf('.');
    const stem = dot > 0 ? fileName.slice(0, dot) : fileName;
    const extension = dot > 0 ? fileName.slice(dot) : '';
    for (let n = 2; ; n++) {
      const key = `${stem} (${n})${extension}`;
      if (!taken.has(key)) return key;
    }
  }

  /**
   * Install a freshly profiled file as one undoable "File loaded/replaced"
   * action and return its history id; null for the restore path, which records
   * no entry.
   */
  private adoptLoadedFile(fileName: string, uploadKey: string, profile: DataProfile): number | null {
    if (this.currentState.uploadMissing && this.sameColumns(profile)) {
      // The file lost by a page reload is back: keep the restored settings.
      this.updateState({ dataProfile: profile, rawFileName: fileName, uploadKey, uploadMissing: false });
      this.saveStateToStorage();
      return null;
    }

    const columnConfigs = new Map<string, ColumnConfig>();
    profile.columns.forEach((col: ColumnStatistics) => {
      columnConfigs.set(col.name, createDefaultColumnConfig(col));
    });

    // Generate unique dataset name and timestamp
    const baseName = fileName.replace(/\.csv$/i, '');
    const datasetName = this.getUniqueDatasetName(baseName);
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');

    // A4: snapshot the prior data before it is replaced, so a re-upload is undoable.
    const historyId = this.pushHistory(this.currentState.dataProfile !== null ? 'File replaced' : 'File loaded');

    this.updateState({
      dataProfile: profile,
      rawFileName: fileName,
      uploadKey,
      uploadMissing: false,
      columnConfigs,
      datasetName,
      timestamp,
      // A new file is walked through the steps again.
      furthestStep: this.currentState.currentStep,
    });
    // Glyph, tooltip and color mappings name the old file's features.
    this.validateDependentReferences();
    this.saveStateToStorage();
    return historyId;
  }

  /** Choose the ZIP archive of item images for the Image glyph type, or drop it with null. */
  public async setThumbnailArchive(archive: File | null): Promise<void> {
    if (archive) await this.fileStore.save(archive.name, archive);
    this.updateState({ thumbnailArchiveName: archive?.name ?? null });
    this.saveStateToStorage();
    this.pruneWorkerFiles();
  }

  /** The chosen ZIP archive of item images, if any. */
  public async thumbnailArchive(): Promise<Blob | undefined> {
    const name = this.currentState.thumbnailArchiveName;
    return name ? this.fileStore.load(name) : undefined;
  }

  /**
   * Key of the uploaded file once it is in the worker: after a page reload,
   * this waits until the file is restored. Throws when there is none.
   */
  private async loadedUploadKey(): Promise<string> {
    await this.uploadRestored;
    const { uploadKey, uploadMissing } = this.currentState;
    if (!uploadKey) {
      throw new Error('No data file loaded. Please upload a file first.');
    }
    if (uploadMissing) {
      throw new Error('The data file is no longer loaded after the page reload. Please upload it again in step 1.');
    }
    return uploadKey;
  }

  /** Whether a profile has exactly the columns the current settings are for. */
  private sameColumns(profile: DataProfile): boolean {
    const names = profile.columns.map(column => column.name);
    const configured = Array.from(this.currentState.columnConfigs.keys());
    return names.length === configured.length && names.every(name => this.currentState.columnConfigs.has(name));
  }

  /**
   * After a page reload the worker's file system is empty: put the uploaded file
   * back from the file store. When it is gone, ask for it in the upload step;
   * uploading the same file again keeps the restored settings.
   */
  private async restoreUploadedFile(uploadKey: string): Promise<void> {
    const release = this.holdProcessing();
    this.uploadsInFlight.add(uploadKey);
    try {
      const file = await this.fileStore.load(uploadKey);
      if (!file) throw new Error(`"${uploadKey}" is not stored`);
      await this.dataProcessor.profileData(uploadKey, await file.arrayBuffer());
    } catch (error: unknown) {
      console.warn('[PreprocessingService] The uploaded file could not be restored:', error);
      this.missingUploads.add(uploadKey);
      if (this.currentState.uploadKey === uploadKey) {
        this.updateState({ uploadMissing: true, currentStep: stepIndex('upload') });
      }
    } finally {
      release();
      this.uploadsInFlight.delete(uploadKey);
    }
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
    this.validateDependentReferences();
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
    // Role, selection, encoding and type all change which features exist.
    this.validateDependentReferences();
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
    if (features.length < MIN_GLYPH_AXES || features.length > MAX_GLYPH_AXES) {
      throw new Error(`A glyph needs ${MIN_GLYPH_AXES}–${MAX_GLYPH_AXES} glyph features`);
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
    }
  }

  /**
   * Use a column as a feature or as metadata (tooltip and search only). One undo
   * entry; a column that becomes metadata also leaves the glyph and color mapping.
   */
  public setColumnRole(columnName: string, role: ColumnRole): void {
    const config = this.currentState.columnConfigs.get(columnName);
    if (!config || config.role === role) return;
    this.pushHistory(role === ColumnRole.Metadata ? 'Column used as metadata' : 'Column used as feature');
    this.applyColumnConfig(columnName, { role });
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
   * A4/cross-field: after any change to the file or to which features exist
   * (selection, role, encoding, type), remove references that would otherwise
   * dangle. Concretely: a disabled or metadata column can no longer be the
   * color feature, and glyph/tooltip mappings drop features the settings no
   * longer produce. If the color feature was cleared, the color scale falls back
   * to the numeric default so the review/glyph step UI does not keep showing a
   * scale for a column that is gone.
   *
   * Runs after the change (and after pushHistory captured the pre-change
   * snapshot), so a single undo reverts both the change and this cleanup as one
   * atomic action, while the redo snapshot holds the already-cleaned state.
   */
  private validateDependentReferences(): void {
    // Drop the color-feature flag from columns that are no feature any more.
    let colorFeatureCleared = false;
    const configs = this.mapColumnConfigs(config => {
      if (isFeatureColumn(config) || !config.isColorFeature) return config;
      colorFeatureCleared = true;
      return { ...config, isColorFeature: false };
    });

    // Glyph/tooltip mappings may only reference features the worker produces.
    // predictEncodedFeatureNames() restricts itself to feature columns and
    // follows Python's one-hot rule, so it is the source of truth for valid names.
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
    const uploadKey = await this.loadedUploadKey();
    const result = await this.dataProcessor.detectOutliers(uploadKey, columnName, method);

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
    const uploadKey = await this.loadedUploadKey();
    const result = await this.dataProcessor.detectDuplicates(uploadKey, subsetColumns);

    return {
      duplicateCount: result.duplicateCount,
      duplicateIndices: result.duplicateIndices,
      percentage: result.percentage,
      sampleDuplicates: result.sampleDuplicates,
    };
  }

  // ── Processing ───────────────────────────────────────────────────────────
  // A processing run (Python, FastMap, background projections) is owned by
  // ProcessingRunService; this service holds the inputs and the adopted result.

  /**
   * Identity of everything a processing run depends on: the stored upload,
   * the item-image archive and every setting sent to Python (which includes the
   * projection methods and the dataset name). Derived values such as outlier
   * counts are not part of it.
   */
  get processingInputsKey(): string {
    return this.inputsKeyOf(this.currentState);
  }

  private inputsKeyOf(state: PreprocessingState): string {
    if (this.inputsKeyCache?.state !== state) {
      const key = JSON.stringify([state.uploadKey, state.thumbnailArchiveName, buildProcessingConfig(state)]);
      this.inputsKeyCache = { state, key };
    }
    return this.inputsKeyCache.key;
  }

  /**
   * Run the Python pipeline on the uploaded file with the current settings and
   * return the processed collection (without projection positions). Waits for
   * a file that a page reload is still putting back into the worker.
   */
  public async processInWorker(): Promise<ProcessedCollection> {
    if (!this.currentState.dataProfile) {
      throw new Error('No data file loaded. Please upload a file first.');
    }
    const release = this.holdProcessing();
    try {
      const uploadKey = await this.loadedUploadKey();
      const config = buildProcessingConfig(this.currentState);
      return (await this.dataProcessor.processWithConfig(uploadKey, config)) as unknown as ProcessedCollection;
    } finally {
      release();
    }
  }

  /**
   * Make `collection` the wizard's processing result, if the file and settings
   * are still those it was computed from (`inputsKey`, a processingInputsKey
   * taken when the run started). Returns false, and keeps no result, when they
   * changed meanwhile. The result is cleared as soon as they change later.
   */
  public adoptProcessingResult(collection: ProcessedCollection, inputsKey: string): boolean {
    if (inputsKey !== this.processingInputsKey) {
      return false;
    }
    this.resultInputsKey = inputsKey;
    this.updateState({ processedDataset: collection });
    return true;
  }

  /** Drop the processing result (a new run starts, or it was discarded). */
  public clearProcessingResult(): void {
    this.resultInputsKey = null;
    if (this.currentState.processedDataset !== null) {
      this.updateState({ processedDataset: null });
    }
  }

  /**
   * Keep `isProcessing` true until `task` settles. processInWorker() only covers
   * the worker run; a caller whose run has further phases (the processing run
   * computes the primary FastMap projection afterwards) wraps the whole run in
   * this, so undo/redo stay blocked until the primary result is complete.
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

  /** Clear a lingering upload error. The error flag lives in the root
   *  singleton state and previously survived closing/reopening the wizard,
   *  so a stale error reappeared on re-entry (P-S5-03). */
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

  // State management. The one place that keeps derived state consistent: a
  // processing result only survives an update that leaves its inputs unchanged.
  private updateState(updates: Partial<PreprocessingState>): void {
    const next = { ...this.currentState, ...updates };
    if (next.processedDataset !== null && this.inputsKeyOf(next) !== this.resultInputsKey) {
      next.processedDataset = null;
    }
    this.stateSubject.next(next);
  }

  public resetState(): void {
    // A run that is still in flight keeps the processing flag until it settles.
    this.resultInputsKey = null;
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

  /** Unique upload keys still referenced by the state, the undo/redo history or a running upload. */
  private referencedFileNames(): string[] {
    const snapshots = [
      this.currentState,
      ...this.undoStack.map(e => e.snapshot),
      ...this.redoStack.map(e => e.snapshot),
    ];
    const keys = snapshots.map(s => s.uploadKey).filter((key): key is string => key !== null);
    const archive = this.currentState.thumbnailArchiveName;
    return Array.from(new Set([...keys, ...(archive ? [archive] : []), ...this.uploadsInFlight]));
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
    this.fileStore.prune(keep).catch(logFailure);
  }

  /** Prune when dropped history entries were the last reference to an uploaded file. */
  private pruneIfOrphaned(dropped: HistoryEntry[]): void {
    const referenced = new Set(this.referencedFileNames());
    const orphaned = dropped.some(e => e.snapshot.uploadKey !== null && !referenced.has(e.snapshot.uploadKey));
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

  /**
   * Install a snapshot, deep-copying again so the stored entry stays pristine.
   * An upload that a page reload could not restore is still missing.
   */
  private restoreSnapshot(snap: HistorySnapshot): void {
    const uploadMissing = snap.uploadKey !== null && this.missingUploads.has(snap.uploadKey);
    this.updateState({ ...copySnapshot(snap), uploadMissing });
  }

  // Persistence (versioned; see wizard-storage.ts for the format and migration)
  private saveStateToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeState(this.currentState)));
    } catch (error) {
      // An older save would bring back an older session (maybe of another file)
      // after a reload; without one, the wizard starts from the beginning.
      console.warn('Failed to save the wizard state to localStorage; a reload will start over:', error);
      this.clearStateFromStorage();
    }
  }

  private loadStateFromStorage(): void {
    try {
      const restored = deserializeState(localStorage.getItem(STORAGE_KEY));
      if (restored) {
        this.updateState(restored);
        // A save from an older version may hold references the current rules reject.
        this.validateDependentReferences();
        if (restored.uploadKey) this.uploadRestored = this.restoreUploadedFile(restored.uploadKey);
      }
    } catch (error) {
      console.warn('Failed to load state from localStorage:', error);
    }
  }

  private clearStateFromStorage(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear the wizard state in localStorage:', error);
    }
  }
}
