/**
 * Shared histogram types used across the application.
 * This is the canonical source for histogram-related type definitions.
 */

/**
 * Histogram data structure - maps bin indices to counts.
 * Used by both the menubar histogram and wizard histogram components.
 */
export type Histogram = Record<string, number>;

/**
 * Processed bin data for rendering stacked/bar histograms.
 */
export interface StackedBin {
  bin: number;
  value: number;
  x0: number;
  x1: number;
  label?: string; // Optional label for categorical data
}
