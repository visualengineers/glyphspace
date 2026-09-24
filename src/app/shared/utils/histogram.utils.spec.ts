import { categoryLabelsByBin } from './histogram.utils';

describe('categoryLabelsByBin', () => {
  // Regression: booleans always carry two categories now ([False, True]); an
  // all-True column has histogram {0: 0, 1: 1}, and the old "i-th non-empty
  // bin gets categories[i]" rule labelled its only bar "False".
  it('maps bin n to category n when there is one bin per category', () => {
    const labels = categoryLabelsByBin({ '0': 0, '1': 1 }, ['False', 'True']);

    expect(labels.get(1)).toBe('True');
    expect(labels.get(0)).toBe('False');
  });

  it('keeps the old order-based mapping when categories share fixed bins (CLI output)', () => {
    const histogram = { '0': 0.5, '1': 0, '2': 0, '3': 0.5, '4': 0 };

    const labels = categoryLabelsByBin(histogram, ['a', 'b']);

    expect(labels.get(0)).toBe('a');
    expect(labels.get(3)).toBe('b');
  });

  it('returns an empty map without categories', () => {
    expect(categoryLabelsByBin({ '0': 1 }, undefined).size).toBe(0);
  });
});
