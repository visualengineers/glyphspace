import { GlyphObject } from './glyph-object';
import { MIN_GLYPH_REACH, typicalGlyphReach } from './glyph-reach';

function glyph(values: Record<string, number>): GlyphObject {
  const item = new GlyphObject('g');
  item.features = { '1': values };
  return item;
}

describe('typicalGlyphReach', () => {
  it("is the median of the items' longest axes", () => {
    const glyphs = [glyph({ a: 0.2, b: 0.3 }), glyph({ a: 0.6, b: 0.1 }), glyph({ a: 0.4, b: 0.5 })];

    expect(typicalGlyphReach(glyphs, ['a', 'b'], {}, false)).toBeCloseTo(0.5);
  });

  it('only looks at the glyph axes', () => {
    const glyphs = [glyph({ a: 0.4, b: 0.9 })];

    expect(typicalGlyphReach(glyphs, ['a'], {}, false)).toBeCloseTo(0.4);
  });

  it('is at least MIN_GLYPH_REACH, so glyphs of tiny values stay a few times a point', () => {
    expect(typicalGlyphReach([glyph({ a: 0.01 })], ['a'], {}, false)).toBe(MIN_GLYPH_REACH);
  });

  it('is 1 without items or axes', () => {
    expect(typicalGlyphReach([], ['a'], {}, false)).toBe(1);
    expect(typicalGlyphReach([glyph({ a: 0.4 })], [], {}, false)).toBe(1);
  });
});
