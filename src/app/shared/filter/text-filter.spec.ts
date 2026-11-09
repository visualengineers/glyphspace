import { TextFilter } from './text-filter';
import { GlyphObject } from '../../glyph/glyph-object';

function glyph(values?: Record<string, string>, metadata?: Record<string, string>): GlyphObject {
  const item = new GlyphObject('g');
  item.values = values;
  item.metadata = metadata;
  return item;
}

/** A filter for `terms`, set the way the sidebar's search sets them. */
function searchFor(...terms: string[]): TextFilter {
  const filter = new TextFilter();
  filter.acceptableStrings = terms;
  return filter;
}

describe('TextFilter', () => {
  it('matches a feature value, case-insensitively', () => {
    expect(searchFor('FRANCE').inFilter(glyph({ '1': 'France' }))).toBe(true);
  });

  it('matches metadata, which is searchable without being a feature', () => {
    const filter = searchFor('caramel');

    expect(filter.inFilter(glyph({ '1': 'cow' }, { '1': 'sweet, burnt caramel' }))).toBe(true);
    expect(filter.inFilter(glyph({ '1': 'cow' }, { '1': 'sharp' }))).toBe(false);
  });

  it('matches an item with metadata only, and none with neither', () => {
    const filter = searchFor('brie');

    expect(filter.inFilter(glyph(undefined, { '1': 'Brie de Meaux' }))).toBe(true);
    expect(filter.inFilter(glyph())).toBe(false);
  });
});
