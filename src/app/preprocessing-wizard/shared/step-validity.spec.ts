import { isGlyphSelectionValid, isStepCompleted, isStepReachable, isStepValid } from './step-validity';
import { detectStartBlockers } from './constants/wizard-error-classes';
import { stepIndex } from './constants/step-info';
import { PreprocessingState, createInitialState } from '../models/preprocessing-state';
import { ColumnConfig } from '../models/column-config';
import { DataProfile } from '../models/column-statistics';
import {
  ColumnRole,
  DataType,
  EncodingMethod,
  MissingValueStrategy,
  OutlierMethod,
  OutlierStrategy,
  ScalingMethod,
} from '../models/data-type.enum';

function feature(name: string, overrides: Partial<ColumnConfig> = {}): ColumnConfig {
  return {
    name,
    originalType: DataType.Numeric,
    targetType: DataType.Numeric,
    role: ColumnRole.Feature,
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

/** A loaded file with three numeric feature columns and a valid glyph. */
function state(overrides: Partial<PreprocessingState> = {}): PreprocessingState {
  const names = ['a', 'b', 'c'];
  return {
    ...createInitialState(),
    rawFileName: 'f.csv',
    uploadKey: 'f.csv',
    dataProfile: { columns: names.map(name => ({ name, dataType: DataType.Numeric })) } as unknown as DataProfile,
    columnConfigs: new Map(names.map(name => [name, feature(name)])),
    glyphFeatures: [...names],
    ...overrides,
  };
}

describe('step validity', () => {
  it('accepts a loaded file with features, a projection column and a fitting glyph', () => {
    const s = state();
    for (const id of ['upload', 'columns', 'features', 'projection', 'appearance'] as const) {
      expect(isStepValid(id, s), id).toBe(true);
    }
    expect(detectStartBlockers(s)).toEqual([]);
  });

  it('needs the upload again when a reload lost it', () => {
    const s = state({ uploadMissing: true });
    expect(isStepValid('upload', s)).toBe(false);
    expect(detectStartBlockers(s).map(issue => issue.step)).toEqual(['upload']);
  });

  it('needs at least one feature column, and one in the projection', () => {
    const metadata = state({
      columnConfigs: new Map([['a', feature('a', { role: ColumnRole.Metadata })]]),
      glyphFeatures: [],
    });
    expect(isStepValid('columns', metadata)).toBe(false);
    expect(detectStartBlockers(metadata).map(issue => issue.step)).toEqual(['columns']);

    const noProjection = state({
      columnConfigs: new Map(['a', 'b', 'c'].map(name => [name, feature(name, { includeInProjection: false })])),
    });
    expect(isStepValid('projection', noProjection)).toBe(false);
    expect(detectStartBlockers(noProjection).map(issue => issue.step)).toEqual(['projection']);
  });

  it('rejects a glyph of the wrong size or with a feature the settings do not produce', () => {
    expect(isGlyphSelectionValid(state({ glyphFeatures: ['a', 'b'] }))).toBe(false);
    expect(isGlyphSelectionValid(state({ glyphFeatures: ['a', 'b', 'gone'] }))).toBe(false);
    const blockers = detectStartBlockers(state({ glyphFeatures: ['a', 'b', 'gone'] }));
    expect(blockers.map(issue => issue.code)).toEqual(['K5']);
    expect(blockers[0].step).toBe('appearance');
  });

  it('completes a step once moved past it with valid settings; the review with a result', () => {
    const s = state({ currentStep: stepIndex('appearance'), furthestStep: stepIndex('appearance') });
    expect(isStepCompleted('projection', s)).toBe(true);
    expect(isStepCompleted('appearance', s)).toBe(false);
    expect(isStepCompleted('review', s)).toBe(false);
    expect(isStepCompleted('review', state({ processedDataset: { datasets: {} } }))).toBe(true);
    expect(isStepCompleted('columns', state({ furthestStep: 4, glyphFeatures: [], columnConfigs: new Map() }))).toBe(
      false
    );
  });

  it('opens every earlier step, the next unopened one, and nothing behind an invalid step', () => {
    const s = state({ currentStep: stepIndex('features'), furthestStep: stepIndex('projection') });
    expect(isStepReachable(s, stepIndex('upload'))).toBe(true);
    expect(isStepReachable(s, stepIndex('appearance'))).toBe(true);
    expect(isStepReachable(s, stepIndex('review'))).toBe(false); // two beyond the furthest step

    const broken = state({ currentStep: 0, furthestStep: stepIndex('review'), glyphFeatures: ['gone', 'a', 'b'] });
    expect(isStepReachable(broken, stepIndex('appearance'))).toBe(true);
    expect(isStepReachable(broken, stepIndex('review'))).toBe(false);
    expect(isStepReachable(broken, -1)).toBe(false);
  });
});
