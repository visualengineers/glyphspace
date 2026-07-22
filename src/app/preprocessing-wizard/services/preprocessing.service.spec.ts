import { PreprocessingService } from './preprocessing.service';
import { DataProcessorService } from '../../services/data-processor';
import { DataLoaderService } from '../../services/data-loader.service';
import { HistoryStatus, PreprocessingState } from '../models/preprocessing-state';
import { ColumnConfig } from '../models/column-config';
import { DataProfile, ColumnStatistics } from '../models/column-statistics';
import {
  DataType,
  EncodingMethod,
  ScalingMethod,
  MissingValueStrategy,
  OutlierMethod,
  OutlierStrategy,
} from '../models/data-type.enum';

/**
 * A4 – Undo/Redo history engine.
 *
 * These tests drive the history stack directly on the service (the single source
 * of truth for undo/redo). They pin the invariants the wizard shell and the step
 * components rely on: LIFO ordering, redo-stack invalidation, snapshot isolation
 * (deep copy), the MAX_HISTORY cap, the diff-based settingLabel/deep-link mapping,
 * and the cross-field cleanup that must undo as one atomic action.
 */
describe('PreprocessingService – Undo/Redo history', () => {
  let service: PreprocessingService;

  // Minimal stubs: the history engine never touches the worker or the data loader.
  const dataProcessorStub = {} as unknown as ConstructorParameters<typeof PreprocessingService>[0];
  const dataLoaderStub = {
    getDataSetNames: () => [] as string[],
  } as unknown as ConstructorParameters<typeof PreprocessingService>[1];

  function makeColumn(name: string, dataType: DataType): ColumnStatistics {
    return {
      name,
      dataType,
      count: 100,
      missingCount: 0,
      missingPercentage: 0,
      uniqueCount: 50,
      mean: 10,
      stdDev: 2,
    };
  }

  function makeConfig(name: string, overrides: Partial<ColumnConfig> = {}): ColumnConfig {
    return {
      name,
      originalType: DataType.Numeric,
      targetType: DataType.Numeric,
      encodingMethod: EncodingMethod.Normalize,
      scalingMethod: ScalingMethod.MinMax,
      includeInProjection: true,
      isColorFeature: false,
      missingValueStrategy: MissingValueStrategy.Keep,
      outlierMethod: OutlierMethod.IQR_1_5,
      outlierStrategy: OutlierStrategy.Keep,
      enabled: true,
      hasIssues: false,
      ...overrides,
    };
  }

  /** Seed the service with a realistic loaded-file state without running the worker. */
  function seed(overrides: Partial<PreprocessingState> = {}): void {
    const columns = ['alpha', 'beta', 'gamma'].map(n => makeColumn(n, DataType.Numeric));
    const profile: DataProfile = {
      totalRows: 100,
      totalColumns: columns.length,
      fileSize: 1000,
      fileName: 'test.csv',
      columns,
      qualityScore: 90,
      duplicateCount: 0,
      previewRows: [],
    };
    const columnConfigs = new Map<string, ColumnConfig>();
    columns.forEach(c => columnConfigs.set(c.name, makeConfig(c.name)));

    // updateState is private but is the honest way to install a base state in a test.
    (service as unknown as { updateState(u: Partial<PreprocessingState>): void }).updateState({
      rawFileName: 'test.csv',
      dataProfile: profile,
      columnConfigs,
      datasetName: 'test',
      ...overrides,
    });
  }

  function latestHistory(): HistoryStatus {
    let status!: HistoryStatus;
    service.history$.subscribe(s => (status = s)).unsubscribe();
    return status;
  }

  beforeEach(() => {
    localStorage.clear();
    service = new PreprocessingService(dataProcessorStub, dataLoaderStub);
    seed();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('empty history', () => {
    it('starts with nothing to undo or redo', () => {
      const status = latestHistory();
      expect(status.canUndo).toBeFalse();
      expect(status.canRedo).toBeFalse();
      expect(status.undoLabel).toBeNull();
      expect(status.redoLabel).toBeNull();
      expect(service.canUndo).toBeFalse();
      expect(service.canRedo).toBeFalse();
    });

    it('undo() and redo() return null and change nothing on an empty stack', () => {
      const before = service.currentState;
      expect(service.undo()).toBeNull();
      expect(service.redo()).toBeNull();
      expect(service.currentState).toBe(before);
    });
  });

  describe('pushHistory', () => {
    it('makes undo available and reports the action label', () => {
      service.pushHistory('Aktion A');
      const status = latestHistory();
      expect(status.canUndo).toBeTrue();
      expect(status.undoLabel).toBe('Aktion A');
      expect(status.canRedo).toBeFalse();
    });

    it('caps the undo stack at MAX_HISTORY (50) entries', () => {
      for (let i = 0; i < 60; i++) {
        service.pushHistory(`Aktion ${i}`);
      }
      const stackLen = (service as unknown as { undoStack: unknown[] }).undoStack.length;
      expect(stackLen).toBe(50);
      // The oldest entries were dropped, the newest survives.
      expect(latestHistory().undoLabel).toBe('Aktion 59');
    });
  });

  describe('undo / redo round trip', () => {
    it('reverts a column-enable toggle and re-applies it', () => {
      service.toggleColumnEnabled('alpha'); // disable
      expect(service.currentState.columnConfigs.get('alpha')!.enabled).toBeFalse();

      const undoInfo = service.undo();
      expect(undoInfo).not.toBeNull();
      expect(service.currentState.columnConfigs.get('alpha')!.enabled).toBeTrue();

      const redoInfo = service.redo();
      expect(redoInfo).not.toBeNull();
      expect(service.currentState.columnConfigs.get('alpha')!.enabled).toBeFalse();
    });

    it('reverts and re-applies a glyph-feature change', () => {
      service.pushHistory('Glyph-Merkmale geändert');
      service.setGlyphFeatures(['alpha', 'beta', 'gamma']);
      expect(service.currentState.glyphFeatures).toEqual(['alpha', 'beta', 'gamma']);

      service.undo();
      expect(service.currentState.glyphFeatures).toEqual([]);

      service.redo();
      expect(service.currentState.glyphFeatures).toEqual(['alpha', 'beta', 'gamma']);
    });

    it('unwinds several actions in strict LIFO order', () => {
      service.updateColumnConfig('alpha', { encodingMethod: EncodingMethod.Standardize });
      service.updateColumnConfig('beta', { encodingMethod: EncodingMethod.Standardize });

      // Undo the beta change first (most recent), then alpha.
      service.undo();
      expect(service.currentState.columnConfigs.get('beta')!.encodingMethod).toBe(EncodingMethod.Normalize);
      expect(service.currentState.columnConfigs.get('alpha')!.encodingMethod).toBe(EncodingMethod.Standardize);

      service.undo();
      expect(service.currentState.columnConfigs.get('alpha')!.encodingMethod).toBe(EncodingMethod.Normalize);
    });

    it('keeps undo/redo labels in sync with the stacks', () => {
      service.pushHistory('Aktion A');
      service.pushHistory('Aktion B');
      expect(latestHistory().undoLabel).toBe('Aktion B');

      service.undo();
      const afterUndo = latestHistory();
      expect(afterUndo.undoLabel).toBe('Aktion A');
      expect(afterUndo.redoLabel).toBe('Aktion B');
      expect(afterUndo.canRedo).toBeTrue();
    });
  });

  describe('redo-stack invalidation', () => {
    it('clears the redo stack when a new action is pushed after an undo', () => {
      service.pushHistory('Aktion A');
      service.undo();
      expect(latestHistory().canRedo).toBeTrue();

      service.pushHistory('Aktion B');
      const status = latestHistory();
      expect(status.canRedo).toBeFalse();
      expect(service.redo()).toBeNull();
    });
  });

  describe('snapshot isolation', () => {
    it('deep-copies column configs so a later in-place mutation cannot corrupt a snapshot', () => {
      service.pushHistory('Vor Mutation');
      // Mutate the live config object in place, bypassing the public API entirely.
      const liveConfig = service.currentState.columnConfigs.get('alpha')!;
      liveConfig.encodingMethod = EncodingMethod.Standardize;

      service.undo();
      // The snapshot must still hold the pre-mutation value.
      expect(service.currentState.columnConfigs.get('alpha')!.encodingMethod).toBe(EncodingMethod.Normalize);
    });

    it('deep-copies glyph feature arrays', () => {
      service.setGlyphFeatures(['alpha', 'beta', 'gamma']);
      service.pushHistory('Vor Mutation');
      // Push directly onto the live array reference.
      service.currentState.glyphFeatures.push('delta');

      service.undo();
      expect(service.currentState.glyphFeatures).toEqual(['alpha', 'beta', 'gamma']);
    });
  });

  describe('describeDiff – setting label and deep-link mapping', () => {
    it('names an encoding change and points to step 3 (Datenkonfiguration)', () => {
      service.updateColumnConfig('alpha', { encodingMethod: EncodingMethod.Standardize });
      const info = service.undo()!;
      expect(info.settingLabel).toBe('Encoding');
      expect(info.step).toBe(2);
      expect(info.anchorId).toBe('wizard-anchor-features');
    });

    it('names a glyph-feature change and points to step 4 (Visualisierung)', () => {
      service.pushHistory('Glyph-Merkmale geändert');
      service.setGlyphFeatures(['alpha', 'beta', 'gamma']);
      const info = service.undo()!;
      expect(info.settingLabel).toBe('Glyph-Merkmale');
      expect(info.step).toBe(3);
      expect(info.anchorId).toBe('wizard-anchor-glyph');
    });

    it('names a column-selection change', () => {
      service.toggleColumnEnabled('alpha');
      const info = service.undo()!;
      expect(info.settingLabel).toBe('Spaltenauswahl');
      expect(info.step).toBe(1);
    });

    it('falls back to the raw action label when no field maps cleanly', () => {
      // Push twice over an identical state so the diff finds no changed field.
      service.pushHistory('Freitext-Aktion');
      const info = service.undo()!;
      expect(info.actionLabel).toBe('Freitext-Aktion');
      expect(info.settingLabel).toBe('Freitext-Aktion');
      expect(info.step).toBeNull();
    });
  });

  describe('cross-field cleanup is atomic under undo', () => {
    it('restores the color feature, color scale AND glyph mapping with a single undo', () => {
      // alpha is the color feature; glyph rays reference alpha + beta.
      seed();
      const configs = service.currentState.columnConfigs;
      configs.get('alpha')!.isColorFeature = true;
      (service as unknown as { updateState(u: Partial<PreprocessingState>): void }).updateState({
        columnConfigs: new Map(configs),
        colorScaleId: 2,
        colorScaleMode: 'continuous',
        glyphFeatures: ['alpha', 'beta'],
      });

      // Disabling alpha must cascade: clear color feature, reset scale, drop alpha from glyph.
      service.toggleColumnEnabled('alpha');
      expect(service.currentState.columnConfigs.get('alpha')!.isColorFeature).toBeFalse();
      expect(service.currentState.colorScaleId).toBe(0);
      expect(service.currentState.glyphFeatures).toEqual(['beta']);

      // A single undo reverts the toggle and the whole cascade together.
      service.undo();
      const restored = service.currentState;
      expect(restored.columnConfigs.get('alpha')!.enabled).toBeTrue();
      expect(restored.columnConfigs.get('alpha')!.isColorFeature).toBeTrue();
      expect(restored.colorScaleId).toBe(2);
      expect(restored.glyphFeatures).toEqual(['alpha', 'beta']);
    });
  });

  describe('resetState', () => {
    it('clears both history stacks', () => {
      service.pushHistory('Aktion A');
      service.pushHistory('Aktion B');
      service.undo();
      expect(latestHistory().canUndo).toBeTrue();
      expect(latestHistory().canRedo).toBeTrue();

      service.resetState();
      const status = latestHistory();
      expect(status.canUndo).toBeFalse();
      expect(status.canRedo).toBeFalse();
    });
  });

  describe('describeDiff – full SETTING_META mapping', () => {
    // Change exactly one field, then undo, and check the reported setting/deep-link.
    // pushHistory snapshots the pre-change state; the single mutation is the only diff.
    function undoInfoAfter(mutate: () => void) {
      service.pushHistory('irgendeine Aktion');
      mutate();
      return service.undo()!;
    }

    function mutateColumn<K extends keyof ColumnConfig>(field: K, value: ColumnConfig[K]): void {
      const configs = new Map(service.currentState.columnConfigs);
      configs.set('alpha', { ...configs.get('alpha')!, [field]: value });
      (service as unknown as { updateState(u: Partial<PreprocessingState>): void }).updateState({ columnConfigs: configs });
    }

    function setTop(updates: Partial<PreprocessingState>): void {
      (service as unknown as { updateState(u: Partial<PreprocessingState>): void }).updateState(updates);
    }

    const cases: { name: string; mutate: () => void; label: string; step: number | null; anchor: string | null }[] = [
      { name: 'rawFileName', mutate: () => setTop({ rawFileName: 'anders.csv' }), label: 'Datei', step: 0, anchor: null },
      { name: 'datasetName', mutate: () => setTop({ datasetName: 'umbenannt' }), label: 'Datensatzname', step: 0, anchor: null },
      { name: 'columnConfigs.enabled', mutate: () => mutateColumn('enabled', false), label: 'Spaltenauswahl', step: 1, anchor: 'wizard-anchor-columns' },
      { name: 'columnConfigs.isColorFeature', mutate: () => mutateColumn('isColorFeature', true), label: 'Farbattribut', step: 3, anchor: 'wizard-anchor-color' },
      { name: 'columnConfigs.targetType', mutate: () => mutateColumn('targetType', DataType.Categorical), label: 'Datentyp', step: 2, anchor: 'wizard-anchor-features' },
      { name: 'columnConfigs.encodingMethod', mutate: () => mutateColumn('encodingMethod', EncodingMethod.Standardize), label: 'Encoding', step: 2, anchor: 'wizard-anchor-features' },
      { name: 'columnConfigs.scalingMethod', mutate: () => mutateColumn('scalingMethod', ScalingMethod.Standard), label: 'Skalierung', step: 2, anchor: 'wizard-anchor-features' },
      { name: 'columnConfigs.includeInProjection', mutate: () => mutateColumn('includeInProjection', false), label: 'Projektionsspalten', step: 3, anchor: 'wizard-anchor-projection-columns' },
      { name: 'columnConfigs.missingValueStrategy', mutate: () => mutateColumn('missingValueStrategy', MissingValueStrategy.FillMean), label: 'Fehlende Werte', step: 2, anchor: 'wizard-anchor-features' },
      { name: 'columnConfigs.outlierStrategy', mutate: () => mutateColumn('outlierStrategy', OutlierStrategy.Remove), label: 'Ausreißerbehandlung', step: 2, anchor: 'wizard-anchor-features' },
      { name: 'cleaningConfig', mutate: () => setTop({ cleaningConfig: { removeDuplicates: true } }), label: 'Datenbereinigung', step: 2, anchor: 'wizard-anchor-cleaning' },
      { name: 'projectionConfig', mutate: () => setTop({ projectionConfig: { ...service.currentState.projectionConfig, enablePCA: false } }), label: 'Projektionsparameter', step: 3, anchor: 'wizard-anchor-methods' },
      { name: 'glyphFeatures', mutate: () => setTop({ glyphFeatures: ['alpha'] }), label: 'Glyph-Merkmale', step: 3, anchor: 'wizard-anchor-glyph' },
      { name: 'tooltipFeatures', mutate: () => setTop({ tooltipFeatures: ['alpha'] }), label: 'Tooltip-Merkmale', step: 3, anchor: 'wizard-anchor-glyph' },
      { name: 'colorScaleMode', mutate: () => setTop({ colorScaleMode: 'categorical' }), label: 'Farbmodus', step: 3, anchor: 'wizard-anchor-color' },
      { name: 'colorScaleId', mutate: () => setTop({ colorScaleId: 5 }), label: 'Farbskala', step: 3, anchor: 'wizard-anchor-color' },
    ];

    cases.forEach(c => {
      it(`maps a ${c.name} change to "${c.label}" (step ${c.step})`, () => {
        const info = undoInfoAfter(c.mutate);
        expect(info.settingLabel).toBe(c.label);
        expect(info.step).toBe(c.step);
        expect(info.anchorId).toBe(c.anchor);
      });
    });

    it('treats an added/removed column as a selection change', () => {
      service.pushHistory('irgendeine Aktion');
      const configs = new Map(service.currentState.columnConfigs);
      configs.delete('gamma');
      (service as unknown as { updateState(u: Partial<PreprocessingState>): void }).updateState({ columnConfigs: configs });
      const info = service.undo()!;
      expect(info.settingLabel).toBe('Spaltenauswahl');
    });
  });

  describe('round trips for the remaining undoable actions', () => {
    it('setColumnsEnabled reverts a bulk disable', () => {
      service.setColumnsEnabled(['alpha', 'beta'], false);
      expect(service.currentState.columnConfigs.get('alpha')!.enabled).toBeFalse();
      expect(service.currentState.columnConfigs.get('beta')!.enabled).toBeFalse();

      service.undo();
      expect(service.currentState.columnConfigs.get('alpha')!.enabled).toBeTrue();
      expect(service.currentState.columnConfigs.get('beta')!.enabled).toBeTrue();
    });

    it('selectAllColumns undo restores a previously disabled column', () => {
      service.setColumnsEnabled(['alpha'], false);
      service.selectAllColumns();
      expect(service.currentState.columnConfigs.get('alpha')!.enabled).toBeTrue();

      service.undo(); // revert selectAll
      expect(service.currentState.columnConfigs.get('alpha')!.enabled).toBeFalse();
    });

    it('deselectAllColumns is fully reversible', () => {
      service.deselectAllColumns();
      const allDisabled = Array.from(service.currentState.columnConfigs.values()).every(c => !c.enabled);
      expect(allDisabled).toBeTrue();

      service.undo();
      const allEnabled = Array.from(service.currentState.columnConfigs.values()).every(c => c.enabled);
      expect(allEnabled).toBeTrue();
    });

    it('updateCleaningConfig round trip', () => {
      expect(service.currentState.cleaningConfig.removeDuplicates).toBeFalse();
      service.updateCleaningConfig({ removeDuplicates: true });
      expect(service.currentState.cleaningConfig.removeDuplicates).toBeTrue();

      service.undo();
      expect(service.currentState.cleaningConfig.removeDuplicates).toBeFalse();
    });

    it('updateProjectionConfig round trip', () => {
      expect(service.currentState.projectionConfig.enablePCA).toBeTrue();
      service.updateProjectionConfig({ enablePCA: false });
      expect(service.currentState.projectionConfig.enablePCA).toBeFalse();

      service.undo();
      expect(service.currentState.projectionConfig.enablePCA).toBeTrue();
    });
  });

  describe('file load history', () => {
    const profile: DataProfile = {
      totalRows: 2,
      totalColumns: 0,
      fileSize: 10,
      fileName: 'x.csv',
      columns: [] as ColumnStatistics[],
      qualityScore: 100,
      duplicateCount: 0,
      previewRows: [],
    };

    function serviceWithLoader() {
      const proc = { profileData: async () => profile } as unknown as ConstructorParameters<typeof PreprocessingService>[0];
      return new PreprocessingService(proc, dataLoaderStub);
    }

    function csvFile(): File {
      return new File(['a,b\n1,2\n'], 'daten.csv', { type: 'text/csv' });
    }

    it('records the first load as "Datei geladen" and undo clears the profile', async () => {
      const svc = serviceWithLoader();
      await svc.loadCSV(csvFile());

      expect(svc.currentState.dataProfile).not.toBeNull();
      expect(svc.canUndo).toBeTrue();
      let status!: HistoryStatus;
      svc.history$.subscribe(s => (status = s)).unsubscribe();
      expect(status.undoLabel).toBe('Datei geladen');

      svc.undo();
      expect(svc.currentState.dataProfile).toBeNull();
    });

    it('labels a re-upload as "Datei ersetzt"', async () => {
      const svc = serviceWithLoader();
      await svc.loadCSV(csvFile());
      await svc.loadCSV(csvFile());

      let status!: HistoryStatus;
      svc.history$.subscribe(s => (status = s)).unsubscribe();
      expect(status.undoLabel).toBe('Datei ersetzt');
    });
  });
});

/**
 * A3 — state-level error-handling tests for PreprocessingService.
 * `toErrorMessage` must keep string rejections (the worker often rejects with a
 * plain string, which the old `instanceof Error` check discarded), and
 * `clearError` must clear the lingering error flag so a stale "Processing
 * failed" no longer survives closing/reopening the wizard.
 *
 * The service is constructed directly with lightweight stubs to avoid pulling
 * the heavy data-processor / pyodide runtime into the unit test.
 */
describe('PreprocessingService — error handling (A3)', () => {
  let service: PreprocessingService;

  beforeEach(() => {
    localStorage.removeItem('glyphspace_preprocessing_state');
    const dataProcessor = {} as unknown as DataProcessorService;
    const dataLoader = { getDataSetNames: () => [] } as unknown as DataLoaderService;
    service = new PreprocessingService(dataProcessor, dataLoader);
  });

  describe('toErrorMessage', () => {
    // Private helper — accessed via bracket notation for the unit test.
    const call = (err: unknown, fallback: string): string =>
      (service as unknown as { toErrorMessage(e: unknown, f: string): string }).toErrorMessage(err, fallback);

    it('returns the message of an Error instance', () => {
      expect(call(new Error('worker exploded'), 'fallback')).toBe('worker exploded');
    });

    it('keeps a non-empty string rejection instead of discarding it', () => {
      expect(call('could not convert string to float', 'fallback')).toBe('could not convert string to float');
    });

    it('falls back for an empty / whitespace-only string', () => {
      expect(call('   ', 'Processing failed')).toBe('Processing failed');
      expect(call('', 'Processing failed')).toBe('Processing failed');
    });

    it('falls back for non-string, non-Error values', () => {
      expect(call({ some: 'object' }, 'Processing failed')).toBe('Processing failed');
      expect(call(null, 'Processing failed')).toBe('Processing failed');
      expect(call(undefined, 'Processing failed')).toBe('Processing failed');
    });
  });

  describe('clearError', () => {
    // Seed an error into the singleton state via the private updateState.
    const setError = (msg: string | null): void =>
      (service as unknown as { updateState(u: { error: string | null }): void }).updateState({ error: msg });

    it('clears a lingering processing error from the state', () => {
      setError('Processing failed');
      expect(service.currentState.error).toBe('Processing failed');

      service.clearError();
      expect(service.currentState.error).toBeNull();
    });

    it('is a no-op when there is no error', () => {
      let emissions = 0;
      service.state$.subscribe(() => emissions++);
      const before = emissions; // includes the initial replay emission

      service.clearError();
      expect(service.currentState.error).toBeNull();
      // No error present → no extra state emission.
      expect(emissions).toBe(before);
    });
  });
});
