import { curveBasis, line } from 'd3';

/**
 * Glyph geometry shared by everything that draws a glyph: the three.js
 * renderers, the sidebar legend and filter icons, and the wizard preview.
 *
 * Points use a math frame: origin at the glyph center, x to the right, y up.
 * Targets whose y axis points down (SVG, canvas 2D) flip y.
 */

export type GlyphPoint = readonly [x: number, y: number];

/**
 * Direction of axis `index` of `count` axes, in radians counter-clockwise from
 * the x axis. Axis 0 points up and the others follow clockwise, like a clock
 * face, so the legend numbers them in reading order.
 */
export function axisAngle(index: number, count: number): number {
  return Math.PI / 2 - (index / count) * 2 * Math.PI;
}

export function axisPoint(index: number, count: number, radius: number): GlyphPoint {
  const angle = axisAngle(index, count);
  return [Math.cos(angle) * radius, Math.sin(angle) * radius];
}

/**
 * Length of an axis as a fraction of the glyph radius: the value itself on a
 * linear scale, otherwise relative to the feature's maximum.
 */
export function axisLength(value: number, featureMax: number | undefined, linearScale: boolean): number {
  return linearScale ? value : value / (featureMax || 1);
}

/** Corners of a star (radar) glyph: one per axis, `values` being fractions of `radius`. */
export function starPoints(values: readonly number[], radius: number): GlyphPoint[] {
  return values.map((value, i) => axisPoint(i, values.length, radius * value));
}

/*
 * Flower petal after the Glyphboard flower glyph (visualengineers/glyphboard,
 * src/app/glyph/glyph.flower.ts): a B-spline (d3.curveBasis) through seven
 * control points along the axis. The petal starts narrow at the center and
 * ends in a round tip; it is 23 % as wide as it is long.
 * Control points as [along the axis, across it], in units of the petal length.
 */
const PETAL_WIDTH = 0.23;
const PETAL_OUTLINE: readonly GlyphPoint[] = [
  [0, 0],
  [10 / 19, 0.2 * PETAL_WIDTH],
  [0.89, PETAL_WIDTH],
  [1.03, 0],
  [0.89, -PETAL_WIDTH],
  [10 / 19, -0.2 * PETAL_WIDTH],
  [0, 0],
];

/** Control points of the petal on the axis at `angle`; `length` is the value's distance from the center. */
export function flowerPetalControlPoints(length: number, angle: number): GlyphPoint[] {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return PETAL_OUTLINE.map(([along, across]) => [
    (along * cos - across * sin) * length,
    (along * sin + across * cos) * length,
  ]);
}

/** A target a path can be traced into: CanvasRenderingContext2D, Path2D or THREE.Shape. */
export interface PathSink {
  moveTo(x: number, y: number): unknown;
  lineTo(x: number, y: number): unknown;
  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): unknown;
  closePath(): unknown;
}

const petalCurve = line<GlyphPoint>()
  .x(p => p[0])
  .y(p => p[1])
  .curve(curveBasis);

/** Trace the petal outline into `sink`, in the math frame. */
export function traceFlowerPetal(sink: PathSink, length: number, angle: number): void {
  // d3 only calls moveTo/lineTo/bezierCurveTo/closePath, which every PathSink has.
  petalCurve.context(sink as unknown as CanvasRenderingContext2D)(flowerPetalControlPoints(length, angle));
  petalCurve.context(null);
}

/** SVG path data of the petal around (cx, cy); SVG's y axis points down. */
export function flowerPetalSvgPath(length: number, angle: number, cx = 0, cy = 0): string {
  return petalCurve(toSvg(flowerPetalControlPoints(length, angle), cx, cy)) ?? '';
}

/** SVG path data of a closed polygon around (cx, cy). */
export function polygonSvgPath(points: readonly GlyphPoint[], cx = 0, cy = 0): string {
  if (points.length === 0) return '';
  return `M${toSvg(points, cx, cy)
    .map(([x, y]) => `${round(x)},${round(y)}`)
    .join('L')}Z`;
}

/** SVG path data of the spokes from (cx, cy) to `radius`, one per axis. */
export function axesSvgPath(count: number, radius: number, cx = 0, cy = 0): string {
  return Array.from({ length: count }, (_, i) => {
    const [x, y] = axisPoint(i, count, radius);
    return `M${round(cx)},${round(cy)}L${round(cx + x)},${round(cy - y)}`;
  }).join('');
}

function toSvg(points: readonly GlyphPoint[], cx: number, cy: number): GlyphPoint[] {
  return points.map(([x, y]) => [cx + x, cy - y]);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
