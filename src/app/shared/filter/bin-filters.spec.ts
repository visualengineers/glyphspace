import { GlyphObject } from '../../glyph/glyph-object';
import { CategoryFilter } from './category-filter';
import { FeatureFilter } from './feature-filter';

function item(id: string, value: number | undefined): GlyphObject {
  const glyph = new GlyphObject(id);
  glyph.features = { '1': value === undefined ? {} : { f: value } };
  return glyph;
}

describe('FeatureFilter', () => {
  // Regression: the filter used closed ranges [min, max], while numpy's bins are
  // half-open, so brushing bars 0–3 of wineqr "citric acid" kept 631 items where
  // those bars hold 606: every item on the upper edge of bar 3 came along.
  it('keeps exactly the items counted in the brushed bins', () => {
    const filter = new FeatureFilter('f');
    filter.setBinRange(0, 3, 20);

    expect(filter.inFilter(item('a', 0))).toBe(true);
    expect(filter.inFilter(item('b', 0.199))).toBe(true);
    expect(filter.inFilter(item('edge', 0.2))).toBe(false); // first value of bin 4
  });

  it('includes 1 in the last bin', () => {
    const filter = new FeatureFilter('f');
    filter.setBinRange(19, 19, 20);

    expect(filter.inFilter(item('max', 1))).toBe(true);
  });

  it('rejects items without a value, and is empty until a range is set', () => {
    const filter = new FeatureFilter('f');
    expect(filter.empty()).toBe(true);

    filter.setBinRange(0, 19, 20);
    expect(filter.inFilter(item('none', undefined))).toBe(false);

    filter.clear();
    expect(filter.empty()).toBe(true);
  });

  it('refuses bins outside the histogram', () => {
    const filter = new FeatureFilter('f');

    expect(() => filter.setBinRange(0, 20, 20)).toThrow(RangeError);
    expect(() => filter.setBinRange(5, 4, 20)).toThrow(RangeError);
  });
});

describe('CategoryFilter', () => {
  // Regression: a clicked bar's range was padded on both sides, so a category on
  // the bar's edge was picked up from the neighbouring bar too (nutrients
  // "group": bar 4 selected Cereal Grains and also Dairy and Egg Products of bar 5).
  it('keeps exactly the items counted in the clicked bars', () => {
    // 25 categories in 20 bins: code c is the value c / 24.
    const cerealGrains = item('cereal', 5 / 24); // bin 4
    const dairy = item('dairy', 6 / 24); // bin 5, exactly on its lower edge
    const filter = new CategoryFilter('f');

    filter.setBins([4], 20);

    expect(filter.inFilter(cerealGrains)).toBe(true);
    expect(filter.inFilter(dairy)).toBe(false);
  });

  it('accepts several bars', () => {
    const filter = new CategoryFilter('f');

    filter.setBins([0, 2], 3);

    expect([0, 0.5, 1].map(value => filter.inFilter(item(String(value), value)))).toEqual([true, false, true]);
  });

  it('is empty after clear and refuses bins outside the histogram', () => {
    const filter = new CategoryFilter('f');
    filter.setBins([1], 3);
    filter.clear();

    expect(filter.empty()).toBe(true);
    expect(() => filter.setBins([3], 3)).toThrow(RangeError);
  });
});
