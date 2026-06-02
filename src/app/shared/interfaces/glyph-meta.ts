import { Histogram } from '../types/histogram.types';

// Re-export Histogram from shared types for backward compatibility
export type { Histogram } from '../types/histogram.types';

export interface FeatureStats {
  type: string; // "categorical" | "numeric"
  histogram: Histogram;
  categories?: string[]; // add optional categorical values for this feature
  max: number;
  min: number;
  originalMin?: number; // Pre-scaling min for human-readable tooltips
  originalMax?: number; // Pre-scaling max for human-readable tooltips
  median: number;
  variance: number;
  deviation: number;
}

export type FeaturesData = Record<string, FeatureStats>;

export interface GlyphMeta {
  features: FeaturesData;
}
