/**
 * Shared histogram utility functions.
 * Used by both the menubar histogram and wizard histogram components.
 */

import { StackedBin, Histogram } from '../types/histogram.types';

/**
 * Configuration for preparing stacked bins.
 */
export interface StackedBinConfig {
  gap?: number;
  minWidth?: number;
  availableWidth: number;
}

/**
 * Determine the effective rendering type based on declared type and data characteristics.
 * If categorical type has too many bins, fall back to numeric histogram.
 *
 * @param declaredType - The declared data type ('categorical', 'numeric', etc.)
 * @param nonZeroBinCount - Number of bins with non-zero values
 * @param maxCategoricalBins - Maximum bins before falling back to numeric (default: 40)
 * @returns 'categorical' or 'numeric'
 */
export function getEffectiveHistogramType(
  declaredType: string | undefined,
  nonZeroBinCount: number,
  maxCategoricalBins = 40
): 'categorical' | 'numeric' {
  // If declared as categorical/text but has too many non-zero bins, render as numeric histogram
  if ((declaredType === 'categorical' || declaredType === 'text') && nonZeroBinCount > maxCategoricalBins) {
    return 'numeric';
  }

  // If no type specified, infer from non-zero bin count
  if (!declaredType || declaredType === 'unknown') {
    return nonZeroBinCount <= 10 ? 'categorical' : 'numeric';
  }

  // Categorical types
  if (declaredType === 'categorical' || declaredType === 'boolean' || declaredType === 'text') {
    return 'categorical';
  }

  return 'numeric';
}

/**
 * Prepare stacked bins from histogram data (object format: {binIndex: count}).
 * Calculates x0/x1 positions for each bin based on proportional widths.
 *
 * @param histogramData - Histogram data in object format
 * @param config - Configuration for bin preparation
 * @returns Array of stacked bins with positions
 */
export function prepareStackedBinsFromObject(histogramData: Histogram, config: StackedBinConfig): StackedBin[] {
  const { gap = 1, minWidth = 6, availableWidth } = config;

  // Filter non-zero bins and sort
  const rawBins = Object.keys(histogramData)
    .map(k => ({ bin: +k, value: histogramData[k] }))
    .filter(d => d.value > 0)
    .sort((a, b) => a.bin - b.bin);

  return calculateStackedBinPositions(rawBins, availableWidth, gap, minWidth);
}

/**
 * Prepare stacked bins from histogram data (array format: counts[]).
 * Calculates x0/x1 positions for each bin based on proportional widths.
 *
 * @param counts - Array of bin counts
 * @param labels - Optional array of bin labels
 * @param config - Configuration for bin preparation
 * @returns Array of stacked bins with positions
 */
export function prepareStackedBinsFromArray(
  counts: number[],
  labels: string[] | undefined,
  config: StackedBinConfig
): StackedBin[] {
  const { gap = 1, minWidth = 3, availableWidth } = config;

  // Filter non-zero bins and sort
  const rawBins = counts
    .map((value, index) => ({
      bin: index,
      value,
      label: labels && labels[index] ? labels[index] : `Bin ${index}`,
    }))
    .filter(d => d.value > 0)
    .sort((a, b) => a.bin - b.bin);

  return calculateStackedBinPositions(rawBins, availableWidth, gap, minWidth);
}

/**
 * Calculate x0/x1 positions for stacked bins based on proportional widths.
 *
 * @param rawBins - Array of raw bins with bin index and value
 * @param availableWidth - Total available width
 * @param gap - Gap between bins
 * @param minWidth - Minimum width for each bin
 * @returns Array of stacked bins with x0/x1 positions
 */
function calculateStackedBinPositions<T extends { bin: number; value: number }>(
  rawBins: T[],
  availableWidth: number,
  gap: number,
  minWidth: number
): (T & { x0: number; x1: number })[] {
  const nBars = rawBins.length;
  if (nBars === 0) return [];

  const totalValue = rawBins.reduce((sum, d) => sum + d.value, 0);
  const totalGapWidth = gap * (nBars - 1);
  const effectiveWidth = availableWidth - totalGapWidth;

  // First pass: proportional widths
  let widths = rawBins.map(d => Math.max((d.value / totalValue) * effectiveWidth, minWidth));

  // Adjust widths if sum exceeds availableWidth
  const totalWidth = widths.reduce((sum, w) => sum + w, 0);
  if (totalWidth > effectiveWidth) {
    const scaleDown = effectiveWidth / totalWidth;
    widths = widths.map(w => w * scaleDown);
  }

  // Build x0/x1 cumulatively
  let cursor = 0;
  return rawBins.map((d, i) => {
    const x0 = cursor;
    const x1 = x0 + widths[i];
    cursor = x1 + gap;
    return {
      ...d,
      x0,
      x1,
    };
  });
}

/**
 * Rebin histogram data to a target number of bins.
 * Useful for reducing the number of bins in numeric histograms.
 *
 * @param originalCounts - Original array of bin counts
 * @param targetBins - Target number of bins
 * @returns Rebinned counts array
 */
export function rebinHistogramData(originalCounts: number[], targetBins: number): number[] {
  const originalBins = originalCounts.length;
  if (originalBins <= targetBins) {
    return originalCounts;
  }

  const newCounts: number[] = new Array(targetBins).fill(0);
  const binSize = originalBins / targetBins;

  for (let i = 0; i < originalBins; i++) {
    const targetBin = Math.floor(i / binSize);
    if (targetBin < targetBins) {
      newCounts[targetBin] += originalCounts[i];
    }
  }

  return newCounts;
}

// Epoch range heuristic: 1970-01-01 to 2100-01-01 in seconds
const EPOCH_MIN = 0;
const EPOCH_MAX = 4_102_444_800;

function isEpochSeconds(value: number): boolean {
  return value > EPOCH_MIN && value < EPOCH_MAX;
}

function formatEpochDate(epochSeconds: number): string {
  const date = new Date(epochSeconds * 1000);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function formatCompact(value: number): string {
  if (Number.isInteger(value) && Math.abs(value) < 10_000) {
    return value.toString();
  }
  if (Math.abs(value) >= 1000) {
    return value.toLocaleString('en-US', { maximumFractionDigits: 1 });
  }
  return value.toFixed(2);
}

/**
 * Format a numeric histogram bin tooltip from feature min/max.
 * Computes evenly-spaced bin edges and formats based on data type.
 *
 * @param bin - Bin index
 * @param totalBins - Total number of bins
 * @param featureMin - Minimum feature value
 * @param featureMax - Maximum feature value
 * @param dataType - Data type string (e.g. 'numeric', 'date', 'coordinate')
 * @returns Formatted tooltip string showing the bin's value range
 */
export function formatBinTooltip(
  bin: number,
  totalBins: number,
  featureMin: number,
  featureMax: number,
  dataType?: string
): string {
  const binWidth = (featureMax - featureMin) / totalBins;
  const start = featureMin + bin * binWidth;
  const end = featureMin + (bin + 1) * binWidth;

  if (dataType === 'date' && isEpochSeconds(start)) {
    return `${formatEpochDate(start)} – ${formatEpochDate(end)}`;
  }

  return `${formatCompact(start)} – ${formatCompact(end)}`;
}

/**
 * Darken a hex color by a specified amount.
 *
 * @param color - Hex color string (e.g., '#2196F3')
 * @param amount - Amount to darken (0-1, default: 0.3)
 * @returns Darkened hex color string
 */
export function darkenColor(color: string, amount = 0.3): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const newR = Math.floor(r * (1 - amount));
  const newG = Math.floor(g * (1 - amount));
  const newB = Math.floor(b * (1 - amount));

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}
