import { normalizeFeatureValue } from './color-helper';

describe('normalizeFeatureValue', () => {
  const CATEGORICAL = { feat1: 'categorical' };

  // [test name, value, featureId, featureTypes, featureMaxValues, expected]
  const cases: [string, number, string, Record<string, string>, Record<string, number>, number][] = [
    ['should return raw value for non-categorical features', 0.75, 'feat1', { feat1: 'numeric' }, {}, 0.75],
    ['should normalize categorical features by max value', 3, 'feat1', CATEGORICAL, { feat1: 6 }, 0.5],
    ['should return raw value when categorical max is 0', 3, 'feat1', CATEGORICAL, { feat1: 0 }, 3],
    ['should return raw value when categorical max is undefined', 3, 'feat1', CATEGORICAL, {}, 3],
    ['should return raw value when feature type is missing', 0.5, 'unknown', {}, {}, 0.5],
    ['should handle value of 0 for categorical', 0, 'feat1', CATEGORICAL, { feat1: 10 }, 0],
    ['should handle max value equal to value', 5, 'feat1', CATEGORICAL, { feat1: 5 }, 1],
  ];

  it.each(cases)('%s', (_name, value, featureId, featureTypes, featureMaxValues, expected) => {
    expect(normalizeFeatureValue(value, featureId, featureTypes, featureMaxValues)).toBe(expected);
  });
});
