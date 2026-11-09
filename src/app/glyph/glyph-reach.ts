import type { GlyphObject } from './glyph-object';

/** Glyphs reaching less than this are drawn as if they reached this far, so they stay at most 4× a point. */
export const MIN_GLYPH_REACH = 0.25;

/** Items looked at; enough for a stable median. */
const SAMPLE_SIZE = 2000;

/**
 * How far a typical glyph reaches: the median, over the items, of the longest
 * axis as a fraction of the glyph radius, clamped to [MIN_GLYPH_REACH, 1].
 * A glyph drawn with radius r looks about as large as a point of radius
 * r × reach, which lets points and glyphs share one size setting.
 */
export function typicalGlyphReach(
  glyphs: readonly GlyphObject[],
  axes: readonly string[],
  featureMaxValues: Record<string, number>,
  linearScale: boolean
): number {
  if (glyphs.length === 0 || axes.length === 0) return 1;
  const step = Math.max(1, Math.floor(glyphs.length / SAMPLE_SIZE));
  const reaches: number[] = [];
  for (let i = 0; i < glyphs.length; i += step) {
    reaches.push(Math.max(...glyphs[i].axisLengths(axes, featureMaxValues, linearScale)));
  }
  reaches.sort((a, b) => a - b);
  const median = reaches[Math.floor((reaches.length - 1) / 2)];
  return Math.min(1, Math.max(MIN_GLYPH_REACH, median));
}
