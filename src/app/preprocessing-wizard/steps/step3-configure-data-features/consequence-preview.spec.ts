import { ColumnStatistics } from '../../models/column-statistics';
import {
  DataType,
  EncodingMethod,
  MissingValueStrategy,
  OutlierStrategy,
  ScalingMethod,
} from '../../models/data-type.enum';
import {
  describeEncoding,
  describeMissingValues,
  describeOutliers,
  describeScaling,
  formatNumber,
  formatShare,
  toSpokenText,
} from './consequence-preview';

function numeric(overrides: Partial<ColumnStatistics> = {}): ColumnStatistics {
  return {
    name: 'price',
    dataType: DataType.Numeric,
    count: 1000,
    missingCount: 0,
    missingPercentage: 0,
    uniqueCount: 800,
    min: 12.4,
    max: 98.1,
    mean: 55.2,
    median: 50,
    q1: 40,
    q3: 60,
    stdDev: 12.1,
    ...overrides,
  };
}

function categorical(uniqueCount: number, overrides: Partial<ColumnStatistics> = {}): ColumnStatistics {
  return {
    name: 'colour',
    dataType: DataType.Categorical,
    count: 500,
    missingCount: 0,
    missingPercentage: 0,
    uniqueCount,
    topValues: [{ value: 'red', count: 200 }],
    ...overrides,
  };
}

/** Noon UTC so the formatted day is the same in every test time zone. */
const JAN_15_2024 = Date.UTC(2024, 0, 15, 12);
const DEC_20_2024 = Date.UTC(2024, 11, 20, 12);

describe('consequence-preview', () => {
  describe('formatNumber', () => {
    const cases: [number, string][] = [
      [12.4, '12.4'],
      [98.14, '98.1'],
      [0.001234, '0.00123'],
      [-3.456, '−3.46'],
      [42, '42'],
      [999.4, '999'],
      [1234.5, '1,235'],
      [-1234567.8, '−1,234,568'],
      [-0.0000001, '−0.0000001'],
      [0, '0'],
    ];
    cases.forEach(([value, expected]) => {
      it(`formats ${value} as "${expected}"`, () => expect(formatNumber(value)).toBe(expected));
    });

    it('never prints a negative zero', () => {
      expect(formatNumber(-0)).toBe('0');
    });
  });

  describe('formatShare', () => {
    const cases: [number, number, string][] = [
      [42, 1000, '4.2%'],
      [1, 3, '33.3%'],
      [5, 5, '100%'],
      [1, 5000, '<0.1%'],
      [0, 10, '0%'],
    ];
    cases.forEach(([part, total, expected]) => {
      it(`${part} of ${total} is "${expected}"`, () => expect(formatShare(part, total)).toBe(expected));
    });
  });

  describe('describeScaling', () => {
    const cases: [string, ColumnStatistics, ScalingMethod, string | null][] = [
      ['min-max range', numeric(), ScalingMethod.MinMax, '12.4 – 98.1 → 0.00 – 1.00'],
      ['standard with z range', numeric(), ScalingMethod.Standard, 'mean 55.2, sd 12.1 → mean 0, sd 1 (≈ −3.5 … 3.5)'],
      ['robust with range', numeric(), ScalingMethod.Robust, '(x − median) / IQR → ≈ −1.9 … 2.4'],
      ['none', numeric(), ScalingMethod.None, null],
      [
        'constant column, min-max',
        numeric({ min: 5, max: 5 }),
        ScalingMethod.MinMax,
        'All values are 5 → every value becomes 0',
      ],
      ['sd = 0', numeric({ stdDev: 0 }), ScalingMethod.Standard, 'All values are equal (sd 0) → every value becomes 0'],
      [
        'IQR = 0',
        numeric({ q1: 50, q3: 50 }),
        ScalingMethod.Robust,
        'IQR is 0 → values are only shifted by the median',
      ],
      [
        'standard without min/max',
        numeric({ min: undefined, max: undefined }),
        ScalingMethod.Standard,
        'mean 55.2, sd 12.1 → mean 0, sd 1',
      ],
      ['robust without min/max', numeric({ min: undefined }), ScalingMethod.Robust, '(x − median) / IQR → median 0'],
      ['min-max without stats', numeric({ max: undefined }), ScalingMethod.MinMax, null],
      ['standard without sd', numeric({ stdDev: undefined }), ScalingMethod.Standard, null],
      ['robust without quartiles', numeric({ q3: undefined }), ScalingMethod.Robust, null],
      ['NaN statistics', numeric({ min: NaN }), ScalingMethod.MinMax, null],
      ['large values', numeric({ min: 1200, max: 2500000 }), ScalingMethod.MinMax, '1,200 – 2,500,000 → 0.00 – 1.00'],
    ];
    cases.forEach(([name, column, method, expected]) => {
      it(name, () => expect(describeScaling(column, method)).toBe(expected));
    });

    it('never prints NaN or Infinity', () => {
      const broken = numeric({ stdDev: 0, q1: 1, q3: 1, min: 3, max: 3 });
      for (const method of Object.values(ScalingMethod)) {
        expect(describeScaling(broken, method) ?? '').not.toMatch(/NaN|Infinity/);
      }
    });

    it('shows a date column range as dates', () => {
      const date = numeric({ dataType: DataType.Date, min: JAN_15_2024, max: DEC_20_2024 });
      expect(describeScaling(date, ScalingMethod.MinMax)).toBe('Jan 15, 2024 – Dec 20, 2024 → 0.00 – 1.00');
    });

    it('shows only the result for a standardised date column', () => {
      const day = 86_400_000;
      const date = numeric({ dataType: DataType.Date, min: 0, max: 20 * day, mean: 10 * day, stdDev: 5 * day });
      expect(describeScaling(date, ScalingMethod.Standard)).toBe('mean 0, sd 1 (≈ −2 … 2)');
    });
  });

  describe('describeEncoding', () => {
    const cases: [string, ColumnStatistics, EncodingMethod, string | null][] = [
      ['one-hot', categorical(7), EncodingMethod.OneHot, 'Creates 7 new columns'],
      ['one-hot, one category', categorical(1), EncodingMethod.OneHot, 'Creates 1 new column'],
      ['one-hot, many categories', categorical(1500), EncodingMethod.OneHot, 'Creates 1,500 new columns'],
      ['label', categorical(4), EncodingMethod.Label, 'Maps 4 categories to 0 … 3'],
      ['label, one category', categorical(1), EncodingMethod.Label, 'Maps 1 category to 0'],
      ['label, no categories', categorical(0), EncodingMethod.Label, null],
      [
        'one-hot with missing values (kept ones become a "missing" column)',
        categorical(7, { missingCount: 3 }),
        EncodingMethod.OneHot,
        'Creates 7 new columns (+1 for missing values if kept)',
      ],
      [
        'label with missing values (kept ones become a "missing" category)',
        categorical(4, { missingCount: 3 }),
        EncodingMethod.Label,
        'Maps 4 categories to 0 … 3 (+1 for missing values if kept)',
      ],
      [
        'label on a boolean column with missing values (always 0/1)',
        categorical(2, { dataType: DataType.Boolean, missingCount: 3 }),
        EncodingMethod.Label,
        'Maps 2 categories to 0 … 1',
      ],
      ['normalize', numeric(), EncodingMethod.Normalize, '12.4 – 98.1 → 0.00 – 1.00'],
      ['standardize', numeric(), EncodingMethod.Standardize, 'mean 55.2, sd 12.1 → mean 0, sd 1 (≈ −3.5 … 3.5)'],
      ['none', numeric(), EncodingMethod.None, null],
      [
        'none on a text column (one-hot encoded by the pipeline)',
        categorical(5, { dataType: DataType.Text, missingCount: 1 }),
        EncodingMethod.None,
        'Text is one-hot encoded into 5 new columns (+1 for missing values if kept)',
      ],
      ['none on a categorical column', categorical(5), EncodingMethod.None, null],
    ];
    cases.forEach(([name, column, method, expected]) => {
      it(name, () => expect(describeEncoding(column, method)).toBe(expected));
    });
  });

  describe('describeMissingValues', () => {
    const withMissing = numeric({ missingCount: 42, mean: 42.14, median: 40 });
    const cases: [string, ColumnStatistics, MissingValueStrategy, string | undefined, string | null][] = [
      [
        'remove rows',
        withMissing,
        MissingValueStrategy.RemoveRows,
        undefined,
        'Drops 42 of 1,000 rows (4.2%) with a missing value in this column',
      ],
      ['fill mean', withMissing, MissingValueStrategy.FillMean, undefined, 'Fills 42 missing values with 42.1'],
      ['fill median', withMissing, MissingValueStrategy.FillMedian, undefined, 'Fills 42 missing values with 40'],
      [
        'fill mode',
        categorical(3, { missingCount: 1 }),
        MissingValueStrategy.FillMode,
        undefined,
        'Fills 1 missing value with “red”',
      ],
      [
        'fill mode without top values',
        categorical(3, { missingCount: 2, topValues: [] }),
        MissingValueStrategy.FillMode,
        undefined,
        'Fills 2 missing values with the most common value',
      ],
      [
        'fill custom value',
        categorical(3, { missingCount: 42 }),
        MissingValueStrategy.FillValue,
        ' n/a ',
        'Fills 42 missing values with “n/a”',
      ],
      [
        'fill custom value, not entered yet',
        withMissing,
        MissingValueStrategy.FillValue,
        '',
        'Fills 42 missing values with the value you enter',
      ],
      ['fill a number', withMissing, MissingValueStrategy.FillValue, '-1.5e3', 'Fills 42 missing values with “-1.5e3”'],
      [
        'fill a numeric column with text',
        withMissing,
        MissingValueStrategy.FillValue,
        'n/a',
        'Enter a number: “n/a” can’t fill this numeric column',
      ],
      [
        'fill a coordinate column with a hex number',
        numeric({ dataType: DataType.Coordinate, missingCount: 1 }),
        MissingValueStrategy.FillValue,
        '0x10',
        'Enter a number: “0x10” can’t fill this numeric column',
      ],
      [
        'fill a categorical column with text',
        categorical(3, { missingCount: 2 }),
        MissingValueStrategy.FillValue,
        'unknown',
        'Fills 2 missing values with “unknown”',
      ],
      [
        'fill mean without a mean',
        numeric({ missingCount: 3, mean: undefined }),
        MissingValueStrategy.FillMean,
        undefined,
        'Fills 3 missing values with the column mean',
      ],
      [
        'keep',
        withMissing,
        MissingValueStrategy.Keep,
        undefined,
        '42 values stay missing: shown as “missing” in tooltips, placed at 0 after scaling',
      ],
      [
        'keep one missing value',
        numeric({ missingCount: 1 }),
        MissingValueStrategy.Keep,
        undefined,
        '1 value stays missing: shown as “missing” in tooltips, placed at 0 after scaling',
      ],
      [
        'keep in a date column',
        numeric({ dataType: DataType.Date, missingCount: 3 }),
        MissingValueStrategy.Keep,
        undefined,
        '3 values stay missing: shown as “missing” in tooltips, placed at 0 after scaling',
      ],
      [
        'keep in a categorical column (a "missing" category)',
        categorical(3, { missingCount: 2 }),
        MissingValueStrategy.Keep,
        undefined,
        '2 values stay missing: shown as “missing” in tooltips, encoded as a “missing” category',
      ],
      [
        'keep in a text column (a "missing" category)',
        categorical(3, { dataType: DataType.Text, missingCount: 2 }),
        MissingValueStrategy.Keep,
        undefined,
        '2 values stay missing: shown as “missing” in tooltips, encoded as a “missing” category',
      ],
      [
        'keep in a boolean column (placed like False)',
        categorical(2, { dataType: DataType.Boolean, missingCount: 5 }),
        MissingValueStrategy.Keep,
        undefined,
        '5 values stay missing: shown as “missing” in tooltips, placed at 0 like False',
      ],
      ['keep without missing values', numeric(), MissingValueStrategy.Keep, undefined, null],
      ['no missing values', numeric(), MissingValueStrategy.RemoveRows, undefined, null],
    ];
    cases.forEach(([name, column, strategy, fillValue, expected]) => {
      it(name, () => expect(describeMissingValues(column, strategy, 1000, fillValue)).toBe(expected));
    });

    it('omits the share when the row count is unknown', () => {
      expect(describeMissingValues(numeric({ missingCount: 1 }), MissingValueStrategy.RemoveRows, 0)).toBe(
        'Drops 1 row with a missing value in this column'
      );
    });
  });

  describe('describeOutliers', () => {
    const cases: [string, OutlierStrategy, number | undefined, string | null][] = [
      ['remove', OutlierStrategy.Remove, 37, 'Drops 37 rows (3.7%)'],
      ['remove one', OutlierStrategy.Remove, 1, 'Drops 1 row (0.1%)'],
      ['cap', OutlierStrategy.Cap, 37, 'Caps 37 values at the detection bounds'],
      ['keep', OutlierStrategy.Keep, 37, null],
      ['count still loading', OutlierStrategy.Remove, undefined, null],
      ['remove, nothing detected', OutlierStrategy.Remove, 0, 'No outliers detected, so no rows are dropped'],
      ['cap, nothing detected', OutlierStrategy.Cap, 0, 'No outliers detected, so no values are capped'],
    ];
    cases.forEach(([name, strategy, count, expected]) => {
      it(name, () => expect(describeOutliers(strategy, count, 1000)).toBe(expected));
    });
  });

  describe('toSpokenText', () => {
    const cases: [string, string][] = [
      ['12.4 – 98.1 → 0.00 – 1.00', '12.4 to 98.1, becomes 0.00 to 1.00'],
      ['mean 0, sd 1 (≈ −3.5 … 3.6)', 'mean 0, sd 1 (about minus 3.5 to 3.6)'],
      ['(x − median) / IQR → ≈ −1.9 … 2.4', '(x minus median) divided by IQR, becomes about minus 1.9 to 2.4'],
      ['Creates 7 new columns', 'Creates 7 new columns'],
    ];
    cases.forEach(([text, expected]) => {
      it(`spells out "${text}"`, () => expect(toSpokenText(text)).toBe(expected));
    });
  });
});
