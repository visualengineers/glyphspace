import {
  axisLabelText,
  buildGlyphPreview,
  MAX_AXIS_LABEL_CHARS,
  PREVIEW_CENTER,
  PREVIEW_RADIUS,
} from './glyph-preview-geometry';

describe('axisLabelText', () => {
  it('keeps short feature names unchanged', () => {
    expect(axisLabelText('alcohol')).toBe('alcohol');
    expect(axisLabelText('x'.repeat(MAX_AXIS_LABEL_CHARS))).toBe('x'.repeat(MAX_AXIS_LABEL_CHARS));
  });

  it('shortens long names with an ellipsis so they stay inside the preview panel', () => {
    const text = axisLabelText('neighbourhood_group_Manhattan');

    expect(text.length).toBe(MAX_AXIS_LABEL_CHARS);
    expect(text.endsWith('…')).toBe(true);
    expect(text.startsWith('neighbourhood')).toBe(true);
  });
});

describe('buildGlyphPreview', () => {
  it('draws nothing below three features', () => {
    expect(buildGlyphPreview(['a', 'b']).petalPaths).toEqual([]);
  });

  it('starts at the top like the canvas glyphs and has one petal per feature', () => {
    const preview = buildGlyphPreview(['a', 'b', 'c', 'd']);

    expect(preview.axes[0].x).toBeCloseTo(PREVIEW_CENTER);
    expect(preview.axes[0].y).toBeCloseTo(PREVIEW_CENTER - PREVIEW_RADIUS);
    expect(preview.axes[1].x).toBeCloseTo(PREVIEW_CENTER + PREVIEW_RADIUS);
    expect(preview.petalPaths.length).toBe(4);
    expect(preview.petalPaths.every(path => path.startsWith(`M${PREVIEW_CENTER},${PREVIEW_CENTER}`))).toBe(true);
    expect(preview.starPath.endsWith('Z')).toBe(true);
  });
});
