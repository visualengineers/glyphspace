import { PreprocessingState } from '../models/preprocessing-state';
import { CleaningConfig, ColumnConfig, ProjectionConfig, isFeatureColumn } from '../models/column-config';
import { ColumnStatistics } from '../models/column-statistics';
import { DataType, EncodingMethod } from '../models/data-type.enum';
import { ProcessedCollection, ProjectionPosition, processedDatasetOf } from '../models/processed-collection';

export type { ProcessedCollection, ProjectionPosition } from '../models/processed-collection';

/** One column as the worker's processWithConfig expects it. */
export type ProcessingColumnConfig = Pick<
  ColumnConfig,
  | 'name'
  | 'enabled'
  | 'role'
  | 'includeInProjection'
  | 'isColorFeature'
  | 'missingValueStrategy'
  | 'missingValueFillValue'
  | 'outlierMethod'
  | 'outlierStrategy'
> & {
  dataType: ColumnConfig['targetType'];
  encoding: ColumnConfig['encodingMethod'];
  scaling: ColumnConfig['scalingMethod'];
};

/** The configuration object sent to the worker's processWithConfig. */
export interface ProcessingRequestConfig {
  datasetName: string;
  timestamp: string;
  columns: ProcessingColumnConfig[];
  cleaning: CleaningConfig;
  projections: ProjectionConfig;
  glyphFeatures: string[];
  tooltipFeatures: string[] | null;
  colorScaleMode: PreprocessingState['colorScaleMode'];
  colorScaleId: number;
}

/**
 * Whether pandas reads the column as numbers (or booleans). The profile records
 * the type it detected, not the pandas dtype, but detect_data_type in
 * preprocessing_processor.py only reports numeric and boolean for numeric
 * dtypes; ID and coordinate columns are recognised by name and almost always
 * hold numbers.
 */
function readAsNumbers(column: ColumnConfig): boolean {
  return [DataType.Numeric, DataType.Boolean, DataType.Coordinate, DataType.ID].includes(column.originalType);
}

/**
 * Whether pandas reads a boolean column as `bool` (the text True/False) rather
 * than as 0/1 integers: Python encodes a `bool` column as one 0/1 feature
 * whatever its settings.
 */
function readAsBool(stats: ColumnStatistics | undefined): boolean {
  const values = stats?.topValues ?? [];
  return values.length > 0 && values.every(({ value }) => value === 'True' || value === 'False');
}

/**
 * Whether Python one-hot encodes the column (apply_feature_engineering in
 * preprocessing_processor_config.py): dates and booleans are always one numeric
 * feature; otherwise One-Hot does, and so does None on a column that is not
 * read as numbers (text and categories).
 */
export function isOneHotEncoded(config: ColumnConfig, stats: ColumnStatistics | undefined): boolean {
  if (config.targetType === DataType.Date || config.targetType === DataType.Boolean) return false;
  if (config.originalType === DataType.Boolean && readAsBool(stats)) return false;
  return (
    config.encodingMethod === EncodingMethod.OneHot ||
    (config.encodingMethod === EncodingMethod.None && !readAsNumbers(config))
  );
}

/**
 * Feature names the worker will produce after encoding: feature (not metadata),
 * non-ID columns; a one-hot encoded column (see isOneHotEncoded) expands to
 * `<column>_<value>`. The profile knows the most frequent values only, so the
 * prediction may list fewer one-hot features than Python creates, never other
 * ones.
 */
export function predictEncodedFeatureNames(state: Pick<PreprocessingState, 'columnConfigs' | 'dataProfile'>): string[] {
  const enabledCols = Array.from(state.columnConfigs.values()).filter(
    config => isFeatureColumn(config) && config.originalType !== DataType.ID
  );

  return enabledCols.flatMap(col => {
    const colStats = state.dataProfile?.columns.find(c => c.name === col.name);
    if (!isOneHotEncoded(col, colStats)) {
      return [col.name];
    }
    return (colStats?.topValues ?? []).map(item => `${col.name}_${item.value}`);
  });
}

/**
 * Store `positions` of `method` on the collection's selected (or first) dataset,
 * in the format the dashboard's DataProvider expects; ids are normalised to
 * strings. The dataset is updated in place, so already loaded references see it.
 */
export function storeProjectionPositions(
  collection: ProcessedCollection,
  method: string,
  positions: ProjectionPosition[]
): void {
  if (!collection.datasets) {
    throw new Error('Invalid dataset structure');
  }
  const dataset = processedDatasetOf(collection);
  if (!dataset) {
    throw new Error('Dataset not found');
  }
  dataset.positions = dataset.positions ?? {};
  dataset.positions[method] = positions.map(p => ({ id: String(p.id), position: { x: p.x, y: p.y } }));
}

/** Build the processWithConfig request from the wizard state. */
export function buildProcessingConfig(state: PreprocessingState): ProcessingRequestConfig {
  return {
    datasetName: state.datasetName,
    timestamp: state.timestamp,
    columns: Array.from(state.columnConfigs.values()).map(col => ({
      name: col.name,
      enabled: col.enabled,
      role: col.role,
      dataType: col.targetType,
      encoding: col.encodingMethod,
      scaling: col.scalingMethod,
      includeInProjection: col.includeInProjection,
      isColorFeature: col.isColorFeature,
      missingValueStrategy: col.missingValueStrategy,
      missingValueFillValue: col.missingValueFillValue,
      outlierMethod: col.outlierMethod,
      outlierStrategy: col.outlierStrategy,
    })),
    cleaning: state.cleaningConfig,
    projections: state.projectionConfig,
    // Glyph and tooltip feature mappings
    glyphFeatures: state.glyphFeatures,
    tooltipFeatures: state.tooltipFeatures.length > 0 ? state.tooltipFeatures : null,
    colorScaleMode: state.colorScaleMode,
    colorScaleId: state.colorScaleId,
  };
}
