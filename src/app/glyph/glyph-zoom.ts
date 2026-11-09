/** Camera zoom where points turn into glyphs (ZoomLevel.medium). */
export const GLYPH_ZOOM = 2;
/** Camera zoom from which glyphs are drawn in full detail (ZoomLevel.high). */
export const FULL_DETAIL_ZOOM = 10;

/**
 * Beyond GLYPH_ZOOM a glyph's size on screen grows with zoom^GLYPH_ZOOM_GROWTH,
 * while the distances between items grow with the zoom itself. So zooming in
 * separates overlapping glyphs instead of only magnifying them.
 */
export const GLYPH_ZOOM_GROWTH = 0.5;

/**
 * Scale of the glyph meshes at a camera zoom: 1 up to GLYPH_ZOOM (where the
 * item size is matched to the points), smaller beyond it.
 */
export function glyphScale(zoom: number): number {
  return zoom <= GLYPH_ZOOM ? 1 : Math.pow(GLYPH_ZOOM / zoom, 1 - GLYPH_ZOOM_GROWTH);
}
