import { stepSummaries } from './step-summaries';
import { PreprocessingState, DEFAULT_CLEANING_CONFIG, DEFAULT_PROJECTION_CONFIG } from '../models/preprocessing-state';
import { ColumnConfig, ProjectionConfig } from '../models/column-config';
import { DataProfile } from '../models/column-statistics';
import { DatasetCollection } from '../../shared/interfaces/dataset-collection';
import {
  DataType,
  EncodingMethod,
  MissingValueStrategy,
  OutlierMethod,
  OutlierStrategy,
  ScalingMethod,
} from '../models/data-type.enum';

describe('stepSummaries', () => {
  function column(name: string, overrides: Partial<ColumnConfig> = {}): ColumnConfig {
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

  const NO_BACKGROUND_METHODS: ProjectionConfig = {
    ...DEFAULT_PROJECTION_CONFIG,
    enablePCA: false,
    enableIsoMap: false,
  };

  function state(overrides: Partial<PreprocessingState> = {}): PreprocessingState {
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
      ...overrides,
    };
  }

  function configs(list: ColumnConfig[]): Map<string, ColumnConfig> {
    return new Map(list.map(c => [c.name, c]));
  }

  it('summarizes nothing before a file is loaded', () => {
    expect(stepSummaries(state())).toEqual({
      upload: '',
      columns: '',
      features: '',
      projection: '',
      appearance: '',
      review: '',
    });
  });

  it('names the file and the row count with thousands separators', () => {
    const profile = { fileName: 'wine.csv', totalRows: 1599 } as DataProfile;
    expect(stepSummaries(state({ dataProfile: profile })).upload).toBe('wine.csv · 1,599 rows');
  });

  it('tolerates a partial profile (e.g. from an older saved session)', () => {
    expect(stepSummaries(state({ dataProfile: {} as DataProfile, rawFileName: 'old.csv' })).upload).toBe('old.csv');
    expect(stepSummaries(state({ dataProfile: {} as DataProfile })).upload).toBe('');
  });

  it('uses the singular for a single row / column', () => {
    const profile = { fileName: 'one.csv', totalRows: 1 } as DataProfile;
    const s = stepSummaries(state({ dataProfile: profile, columnConfigs: configs([column('a')]) }));
    expect(s.upload).toBe('one.csv · 1 row');
    expect(s.columns).toBe('1 of 1 column');
    expect(s.features).toBe('1 column configured');
  });

  it('counts the selected columns out of all columns', () => {
    const list = [column('a'), column('b'), column('c', { enabled: false })];
    const s = stepSummaries(state({ columnConfigs: configs(list) }));
    expect(s.columns).toBe('2 of 3 columns');
    expect(s.features).toBe('2 columns configured');
  });

  it('lists up to two background methods, folds the rest into +N and counts projected columns', () => {
    const projectionConfig: ProjectionConfig = {
      ...NO_BACKGROUND_METHODS,
      enablePCA: true,
      enableUMAP: true,
      enableSammon: true,
      enableTSNE: true,
    };
    const list = [column('a'), column('b', { includeInProjection: false }), column('c', { enabled: false })];

    const summary = stepSummaries(state({ projectionConfig, columnConfigs: configs(list) })).projection;

    // Listed in the Step 4 method order (fastest first).
    expect(summary).toBe('PCA, UMAP +2 · 1 column');
  });

  it('leaves out LLE, which is hidden, even when a saved config enables it', () => {
    const projectionConfig: ProjectionConfig = { ...NO_BACKGROUND_METHODS, enableLLE: true, enableLTSA: true };
    const s = stepSummaries(state({ projectionConfig, columnConfigs: configs([column('a')]) }));
    expect(s.projection).toBe('LTSA · 1 column');
  });

  it('falls back to "FastMap only" when no background method is enabled', () => {
    const s = stepSummaries(state({ projectionConfig: NO_BACKGROUND_METHODS, columnConfigs: configs([column('a')]) }));
    expect(s.projection).toBe('FastMap only · 1 column');
  });

  it('summarizes glyph features and the enabled color column', () => {
    const list = [column('alcohol', { isColorFeature: true }), column('ph')];
    const s = stepSummaries(state({ columnConfigs: configs(list), glyphFeatures: ['a', 'b', 'c', 'd', 'e'] }));
    expect(s.appearance).toBe('5 glyph features · color: alcohol');
  });

  it('ignores a color flag on a deselected column', () => {
    const list = [column('alcohol', { isColorFeature: true, enabled: false })];
    const s = stepSummaries(state({ columnConfigs: configs(list), glyphFeatures: ['a'] }));
    expect(s.appearance).toBe('1 glyph feature');
  });

  it('reports the review step as processed once a dataset exists', () => {
    expect(stepSummaries(state({ processedDataset: [] as DatasetCollection })).review).toBe('Processed');
  });
});
