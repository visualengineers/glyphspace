import { CENTER_X, CENTER_Y, PREVIEW_HEIGHT, PREVIEW_WIDTH } from './preview-geometry';
import { hexToRgb, lerp, rgba, smoothstep } from './preview-math';
import { ClusterPoint, CloudPoint, CurvePoint, FrameState, Rgb, Vec2 } from './preview-types';

/** Highlight colour of the animations (axes, pivots, neighbourhoods). */
export const ACCENT: Rgb = hexToRgb('#00bcd4');
/** Colour of not-yet-grouped points and neutral helper lines. */
export const NEUTRAL: Rgb = hexToRgb('#9aa9b6');
/** Cluster colours, indexed by `ClusterPoint.g`. */
export const GROUP_COLORS: readonly Rgb[] = ['#00bcd4', '#ff7043', '#7e57c2'].map(hexToRgb);

/** Full circle as used by the original template (slightly less than 2*PI). */
export const TAU = 6.283;

// ---------- static background ----------

const gridLayers = new Map<number, HTMLCanvasElement>();

/**
 * The dotted background grid, rendered once per device-pixel ratio into an
 * offscreen canvas and blitted every frame (instead of ~110 fillRect calls).
 */
export function gridLayer(dpr: number): HTMLCanvasElement {
  const cached = gridLayers.get(dpr);
  if (cached) return cached;
  const layer = document.createElement('canvas');
  layer.width = PREVIEW_WIDTH * dpr;
  layer.height = PREVIEW_HEIGHT * dpr;
  const ctx = layer.getContext('2d');
  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = 'rgba(120,140,160,0.06)';
    for (let gx = 16; gx < PREVIEW_WIDTH; gx += 24) {
      for (let gy = 18; gy < PREVIEW_HEIGHT; gy += 24) ctx.fillRect(gx, gy, 1.4, 1.4);
    }
  }
  gridLayers.set(dpr, layer);
  return layer;
}

// ---------- shapes ----------

export function drawPoint(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, r = 3.4): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 0.8;
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.stroke();
}

export function drawArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ang: number,
  size: number,
  color: string
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size, -size * 0.55);
  ctx.lineTo(-size, size * 0.55);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** Double-headed axis through the canvas centre. */
export function drawAxis(ctx: CanvasRenderingContext2D, angle: number, alpha: number): void {
  const len = 150;
  const ex = Math.cos(angle);
  const ey = Math.sin(angle);
  ctx.save();
  ctx.strokeStyle = rgba(ACCENT, 0.9 * alpha);
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(CENTER_X - ex * len, CENTER_Y - ey * len);
  ctx.lineTo(CENTER_X + ex * len, CENTER_Y + ey * len);
  ctx.stroke();
  const col = rgba(ACCENT, 0.9 * alpha);
  drawArrow(ctx, CENTER_X + ex * len, CENTER_Y + ey * len, angle, 7, col);
  drawArrow(ctx, CENTER_X - ex * len, CENTER_Y - ey * len, angle + Math.PI, 7, col);
  ctx.restore();
}

export function drawLine(
  ctx: CanvasRenderingContext2D,
  a: Vec2,
  b: Vec2,
  style: string,
  w = 1,
  dash?: readonly number[]
): void {
  ctx.save();
  if (dash) ctx.setLineDash(dash);
  ctx.strokeStyle = style;
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.restore();
}

/** Stroked circle, used to highlight a point. */
export function drawRing(ctx: CanvasRenderingContext2D, p: Vec2, r: number, style: string, lineWidth: number): void {
  ctx.save();
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, TAU);
  ctx.strokeStyle = style;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
  ctx.restore();
}

// ---------- layouts ----------

/** Reads one of a point's layouts (e.g. base or projected position). */
export interface Layout<T> {
  x(p: T): number;
  y(p: T): number;
}

export const BASE: Layout<{ bx: number; by: number }> = { x: p => p.bx, y: p => p.by };
export const PROJECTED: Layout<CloudPoint> = { x: p => p.px, y: p => p.py };
export const UNROLLED: Layout<CurvePoint> = { x: p => p.ux, y: p => p.uy };
export const CLUSTERED: Layout<ClusterPoint> = { x: p => p.cx, y: p => p.cy };
export const SCATTERED: Layout<ClusterPoint> = { x: p => p.sx, y: p => p.sy };

/** Writes `from -> to` interpolated positions into the reusable `pos` buffer. */
export function lerpInto<T>(pos: Vec2[], pts: readonly T[], from: Layout<T>, to: Layout<T>, t: number): void {
  for (let i = 0; i < pts.length; i++) {
    pos[i].x = lerp(from.x(pts[i]), to.x(pts[i]), t);
    pos[i].y = lerp(from.y(pts[i]), to.y(pts[i]), t);
  }
}

export function copyInto<T>(pos: Vec2[], pts: readonly T[], layout: Layout<T>): void {
  for (let i = 0; i < pts.length; i++) {
    pos[i].x = layout.x(pts[i]);
    pos[i].y = layout.y(pts[i]);
  }
}

/**
 * The common "start layout -> end layout" timeline shared by most methods:
 * phase 0 springs back from the end to the start layout, phases before
 * `morphPhase` hold the start, `morphPhase` morphs to the end, later phases
 * hold the end. Returns how far the points are towards the end (0..1).
 */
export function morphPositions<T>(
  pos: Vec2[],
  pts: readonly T[],
  start: Layout<T>,
  end: Layout<T>,
  frame: FrameState,
  morphPhase: number
): number {
  const { idx, local } = frame;
  if (idx === 0) {
    const re = smoothstep(local / 0.55);
    lerpInto(pos, pts, end, start, re);
    return 1 - re;
  }
  if (idx < morphPhase) {
    copyInto(pos, pts, start);
    return 0;
  }
  if (idx === morphPhase) {
    const t = smoothstep(local);
    lerpInto(pos, pts, start, end, t);
    return t;
  }
  copyInto(pos, pts, end);
  return 1;
}

/** Draws every point at its buffered position with the given colour. */
export function drawPoints(ctx: CanvasRenderingContext2D, pos: readonly Vec2[], color: (i: number) => string): void {
  for (let i = 0; i < pos.length; i++) drawPoint(ctx, pos[i].x, pos[i].y, color(i));
}
