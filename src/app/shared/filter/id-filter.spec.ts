import { GlyphObject } from '../../glyph/glyph-object';
import { IdFilter } from './id-filter';

describe('IdFilter', () => {
  it('adds, removes and toggles ids', () => {
    const filter = new IdFilter(['a']);

    filter.add('b');
    filter.add('b');
    filter.toggle('a');
    filter.toggle('c');
    filter.remove('missing');

    expect(filter.acceptableIds).toEqual(['b', 'c']);
    expect(filter.size).toBe(2);
    expect(filter.inFilter(new GlyphObject('c'))).toBe(true);
    expect(filter.inFilter(new GlyphObject('a'))).toBe(false);
  });

  it('is empty after clear', () => {
    const filter = new IdFilter(['a', 'b']);

    filter.clear();

    expect(filter.empty()).toBe(true);
  });

  // Regression: ids were kept in an array, so testing N items against K selected
  // ids took N·K steps; selecting half of 50 000 items froze the page.
  it('handles selections of tens of thousands of items quickly', () => {
    const ids = Array.from({ length: 50_000 }, (_, i) => String(i));
    const items = ids.map(id => new GlyphObject(id));
    const filter = new IdFilter();

    const start = performance.now();
    filter.addMultiple(ids.filter((_, i) => i % 2 === 0));
    const selected = items.filter(item => filter.inFilter(item)).length;
    const elapsed = performance.now() - start;

    expect(selected).toBe(25_000);
    expect(elapsed).toBeLessThan(1000);
  });
});
