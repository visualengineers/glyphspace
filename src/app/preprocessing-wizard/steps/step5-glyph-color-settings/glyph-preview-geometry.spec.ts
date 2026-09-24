import { axisLabelText, MAX_AXIS_LABEL_CHARS } from './glyph-preview-geometry';

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
