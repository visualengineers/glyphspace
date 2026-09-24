import { gaussOf, grad, mulberry } from './preview-math';
import {
  ClusterPoint,
  CloudPoint,
  CurvePoint,
  Edge,
  FastEngine,
  PcaEngine,
  PreviewEngine,
  PreviewKey,
  SammonEngine,
  TriEngine,
  Triplet,
  Vec2,
} from './preview-types';

/** Logical (CSS pixel) size of the preview canvas. */
export const PREVIEW_WIDTH = 340;
export const PREVIEW_HEIGHT = 200;
export const CENTER_X = PREVIEW_WIDTH / 2;
export const CENTER_Y = PREVIEW_HEIGHT / 2;

const CLUSTER_GROUPS = 3;

/** Deterministic geometry for the given method; built once per preview. */
export function buildEngine(key: PreviewKey): PreviewEngine {
  switch (key) {
    case 'pca':
      return buildPca();
    case 'fast':
      return buildFast();
    case 'umap': {
      const pts = genClusters(cluster(-92, -14, 80, -30, -4, 54), 15, 777, [16, 15, 15]);
      return withScratch({
        kind: 'umap',
        pts,
        edges: nearestEdges(clusterCoords(pts), 2, (i, j) => pts[i].g === pts[j].g),
      });
    }
    case 'tsne': {
      const pts = genClusters(cluster(-58, -34, 66, -2, -18, 52), 9, 313, [16, 15, 15]);
      return withScratch({ kind: 'tsne', pts, cent: centroids(pts) });
    }
    case 'tri':
      return buildTri();
    case 'topo': {
      const pts = genClusters(cluster(-84, -8, 70, -34, 10, 50), 20, 888, [12, 12, 12]);
      return withScratch({ kind: 'topo', pts, edges: minimumSpanningTree(clusterCoords(pts)) });
    }
    case 'mds': {
      const pts = cloudTarget(246, 26, -0.45, 0.72);
      const edges = nearestEdges(baseCoords(pts), 2, () => true);
      return withScratch({ kind: 'mds', pts, edges, anchors: [2, 9, 16, 22, 6, 13] });
    }
    case 'sammon':
      return buildSammon();
    case 'iso':
      return withScratch({ kind: 'iso', pts: curve(41, 34, 60, 4.6, 0) });
    case 'lle':
      return withScratch({ kind: 'lle', pts: curve(42, 30, 56, 2.6, 0.6), samples: [3, 9, 15, 21, 27] });
    case 'ltsa':
      return withScratch({ kind: 'ltsa', pts: curve(43, 30, 46, 5.6, 0), samples: [2, 6, 10, 14, 18, 22, 26] });
  }
}

/** Adds the per-frame position buffer (one reusable entry per point). */
function withScratch<E extends Omit<PreviewEngine, 'pos'>>(engine: E): E & { pos: Vec2[] } {
  return { ...engine, pos: Array.from({ length: engine.pts.length }, () => ({ x: 0, y: 0 })) };
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function cluster(ax: number, ay: number, bx: number, by: number, cx: number, cy: number): Vec2[] {
  return [
    { x: ax, y: ay },
    { x: bx, y: by },
    { x: cx, y: cy },
  ];
}

function clusterCoords(pts: readonly ClusterPoint[]): Vec2[] {
  return pts.map(p => ({ x: p.cx, y: p.cy }));
}

function baseCoords(pts: readonly CloudPoint[]): Vec2[] {
  return pts.map(p => ({ x: p.bx, y: p.by }));
}

// ---------- point generators ----------

function genClusters(centers: readonly Vec2[], spread: number, seed: number, sizes: readonly number[]): ClusterPoint[] {
  const r = mulberry(seed);
  const g2 = gaussOf(r);
  const pts: ClusterPoint[] = [];
  for (let gi = 0; gi < centers.length; gi++) {
    for (let k = 0; k < sizes[gi]; k++) {
      const ang = r() * 6.2832;
      const rad = Math.min(Math.abs(g2()) * spread, spread * 2.4);
      pts.push({
        g: gi,
        cx: CENTER_X + centers[gi].x + Math.cos(ang) * rad,
        cy: CENTER_Y + centers[gi].y + Math.sin(ang) * rad,
        sx: CENTER_X + (r() * 2 - 1) * 150,
        sy: CENTER_Y + (r() * 2 - 1) * 80,
        jp: r() * 6.283,
      });
    }
  }
  return pts;
}

/** A gaussian cloud and a rotated / squashed copy of it as target layout. */
function cloudTarget(seed: number, n: number, rot: number, sy: number): CloudPoint[] {
  const g = gaussOf(mulberry(seed));
  const co = Math.cos(rot);
  const si = Math.sin(rot);
  const pts: CloudPoint[] = [];
  for (let i = 0; i < n; i++) {
    const a = clamp(g() * 62, -105, 105);
    const b = clamp(g() * 34, -62, 62);
    const bx = CENTER_X + a;
    const by = CENTER_Y + b * 0.9;
    const dx = bx - CENTER_X;
    const dy = by - CENTER_Y;
    const px = CENTER_X + dx * co - dy * si;
    const py = CENTER_Y + (dx * si + dy * co) * sy;
    pts.push({
      bx,
      by,
      px: clamp(px, 14, PREVIEW_WIDTH - 14),
      py: clamp(py, 14, PREVIEW_HEIGHT - 14),
      color: grad((a + 95) / 190),
    });
  }
  return pts;
}

/** Noisy points on a sine-shaped curve plus their unrolled positions. */
function curve(seed: number, n: number, amp: number, freq: number, phase: number): CurvePoint[] {
  const r = mulberry(seed);
  const pts: CurvePoint[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const jx = (r() * 2 - 1) * 4;
    const jy = (r() * 2 - 1) * 8;
    pts.push({
      t,
      bx: CENTER_X + (t - 0.5) * 252 + jx,
      by: CENTER_Y + amp * Math.sin((t - 0.5) * freq + phase) + jy,
      ux: CENTER_X + (t - 0.5) * 290 + jx,
      uy: CENTER_Y + jy * 0.6,
      color: grad(t),
    });
  }
  return pts;
}

// ---------- graph helpers ----------

function centroids(pts: readonly ClusterPoint[]): Vec2[] {
  const acc = Array.from({ length: CLUSTER_GROUPS }, () => ({ x: 0, y: 0, n: 0 }));
  for (const p of pts) {
    acc[p.g].x += p.cx;
    acc[p.g].y += p.cy;
    acc[p.g].n++;
  }
  return acc.map(c => ({ x: c.x / c.n, y: c.y / c.n }));
}

/** Undirected k-nearest-neighbour edges among the `related` point pairs. */
function nearestEdges(coords: readonly Vec2[], k: number, related: (i: number, j: number) => boolean): Edge[] {
  const edges: Edge[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < coords.length; i++) {
    const cand: [number, number][] = [];
    for (let j = 0; j < coords.length; j++) {
      if (j === i || !related(i, j)) continue;
      const dx = coords[i].x - coords[j].x;
      const dy = coords[i].y - coords[j].y;
      cand.push([dx * dx + dy * dy, j]);
    }
    cand.sort((a, b) => a[0] - b[0]);
    for (let m = 0; m < Math.min(k, cand.length); m++) {
      const j = cand[m][1];
      const key = i < j ? i + '-' + j : j + '-' + i;
      if (!seen.has(key)) {
        seen.add(key);
        edges.push([i, j]);
      }
    }
  }
  return edges;
}

/** Prim's algorithm; edges are returned in the order they join the tree. */
function minimumSpanningTree(coords: readonly Vec2[]): Edge[] {
  const used = new Set<number>([0]);
  const edges: Edge[] = [];
  while (used.size < coords.length) {
    let bi = -1;
    let bj = -1;
    let bd = Infinity;
    for (const i of used) {
      for (let j = 0; j < coords.length; j++) {
        if (used.has(j)) continue;
        const dx = coords[i].x - coords[j].x;
        const dy = coords[i].y - coords[j].y;
        const d = dx * dx + dy * dy;
        if (d < bd) {
          bd = d;
          bi = i;
          bj = j;
        }
      }
    }
    used.add(bj);
    edges.push([bi, bj]);
  }
  return edges;
}

function farthestPair(pts: readonly Vec2[]): [number, number] {
  let pi = 0;
  let pj = 1;
  let best = -1;
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[i].x - pts[j].x;
      const dy = pts[i].y - pts[j].y;
      const d2 = dx * dx + dy * dy;
      if (d2 > best) {
        best = d2;
        pi = i;
        pj = j;
      }
    }
  }
  return [pi, pj];
}

// ---------- per-method builders ----------

function buildPca(): PcaEngine {
  const gauss = gaussOf(mulberry(20260702));
  const th = -0.384;
  const ux = Math.cos(th);
  const uy = Math.sin(th);
  const vx = -Math.sin(th);
  const vy = Math.cos(th);
  const pts: CloudPoint[] = [];
  for (let i = 0; i < 46; i++) {
    const a = clamp(gauss() * 58, -92, 92);
    const b = clamp(gauss() * 15, -30, 30);
    pts.push({
      bx: CENTER_X + ux * a + vx * b,
      by: CENTER_Y + uy * a + vy * b,
      px: CENTER_X + ux * a,
      py: CENTER_Y + uy * a,
      color: grad((a + 80) / 160),
    });
  }
  return withScratch({ kind: 'pca', pts, theta: th });
}

function buildFast(): FastEngine {
  const gauss = gaussOf(mulberry(99123));
  const base: Vec2[] = [];
  for (let i = 0; i < 44; i++) {
    const a = clamp(gauss() * 52, -98, 98);
    const b = clamp(gauss() * 30, -58, 58);
    base.push({ x: CENTER_X + a, y: CENTER_Y + b * 0.92 });
  }
  const [pi, pj] = farthestPair(base);
  const P = base[pi];
  const Q = base[pj];
  return withScratch({
    kind: 'fast',
    pts: projectOntoPivotAxis(base, P, Q),
    pi,
    pj,
    angle: Math.atan2(Q.y - P.y, Q.x - P.x),
  });
}

/** Projects every point onto the line through the pivots `P` and `Q`. */
export function projectOntoPivotAxis(base: readonly Vec2[], P: Vec2, Q: Vec2): CloudPoint[] {
  const fdx = Q.x - P.x;
  const fdy = Q.y - P.y;
  const flen2 = fdx * fdx + fdy * fdy;
  return base.map((p): CloudPoint => {
    // Coinciding pivots would divide by zero; project everything onto P then.
    const t = flen2 > 0 ? ((p.x - P.x) * fdx + (p.y - P.y) * fdy) / flen2 : 0;
    return { bx: p.x, by: p.y, px: P.x + fdx * t, py: P.y + fdy * t, color: grad(t) };
  });
}

function buildTri(): TriEngine {
  const pts = genClusters(cluster(-80, -20, 86, -18, 2, 52), 13, 555, [16, 15, 15]);
  const rt = mulberry(1212);
  const pick = (): number => Math.floor(rt() * pts.length);
  const triplets: Triplet[] = [];
  for (let t = 0; t < 5; t++) {
    const a = pick();
    let b = a;
    while (b === a || pts[b].g !== pts[a].g) b = pick();
    let c = a;
    while (pts[c].g === pts[a].g) c = pick();
    triplets.push([a, b, c]);
  }
  return withScratch({ kind: 'tri', pts, triplets, cent: centroids(pts) });
}

function buildSammon(): SammonEngine {
  const pts = cloudTarget(135, 26, 0.4, 0.7);
  const near: Edge[] = [];
  const far: Edge[] = [];
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[i].bx - pts[j].bx;
      const dy = pts[i].by - pts[j].by;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 40 && near.length < 24) near.push([i, j]);
      else if (d > 150 && far.length < 6) far.push([i, j]);
    }
  }
  return withScratch({ kind: 'sammon', pts, near, far });
}
