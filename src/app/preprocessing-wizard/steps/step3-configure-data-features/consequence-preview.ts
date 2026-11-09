import { ColumnStatistics } from '../../models/column-statistics';
import {
  DataType,
  EncodingMethod,
  MissingValueStrategy,
  OutlierStrategy,
  ScalingMethod,
} from '../../models/data-type.enum';

/**
 * "Show the consequence" texts for Step 3: what a setting does to THIS column,
 * computed from its profile statistics (e.g. "12.4 – 98.1 → 0.00 – 1.00").
 * Pure functions; every one returns null when there is nothing worth saying
 * (setting has no effect, or the statistics it needs are missing).
 */

type NumericTransform = 'minmax' | 'standard' | 'robust';

const MINUS = '−';
/** From this magnitude on, values are shown as whole numbers with thousands separators. */
const WHOLE_NUMBER_THRESHOLD = 1000;

const WHOLE_FORMAT = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const SIGNIFICANT_FORMAT = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 3 });
const SCALED_FORMAT = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
const PERCENT_FORMAT = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
const DATE_FORMAT = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

function withTypographicMinus(text: string): string {
  return text === '-0' ? '0' : text.replace('-', MINUS);
}

/** Readable number: thousands separators, at most 3 significant digits below 1,000. */
export function formatNumber(value: number): string {
  const format = Math.abs(value) >= WHOLE_NUMBER_THRESHOLD ? WHOLE_FORMAT : SIGNIFICANT_FORMAT;
  return withTypographicMinus(format.format(value));
}

/** A value after scaling (z-score-like): one decimal is enough to read the range. */
function formatScaled(value: number): string {
  return withTypographicMinus(SCALED_FORMAT.format(value));
}

function formatCount(count: number): string {
  return WHOLE_FORMAT.format(count);
}

/** Share of `part` in `total` as a percentage; tiny non-zero shares read "<0.1%". */
export function formatShare(part: number, total: number): string {
  const percent = (part / total) * 100;
  return percent > 0 && percent < 0.1 ? '<0.1%' : `${PERCENT_FORMAT.format(percent)}%`;
}

function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return count === 1 ? singular : pluralForm;
}

function isNumber(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/** Raw column values: dates (stored as timestamps) read as dates, everything else as numbers. */
function formatRawValue(column: ColumnStatistics, value: number): string {
  return column.dataType === DataType.Date ? DATE_FORMAT.format(new Date(value)) : formatNumber(value);
}

function describeMinMax(column: ColumnStatistics): string | null {
  const { min, max } = column;
  if (!isNumber(min) || !isNumber(max)) return null;
  if (min === max) return `All values are ${formatRawValue(column, min)} → every value becomes 0`;
  return `${formatRawValue(column, min)} – ${formatRawValue(column, max)} → 0.00 – 1.00`;
}

function describeStandard(column: ColumnStatistics): string | null {
  const { mean, stdDev: sd, min, max } = column;
  if (!isNumber(mean) || !isNumber(sd)) return null;
  if (sd <= 0) return 'All values are equal (sd 0) → every value becomes 0';
  // Mean and sd of a date column are timestamps and durations: show the result only.
  const before = column.dataType === DataType.Date ? '' : `mean ${formatNumber(mean)}, sd ${formatNumber(sd)} → `;
  const range =
    isNumber(min) && isNumber(max)
      ? ` (≈ ${formatScaled((min - mean) / sd)} … ${formatScaled((max - mean) / sd)})`
      : '';
  return `${before}mean 0, sd 1${range}`;
}

function describeRobust(column: ColumnStatistics): string | null {
  const { median, q1, q3, min, max } = column;
  if (!isNumber(median) || !isNumber(q1) || !isNumber(q3)) return null;
  const iqr = q3 - q1;
  if (iqr <= 0) return 'IQR is 0 → values are only shifted by the median';
  if (!isNumber(min) || !isNumber(max)) return '(x − median) / IQR → median 0';
  return `(x − median) / IQR → ≈ ${formatScaled((min - median) / iqr)} … ${formatScaled((max - median) / iqr)}`;
}

const NUMERIC_TRANSFORMS: Readonly<Record<NumericTransform, (column: ColumnStatistics) => string | null>> = {
  minmax: describeMinMax,
  standard: describeStandard,
  robust: describeRobust,
};

const SCALING_TRANSFORMS: Readonly<Partial<Record<ScalingMethod, NumericTransform>>> = {
  [ScalingMethod.MinMax]: 'minmax',
  [ScalingMethod.Standard]: 'standard',
  [ScalingMethod.Robust]: 'robust',
};

/** Range before → after for a scaling method; null for "None". */
export function describeScaling(column: ColumnStatistics, method: ScalingMethod): string | null {
  const transform = SCALING_TRANSFORMS[method];
  return transform ? NUMERIC_TRANSFORMS[transform](column) : null;
}

/**
 * Kept missing values become a category of their own ("missing") in label and
 * one-hot encoding; boolean columns are always encoded as 0/1 instead.
 */
function missingCategoryNote(column: ColumnStatistics): string {
  return column.missingCount > 0 && column.dataType !== DataType.Boolean ? ' (+1 for missing values if kept)' : '';
}

/** "N new columns" of a one-hot encoding; null without categories. */
function oneHotColumns(column: ColumnStatistics): string | null {
  const categories = column.uniqueCount;
  if (categories <= 0) return null;
  return `${formatCount(categories)} new ${plural(categories, 'column')}${missingCategoryNote(column)}`;
}

function describeLabel(column: ColumnStatistics): string | null {
  const categories = column.uniqueCount;
  if (categories <= 0) return null;
  const codes =
    categories === 1
      ? 'Maps 1 category to 0'
      : `Maps ${formatCount(categories)} categories to 0 … ${formatCount(categories - 1)}`;
  return `${codes}${missingCategoryNote(column)}`;
}

/**
 * What an encoding produces: new columns, category codes or the numeric range.
 * "None" keeps numbers as they are (null), but text is one-hot encoded then.
 */
export function describeEncoding(column: ColumnStatistics, method: EncodingMethod): string | null {
  switch (method) {
    case EncodingMethod.OneHot: {
      const columns = oneHotColumns(column);
      return columns ? `Creates ${columns}` : null;
    }
    case EncodingMethod.Label:
      return describeLabel(column);
    case EncodingMethod.Normalize:
      return describeMinMax(column);
    case EncodingMethod.Standardize:
      return describeStandard(column);
    case EncodingMethod.None: {
      const columns = column.dataType === DataType.Text ? oneHotColumns(column) : null;
      return columns ? `Text is one-hot encoded into ${columns}` : null;
    }
    default:
      return null;
  }
}

function fillText(missing: number, filler: string): string {
  return `Fills ${formatCount(missing)} missing ${plural(missing, 'value')} with ${filler}`;
}

function numericFiller(column: ColumnStatistics, value: number | undefined, fallback: string): string {
  return isNumber(value) ? formatRawValue(column, value) : fallback;
}

/** Column types whose fill value must be a number (the pipeline rejects anything else). */
const NUMERIC_FILL_TYPES: ReadonlySet<DataType> = new Set([DataType.Numeric, DataType.Coordinate]);
/** A decimal number as the pipeline parses it (e.g. "5", "-0.5", "1e3"). */
const NUMBER_TEXT = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i;

function describeFillValue(column: ColumnStatistics, missing: number, fillValue: string | undefined): string {
  const value = fillValue?.trim();
  if (!value) return fillText(missing, 'the value you enter');
  if (NUMERIC_FILL_TYPES.has(column.dataType) && !NUMBER_TEXT.test(value)) {
    return `Enter a number: “${value}” can’t fill this numeric column`;
  }
  return fillText(missing, `“${value}”`);
}

/** Column types whose kept missing values become a “missing” category (label and one-hot encoding). */
const MISSING_CATEGORY_TYPES: ReadonlySet<DataType> = new Set([DataType.Categorical, DataType.Text]);

/** Where the pipeline puts kept missing values of this column. */
function keptMissingPlacement(column: ColumnStatistics): string {
  if (MISSING_CATEGORY_TYPES.has(column.dataType)) return 'encoded as a “missing” category';
  // Booleans are encoded as 0 (False) / 1 (True) and not scaled.
  if (column.dataType === DataType.Boolean) return 'placed at 0 like False';
  return 'placed at 0 after scaling';
}

function describeKeep(column: ColumnStatistics, missing: number): string {
  const values = `${formatCount(missing)} ${plural(missing, 'value')} ${plural(missing, 'stays', 'stay')} missing`;
  return `${values}: shown as “missing” in tooltips, ${keptMissingPlacement(column)}`;
}

/** Rows dropped / values filled or kept by a missing-value strategy; null without missing values. */
export function describeMissingValues(
  column: ColumnStatistics,
  strategy: MissingValueStrategy,
  totalRows: number,
  fillValue?: string
): string | null {
  const missing = column.missingCount;
  if (missing <= 0) return null;
  switch (strategy) {
    case MissingValueStrategy.Keep:
      return describeKeep(column, missing);
    case MissingValueStrategy.RemoveRows:
      return totalRows > 0
        ? `Drops ${formatCount(missing)} of ${formatCount(totalRows)} rows (${formatShare(missing, totalRows)}) with a missing value in this column`
        : `Drops ${formatCount(missing)} ${plural(missing, 'row')} with a missing value in this column`;
    case MissingValueStrategy.FillMean:
      return fillText(missing, numericFiller(column, column.mean, 'the column mean'));
    case MissingValueStrategy.FillMedian:
      return fillText(missing, numericFiller(column, column.median, 'the column median'));
    case MissingValueStrategy.FillMode: {
      const mode = column.topValues?.[0]?.value;
      return fillText(missing, mode !== undefined ? `“${mode}”` : 'the most common value');
    }
    case MissingValueStrategy.FillValue:
      return describeFillValue(column, missing, fillValue);
    default:
      return null;
  }
}

/**
 * Rows dropped / values capped by an outlier strategy. Null for "Keep" and while
 * the outlier count is unknown (detection still running).
 */
export function describeOutliers(
  strategy: OutlierStrategy,
  outlierCount: number | undefined,
  totalRows: number
): string | null {
  if (outlierCount === undefined || strategy === OutlierStrategy.Keep) return null;
  if (strategy === OutlierStrategy.Remove) {
    if (outlierCount === 0) return 'No outliers detected, so no rows are dropped';
    const share = totalRows > 0 ? ` (${formatShare(outlierCount, totalRows)})` : '';
    return `Drops ${formatCount(outlierCount)} ${plural(outlierCount, 'row')}${share}`;
  }
  if (outlierCount === 0) return 'No outliers detected, so no values are capped';
  return `Caps ${formatCount(outlierCount)} ${plural(outlierCount, 'value')} at the detection bounds`;
}

const SPOKEN_REPLACEMENTS: readonly (readonly [RegExp, string])[] = [
  [/ → /g, ', becomes '],
  [/ – /g, ' to '],
  [/ … /g, ' to '],
  [/≈ /g, 'about '],
  [/ \/ /g, ' divided by '],
  [/ − /g, ' minus '],
  [/−/g, 'minus '],
];

/** The same text with its symbols spelled out, for screen readers. */
export function toSpokenText(text: string): string {
  return SPOKEN_REPLACEMENTS.reduce((spoken, [pattern, words]) => spoken.replace(pattern, words), text);
}
