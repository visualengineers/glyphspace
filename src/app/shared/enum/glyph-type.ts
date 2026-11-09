export enum GlyphType {
  Star,
  Flower,
  /** Thumbnail image per item, shown as "Image". */
  Thumb,
}

const GLYPH_TYPE_NAMES: Record<GlyphType, string> = {
  [GlyphType.Star]: 'Star',
  [GlyphType.Flower]: 'Flower',
  [GlyphType.Thumb]: 'Image',
};

export function getGlyphTypeName(type: GlyphType): string {
  return GLYPH_TYPE_NAMES[type] ?? 'Unknown';
}

/** Glyph types whose shape has one axis per feature (all but image thumbnails). */
export function hasFeatureAxes(type: GlyphType): boolean {
  return type === GlyphType.Star || type === GlyphType.Flower;
}
