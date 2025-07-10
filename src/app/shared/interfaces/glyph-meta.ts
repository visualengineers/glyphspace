export type Histogram = {
  [binIndex: string]: number; // binIndex: "0" to "49"
};

export type FeatureStats = {
  histogram: Histogram;
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
