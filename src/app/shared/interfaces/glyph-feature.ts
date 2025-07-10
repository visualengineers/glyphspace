// A dictionary where keys are numeric strings and values are strings
export type NumericStringMap = { [key: string]: number };
export type StringStringMap = { [key: string]: string };

// The structure for the "features" property
export interface Features {
    [contextId: string]: NumericStringMap;
}

// The main item structure
export interface GlyphFeature {
    defaultcontext: string;
    id: string;
    features: Features;
    values: StringStringMap;
}