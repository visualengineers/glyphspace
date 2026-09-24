import type { Mock } from 'vitest';
import { PreprocessingService } from './preprocessing.service';
import { createTestPreprocessingService } from '../testing/preprocessing-test-helpers';
import { HistoryStatus, PreprocessingState } from '../models/preprocessing-state';
import { ColumnConfig } from '../models/column-config';
import { DataProfile, ColumnStatistics } from '../models/column-statistics';
import { WizardStepId, stepIndex } from '../shared/constants/step-info';
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
    // The history engine only asks the worker to prune unused files.
    service = createTestPreprocessingService({ pruneFiles: () => Promise.resolve() });
    seed();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('empty history', () => {
    it('starts with nothing to undo or redo', () => {
      const status = latestHistory();
      expect(status.canUndo).toBe(false);
      expect(status.canRedo).toBe(false);
      expect(status.undoLabel).toBeNull();
      expect(status.redoLabel).toBeNull();
      expect(service.canUndo).toBe(false);
      expect(service.canRedo).toBe(false);
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
      service.pushHistory('Action A');
      const status = latestHistory();
      expect(status.canUndo).toBe(true);
      expect(status.undoLabel).toBe('Action A');
      expect(status.canRedo).toBe(false);
    });

    it('caps the undo stack at MAX_HISTORY (50) entries', () => {
      for (let i = 0; i < 60; i++) {
        service.pushHistory(`Action ${i}`);
      }
      const stackLen = (service as unknown as { undoStack: unknown[] }).undoStack.length;
      expect(stackLen).toBe(50);
      // The oldest entries were dropped, the newest survives.
      expect(latestHistory().undoLabel).toBe('Action 59');
    });
  });

  describe('undo / redo round trip', () => {
    it('reverts a column-enable toggle and re-applies it', () => {
      service.toggleColumnEnabled('alpha'); // disable
      expect(service.currentState.columnConfigs.get('alpha')!.enabled).toBe(false);

      const undoInfo = service.undo();
      expect(undoInfo).not.toBeNull();
      expect(service.currentState.columnConfigs.get('alpha')!.enabled).toBe(true);

      const redoInfo = service.redo();
      expect(redoInfo).not.toBeNull();
      expect(service.currentState.columnConfigs.get('alpha')!.enabled).toBe(false);
    });

    it('reverts and re-applies a glyph-feature change', () => {
      service.pushHistory('Glyph features changed');
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
      service.pushHistory('Action A');
      service.pushHistory('Action B');
      expect(latestHistory().undoLabel).toBe('Action B');

      service.undo();
      const afterUndo = latestHistory();
      expect(afterUndo.undoLabel).toBe('Action A');
      expect(afterUndo.redoLabel).toBe('Action B');
      expect(afterUndo.canRedo).toBe(true);
    });
  });

  describe('redo-stack invalidation', () => {
    it('clears the redo stack when a new action is pushed after an undo', () => {
      service.pushHistory('Action A');
      service.undo();
      expect(latestHistory().canRedo).toBe(true);

      service.pushHistory('Action B');
      const status = latestHistory();
      expect(status.canRedo).toBe(false);
      expect(service.redo()).toBeNull();
    });
  });

  describe('snapshot isolation', () => {
    it('deep-copies column configs so a later in-place mutation cannot corrupt a snapshot', () => {
      service.pushHistory('Before mutation');
      // Mutate the live config object in place, bypassing the public API entirely.
      const liveConfig = service.currentState.columnConfigs.get('alpha')!;
      liveConfig.encodingMethod = EncodingMethod.Standardize;

      service.undo();
      // The snapshot must still hold the pre-mutation value.
      expect(service.currentState.columnConfigs.get('alpha')!.encodingMethod).toBe(EncodingMethod.Normalize);
    });

    it('deep-copies glyph feature arrays', () => {
      service.setGlyphFeatures(['alpha', 'beta', 'gamma']);
      service.pushHistory('Before mutation');
      // Push directly onto the live array reference.
      service.currentState.glyphFeatures.push('delta');

      service.undo();
      expect(service.currentState.glyphFeatures).toEqual(['alpha', 'beta', 'gamma']);
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
      expect(service.currentState.columnConfigs.get('alpha')!.isColorFeature).toBe(false);
      expect(service.currentState.colorScaleId).toBe(0);
      expect(service.currentState.glyphFeatures).toEqual(['beta']);

      // A single undo reverts the toggle and the whole cascade together.
      service.undo();
      const restored = service.currentState;
      expect(restored.columnConfigs.get('alpha')!.enabled).toBe(true);
      expect(restored.columnConfigs.get('alpha')!.isColorFeature).toBe(true);
      expect(restored.colorScaleId).toBe(2);
      expect(restored.glyphFeatures).toEqual(['alpha', 'beta']);
    });
  });

  describe('resetState', () => {
    it('clears both history stacks', () => {
      service.pushHistory('Action A');
      service.pushHistory('Action B');
      service.undo();
      expect(latestHistory().canUndo).toBe(true);
      expect(latestHistory().canRedo).toBe(true);

      service.resetState();
      const status = latestHistory();
      expect(status.canUndo).toBe(false);
      expect(status.canRedo).toBe(false);
    });
  });

  describe('describeDiff – full SETTING_META mapping', () => {
    // Change exactly one field, then undo, and check the reported setting/deep-link.
    // pushHistory snapshots the pre-change state; the single mutation is the only diff.
    function undoInfoAfter(mutate: () => void) {
      service.pushHistory('some action');
      mutate();
      return service.undo()!;
    }

    function mutateColumn<K extends keyof ColumnConfig>(field: K, value: ColumnConfig[K]): void {
      const configs = new Map(service.currentState.columnConfigs);
      configs.set('alpha', { ...configs.get('alpha')!, [field]: value });
      (service as unknown as { updateState(u: Partial<PreprocessingState>): void }).updateState({
        columnConfigs: configs,
      });
    }

    function setTop(updates: Partial<PreprocessingState>): void {
      (service as unknown as { updateState(u: Partial<PreprocessingState>): void }).updateState(updates);
    }

    const cases: {
      name: string;
      mutate: () => void;
      label: string;
      step: WizardStepId | null;
      anchor: string | null;
    }[] = [
      {
        name: 'rawFileName',
        mutate: () => setTop({ rawFileName: 'other.csv' }),
        label: 'File',
        step: 'upload',
        anchor: null,
      },
      {
        name: 'datasetName',
        mutate: () => setTop({ datasetName: 'renamed' }),
        label: 'Dataset name',
        step: 'upload',
        anchor: null,
      },
      {
        name: 'columnConfigs.enabled',
        mutate: () => mutateColumn('enabled', false),
        label: 'Column selection',
        step: 'columns',
        anchor: 'wizard-anchor-columns',
      },
      {
        name: 'columnConfigs.isColorFeature',
        mutate: () => mutateColumn('isColorFeature', true),
        label: 'Color attribute',
        step: 'appearance',
        anchor: 'wizard-anchor-color',
      },
      {
        name: 'columnConfigs.targetType',
        mutate: () => mutateColumn('targetType', DataType.Categorical),
        label: 'Data type',
        step: 'features',
        anchor: 'wizard-anchor-features',
      },
      {
        name: 'columnConfigs.encodingMethod',
        mutate: () => mutateColumn('encodingMethod', EncodingMethod.Standardize),
        label: 'Encoding',
        step: 'features',
        anchor: 'wizard-anchor-features',
      },
      {
        name: 'columnConfigs.scalingMethod',
        mutate: () => mutateColumn('scalingMethod', ScalingMethod.Standard),
        label: 'Scaling',
        step: 'features',
        anchor: 'wizard-anchor-features',
      },
      {
        name: 'columnConfigs.includeInProjection',
        mutate: () => mutateColumn('includeInProjection', false),
        label: 'Projection columns',
        step: 'projection',
        anchor: 'wizard-anchor-projection-columns',
      },
      {
        name: 'columnConfigs.missingValueStrategy',
        mutate: () => mutateColumn('missingValueStrategy', MissingValueStrategy.FillMean),
        label: 'Missing values',
        step: 'features',
        anchor: 'wizard-anchor-features',
      },
      {
        name: 'columnConfigs.outlierStrategy',
        mutate: () => mutateColumn('outlierStrategy', OutlierStrategy.Remove),
        label: 'Outlier handling',
        step: 'features',
        anchor: 'wizard-anchor-features',
      },
      {
        name: 'cleaningConfig',
        mutate: () => setTop({ cleaningConfig: { removeDuplicates: true } }),
        label: 'Data cleaning',
        step: 'features',
        anchor: 'wizard-anchor-cleaning',
      },
      {
        name: 'projectionConfig',
        mutate: () => setTop({ projectionConfig: { ...service.currentState.projectionConfig, enablePCA: false } }),
        label: 'Projection settings',
        step: 'projection',
        anchor: 'wizard-anchor-methods',
      },
      {
        name: 'glyphFeatures',
        mutate: () => setTop({ glyphFeatures: ['alpha'] }),
        label: 'Glyph features',
        step: 'appearance',
        anchor: 'wizard-anchor-glyph',
      },
      {
        name: 'tooltipFeatures',
        mutate: () => setTop({ tooltipFeatures: ['alpha'] }),
        label: 'Tooltip features',
        step: 'appearance',
        anchor: 'wizard-anchor-glyph',
      },
      {
        name: 'colorScaleMode',
        mutate: () => setTop({ colorScaleMode: 'categorical' }),
        label: 'Color mode',
        step: 'appearance',
        anchor: 'wizard-anchor-color',
      },
      {
        name: 'colorScaleId',
        mutate: () => setTop({ colorScaleId: 5 }),
        label: 'Color scale',
        step: 'appearance',
        anchor: 'wizard-anchor-color',
      },
    ];

    cases.forEach(c => {
      it(`maps a ${c.name} change to "${c.label}" (step ${c.step})`, () => {
        const info = undoInfoAfter(c.mutate);
        expect(info.settingLabel).toBe(c.label);
        expect(info.step).toBe(c.step);
        expect(info.anchorId).toBe(c.anchor);
      });
    });

    it('falls back to the raw action label when no field maps cleanly', () => {
      // Push twice over an identical state so the diff finds no changed field.
      service.pushHistory('Free-text action');
      const info = service.undo()!;
      expect(info.actionLabel).toBe('Free-text action');
      expect(info.settingLabel).toBe('Free-text action');
      expect(info.step).toBeNull();
    });

    it('treats an added/removed column as a selection change', () => {
      service.pushHistory('some action');
      const configs = new Map(service.currentState.columnConfigs);
      configs.delete('gamma');
      (service as unknown as { updateState(u: Partial<PreprocessingState>): void }).updateState({
        columnConfigs: configs,
      });
      const info = service.undo()!;
      expect(info.settingLabel).toBe('Column selection');
    });
  });

  describe('round trips for the remaining undoable actions', () => {
    it('bulk column changes replace configs instead of mutating the previous state', () => {
      const before = service.currentState.columnConfigs;
      const alphaBefore = before.get('alpha');

      service.setColumnsEnabled(['alpha'], false);
      service.deselectAllColumns();
      service.selectAllColumns();

      expect(alphaBefore?.enabled).toBe(true);
      expect(before.get('alpha')).toBe(alphaBefore);
    });

    it('setColumnsEnabled reverts a bulk disable', () => {
      service.setColumnsEnabled(['alpha', 'beta'], false);
      expect(service.currentState.columnConfigs.get('alpha')!.enabled).toBe(false);
      expect(service.currentState.columnConfigs.get('beta')!.enabled).toBe(false);

      service.undo();
      expect(service.currentState.columnConfigs.get('alpha')!.enabled).toBe(true);
      expect(service.currentState.columnConfigs.get('beta')!.enabled).toBe(true);
    });

    it('selectAllColumns undo restores a previously disabled column', () => {
      service.setColumnsEnabled(['alpha'], false);
      service.selectAllColumns();
      expect(service.currentState.columnConfigs.get('alpha')!.enabled).toBe(true);

      service.undo(); // revert selectAll
      expect(service.currentState.columnConfigs.get('alpha')!.enabled).toBe(false);
    });

    it('deselectAllColumns is fully reversible', () => {
      service.deselectAllColumns();
      const allDisabled = Array.from(service.currentState.columnConfigs.values()).every(c => !c.enabled);
      expect(allDisabled).toBe(true);

      service.undo();
      const allEnabled = Array.from(service.currentState.columnConfigs.values()).every(c => c.enabled);
      expect(allEnabled).toBe(true);
    });

    it('updateCleaningConfig round trip', () => {
      expect(service.currentState.cleaningConfig.removeDuplicates).toBe(false);
      service.updateCleaningConfig({ removeDuplicates: true });
      expect(service.currentState.cleaningConfig.removeDuplicates).toBe(true);

      service.undo();
      expect(service.currentState.cleaningConfig.removeDuplicates).toBe(false);
    });

    it('updateProjectionConfig round trip', () => {
      expect(service.currentState.projectionConfig.enablePCA).toBe(true);
      service.updateProjectionConfig({ enablePCA: false });
      expect(service.currentState.projectionConfig.enablePCA).toBe(false);

      service.undo();
      expect(service.currentState.projectionConfig.enablePCA).toBe(true);
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
      return createTestPreprocessingService({
        profileData: async () => profile,
        pruneFiles: async () => undefined,
      });
    }

    function csvFile(): File {
      return new File(['a,b\n1,2\n'], 'data.csv', { type: 'text/csv' });
    }

    it('records the first load as "File loaded" and undo clears the profile', async () => {
      const svc = serviceWithLoader();
      await svc.loadCSV(csvFile());

      expect(svc.currentState.dataProfile).not.toBeNull();
      expect(svc.canUndo).toBe(true);
      let status!: HistoryStatus;
      svc.history$.subscribe(s => (status = s)).unsubscribe();
      expect(status.undoLabel).toBe('File loaded');

      svc.undo();
      expect(svc.currentState.dataProfile).toBeNull();
    });

    it('labels a re-upload as "File replaced"', async () => {
      const svc = serviceWithLoader();
      await svc.loadCSV(csvFile());
      await svc.loadCSV(csvFile());

      let status!: HistoryStatus;
      svc.history$.subscribe(s => (status = s)).unsubscribe();
      expect(status.undoLabel).toBe('File replaced');
    });
  });

  describe('English action labels', () => {
    it('labels a single column edit "Column settings changed"', () => {
      service.updateColumnConfig('alpha', { encodingMethod: EncodingMethod.Standardize });
      expect(latestHistory().undoLabel).toBe('Column settings changed');
    });

    it('labels a projection change "Projection settings changed" by default', () => {
      service.updateProjectionConfig({ enablePCA: false });
      expect(latestHistory().undoLabel).toBe('Projection settings changed');
    });

    it('uses a caller-supplied label for a projection change', () => {
      service.updateProjectionConfig({ enableUMAP: true }, 'UMAP enabled');
      expect(latestHistory().undoLabel).toBe('UMAP enabled');
    });
  });

  describe('history-free metadata writes (derived fields such as outlierCount)', () => {
    it('stores the value without creating an undo entry', () => {
      service.updateColumnMetadata('alpha', { outlierCount: 7 });
      service.updateColumnMetadata('beta', { outlierCount: 3 });

      expect(service.currentState.columnConfigs.get('alpha')?.outlierCount).toBe(7);
      expect(service.currentState.columnConfigs.get('beta')?.outlierCount).toBe(3);
      expect(service.canUndo).toBe(false);
      expect(latestHistory().canUndo).toBe(false);
    });

    it('does not clear the redo stack', () => {
      service.toggleColumnEnabled('alpha');
      service.undo();
      expect(service.canRedo).toBe(true);

      service.updateColumnMetadata('beta', { outlierCount: 3 });
      expect(service.canRedo).toBe(true);
    });

    it('does not replace the previous map entry in place (immutable update)', () => {
      const before = service.currentState.columnConfigs.get('alpha');
      service.updateColumnMetadata('alpha', { outlierCount: 4 });
      expect(before?.outlierCount).toBeUndefined();
    });
  });

  describe('updateColumnConfigs – one user action across several columns', () => {
    const stackLength = (): number => (service as unknown as { undoStack: unknown[] }).undoStack.length;

    it('records exactly one undo entry under the given label', () => {
      service.updateColumnConfigs(
        [
          { columnName: 'alpha', updates: { encodingMethod: EncodingMethod.Standardize } },
          { columnName: 'beta', updates: { encodingMethod: EncodingMethod.Standardize } },
          { columnName: 'gamma', updates: { scalingMethod: ScalingMethod.Robust } },
        ],
        'Settings applied to 3 columns'
      );

      expect(stackLength()).toBe(1);
      expect(latestHistory().undoLabel).toBe('Settings applied to 3 columns');
      expect(service.currentState.columnConfigs.get('beta')?.encodingMethod).toBe(EncodingMethod.Standardize);
      expect(service.currentState.columnConfigs.get('gamma')?.scalingMethod).toBe(ScalingMethod.Robust);
    });

    it('is fully reverted by a single undo', () => {
      service.updateColumnConfigs(
        [
          { columnName: 'alpha', updates: { encodingMethod: EncodingMethod.Standardize } },
          { columnName: 'beta', updates: { encodingMethod: EncodingMethod.Standardize } },
        ],
        'Settings applied to 2 columns'
      );

      service.undo();
      expect(service.currentState.columnConfigs.get('alpha')?.encodingMethod).toBe(EncodingMethod.Normalize);
      expect(service.currentState.columnConfigs.get('beta')?.encodingMethod).toBe(EncodingMethod.Normalize);
      expect(service.canUndo).toBe(false);
    });

    it('records nothing for an empty batch', () => {
      service.updateColumnConfigs([], 'Nothing');
      expect(service.canUndo).toBe(false);
    });
  });

  describe('processing guards', () => {
    const setProcessing = (isProcessing: boolean): void =>
      (service as unknown as { updateState(u: Partial<PreprocessingState>): void }).updateState({ isProcessing });

    it('undo() is a no-op while processing', () => {
      service.toggleColumnEnabled('alpha');
      setProcessing(true);

      expect(service.undo()).toBeNull();
      expect(service.currentState.columnConfigs.get('alpha')?.enabled).toBe(false);
      expect(service.canUndo).toBe(true);
    });

    it('redo() is a no-op while processing', () => {
      service.toggleColumnEnabled('alpha');
      service.undo();
      setProcessing(true);

      expect(service.redo()).toBeNull();
      expect(service.currentState.columnConfigs.get('alpha')?.enabled).toBe(true);
      expect(service.canRedo).toBe(true);
    });

    it('undo works again once processing has finished', () => {
      service.toggleColumnEnabled('alpha');
      setProcessing(true);
      service.undo();
      setProcessing(false);

      expect(service.undo()).not.toBeNull();
      expect(service.currentState.columnConfigs.get('alpha')?.enabled).toBe(true);
    });
  });

  describe('processData re-entrancy guard', () => {
    function processingService(processWithConfig: Mock): PreprocessingService {
      const svc = createTestPreprocessingService({ processWithConfig, pruneFiles: async () => undefined });
      (svc as unknown as { updateState(u: Partial<PreprocessingState>): void }).updateState({
        rawFileName: 'test.csv',
        dataProfile: service.currentState.dataProfile,
        columnConfigs: service.currentState.columnConfigs,
      });
      return svc;
    }

    it('does not start a second run while one is in flight', async () => {
      let finishRun: (value: unknown) => void = () => undefined;
      const spy = vi.fn().mockReturnValue(new Promise(resolve => (finishRun = resolve)));
      const svc = processingService(spy);

      const first = svc.processData();
      const second = svc.processData();
      expect(spy).toHaveBeenCalledTimes(1);

      finishRun({ datasets: {} });
      await Promise.all([first, second]);
      expect(svc.currentState.isProcessing).toBe(false);
    });

    it('allows a new run after the previous one finished', async () => {
      const spy = vi.fn().mockImplementation(() => Promise.resolve({ datasets: {} }));
      const svc = processingService(spy);

      await svc.processData();
      await svc.processData();
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('allows a new run after the previous one failed', async () => {
      const spy = vi.fn().mockReturnValue(Promise.reject(new Error('boom')));
      const svc = processingService(spy);

      await expect(svc.processData()).rejects.toThrowError('boom');
      await expect(svc.processData()).rejects.toThrowError('boom');
      expect(spy).toHaveBeenCalledTimes(2);
    });

    describe('whileProcessing – a run with phases after processData (e.g. FastMap)', () => {
      const resolvedRun = (): Mock => vi.fn().mockImplementation(() => Promise.resolve({ datasets: {} }));

      it('keeps isProcessing up after processData until the whole run has finished', async () => {
        const svc = processingService(resolvedRun());
        svc.pushHistory('Earlier change');
        let processingAfterWorkerRun = false;
        let undoAfterWorkerRun: unknown = 'not called';

        await svc.whileProcessing(async () => {
          await svc.processData();
          // The phase after the worker run (FastMap in the review step).
          processingAfterWorkerRun = svc.currentState.isProcessing;
          undoAfterWorkerRun = svc.undo();
        });

        expect(processingAfterWorkerRun).toBe(true);
        expect(undoAfterWorkerRun).toBeNull();
        expect(svc.currentState.isProcessing).toBe(false);
        expect(svc.undo()).not.toBeNull();
      });

      it('raises the flag before the task starts and returns its result', async () => {
        const svc = processingService(resolvedRun());
        const result = await svc.whileProcessing(async () => svc.currentState.isProcessing);
        expect(result).toBe(true);
      });

      it('releases the flag when the task fails', async () => {
        const svc = processingService(resolvedRun());
        await expect(svc.whileProcessing(() => Promise.reject(new Error('FastMap failed')))).rejects.toThrowError(
          'FastMap failed'
        );
        expect(svc.currentState.isProcessing).toBe(false);
      });

      it('keeps the flag across a reset while the run is still in flight', async () => {
        const svc = processingService(resolvedRun());
        let finish: () => void = () => undefined;
        const run = svc.whileProcessing(() => new Promise<void>(resolve => (finish = resolve)));

        svc.resetState();
        expect(svc.currentState.isProcessing).toBe(true);

        finish();
        await run;
        expect(svc.currentState.isProcessing).toBe(false);
      });
    });
  });

  describe('step navigation by id', () => {
    it('stores the index of the requested step and reports its id', () => {
      service.goToStep('appearance');
      expect(service.currentState.currentStep).toBe(stepIndex('appearance'));
      expect(service.currentStepId).toBe('appearance');
    });

    it('remembers the scroll anchor of a deep-link', () => {
      service.goToStepWithScroll('projection', 'wizard-anchor-methods');
      expect(service.currentStepId).toBe('projection');
      expect(service.consumeScrollTarget()).toBe('wizard-anchor-methods');
      expect(service.consumeScrollTarget()).toBeNull();
    });

    it('walks through all six steps and stops at both ends', () => {
      const visited: WizardStepId[] = [service.currentStepId];
      for (let i = 0; i < 6; i++) {
        service.nextStep();
        visited.push(service.currentStepId);
      }
      expect(visited).toEqual(['upload', 'columns', 'features', 'projection', 'appearance', 'review', 'review']);

      service.goToStep('upload');
      service.previousStep();
      expect(service.currentStepId).toBe('upload');
    });

    it('goes back from review to the Glyphs & Color step', () => {
      service.goToStep('review');
      service.previousStep();
      expect(service.currentStepId).toBe('appearance');
    });
  });

  describe('target-specific undo (undoIfLatest)', () => {
    it('pushHistory returns a distinct id per entry and exposes the latest one', () => {
      const a = service.pushHistory('Action A');
      const b = service.pushHistory('Action B');
      expect(a).not.toBe(b);
      expect(service.latestHistoryId).toBe(b);
    });

    it('reports no latest id on an empty stack', () => {
      expect(service.latestHistoryId).toBeNull();
    });

    it('undoes the entry when it is still the most recent action', () => {
      service.toggleColumnEnabled('alpha');
      const id = service.latestHistoryId ?? -1;

      expect(service.undoIfLatest(id)).toBe(true);
      expect(service.currentState.columnConfigs.get('alpha')?.enabled).toBe(true);
    });

    it('refuses and leaves the state untouched when another action happened since', () => {
      service.toggleColumnEnabled('alpha');
      const id = service.latestHistoryId ?? -1;
      service.updateCleaningConfig({ removeDuplicates: true });

      expect(service.undoIfLatest(id)).toBe(false);
      expect(service.currentState.cleaningConfig.removeDuplicates).toBe(true);
      expect(service.currentState.columnConfigs.get('alpha')?.enabled).toBe(false);
    });

    it('refuses once the entry has already been undone', () => {
      service.toggleColumnEnabled('alpha');
      const id = service.latestHistoryId ?? -1;
      service.undo();

      expect(service.undoIfLatest(id)).toBe(false);
      expect(service.canRedo).toBe(true);
    });

    it('keeps the entry id across undo/redo so the toast still targets the same action', () => {
      service.toggleColumnEnabled('alpha');
      const id = service.latestHistoryId ?? -1;
      service.undo();
      service.redo();

      expect(service.undoIfLatest(id)).toBe(true);
      expect(service.currentState.columnConfigs.get('alpha')?.enabled).toBe(true);
    });

    it('refuses while processing', () => {
      service.toggleColumnEnabled('alpha');
      const id = service.latestHistoryId ?? -1;
      (service as unknown as { updateState(u: Partial<PreprocessingState>): void }).updateState({
        isProcessing: true,
      });

      expect(service.undoIfLatest(id)).toBe(false);
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
    service = createTestPreprocessingService();
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
