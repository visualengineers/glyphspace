import { canAddGlyphAxis, canRemoveGlyphAxis, MAX_GLYPH_AXES, MIN_GLYPH_AXES } from './glyph-axes';

const axes = (count: number) => Array.from({ length: count }, (_, i) => `f${i}`);

describe('glyph axis limits', () => {
  it('adds a new feature below the maximum', () => {
    expect(canAddGlyphAxis(axes(MAX_GLYPH_AXES - 1), 'new')).toBe(true);
  });

  it('adds nothing at the maximum', () => {
    expect(canAddGlyphAxis(axes(MAX_GLYPH_AXES), 'new')).toBe(false);
  });

  it('does not add a feature that already is an axis', () => {
    expect(canAddGlyphAxis(axes(4), 'f1')).toBe(false);
  });

  it('removes an axis above the minimum', () => {
    expect(canRemoveGlyphAxis(axes(MIN_GLYPH_AXES + 1), 'f0')).toBe(true);
  });

  it('keeps the minimum number of axes', () => {
    expect(canRemoveGlyphAxis(axes(MIN_GLYPH_AXES), 'f0')).toBe(false);
  });

  it('cannot remove a feature that is no axis', () => {
    expect(canRemoveGlyphAxis(axes(5), 'other')).toBe(false);
  });

  it('can still remove axes from a glyph with more than the maximum', () => {
    // Datasets from the wizard may bring more axes than the sidebar allows to add.
    expect(canRemoveGlyphAxis(axes(MAX_GLYPH_AXES + 2), 'f0')).toBe(true);
  });
});
