/**
 * Geometry for the Glyphs & Color step's live SVG preview. Each selected feature
 * becomes one axis; its length is a stable pseudo-value derived from the feature
 * name, so the preview reflects count and order of the features, not real data.
 * The shapes come from the shared glyph geometry, so they match the canvas.
 */

import { axisAngle, axisPoint, flowerPetalSvgPath, polygonSvgPath, starPoints } from '../../../glyph/glyph-geometry';

export const PREVIEW_RADIUS = 90;
export const PREVIEW_CENTER = 120;

/** Rays below this count do not form a glyph, so nothing is drawn. */
const MIN_RAYS = 3;
const LABEL_OFFSET = 14;

/** Longer axis names are shortened so labels stay inside the preview panel. */
export const MAX_AXIS_LABEL_CHARS = 14;

export interface PreviewPoint {
  x: number;
  y: number;
}

export interface PreviewLabel extends PreviewPoint {
  /** Full feature name (shown as the SVG title). */
  name: string;
  /** Name as drawn, shortened to MAX_AXIS_LABEL_CHARS. */
  text: string;
  anchor: 'start' | 'middle' | 'end';
}

export function axisLabelText(name: string): string {
  return name.length > MAX_AXIS_LABEL_CHARS ? `${name.slice(0, MAX_AXIS_LABEL_CHARS - 1)}…` : name;
}

export interface GlyphPreview {
  starPath: string;
  /** SVG path data of each flower petal, in preview coordinates. */
  petalPaths: string[];
  axes: PreviewPoint[];
  labels: PreviewLabel[];
}

const EMPTY_PREVIEW: GlyphPreview = { starPath: '', petalPaths: [], axes: [], labels: [] };

/** All shapes of the preview for the given ordered feature list. */
export function buildGlyphPreview(features: readonly string[]): GlyphPreview {
  if (features.length < MIN_RAYS) {
    return EMPTY_PREVIEW;
  }
  const values = features.map(previewValue);
  return {
    starPath: polygonSvgPath(starPoints(values, PREVIEW_RADIUS), PREVIEW_CENTER, PREVIEW_CENTER),
    petalPaths: values.map((value, i) =>
      flowerPetalSvgPath(PREVIEW_RADIUS * value, axisAngle(i, values.length), PREVIEW_CENTER, PREVIEW_CENTER)
    ),
    axes: features.map((_, i) => pointAt(i, features.length, PREVIEW_RADIUS)),
    labels: features.map((name, i) => label(name, i, features.length)),
  };
}

/** Stable pseudo-value in [0.3, 1.0) for a feature name. */
function previewValue(feature: string): number {
  return 0.3 + (simpleHash(feature) % 70) / 100;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Point on axis `index` in SVG coordinates (y down). */
function pointAt(index: number, count: number, radius: number): PreviewPoint {
  const [x, y] = axisPoint(index, count, radius);
  return { x: PREVIEW_CENTER + x, y: PREVIEW_CENTER - y };
}

/**
 * Axis label just outside the circle. Long names (e.g. one-hot columns such as
 * neighbourhood_group_Manhattan) are shortened; the full name stays available
 * as the SVG title and in the preview's accessible name.
 */
function label(name: string, index: number, count: number): PreviewLabel {
  const { x, y } = pointAt(index, count, PREVIEW_RADIUS + LABEL_OFFSET);
  const cos = Math.cos(axisAngle(index, count));
  const anchor = cos > 0.1 ? 'start' : cos < -0.1 ? 'end' : 'middle';
  return { x, y, name, text: axisLabelText(name), anchor };
}
