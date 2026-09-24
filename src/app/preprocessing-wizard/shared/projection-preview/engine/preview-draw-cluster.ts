import { hexToRgb, mixRgb, rgb, rgba, smoothstep } from './preview-math';
import {
  ACCENT,
  CLUSTERED,
  GROUP_COLORS,
  NEUTRAL,
  SCATTERED,
  TAU,
  drawLine,
  drawPoints,
  drawRing,
  morphPositions,
} from './preview-primitives';
import { ClusterPoint, FrameState, TopoEngine, TriEngine, TsneEngine, UmapEngine, Vec2 } from './preview-types';

// Draw routines of the neighbourhood-based methods whose scattered points
// gather into clusters: UMAP, t-SNE, TriMap and TopoMap.

const TREE_EDGE = hexToRgb('#7e8f9c');
const TRIPLET_DASH = [3, 3];

/** Neutral grey blending into the cluster colour as the groups form. */
function groupColor(g: number, mix: number): string {
  return rgb(mixRgb(NEUTRAL, GROUP_COLORS[g], mix));
}

function drawClusterPoints(
  ctx: CanvasRenderingContext2D,
  e: { pts: readonly ClusterPoint[]; pos: Vec2[] },
  mix: number
): void {
  drawPoints(ctx, e.pos, i => groupColor(e.pts[i].g, mix));
}

export function drawUmap(ctx: CanvasRenderingContext2D, e: UmapEngine, f: FrameState): void {
  const mix = morphPositions(e.pos, e.pts, SCATTERED, CLUSTERED, f, 2);
  const edgeA = f.idx === 0 ? 0 : f.idx === 1 ? smoothstep(f.local) : 1;
  if (edgeA > 0) {
    ctx.save();
    ctx.lineWidth = 1;
    for (const [i, j] of e.edges) {
      ctx.strokeStyle = rgba(mixRgb(NEUTRAL, GROUP_COLORS[e.pts[i].g], mix), 0.3 * edgeA);
      ctx.beginPath();
      ctx.moveTo(e.pos[i].x, e.pos[i].y);
      ctx.lineTo(e.pos[j].x, e.pos[j].y);
      ctx.stroke();
    }
    ctx.restore();
  }
  drawClusterPoints(ctx, e, mix);
}

/** Soft halo around every point while the neighbourhoods are measured. */
function drawHalos(ctx: CanvasRenderingContext2D, pos: readonly Vec2[], halo: number): void {
  ctx.save();
  for (const p of pos) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 12, 0, TAU);
    ctx.fillStyle = rgba(ACCENT, 0.055 * halo);
    ctx.fill();
  }
  ctx.restore();
}

/** Dashed line between two clusters with a "?" (gaps are not to scale). */
function drawGapMarker(ctx: CanvasRenderingContext2D, a: Vec2, b: Vec2): void {
  ctx.save();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = 'rgba(120,134,148,0.55)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.setLineDash([]);
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  ctx.beginPath();
  ctx.arc(mx, my, 8, 0, TAU);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,134,148,0.6)';
  ctx.stroke();
  ctx.fillStyle = '#6b7680';
  ctx.font = 'italic bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?', mx, my + 0.5);
  ctx.restore();
}

export function drawTsne(ctx: CanvasRenderingContext2D, e: TsneEngine, f: FrameState): void {
  const mix = morphPositions(e.pos, e.pts, SCATTERED, CLUSTERED, f, 2);
  let halo = 0;
  if (f.idx === 1) {
    halo = smoothstep(f.local);
  } else if (f.idx === 2) {
    // Points wobble while attraction and repulsion settle.
    const amp = (1 - mix) * 7;
    for (let i = 0; i < e.pts.length; i++) {
      e.pos[i].x += Math.cos(f.clock * 5.5 + e.pts[i].jp) * amp;
      e.pos[i].y += Math.sin(f.clock * 4.7 + e.pts[i].jp * 1.4) * amp;
    }
    halo = (1 - mix) * 0.5;
  }
  if (halo > 0) drawHalos(ctx, e.pos, halo);
  if (f.idx === 3) drawGapMarker(ctx, e.cent[0], e.cent[1]);
  drawClusterPoints(ctx, e, mix);
}

/** One sampled triplet: anchor-to-near (solid) and anchor-to-far (dashed). */
function drawTriplet(ctx: CanvasRenderingContext2D, e: TriEngine, local: number): void {
  const count = e.triplets.length;
  const k = Math.min(count - 1, Math.floor(local * count));
  const fade = Math.sin(Math.min(1, local * count - k) * Math.PI);
  const [a, b, c] = e.triplets[k];
  drawLine(ctx, e.pos[a], e.pos[b], rgba(ACCENT, 0.85 * fade), 1.8);
  drawLine(ctx, e.pos[a], e.pos[c], rgba(NEUTRAL, 0.7 * fade), 1.2, TRIPLET_DASH);
  drawRing(ctx, e.pos[a], 8.5, rgba(ACCENT, 0.8 * fade), 1.6);
}

function drawCentroidTriangle(ctx: CanvasRenderingContext2D, cent: readonly Vec2[]): void {
  ctx.save();
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(120,134,148,0.35)';
  ctx.beginPath();
  ctx.moveTo(cent[0].x, cent[0].y);
  ctx.lineTo(cent[1].x, cent[1].y);
  ctx.lineTo(cent[2].x, cent[2].y);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

export function drawTri(ctx: CanvasRenderingContext2D, e: TriEngine, f: FrameState): void {
  const mix = morphPositions(e.pos, e.pts, SCATTERED, CLUSTERED, f, 2);
  if (f.idx === 1) drawTriplet(ctx, e, f.local);
  if (f.idx === 3) drawCentroidTriangle(ctx, e.cent);
  drawClusterPoints(ctx, e, mix);
}

export function drawTopo(ctx: CanvasRenderingContext2D, e: TopoEngine, f: FrameState): void {
  const mix = morphPositions(e.pos, e.pts, SCATTERED, CLUSTERED, f, 2);
  const total = e.edges.length;
  // The spanning tree grows edge by edge in phase 1 and stays afterwards.
  const count = f.idx === 0 ? 0 : f.idx === 1 ? Math.floor(smoothstep(f.local) * total) : total;
  const alpha = f.idx === 1 ? 0.5 : f.idx === 2 ? 0.45 : 0.3;
  const style = f.idx === 1 ? rgba(ACCENT, alpha) : rgba(mixRgb(NEUTRAL, TREE_EDGE, mix), alpha);
  for (let k = 0; k < count; k++) {
    const [i, j] = e.edges[k];
    drawLine(ctx, e.pos[i], e.pos[j], style, 1.2);
  }
  if (f.idx === 1 && count > 0) {
    const [, j] = e.edges[Math.min(count - 1, total - 1)];
    drawRing(ctx, e.pos[j], 7.5, rgba(ACCENT, 0.8), 1.6);
  }
  drawClusterPoints(ctx, e, mix);
}
