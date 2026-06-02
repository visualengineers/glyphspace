export interface GlyphSchema {
  color: string;
  glyph: string[];
  label: Record<string, string>;
  tooltip: string[];
  colorRange?: boolean; // Optional: true = continuous (rangeColor), false = categorical (categoryColor)
  colorScaleId?: number; // Optional: specific color scale ID from COLOR_SCALES
  types: Record<string, string>; // Feature ID -> data type ('numeric', 'categorical', 'text', 'date', 'boolean')
  variantcontext: Record<
    string,
    {
      description: string;
      id: string;
    }
  >;
}
