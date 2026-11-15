import { binCategoryLabel, binOfValue, categoryCodesByBin, categoryLabelsByBin } from './histogram.utils';

/** The first eight of the 25 food groups of the bundled nutrients dataset, in code order. */
const FOOD_GROUPS = [
  'Baby Foods',
  'Baked Products',
  'Beef Products',
  'Beverages',
  'Breakfast Cereals',
  'Cereal Grains and Pasta',
  'Dairy and Egg Products',
  'Ethnic Foods',
  ...Array.from({ length: 17 }, (_, i) => `Group ${i + 8}`),
];

describe('binOfValue', () => {
  it('uses half-open bins like numpy: a value on an edge belongs to the upper bin', () => {
    expect(binOfValue(0, 20)).toBe(0);
    expect(binOfValue(0.05, 20)).toBe(1);
    expect(binOfValue(0.25, 20)).toBe(5);
    expect(binOfValue(0.75, 20)).toBe(15);
    expect(binOfValue(0.0499999, 20)).toBe(0);
  });

  it('counts 1 in the last bin and keeps values outside [0, 1] in the end bins', () => {
    expect(binOfValue(1, 20)).toBe(19);
    expect(binOfValue(1.2, 20)).toBe(19);
    expect(binOfValue(-0.1, 20)).toBe(0);
  });

  it('puts everything in bin 0 of a single-bin histogram', () => {
    expect(binOfValue(0.7, 1)).toBe(0);
  });
});

describe('categoryCodesByBin', () => {
  it('gives each category its own bin when there is one bin per category (wizard)', () => {
    const byBin = categoryCodesByBin(5, 5);

    expect([...byBin.entries()]).toEqual([
      [0, [0]],
      [1, [1]],
      [2, [2]],
      [3, [3]],
      [4, [4]],
    ]);
  });

  it('lets categories share the CLI’s fixed bins', () => {
    const byBin = categoryCodesByBin(20, 25);

    expect(byBin.get(0)).toEqual([0, 1]);
    expect(byBin.get(1)).toEqual([2]);
    expect(byBin.get(4)).toEqual([5]);
    expect(byBin.get(5)).toEqual([6, 7]);
    expect(byBin.get(19)).toEqual([23, 24]);
  });
});

describe('categoryLabelsByBin', () => {
  // Regression: booleans always carry two categories now ([False, True]); an
  // all-True column has histogram {0: 0, 1: 1}, and the old "i-th non-empty
  // bin gets categories[i]" rule labelled its only bar "False".
  it('maps bin n to category n when there is one bin per category', () => {
    const labels = categoryLabelsByBin({ '0': 0, '1': 1 }, ['False', 'True']);

    expect(labels.get(1)).toBe('True');
    expect(labels.get(0)).toBe('False');
  });

  // Regression: the nutrients "group" feature has 25 categories in 20 bins. The
  // old rule labelled the i-th non-empty bin with categories[i], so the bar of
  // "Beef Products" said "Baked Products".
  it('names the categories counted in each of the CLI’s fixed bins', () => {
    const histogram = Object.fromEntries(Array.from({ length: 20 }, (_, i) => [String(i), 1]));

    const labels = categoryLabelsByBin(histogram, FOOD_GROUPS);

    expect(labels.get(0)).toBe('Baby Foods, Baked Products');
    expect(labels.get(1)).toBe('Beef Products');
    expect(labels.get(4)).toBe('Cereal Grains and Pasta');
    expect(labels.get(5)).toBe('Dairy and Egg Products, Ethnic Foods');
  });

  it('returns an empty map without categories', () => {
    expect(categoryLabelsByBin({ '0': 1 }, undefined).size).toBe(0);
  });
});

describe('binCategoryLabel', () => {
  it('lists a few categories and summarises many', () => {
    expect(binCategoryLabel(['a'])).toBe('a');
    expect(binCategoryLabel(['a', 'b', 'c'])).toBe('a, b, c');
    expect(binCategoryLabel(['Apple', 'b', 'c', 'Banana'])).toBe('Apple … Banana (4 categories)');
  });
});
