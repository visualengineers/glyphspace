import { colorScaleForFeature, createDefaultColumnConfig } from './column-defaults';
import { ColumnStatistics } from '../models/column-statistics';
import { ColumnConfig } from '../models/column-config';
import {
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
 * Pins the auto-deselect heuristic: mostly-missing / constant columns, and the
 * high-cardinality rule for text/categorical/ID columns whose values are nearly
 * all unique.
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

  it('deselects a nearly all-unique text column (likely ID/free text)', () => {
    const config = defaultConfig(col({ dataType: DataType.Text, count: 100, uniqueCount: 100 }));
    expect(config.enabled).toBe(false);
    expect(config.hasIssues).toBe(false); // high cardinality is not a data-quality issue
    expect(config.issueDescription).toContain('unique');
  });

  it('deselects a high-cardinality categorical column at the 90% threshold', () => {
    const config = defaultConfig(col({ dataType: DataType.Categorical, count: 100, uniqueCount: 95 }));
    expect(config.enabled).toBe(false);
  });

  it('keeps a low-cardinality categorical column', () => {
    const config = defaultConfig(col({ dataType: DataType.Categorical, count: 100, uniqueCount: 5 }));
    expect(config.enabled).toBe(true);
    expect(config.issueDescription).toBeUndefined();
  });

  it('does not treat a near-unique numeric column as high cardinality', () => {
    const config = defaultConfig(col({ dataType: DataType.Numeric, count: 100, uniqueCount: 100 }));
    expect(config.enabled).toBe(true);
    expect(config.issueDescription).toBeUndefined();
  });

  it('ignores high uniqueness on tiny datasets (below the min-row guard)', () => {
    const config = defaultConfig(col({ dataType: DataType.Text, count: 15, uniqueCount: 15 }));
    expect(config.enabled).toBe(true);
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
      colorScaleId: 4,
    });
  });

  it('treats a column converted to text as categorical', () => {
    expect(colorScaleForFeature(column(DataType.Numeric, DataType.Text), 0).colorScaleMode).toBe('categorical');
  });

  it('switches a categorical scale to the numeric default for a numeric column', () => {
    expect(colorScaleForFeature(column(DataType.Numeric), 5)).toEqual({
      colorScaleMode: 'continuous',
      colorScaleId: 0,
    });
  });

  it('keeps a scale that already matches the mode', () => {
    expect(colorScaleForFeature(column(DataType.Numeric), 3).colorScaleId).toBe(3);
    expect(colorScaleForFeature(column(DataType.Categorical), 5).colorScaleId).toBe(5);
  });

  it('falls back to continuous without a column', () => {
    expect(colorScaleForFeature(undefined, 1)).toEqual({ colorScaleMode: 'continuous', colorScaleId: 1 });
  });
});
