import { ZoomLevel } from '../shared/enum/zoom-level';
import { GLYPH_SIZE_PX, GlyphSizeInfo, POINT_SIZE_PX } from './glyph-size-info';

describe('GlyphSizeInfo', () => {
  it('draws points with half the point size as radius', () => {
    const sizeInfo = new GlyphSizeInfo();
    sizeInfo.setSizes(10, GLYPH_SIZE_PX.default);

    expect(sizeInfo.getRadius(ZoomLevel.low)).toBe(5);
  });

  it('keeps the previous canvas glyph radii at the default glyph size', () => {
    const sizeInfo = new GlyphSizeInfo();

    expect(sizeInfo.getRadius(ZoomLevel.high)).toBeCloseTo(5);
    expect(sizeInfo.getRadius(ZoomLevel.medium)).toBeCloseTo(2.5);
  });

  it('scales canvas glyphs with the glyph size', () => {
    const sizeInfo = new GlyphSizeInfo();
    sizeInfo.setSizes(POINT_SIZE_PX.default, GLYPH_SIZE_PX.default * 2);

    expect(sizeInfo.getRadius(ZoomLevel.high)).toBeCloseTo(10);
    expect(sizeInfo.getRadius(ZoomLevel.medium)).toBeCloseTo(5);
  });

  it('updates the current radius when the sizes change', () => {
    const sizeInfo = new GlyphSizeInfo();
    sizeInfo.currentZoomLevel = ZoomLevel.low;

    expect(sizeInfo.setSizes(12, GLYPH_SIZE_PX.default)).toBe(true);
    expect(sizeInfo.radius).toBe(6);
  });

  it('reports unchanged sizes', () => {
    const sizeInfo = new GlyphSizeInfo();

    expect(sizeInfo.setSizes(POINT_SIZE_PX.default, GLYPH_SIZE_PX.default)).toBe(false);
  });

  it('clones sizes and current overrides', () => {
    const sizeInfo = new GlyphSizeInfo();
    sizeInfo.setSizes(8, 64);
    sizeInfo.currentZoomLevel = ZoomLevel.high;
    sizeInfo.radius = 42;

    const clone = sizeInfo.clone();

    expect(clone.pointSize).toBe(8);
    expect(clone.glyphSize).toBe(64);
    expect(clone.radius).toBe(42);
    expect(clone.getRadius(ZoomLevel.low)).toBe(4);
  });
});
