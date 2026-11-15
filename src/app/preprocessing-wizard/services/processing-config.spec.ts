import { predictEncodedFeatureNames } from './processing-config';
import { ColumnConfig } from '../models/column-config';
import { ColumnStatistics, DataProfile } from '../models/column-statistics';
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
 * The feature names the wizard offers in Step 5 must be names Python produces
 * (apply_feature_engineering in preprocessing_processor_config.py), or the
 * glyph names features that do not exist.
 */
describe('predictEncodedFeatureNames', () => {
  function column(name: string, type: DataType, encoding: EncodingMethod, overrides: Partial<ColumnConfig> = {}) {
    const config: ColumnConfig = {
      name,
      originalType: type,
      targetType: type,
      role: ColumnRole.Feature,
      encodingMethod: encoding,
      scalingMethod: ScalingMethod.None,
      includeInProjection: true,
      isColorFeature: false,
      missingValueStrategy: MissingValueStrategy.Keep,
      outlierMethod: OutlierMethod.IQR_1_5,
      outlierStrategy: OutlierStrategy.Keep,
      enabled: true,
      hasIssues: false,
      ...overrides,
    };
    return config;
  }

  function predict(configs: ColumnConfig[], topValues: Record<string, string[]> = {}): string[] {
    const columns = configs.map(
      config =>
        ({
          name: config.name,
          dataType: config.originalType,
          topValues: (topValues[config.name] ?? []).map(value => ({ value, count: 1 })),
        }) as ColumnStatistics
    );
    return predictEncodedFeatureNames({
      columnConfigs: new Map(configs.map(config => [config.name, config])),
      dataProfile: { columns } as unknown as DataProfile,
    });
  }

  it('keeps the name of a numeric column with no encoding', () => {
    expect(predict([column('price', DataType.Numeric, EncodingMethod.None)])).toEqual(['price']);
  });

  it('expands a text or categorical column with no encoding, as Python one-hot encodes it', () => {
    const genre = column('genre', DataType.Text, EncodingMethod.None);
    const size = column('size', DataType.Categorical, EncodingMethod.None);
    expect(predict([genre, size], { genre: ['rock', 'pop'], size: ['S', 'M'] })).toEqual([
      'genre_rock',
      'genre_pop',
      'size_S',
      'size_M',
    ]);
  });

  it('keeps a label-encoded column, and expands a one-hot one', () => {
    const label = column('size', DataType.Categorical, EncodingMethod.Label);
    const oneHot = column('color', DataType.Categorical, EncodingMethod.OneHot);
    expect(predict([label, oneHot], { size: ['S'], color: ['red', 'blue'] })).toEqual([
      'size',
      'color_red',
      'color_blue',
    ]);
  });

  it('keeps one feature for dates and booleans, whatever the encoding', () => {
    const date = column('day', DataType.Date, EncodingMethod.OneHot);
    const flag = column('organic', DataType.Boolean, EncodingMethod.OneHot);
    expect(predict([date, flag], { organic: ['True', 'False'] })).toEqual(['day', 'organic']);
  });

  it('expands a 0/1 column one-hot encoded as a category (pandas reads it as numbers, not bool)', () => {
    const flag = column('organic', DataType.Boolean, EncodingMethod.OneHot, { targetType: DataType.Categorical });
    expect(predict([flag], { organic: ['1', '0'] })).toEqual(['organic_1', 'organic_0']);
  });

  it('leaves out metadata and id columns', () => {
    const metadata = column('title', DataType.Text, EncodingMethod.None, { role: ColumnRole.Metadata });
    const id = column('id', DataType.ID, EncodingMethod.None);
    expect(predict([metadata, id, column('x', DataType.Numeric, EncodingMethod.None)])).toEqual(['x']);
  });
});
