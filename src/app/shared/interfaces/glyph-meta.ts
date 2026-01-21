import { Histogram } from '../types/histogram.types';

// Re-export Histogram from shared types for backward compatibility
export type { Histogram } from '../types/histogram.types';

export type FeatureStats = {
  type: string; // "categorical" | "numeric"
  histogram: Histogram;
  categories?: string[]; // add optional categorical values for this feature
  max: number;
  min: number;
  median: number;
  variance: number;
  deviation: number;
};

export type FeaturesData = {
  [featureId: string]: FeatureStats; // featureId: "1", "2", "3", ...
};

export type GlyphMeta = {
  features: FeaturesData;
};
