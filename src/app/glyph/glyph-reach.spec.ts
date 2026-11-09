import { GlyphObject } from './glyph-object';
import { MIN_GLYPH_REACH, typicalGlyphReach, visibleRadius } from './glyph-reach';
import { GlyphRenderConfig } from './glyph-render-config';
import { GlyphSizeInfo } from './glyph-size-info';
import { GlyphType } from '../shared/enum/glyph-type';
import { ZoomLevel } from '../shared/enum/zoom-level';

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

describe('visibleRadius', () => {
  const sizeInfo = new GlyphSizeInfo();
  sizeInfo.setSizes(6, 0.5); // point radius 3, glyph radius 12
  const flower = glyph({ a: 0.4, b: 0.2 });
  const config = (overrides: Partial<GlyphRenderConfig> = {}) =>
    ({
      glyphType: GlyphType.Flower,
      activeFeatures: ['a', 'b'],
      featureMaxValues: {},
      scaleLinear: false,
      useBackground: false,
      useCoordinateSystem: false,
      ...overrides,
    }) as GlyphRenderConfig;

  it('is the point radius at the low zoom level', () => {
    expect(visibleRadius(flower, ZoomLevel.low, sizeInfo, config())).toBe(3);
  });

  it("is the glyph's own reach where only the glyph is drawn", () => {
    expect(visibleRadius(flower, ZoomLevel.medium, sizeInfo, config())).toBeCloseTo(12 * 0.4);
    expect(visibleRadius(flower, ZoomLevel.high, sizeInfo, config())).toBeCloseTo(12 * 0.4);
  });

  it('is the whole circle at full detail with a background or axes', () => {
    expect(visibleRadius(flower, ZoomLevel.high, sizeInfo, config({ useBackground: true }))).toBe(12);
    expect(visibleRadius(flower, ZoomLevel.high, sizeInfo, config({ useCoordinateSystem: true }))).toBe(12);
    // Backgrounds and axes are only drawn at full detail.
    expect(visibleRadius(flower, ZoomLevel.medium, sizeInfo, config({ useBackground: true }))).toBeCloseTo(12 * 0.4);
  });

  it('is the whole circle for images', () => {
    expect(visibleRadius(flower, ZoomLevel.medium, sizeInfo, config({ glyphType: GlyphType.Thumb }))).toBe(12);
  });

  it('keeps room for a glyph of tiny values', () => {
    const tiny = glyph({ a: 0.01, b: 0 });

    expect(visibleRadius(tiny, ZoomLevel.medium, sizeInfo, config())).toBeCloseTo(12 * MIN_GLYPH_REACH);
  });
});
