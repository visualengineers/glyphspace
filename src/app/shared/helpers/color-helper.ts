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
