import { GLYPH_ZOOM, glyphScale } from './glyph-zoom';

describe('glyphScale', () => {
  it('leaves glyphs at their size up to the zoom where points turn into glyphs', () => {
    expect(glyphScale(0.5)).toBe(1);
    expect(glyphScale(GLYPH_ZOOM)).toBe(1);
  });

  it('lets a glyph grow on screen with the square root of the zoom beyond it', () => {
    // Four times the zoom: distances grow 4×, the glyph on screen 2×.
    const onScreen = (zoom: number) => zoom * glyphScale(zoom);

    expect(onScreen(GLYPH_ZOOM * 4) / onScreen(GLYPH_ZOOM)).toBeCloseTo(2);
    expect(onScreen(GLYPH_ZOOM * 25) / onScreen(GLYPH_ZOOM)).toBeCloseTo(5);
  });

  it('changes continuously at the switch', () => {
    expect(glyphScale(GLYPH_ZOOM * 1.0001)).toBeCloseTo(1, 3);
  });
});
