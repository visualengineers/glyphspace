import type { Mock, Mocked } from 'vitest';
import { Step3ConfigureDataFeaturesComponent } from './step3-configure-data-features.component';
import { PreprocessingService } from '../../services/preprocessing.service';
import { PreprocessingState } from '../../models/preprocessing-state';
import { ColumnConfig } from '../../models/column-config';
import { ColumnStatistics, DataProfile } from '../../models/column-statistics';
import {
  DataType,
  EncodingMethod,
  ScalingMethod,
  MissingValueStrategy,
  OutlierMethod,
  OutlierStrategy,
} from '../../models/data-type.enum';
import { ToastService } from '../../../services/toast.service';
import { WizardAnnouncer } from '../../shared/wizard-announcer.service';
import { createTestPreprocessingService, createToastServiceSpy } from '../../testing/preprocessing-test-helpers';

type ColState = Step3ConfigureDataFeaturesComponent['columns'][number];

/**
 * A4 – Step 3 vs. the undo history.
 *
 * Every user action in Step 3 must be exactly one undo entry, and derived data
 * (detected outlier counts) must never be recorded at all. Previously, merely
 * opening Step 3 filled the history with one entry per numeric column, and the
 * multi-field actions "Reset to defaults" / "Apply to same type" produced several
 * entries so a single Ctrl+Z only reverted part of them.
 */
describe('Step3ConfigureDataFeaturesComponent – undo history', () => {
  let component: Step3ConfigureDataFeaturesComponent;
  let service: PreprocessingService;
  let toast: Mocked<ToastService>;
  let detectOutliers: Mock;

  const NUMERIC = ['alpha', 'beta', 'gamma'];

  /** Settings that differ from the numeric smart defaults in every field. */
  const MODIFIED: Partial<ColumnConfig> = {
    encodingMethod: EncodingMethod.Standardize,
    scalingMethod: ScalingMethod.Robust,
    missingValueStrategy: MissingValueStrategy.FillMean,
    outlierMethod: OutlierMethod.ZScore_3,
    outlierStrategy: OutlierStrategy.Remove,
  };

  function makeColumn(name: string): ColumnStatistics {
    return { name, dataType: DataType.Numeric, count: 100, missingCount: 5, missingPercentage: 5, uniqueCount: 50 };
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

  /** Seed three numeric columns; `alphaOverrides` customises the first one. */
  function seed(alphaOverrides: Partial<ColumnConfig> = {}): void {
    const columns = NUMERIC.map(makeColumn);
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
    const columnConfigs = new Map<string, ColumnConfig>(
      NUMERIC.map(name => [name, makeConfig(name, name === 'alpha' ? alphaOverrides : {})])
    );
    (service as unknown as { updateState(u: Partial<PreprocessingState>): void }).updateState({
      rawFileName: 'test.csv',
      dataProfile: profile,
      columnConfigs,
    });
  }

  /** Let the fire-and-forget outlier detection (resolved stub promises) settle. */
  const settle = (): Promise<void> => new Promise(resolve => setTimeout(resolve));

  const stackLength = (): number => (service as unknown as { undoStack: unknown[] }).undoStack.length;

  function currentUndoLabel(): string | null {
    let label: string | null = null;
    service.history$.subscribe(s => (label = s.undoLabel)).unsubscribe();
    return label;
  }

  function col(name: string): ColState {
    const found = component.columns.find(c => c.column.name === name);
    if (!found) throw new Error(`column ${name} not loaded`);
    return found;
  }

  function stored(name: string): ColumnConfig {
    const config = service.currentState.columnConfigs.get(name);
    if (!config) throw new Error(`column ${name} not in service state`);
    return config;
  }

  async function open(alphaOverrides: Partial<ColumnConfig> = {}): Promise<void> {
    seed(alphaOverrides);
    component.ngOnInit();
    await settle();
  }

  beforeEach(() => {
    localStorage.clear();
    detectOutliers = vi.fn().mockImplementation(() => Promise.resolve({ outlier_count: 2, outlier_indices: [0, 1] }));
    service = createTestPreprocessingService({
      detectOutliers,
      detectDuplicates: () =>
        Promise.resolve({ duplicateCount: 0, duplicateIndices: [], percentage: 0, sampleDuplicates: [] }),
    });
    toast = createToastServiceSpy();
    component = new Step3ConfigureDataFeaturesComponent(service, toast, new WizardAnnouncer());
  });

  afterEach(() => localStorage.clear());

  describe('outlier counts are metadata, not user actions', () => {
    it('opening the step stores the counts without creating undo entries', async () => {
      await open();

      expect(detectOutliers).toHaveBeenCalledTimes(NUMERIC.length);
      NUMERIC.forEach(name => expect(stored(name).outlierCount, name).toBe(2));
      expect(service.canUndo).toBe(false);
    });

    it('opening the step after an undo keeps the redo stack', async () => {
      seed();
      service.updateCleaningConfig({ removeDuplicates: true });
      service.undo();
      expect(service.canRedo).toBe(true);

      component.ngOnInit();
      await settle();

      expect(service.canRedo).toBe(true);
    });

    it('changing the outlier method is one entry (re-detection is not recorded)', async () => {
      await open();

      await component.onOutlierMethodChange('alpha', OutlierMethod.ZScore_3);

      expect(stackLength()).toBe(1);
      expect(stored('alpha').outlierMethod).toBe(OutlierMethod.ZScore_3);
    });
  });

  describe('"Reset to defaults" is one undoable action', () => {
    it('records a single entry for a full column reset', async () => {
      await open(MODIFIED);
      const before = stackLength();

      component.resetColumnToDefault(col('alpha'));
      await settle();

      expect(stackLength()).toBe(before + 1);
      expect(stored('alpha')).toEqual(expect.objectContaining<ColumnConfig>(makeConfig('alpha')));
    });

    it('a single undo restores every reset field', async () => {
      await open(MODIFIED);

      component.resetColumnToDefault(col('alpha'));
      await settle();
      service.undo();

      expect(stored('alpha')).toEqual(expect.objectContaining(MODIFIED));
    });

    it('does not touch the Step 4 projection flag', async () => {
      await open({ ...MODIFIED, includeInProjection: false });

      component.resetColumnToDefault(col('alpha'));
      await settle();

      expect(stored('alpha').includeInProjection).toBe(false);
    });

    it('resetting the outlier group is one entry', async () => {
      await open(MODIFIED);
      const before = stackLength();

      await component.resetOutliers(col('alpha'));

      expect(stackLength()).toBe(before + 1);
      service.undo();
      expect(stored('alpha').outlierMethod).toBe(OutlierMethod.ZScore_3);
      expect(stored('alpha').outlierStrategy).toBe(OutlierStrategy.Remove);
    });

    it('mirrors the reset into the local column state', async () => {
      await open(MODIFIED);

      component.resetColumnToDefault(col('alpha'));
      await settle();

      expect(component.isColumnModified(col('alpha'))).toBe(false);
    });
  });

  describe('"Apply to same type" is one undoable action', () => {
    it('records a single entry for all target columns', async () => {
      await open(MODIFIED);
      const before = stackLength();

      component.applyToSameType(col('alpha'));
      await settle();

      expect(stackLength()).toBe(before + 1);
      ['beta', 'gamma'].forEach(name => expect(stored(name), name).toEqual(expect.objectContaining(MODIFIED)));
    });

    it('a single undo reverts every target column', async () => {
      await open(MODIFIED);

      component.applyToSameType(col('alpha'));
      await settle();
      service.undo();

      ['beta', 'gamma'].forEach(name => {
        expect(stored(name).encodingMethod, name).toBe(EncodingMethod.Normalize);
        expect(stored(name).outlierStrategy, name).toBe(OutlierStrategy.Keep);
      });
      expect(service.canUndo).toBe(false);
    });

    it('labels the entry in English', async () => {
      await open(MODIFIED);

      component.applyToSameType(col('alpha'));

      expect(currentUndoLabel()).toBe('Settings applied to 2 columns');
    });
  });

  describe('clearing the column filters', () => {
    it('is view-only state: no undo toast, no history entry, English info message', async () => {
      await open();
      component.filterText = 'al';
      component.applyFilters();

      component.clearFilters();

      expect(component.filterText).toBe('');
      expect(toast.showUndo).not.toHaveBeenCalled();
      expect(toast.info).toHaveBeenCalledWith('Filters cleared');
      expect(service.canUndo).toBe(false);
    });

    it('shows nothing when no filter was active', async () => {
      await open();

      component.clearFilters();

      expect(toast.info).not.toHaveBeenCalled();
    });
  });

  describe('remove duplicates toggle', () => {
    it('is reverted by undo (the snapshot is taken before the change)', async () => {
      await open();

      component.toggleRemoveDuplicates();
      expect(service.currentState.cleaningConfig.removeDuplicates).toBe(true);

      service.undo();
      expect(service.currentState.cleaningConfig.removeDuplicates).toBe(false);
    });

    it('works when the checkbox ngModel wrote the new value before the change handler', async () => {
      await open();

      component.cleaningConfig.removeDuplicates = true; // [(ngModel)] write
      expect(service.currentState.cleaningConfig.removeDuplicates).toBe(false);
      component.toggleRemoveDuplicates(); // (change) handler

      expect(service.currentState.cleaningConfig.removeDuplicates).toBe(true);
      expect(component.cleaningConfig.removeDuplicates).toBe(true);
      service.undo();
      expect(service.currentState.cleaningConfig.removeDuplicates).toBe(false);
    });
  });
});
