import { categoryIndex, featureColor, normalizeFeatureValue } from './color-helper';
import { getCategoricalColors, getColorScaleById } from '../interfaces/color-scale';

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

describe('categoryIndex', () => {
  it.each([
    [0, 5, 0],
    [0.25, 5, 1],
    [1, 5, 4],
    [0.5, 2, 1],
    [1.2, 3, 2],
    [-0.1, 3, 0],
    [0.7, 1, 0],
  ])('maps value %s of %s categories to index %s', (value, count, expected) => {
    expect(categoryIndex(value, count)).toBe(expected);
  });
});

describe('featureColor', () => {
  const palette = getColorScaleById(4);
  const colors = getCategoricalColors(palette);
  const info = {
    featureTypes: { cat: 'categorical', num: 'numeric' },
    featureMaxValues: { cat: 1 },
    featureCategoryCounts: { cat: 3 },
  };

  it('gives the categories of a categorical feature the first palette colors in order', () => {
    expect([0, 0.5, 1].map(v => featureColor(palette, v, 'cat', info))).toEqual(colors.slice(0, 3));
  });

  it('starts over when there are more categories than colors', () => {
    const many = { ...info, featureCategoryCounts: { cat: colors.length + 2 } };
    expect(featureColor(palette, 1, 'cat', many)).toBe(colors[1]);
  });

  it('maps numeric features through the scale', () => {
    expect(featureColor(palette, 0.99, 'num', info)).toBe(palette.scale(0.99));
  });

  it('interpolates categorical features under a numeric scale', () => {
    const numeric = getColorScaleById(2);
    expect(featureColor(numeric, 0.5, 'cat', info)).toBe(numeric.scale(0.5));
  });
});
