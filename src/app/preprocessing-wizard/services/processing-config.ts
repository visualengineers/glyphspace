import { PreprocessingState } from '../models/preprocessing-state';
import { CleaningConfig, ColumnConfig, ProjectionConfig } from '../models/column-config';
import { DataType, EncodingMethod } from '../models/data-type.enum';

/** One column as the worker's processWithConfig expects it. */
export type ProcessingColumnConfig = Pick<
  ColumnConfig,
  | 'name'
  | 'enabled'
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
 * Feature names the worker will produce after encoding: enabled, non-ID columns;
 * a one-hot column expands to `<column>_<value>` per top value of its profile.
 */
export function predictEncodedFeatureNames(state: Pick<PreprocessingState, 'columnConfigs' | 'dataProfile'>): string[] {
  const enabledCols = Array.from(state.columnConfigs.values()).filter(
    config => config.enabled && config.originalType !== DataType.ID
  );

  return enabledCols.flatMap(col => {
    if (col.encodingMethod !== EncodingMethod.OneHot) {
      // Label encoding, numeric, or no encoding - keeps column name
      return [col.name];
    }
    // Predict one-hot expansion based on unique values from data profile
    const colStats = state.dataProfile?.columns.find(c => c.name === col.name);
    return (colStats?.topValues ?? []).map(item => `${col.name}_${item.value}`);
  });
}

/** A projection position as computed on the main thread. */
export interface ProjectionPosition {
  id: string | number;
  x: number;
  y: number;
}

/** A dataset of the processed collection, as far as projection positions are concerned. */
interface ProcessedDataset {
  positions?: Record<string, { id: string; position: { x: number; y: number } }[]>;
}

/** The shape the worker's processWithConfig returns (wider than DatasetCollection). */
export interface ProcessedCollection {
  selectedDataset?: string;
  datasets?: Record<string, ProcessedDataset | undefined>;
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
  const datasetKey = collection.selectedDataset || (collection.datasets ? Object.keys(collection.datasets)[0] : null);
  if (!datasetKey || !collection.datasets) {
    throw new Error('Invalid dataset structure');
  }
  const dataset = collection.datasets[datasetKey];
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
