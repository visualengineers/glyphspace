/** A glyph needs three axes to enclose an area. */
export const MIN_GLYPH_AXES = 3;
/** More than eight axes are hard to tell apart in a star or flower glyph. */
export const MAX_GLYPH_AXES = 8;

/** Whether `featureId` can become a new axis of the glyph with the given axes. */
export function canAddGlyphAxis(axes: readonly string[], featureId: string): boolean {
  return !axes.includes(featureId) && axes.length < MAX_GLYPH_AXES;
}

/** Whether the axis `featureId` can be taken out of the glyph with the given axes. */
export function canRemoveGlyphAxis(axes: readonly string[], featureId: string): boolean {
  return axes.includes(featureId) && axes.length > MIN_GLYPH_AXES;
}
