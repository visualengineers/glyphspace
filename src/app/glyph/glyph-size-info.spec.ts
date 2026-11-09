import { ZoomLevel } from '../shared/enum/zoom-level';
import { GLYPH_REACH_IN_POINT_RADII, GlyphSizeInfo, ITEM_SIZE_PX } from './glyph-size-info';

describe('GlyphSizeInfo', () => {
  it('draws points with half the item size as radius', () => {
    const sizeInfo = new GlyphSizeInfo();
    sizeInfo.setSizes(10, 1);

    expect(sizeInfo.getRadius(ZoomLevel.low)).toBe(5);
  });

  // A typical glyph reaches 40 % of its radius, so the radius is 1 / 0.4 times
  // the distance it should reach: GLYPH_REACH_IN_POINT_RADII point radii.
  it('makes a typical glyph reach a fixed number of point radii', () => {
    const sizeInfo = new GlyphSizeInfo();
    sizeInfo.setSizes(6, 0.4);

    expect(sizeInfo.getRadius(ZoomLevel.medium)).toBeCloseTo((3 * GLYPH_REACH_IN_POINT_RADII) / 0.4);
    expect(sizeInfo.getRadius(ZoomLevel.medium) * 0.4).toBeCloseTo(
      sizeInfo.getRadius(ZoomLevel.low) * GLYPH_REACH_IN_POINT_RADII
    );
  });

  it('keeps the glyph size across the medium and high zoom levels', () => {
    const sizeInfo = new GlyphSizeInfo();
    sizeInfo.setSizes(6, 0.5);

    expect(sizeInfo.getRadius(ZoomLevel.high)).toBe(sizeInfo.getRadius(ZoomLevel.medium));
  });

  it('scales points and glyphs together', () => {
    const sizeInfo = new GlyphSizeInfo();
    sizeInfo.setSizes(6, 0.5);
    const before = sizeInfo.getRadius(ZoomLevel.high);

    sizeInfo.setSizes(12, 0.5);

    expect(sizeInfo.getRadius(ZoomLevel.high)).toBeCloseTo(before * 2);
  });

  it('updates the current radius when the sizes change', () => {
    const sizeInfo = new GlyphSizeInfo();
    sizeInfo.currentZoomLevel = ZoomLevel.low;

    expect(sizeInfo.setSizes(12, 1)).toBe(true);
    expect(sizeInfo.radius).toBe(6);
  });

  it('reports unchanged sizes', () => {
    const sizeInfo = new GlyphSizeInfo();

    expect(sizeInfo.setSizes(ITEM_SIZE_PX.default, 1)).toBe(false);
  });

  it('clones sizes and current overrides', () => {
    const sizeInfo = new GlyphSizeInfo();
    sizeInfo.setSizes(8, 0.5);
    sizeInfo.currentZoomLevel = ZoomLevel.high;
    sizeInfo.radius = 42;

    const clone = sizeInfo.clone();

    expect(clone.itemSize).toBe(8);
    expect(clone.reach).toBe(0.5);
    expect(clone.radius).toBe(42);
    expect(clone.getRadius(ZoomLevel.low)).toBe(4);
  });
});
