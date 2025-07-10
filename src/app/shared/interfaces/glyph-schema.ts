export interface GlyphSchema {
  color: string;
  glyph: string[];
  label: Record<string, string>;
  tooltip: string[];
  variantcontext: Record<string, {
    description: string;
    id: string;
  }>;
}