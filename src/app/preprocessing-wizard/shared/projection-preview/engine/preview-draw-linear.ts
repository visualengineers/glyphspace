import { hexToRgb, lerp, rgba, smoothstep } from './preview-math';
import {
  ACCENT,
  BASE,
  NEUTRAL,
  PROJECTED,
  TAU,
  copyInto,
  drawArrow,
  drawAxis,
  drawLine,
  drawPoint,
  drawPoints,
  drawRing,
  lerpInto,
  morphPositions,
} from './preview-primitives';
import { CloudPoint, FastEngine, FrameState, MdsEngine, PcaEngine, SammonEngine } from './preview-types';

// Draw routines of the methods that move points along straight lines:
// PCA, FastMap, MDS and Sammon mapping.

const DROP_LINE = hexToRgb('#5a6672');
const FAR_DASH = [3, 4];

/** PCA / FastMap layout: expand in phase 0, hold, then project from phase 3 on. */
function projectionLayout(e: PcaEngine | FastEngine, idx: number, expandT: number, projT: number): void {
  if (idx === 0) lerpInto(e.pos, e.pts, PROJECTED, BASE, expandT);
  else if (idx <= 2) copyInto(e.pos, e.pts, BASE);
  else lerpInto(e.pos, e.pts, BASE, PROJECTED, projT);
}

/** Dashed lines from each point to its projection, fading in and out. */
function drawDropLines(ctx: CanvasRenderingContext2D, pts: readonly CloudPoint[], projT: number): void {
  ctx.save();
  ctx.setLineDash([2, 3]);
  ctx.lineWidth = 0.8;
  ctx.strokeStyle = rgba(DROP_LINE, 0.32 * Math.sin(projT * Math.PI));
  for (const p of pts) {
    ctx.beginPath();
    ctx.moveTo(p.bx, p.by);
    ctx.lineTo(p.px, p.py);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawPca(ctx: CanvasRenderingContext2D, e: PcaEngine, f: FrameState): void {
  const { idx, local } = f;
  let axisAlpha = 1;
  let angle = e.theta;
  let projT = 0;
  let expandT = 0;
  if (idx === 0) {
    axisAlpha = 0;
    expandT = smoothstep(local / 0.55);
  } else if (idx === 1) {
    angle = lerp(e.theta - 0.85, e.theta, smoothstep(local));
    axisAlpha = smoothstep(local / 0.3);
  } else if (idx === 3) {
    projT = smoothstep(local);
  } else if (idx > 3) {
    projT = 1;
  }
  projectionLayout(e, idx, expandT, projT);
  if (idx === 3) drawDropLines(ctx, e.pts, projT);
  if (axisAlpha > 0) drawAxis(ctx, angle, axisAlpha);
  drawPoints(ctx, e.pos, i => e.pts[i].color);
}

interface FastState {
  pivotA: number;
  axisT: number;
  projT: number;
  expandT: number;
}

function fastState(idx: number, local: number): FastState {
  if (idx === 0) return { pivotA: 0, axisT: 0, projT: 0, expandT: smoothstep(local / 0.55) };
  if (idx === 1) return { pivotA: smoothstep(local / 0.5), axisT: 0, projT: 0, expandT: 1 };
  if (idx === 2) return { pivotA: 1, axisT: smoothstep(local), projT: 0, expandT: 1 };
  if (idx === 3) return { pivotA: 1, axisT: 1, projT: smoothstep(local), expandT: 1 };
  return { pivotA: 0.6, axisT: 1, projT: 1, expandT: 1 };
}

/** The axis through both pivots, growing from their midpoint. */
function drawPivotAxis(ctx: CanvasRenderingContext2D, e: FastEngine, axisT: number): void {
  const P = e.pts[e.pi];
  const Q = e.pts[e.pj];
  const mx = (P.bx + Q.bx) / 2;
  const my = (P.by + Q.by) / 2;
  const ex = Math.cos(e.angle);
  const ey = Math.sin(e.angle);
  const half = (Math.hypot(Q.bx - P.bx, Q.by - P.by) / 2 + 16) * axisT;
  ctx.save();
  ctx.strokeStyle = rgba(ACCENT, 0.9);
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(mx - ex * half, my - ey * half);
  ctx.lineTo(mx + ex * half, my + ey * half);
  ctx.stroke();
  if (axisT > 0.95) {
    const col = rgba(ACCENT, 0.9);
    drawArrow(ctx, mx + ex * half, my + ey * half, e.angle, 7, col);
    drawArrow(ctx, mx - ex * half, my - ey * half, e.angle + Math.PI, 7, col);
  }
  ctx.restore();
}

/** Double rings around both pivots (pulsing while they are being picked). */
function drawPivots(ctx: CanvasRenderingContext2D, e: FastEngine, f: FrameState, s: FastState): void {
  const pulse = f.idx === 1 ? 1 + 0.18 * Math.sin(f.clock * 6) : 1;
  ctx.save();
  for (const pv of [e.pts[e.pi], e.pts[e.pj]]) {
    const x = f.idx >= 3 ? lerp(pv.bx, pv.px, s.projT) : pv.bx;
    const y = f.idx >= 3 ? lerp(pv.by, pv.py, s.projT) : pv.by;
    ctx.beginPath();
    ctx.arc(x, y, 9.5 * pulse, 0, TAU);
    ctx.strokeStyle = rgba(ACCENT, 0.85 * s.pivotA);
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 15 * pulse, 0, TAU);
    ctx.strokeStyle = rgba(ACCENT, 0.25 * s.pivotA);
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
  ctx.restore();
}

export function drawFast(ctx: CanvasRenderingContext2D, e: FastEngine, f: FrameState): void {
  const s = fastState(f.idx, f.local);
  projectionLayout(e, f.idx, s.expandT, s.projT);
  if (f.idx === 3) drawDropLines(ctx, e.pts, s.projT);
  if (s.axisT > 0) drawPivotAxis(ctx, e, s.axisT);
  if (s.pivotA > 0) drawPivots(ctx, e, f, s);
  for (let i = 0; i < e.pts.length; i++) {
    const big = (i === e.pi || i === e.pj) && s.pivotA > 0;
    drawPoint(ctx, e.pos[i].x, e.pos[i].y, e.pts[i].color, big ? 4.6 : 3.4);
  }
}

/** Lines from one anchor point to all others ("measure every distance"). */
function drawDistanceFan(ctx: CanvasRenderingContext2D, e: MdsEngine, local: number): void {
  const anchors = e.anchors;
  const pos = e.pos;
  const k = Math.min(anchors.length - 1, Math.floor(local * anchors.length));
  const fade = Math.sin(Math.min(1, local * anchors.length - k) * Math.PI);
  const a = anchors[k];
  ctx.save();
  ctx.lineWidth = 0.9;
  for (let j = 0; j < pos.length; j++) {
    if (j === a) continue;
    ctx.strokeStyle = rgba(ACCENT, 0.22 * fade);
    ctx.beginPath();
    ctx.moveTo(pos[a].x, pos[a].y);
    ctx.lineTo(pos[j].x, pos[j].y);
    ctx.stroke();
  }
  ctx.restore();
  drawRing(ctx, pos[a], 8, rgba(ACCENT, 0.85 * fade), 1.6);
}

export function drawMds(ctx: CanvasRenderingContext2D, e: MdsEngine, f: FrameState): void {
  morphPositions(e.pos, e.pts, BASE, PROJECTED, f, 2);
  if (f.idx === 1) drawDistanceFan(ctx, e, f.local);
  if (f.idx >= 2) {
    const style = rgba(NEUTRAL, f.idx === 2 ? 0.3 : 0.2);
    for (const [i, j] of e.edges) drawLine(ctx, e.pos[i], e.pos[j], style, 1);
  }
  drawPoints(ctx, e.pos, i => e.pts[i].color);
}

export function drawSammon(ctx: CanvasRenderingContext2D, e: SammonEngine, f: FrameState): void {
  morphPositions(e.pos, e.pts, BASE, PROJECTED, f, 2);
  const pos = e.pos;
  if (f.idx === 1) {
    const inA = smoothstep(f.local / 0.6);
    const farA = Math.sin(Math.min(1, f.local) * Math.PI) * 0.4;
    for (const [i, j] of e.far) drawLine(ctx, pos[i], pos[j], rgba(NEUTRAL, farA), 1, FAR_DASH);
    for (const [i, j] of e.near) drawLine(ctx, pos[i], pos[j], rgba(ACCENT, 0.55 * inA), 1.6);
  }
  if (f.idx >= 2) {
    const style = rgba(ACCENT, f.idx === 2 ? 0.4 : 0.25);
    for (const [i, j] of e.near) drawLine(ctx, pos[i], pos[j], style, 1.3);
  }
  drawPoints(ctx, pos, i => e.pts[i].color);
}
