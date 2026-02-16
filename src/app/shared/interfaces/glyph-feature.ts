// A dictionary where keys are numeric strings and values are strings
export type NumericStringMap = Record<string, number>;
export type StringStringMap = Record<string, string>;

// The structure for the "features" property
export type Features = Record<string, NumericStringMap>;

// The main item structure
export interface GlyphFeature {
  defaultcontext: string;
  id: string | number; // Support both string and numeric IDs
  features: Features;
  values: StringStringMap;
}
