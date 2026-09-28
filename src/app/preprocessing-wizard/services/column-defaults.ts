import { ColumnStatistics } from '../models/column-statistics';
import { ColumnConfig } from '../models/column-config';
import {
  DataType,
  MissingValueStrategy,
  OutlierStrategy,
  OutlierMethod,
  DATA_TYPE_CONFIG,
} from '../models/data-type.enum';

/** Smart defaults for the column configuration of a freshly profiled file. */

const HIGH_CARDINALITY_RATIO = 0.9;
const HIGH_CARDINALITY_MIN_ROWS = 20;

/**
 * A text/categorical/ID column counts as high-cardinality when nearly all of
 * its values are unique (typical of IDs, titles or free text). Such columns
 * carry little structure for a projection and would explode one-hot encoding,
 * so they start deselected as a smart default. Numeric/date columns are exempt —
 * near-unique values there are legitimate measurements.
 */
function isHighCardinality(col: ColumnStatistics): boolean {
  const eligible =
    col.dataType === DataType.Text || col.dataType === DataType.Categorical || col.dataType === DataType.ID;
  if (!eligible || col.count <= HIGH_CARDINALITY_MIN_ROWS) {
    return false;
  }
  return col.uniqueCount / col.count >= HIGH_CARDINALITY_RATIO;
}

/** Initial configuration of a profiled column. */
export function createDefaultColumnConfig(col: ColumnStatistics): ColumnConfig {
  const capabilities = DATA_TYPE_CONFIG[col.dataType] ?? DATA_TYPE_CONFIG[DataType.Unknown];

  // Smart defaults: obviously unsuitable columns start deselected; users can
  // re-enable them in Step 2 at any time. issueDescription records WHY a column
  // was auto-deselected so Step 2 can show a reason next to it.
  const isMostlyMissing = col.missingPercentage > 50;
  const isConstant = col.uniqueCount === 1;
  const highCardinality = isHighCardinality(col);

  // hasIssues drives the data-quality warning icon (mostly-missing / constant).
  const hasIssues = isMostlyMissing || isConstant;
  const autoDeselected = hasIssues || highCardinality;

  let issueDescription: string | undefined;
  if (isMostlyMissing) {
    issueDescription = `Mostly empty (${Math.round(col.missingPercentage)}% missing)`;
  } else if (isConstant) {
    issueDescription = 'Only one unique value — nothing to distinguish rows';
  } else if (highCardinality) {
    const pct = Math.round((col.uniqueCount / col.count) * 100);
    issueDescription = `Nearly all values are unique (${pct}%) — likely an ID, title or free-text column`;
  }

  return {
    name: col.name,
    originalType: col.dataType,
    targetType: col.dataType,
    encodingMethod: capabilities.defaultEncoding,
    scalingMethod: capabilities.defaultScaling,
    includeInProjection: capabilities.defaultIncludeInProjection,
    isColorFeature: false,
    missingValueStrategy: MissingValueStrategy.Keep,
    outlierMethod: OutlierMethod.IQR_1_5,
    outlierStrategy: OutlierStrategy.Keep,
    enabled: !autoDeselected,
    hasIssues,
    issueDescription,
  };
}

/** Color mode plus scale id chosen for a color attribute. */
export interface ColorScaleChoice {
  colorScaleMode: 'continuous' | 'categorical';
  colorScaleId: number;
}

/** Scale ids 0-3 are numeric (continuous) scales, 4 and up categorical ones. */
const FIRST_CATEGORICAL_SCALE_ID = 4;

/**
 * Color mode matching the color column's type: categorical/text columns get a
 * categorical scale, everything else a continuous one. The current scale is kept
 * when it fits that mode; otherwise the mode's default scale is picked.
 */
export function colorScaleForFeature(config: ColumnConfig | undefined, currentScaleId: number): ColorScaleChoice {
  const categoricalTypes = [DataType.Categorical, DataType.Text];
  const isCategorical =
    !!config && (categoricalTypes.includes(config.originalType) || categoricalTypes.includes(config.targetType));
  const currentIsCategorical = currentScaleId >= FIRST_CATEGORICAL_SCALE_ID;
  const defaultScaleId = isCategorical ? FIRST_CATEGORICAL_SCALE_ID : 0;
  const colorScaleId = isCategorical === currentIsCategorical ? currentScaleId : defaultScaleId;
  return { colorScaleMode: isCategorical ? 'categorical' : 'continuous', colorScaleId };
}

/**
 * The smart-default configuration values for a column, derived from its
 * original data type (see DATA_TYPE_CONFIG).
 */
export function columnDefaultsFor(config: ColumnConfig): Partial<ColumnConfig> {
  const capabilities = DATA_TYPE_CONFIG[config.originalType] ?? DATA_TYPE_CONFIG[DataType.Unknown];
  return {
    encodingMethod: capabilities.defaultEncoding,
    scalingMethod: capabilities.defaultScaling,
    includeInProjection: capabilities.defaultIncludeInProjection,
    missingValueStrategy: MissingValueStrategy.Keep,
    missingValueFillValue: undefined,
    outlierMethod: OutlierMethod.IQR_1_5,
    outlierStrategy: OutlierStrategy.Keep,
  };
}
