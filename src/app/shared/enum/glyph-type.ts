export enum GlyphType {
  None,
  Star,
  Flower,
  Whisker,
  Dot,
  Thumb,
}

const GLYPH_TYPE_NAMES: Record<GlyphType, string> = {
  [GlyphType.None]: 'None',
  [GlyphType.Star]: 'Star',
  [GlyphType.Flower]: 'Flower',
  [GlyphType.Whisker]: 'Whisker',
  [GlyphType.Dot]: 'Dot',
  [GlyphType.Thumb]: 'Thumbnail',
};

export function getGlyphTypeName(type: GlyphType): string {
  return GLYPH_TYPE_NAMES[type] ?? 'Unknown';
}
