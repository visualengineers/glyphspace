import { rgba, smoothstep } from './preview-math';
import {
  ACCENT,
  BASE,
  NEUTRAL,
  TAU,
  UNROLLED,
  drawLine,
  drawPoints,
  drawRing,
  morphPositions,
} from './preview-primitives';
import { FrameState, IsoEngine, LleEngine, LtsaEngine, Vec2 } from './preview-types';

// Draw routines of the manifold learners that unroll a curved 1-D manifold:
// IsoMap, LLE and LTSA.

const SHORTCUT_DASH = [4, 4];

/** Chain of neighbour links along the curve. */
function drawChain(ctx: CanvasRenderingContext2D, pos: readonly Vec2[], upTo: number, style: string, w: number): void {
  for (let i = 0; i < upTo; i++) drawLine(ctx, pos[i], pos[i + 1], style, w);
}

/** Geodesic path growing along the curve next to the straight shortcut. */
function drawGeodesic(ctx: CanvasRenderingContext2D, pos: readonly Vec2[], local: number): void {
  const n = pos.length;
  drawChain(ctx, pos, n - 1, rgba(NEUTRAL, 0.3), 1);
  drawLine(ctx, pos[0], pos[n - 1], 'rgba(120,134,148,0.5)', 1, SHORTCUT_DASH);
  const m = Math.floor(smoothstep(local) * (n - 1));
  ctx.save();
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.strokeStyle = rgba(ACCENT, 0.9);
  ctx.beginPath();
  ctx.moveTo(pos[0].x, pos[0].y);
  for (let i = 1; i <= m; i++) ctx.lineTo(pos[i].x, pos[i].y);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(pos[m].x, pos[m].y, 6, 0, TAU);
  ctx.fillStyle = rgba(ACCENT, 0.9);
  ctx.fill();
  ctx.restore();
}

export function drawIso(ctx: CanvasRenderingContext2D, e: IsoEngine, f: FrameState): void {
  morphPositions(e.pos, e.pts, BASE, UNROLLED, f, 3);
  const pos = e.pos;
  const n = pos.length;
  if (f.idx === 1) drawChain(ctx, pos, Math.floor(smoothstep(f.local) * (n - 1)), rgba(NEUTRAL, 0.45), 1.1);
  if (f.idx === 2) drawGeodesic(ctx, pos, f.local);
  if (f.idx >= 3) drawChain(ctx, pos, n - 1, rgba(NEUTRAL, f.idx === 3 ? 0.3 : 0.18), 1);
  drawPoints(ctx, pos, i => e.pts[i].color);
}

/** Links from sample points to their neighbours (the reconstruction weights). */
function drawNeighbourWebs(ctx: CanvasRenderingContext2D, e: LleEngine, webA: number): void {
  const pos = e.pos;
  const n = pos.length;
  const lineStyle = rgba(ACCENT, 0.5 * webA);
  const ringStyle = rgba(ACCENT, 0.65 * webA);
  for (const s of e.samples) {
    for (let dj = -2; dj <= 2; dj++) {
      const j = s + dj;
      if (dj === 0 || j < 0 || j >= n) continue;
      drawLine(ctx, pos[s], pos[j], lineStyle, 1.2);
    }
    drawRing(ctx, pos[s], 8, ringStyle, 1.4);
  }
}

export function drawLle(ctx: CanvasRenderingContext2D, e: LleEngine, f: FrameState): void {
  morphPositions(e.pos, e.pts, BASE, UNROLLED, f, 2);
  const { idx, local } = f;
  const webA = idx === 0 ? 0 : idx === 1 ? smoothstep(local) : idx === 2 ? 0.8 : 0.5 * (1 - smoothstep(local));
  if (webA > 0) drawNeighbourWebs(ctx, e, webA);
  drawPoints(ctx, e.pos, i => e.pts[i].color);
}

/** Short tangent strokes at the sample points. */
function drawTangents(ctx: CanvasRenderingContext2D, e: LtsaEngine, alpha: number, len: number): void {
  const pos = e.pos;
  const n = pos.length;
  ctx.save();
  ctx.lineCap = 'round';
  for (const s of e.samples) {
    const a = pos[Math.max(0, s - 1)];
    const b = pos[Math.min(n - 1, s + 1)];
    const ang = Math.atan2(b.y - a.y, b.x - a.x);
    const ex = Math.cos(ang) * len;
    const ey = Math.sin(ang) * len;
    ctx.strokeStyle = rgba(ACCENT, alpha);
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(pos[s].x - ex, pos[s].y - ey);
    ctx.lineTo(pos[s].x + ex, pos[s].y + ey);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawLtsa(ctx: CanvasRenderingContext2D, e: LtsaEngine, f: FrameState): void {
  morphPositions(e.pos, e.pts, BASE, UNROLLED, f, 2);
  const { idx, local } = f;
  const alpha = idx === 0 ? 0 : idx === 1 ? 0.85 : idx === 2 ? 0.75 : 0.4 * (1 - smoothstep(local));
  const len = idx === 1 ? 15 * smoothstep(local) : 15;
  if (alpha > 0 && len > 0.5) drawTangents(ctx, e, alpha, len);
  drawPoints(ctx, e.pos, i => e.pts[i].color);
}
