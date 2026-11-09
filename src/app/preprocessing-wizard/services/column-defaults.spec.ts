import { colorScaleForFeature, createDefaultColumnConfig } from './column-defaults';
import { ColumnStatistics } from '../models/column-statistics';
import { ColumnConfig } from '../models/column-config';
import {
  ColumnRole,
  DataType,
  EncodingMethod,
  MissingValueStrategy,
  OutlierMethod,
  OutlierStrategy,
  ScalingMethod,
} from '../models/data-type.enum';

/**
 * A2-Nachtrag – smart defaults for the initial column selection.
 *
 * Pins the auto-deselect heuristic (mostly-missing / constant columns) and the
 * role defaults: text and ID columns, and categorical columns whose values are
 * nearly all unique, start as metadata (tooltip and search) instead of features.
 */
describe('createDefaultColumnConfig – smart-default column selection', () => {
  function col(overrides: Partial<ColumnStatistics>): ColumnStatistics {
    return {
      name: 'c',
      dataType: DataType.Categorical,
      count: 100,
      missingCount: 0,
      missingPercentage: 0,
      uniqueCount: 5,
      ...overrides,
    };
  }

  const defaultConfig = createDefaultColumnConfig;

  it('keeps a nearly all-unique text column selected, as metadata (likely ID/free text)', () => {
    const config = defaultConfig(col({ dataType: DataType.Text, count: 100, uniqueCount: 100 }));
    expect(config.enabled).toBe(true);
    expect(config.role).toBe(ColumnRole.Metadata);
    expect(config.hasIssues).toBe(false); // high cardinality is not a data-quality issue
    expect(config.issueDescription).toBeUndefined();
  });

  it('makes a high-cardinality categorical column metadata at the 90% threshold', () => {
    expect(defaultConfig(col({ dataType: DataType.Categorical, count: 100, uniqueCount: 90 })).role).toBe(
      ColumnRole.Metadata
    );
    expect(defaultConfig(col({ dataType: DataType.Categorical, count: 100, uniqueCount: 89 })).role).toBe(
      ColumnRole.Feature
    );
  });

  it('keeps a low-cardinality categorical column as a feature', () => {
    const config = defaultConfig(col({ dataType: DataType.Categorical, count: 100, uniqueCount: 5 }));
    expect(config.enabled).toBe(true);
    expect(config.role).toBe(ColumnRole.Feature);
    expect(config.issueDescription).toBeUndefined();
  });

  it('starts every text and ID column as metadata', () => {
    expect(defaultConfig(col({ dataType: DataType.Text, uniqueCount: 5 })).role).toBe(ColumnRole.Metadata);
    expect(defaultConfig(col({ dataType: DataType.ID, uniqueCount: 5 })).role).toBe(ColumnRole.Metadata);
  });

  it('does not treat a near-unique numeric column as high cardinality', () => {
    const config = defaultConfig(col({ dataType: DataType.Numeric, count: 100, uniqueCount: 100 }));
    expect(config.enabled).toBe(true);
    expect(config.role).toBe(ColumnRole.Feature);
    expect(config.issueDescription).toBeUndefined();
  });

  it('ignores high uniqueness on tiny datasets (below the min-row guard)', () => {
    const config = defaultConfig(col({ dataType: DataType.Categorical, count: 15, uniqueCount: 15 }));
    expect(config.enabled).toBe(true);
    expect(config.role).toBe(ColumnRole.Feature);
  });

  it('deselects a mostly-empty column and flags it as a quality issue', () => {
    const config = defaultConfig(col({ missingPercentage: 80, uniqueCount: 5 }));
    expect(config.enabled).toBe(false);
    expect(config.hasIssues).toBe(true);
    expect(config.issueDescription).toContain('missing');
  });

  it('deselects a constant column', () => {
    const config = defaultConfig(col({ uniqueCount: 1 }));
    expect(config.enabled).toBe(false);
    expect(config.hasIssues).toBe(true);
  });
});

describe('colorScaleForFeature – color mode follows the column type', () => {
  function column(originalType: DataType, targetType: DataType = originalType): ColumnConfig {
    return {
      name: 'c',
      originalType,
      targetType,
      role: ColumnRole.Feature,
      encodingMethod: EncodingMethod.Normalize,
      scalingMethod: ScalingMethod.MinMax,
      includeInProjection: true,
      isColorFeature: true,
      missingValueStrategy: MissingValueStrategy.Keep,
      outlierMethod: OutlierMethod.IQR_1_5,
      outlierStrategy: OutlierStrategy.Keep,
      enabled: true,
      hasIssues: false,
    };
  }

  it('switches a numeric scale to the categorical default for a categorical column', () => {
    expect(colorScaleForFeature(column(DataType.Categorical), 2)).toEqual({
      colorScaleMode: 'categorical',
      colorScaleId: 6,
    });
  });

  it('treats a column converted to text as categorical', () => {
    expect(colorScaleForFeature(column(DataType.Numeric, DataType.Text), 0).colorScaleMode).toBe('categorical');
  });

  it('switches a categorical scale to the numeric default for a numeric column', () => {
    expect(colorScaleForFeature(column(DataType.Numeric), 7)).toEqual({
      colorScaleMode: 'continuous',
      colorScaleId: 0,
    });
  });

  it('keeps a scale that already matches the mode', () => {
    expect(colorScaleForFeature(column(DataType.Numeric), 3).colorScaleId).toBe(3);
    expect(colorScaleForFeature(column(DataType.Categorical), 7).colorScaleId).toBe(7);
  });

  it('reads a retired categorical scale as its replacement', () => {
    expect(colorScaleForFeature(column(DataType.Categorical), 5).colorScaleId).toBe(7);
  });

  it('falls back to continuous without a column', () => {
    expect(colorScaleForFeature(undefined, 1)).toEqual({ colorScaleMode: 'continuous', colorScaleId: 1 });
  });
});
