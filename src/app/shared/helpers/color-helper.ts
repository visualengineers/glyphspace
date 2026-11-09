import { ColorScale, paletteColor } from '../interfaces/color-scale';

/**
 * Normalize a feature value for color mapping.
 * Categorical features are divided by their max value to map into [0,1].
 */
export function normalizeFeatureValue(
  value: number,
  featureId: string,
  featureTypes: Record<string, string>,
  featureMaxValues: Record<string, number>
): number {
  if (featureTypes[featureId] === 'categorical') {
    const maxValue = featureMaxValues[featureId];
    if (maxValue !== undefined && maxValue > 0) {
      return value / maxValue;
    }
  }
  return value;
}

/** What the color of a feature value depends on besides the color scale. */
export interface FeatureColorInfo {
  featureTypes: Record<string, string>;
  featureMaxValues: Record<string, number>;
  /** Number of categories of each feature that has categories (label-encoded codes). */
  featureCategoryCounts: Record<string, number>;
}

/**
 * Index of the category of a glyph value. Glyph values are min-max normalized,
 * so the label-encoded codes 0..count-1 arrive as code / (count - 1).
 */
export function categoryIndex(value: number, categoryCount: number): number {
  if (categoryCount <= 1) return 0;
  const clamped = Math.min(1, Math.max(0, value));
  return Math.round(clamped * (categoryCount - 1));
}

/**
 * Color of a glyph's value of the color feature. Under a categorical palette
 * a feature with categories takes the palette colors in category order, so a
 * few categories get the first (most distinct) colors. Every other value is
 * normalized to [0,1] and mapped through the scale.
 */
export function featureColor(scale: ColorScale, value: number, featureId: string, info: FeatureColorInfo): string {
  const categoryCount = info.featureCategoryCounts[featureId] ?? 0;
  if (scale.type === 'categorical' && categoryCount > 0) {
    return paletteColor(scale, categoryIndex(value, categoryCount));
  }
  return scale.scale(normalizeFeatureValue(value, featureId, info.featureTypes, info.featureMaxValues));
}
