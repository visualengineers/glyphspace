import {
  STORAGE_KEY,
  STORAGE_VERSION,
  deserializeState,
  migrateStoredStep,
  restoreProjectionConfig,
  serializeState,
} from './wizard-storage';
import { PreprocessingService } from './preprocessing.service';
import { DEFAULT_PROJECTION_CONFIG, PreprocessingState } from '../models/preprocessing-state';
import { stepIndex } from '../shared/constants/step-info';
import { createTestPreprocessingService } from '../testing/preprocessing-test-helpers';

describe('wizard storage – step migration', () => {
  it('maps the old five-step layout onto the six-step layout', () => {
    expect(migrateStoredStep(0, 1)).toBe(stepIndex('upload'));
    expect(migrateStoredStep(1, 1)).toBe(stepIndex('columns'));
    expect(migrateStoredStep(2, 1)).toBe(stepIndex('features'));
    expect(migrateStoredStep(3, 1)).toBe(stepIndex('projection'));
    expect(migrateStoredStep(4, 1)).toBe(stepIndex('review'));
  });

  it('keeps indices of the current version unchanged', () => {
    expect(migrateStoredStep(4, STORAGE_VERSION)).toBe(stepIndex('appearance'));
    expect(migrateStoredStep(5, STORAGE_VERSION)).toBe(stepIndex('review'));
  });

  it('falls back to the first step for invalid indices', () => {
    expect(migrateStoredStep(5, 1)).toBe(0); // there was no step 5 in version 1
    expect(migrateStoredStep(6, STORAGE_VERSION)).toBe(0);
    expect(migrateStoredStep(-1, STORAGE_VERSION)).toBe(0);
    expect(migrateStoredStep(1.5, STORAGE_VERSION)).toBe(0);
    expect(migrateStoredStep('3', 1)).toBe(0);
    expect(migrateStoredStep(undefined, 1)).toBe(0);
  });
});

describe('wizard storage – (de)serialization', () => {
  it('writes the current storage version', () => {
    const service = createTestPreprocessingService();
    expect(serializeState(service.currentState).version).toBe(STORAGE_VERSION);
  });

  it('treats a payload without version as version 1', () => {
    const restored = deserializeState(JSON.stringify({ currentStep: 4, columnConfigs: [] }));
    expect(restored?.currentStep).toBe(stepIndex('review'));
  });

  it('round-trips a current payload without moving the step', () => {
    const restored = deserializeState(JSON.stringify({ version: STORAGE_VERSION, currentStep: 4 }));
    expect(restored?.currentStep).toBe(stepIndex('appearance'));
  });

  it('fills missing config sections with defaults', () => {
    const restored = deserializeState(JSON.stringify({ currentStep: 0 }));
    expect(restored?.projectionConfig).toEqual(DEFAULT_PROJECTION_CONFIG);
    expect(restored?.glyphFeatures).toEqual([]);
    expect(restored?.columnConfigs?.size).toBe(0);
    expect(restored?.colorScaleMode).toBe('continuous');
    expect(restored?.colorScaleId).toBe(0);
  });

  // Regression: the color scale wasn't saved, so a reload kept the (saved) color
  // attribute but reset its scale to the numeric default.
  it('round-trips the color scale', () => {
    const state = {
      ...createTestPreprocessingService().currentState,
      colorScaleMode: 'categorical',
      colorScaleId: 4,
    } satisfies PreprocessingState;

    const restored = deserializeState(JSON.stringify(serializeState(state)));

    expect(restored?.colorScaleMode).toBe('categorical');
    expect(restored?.colorScaleId).toBe(4);
  });

  it('ignores an invalid saved color scale', () => {
    const restored = deserializeState(JSON.stringify({ colorScaleMode: 'rainbow', colorScaleId: '4' }));
    expect(restored?.colorScaleMode).toBe('continuous');
    expect(restored?.colorScaleId).toBe(0);
  });

  it('ignores an empty or non-object payload', () => {
    expect(deserializeState(null)).toBeNull();
    expect(deserializeState('42')).toBeNull();
  });

  // TriMap's "Weight Adjustment" was removed with druidjs 0.9; older saves still carry it.
  it('drops projection settings that no longer exist and keeps the known ones', () => {
    const restored = deserializeState(
      JSON.stringify({ projectionConfig: { enableTriMap: true, trimapWeightAdj: 800, umapNeighbors: 30 } })
    );

    expect(restored?.projectionConfig).toEqual({
      ...DEFAULT_PROJECTION_CONFIG,
      enableTriMap: true,
      umapNeighbors: 30,
    });
    expect(Object.keys(restored?.projectionConfig ?? {})).not.toContain('trimapWeightAdj');
  });

  it('falls back to the default for a projection setting of the wrong type', () => {
    const restored = deserializeState(JSON.stringify({ projectionConfig: { enablePCA: 'yes', umapNeighbors: '30' } }));
    expect(restored?.projectionConfig).toEqual(DEFAULT_PROJECTION_CONFIG);
  });

  it('uses the default projection config when the saved one is not an object', () => {
    expect(restoreProjectionConfig(null)).toEqual(DEFAULT_PROJECTION_CONFIG);
    expect(restoreProjectionConfig('x')).toEqual(DEFAULT_PROJECTION_CONFIG);
  });
});

describe('PreprocessingService – restoring saved state', () => {
  function restoreFrom(saved: object): PreprocessingService {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    return createTestPreprocessingService();
  }

  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('reopens an old saved review step (index 4) on the new review step', () => {
    const service = restoreFrom({ currentStep: 4, columnConfigs: [], glyphFeatures: ['a', 'b', 'c'] });
    expect(service.currentStepId).toBe('review');
    expect(service.currentState.glyphFeatures).toEqual(['a', 'b', 'c']);
  });

  it('reopens an old saved visualization step (index 3) on the projection step', () => {
    expect(restoreFrom({ currentStep: 3, columnConfigs: [] }).currentStepId).toBe('projection');
  });

  it('keeps the early steps of an old save unchanged', () => {
    expect(restoreFrom({ currentStep: 2, columnConfigs: [] }).currentStepId).toBe('features');
  });

  it('saves the migrated step with the new version on the next write', () => {
    const service = restoreFrom({ currentStep: 4, columnConfigs: [] });
    service.updateCleaningConfig({ removeDuplicates: true });

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<{
      version: number;
      currentStep: number;
    }>;
    expect(saved.version).toBe(STORAGE_VERSION);
    expect(saved.currentStep).toBe(stepIndex('review'));
  });

  it('does not save the removed TriMap weight adjustment again after restoring an old save', () => {
    const service = restoreFrom({
      currentStep: 3,
      columnConfigs: [],
      projectionConfig: { enableTriMap: true, trimapWeightAdj: 800 },
    });
    expect(service.currentState.projectionConfig.enableTriMap).toBe(true);

    service.updateCleaningConfig({ removeDuplicates: true });

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as { projectionConfig?: object };
    expect(saved.projectionConfig).toEqual(expect.objectContaining({ enableTriMap: true }));
    expect(saved.projectionConfig).not.toHaveProperty('trimapWeightAdj');
  });

  it('starts fresh when the saved payload is corrupt', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const service = createTestPreprocessingService();
    expect(service.currentStepId).toBe('upload');
    const state: PreprocessingState = service.currentState;
    expect(state.dataProfile).toBeNull();
  });
});
