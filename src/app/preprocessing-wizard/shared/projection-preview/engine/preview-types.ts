/**
 * Types for the framework-free projection-preview animation engine.
 *
 * Every projection method has its own engine shape (a discriminated union on
 * `kind`), built once by `buildEngine()` and drawn frame by frame by
 * `renderFrame()`.
 */

/** Keys of the methods that have an animated preview. */
export type PreviewKey = 'fast' | 'pca' | 'tri' | 'mds' | 'iso' | 'lle' | 'ltsa' | 'topo' | 'umap' | 'sammon' | 'tsne';

export interface Vec2 {
  x: number;
  y: number;
}

/** Parsed colour channels (0..255, may be fractional while blending). */
export type Rgb = readonly [number, number, number];

/** Index pair into an engine's `pts`. */
export type Edge = readonly [number, number];

/** Anchor `a`, a point `b` of the same group and a point `c` of another group. */
export type Triplet = readonly [number, number, number];

/** A point of a clustered data set. */
export interface ClusterPoint {
  /** Group (cluster) index. */
  g: number;
  /** Position inside its cluster (the embedding result). */
  cx: number;
  cy: number;
  /** Scattered start position (the high-dimensional "mess"). */
  sx: number;
  sy: number;
  /** Jitter phase used by the t-SNE animation. */
  jp: number;
}

/** A point of a 2-D cloud with a projected (or re-arranged) target. */
export interface CloudPoint {
  /** Base position. */
  bx: number;
  by: number;
  /** Projected / target position. */
  px: number;
  py: number;
  color: string;
}

/** A point on a curved 1-D manifold with its unrolled position. */
export interface CurvePoint {
  /** Parameter along the curve (0..1). */
  t: number;
  /** Position on the curve. */
  bx: number;
  by: number;
  /** Unrolled (flattened) position. */
  ux: number;
  uy: number;
  color: string;
}

interface EngineBase<K extends PreviewKey, P> {
  kind: K;
  pts: readonly P[];
  /**
   * Scratch buffer with one entry per point, overwritten every frame so the
   * animation loop does not allocate new position arrays.
   */
  pos: Vec2[];
}

export interface PcaEngine extends EngineBase<'pca', CloudPoint> {
  /** Angle of the main axis. */
  theta: number;
}

export interface FastEngine extends EngineBase<'fast', CloudPoint> {
  /** Indices of the two pivot points. */
  pi: number;
  pj: number;
  /** Angle of the pivot axis. */
  angle: number;
}

export interface UmapEngine extends EngineBase<'umap', ClusterPoint> {
  edges: readonly Edge[];
}

export interface TsneEngine extends EngineBase<'tsne', ClusterPoint> {
  cent: readonly Vec2[];
}

export interface TriEngine extends EngineBase<'tri', ClusterPoint> {
  triplets: readonly Triplet[];
  cent: readonly Vec2[];
}

export interface TopoEngine extends EngineBase<'topo', ClusterPoint> {
  /** Minimum spanning tree edges in insertion order. */
  edges: readonly Edge[];
}

export interface MdsEngine extends EngineBase<'mds', CloudPoint> {
  edges: readonly Edge[];
  /** Points whose distances are highlighted one after another. */
  anchors: readonly number[];
}

export interface SammonEngine extends EngineBase<'sammon', CloudPoint> {
  near: readonly Edge[];
  far: readonly Edge[];
}

export type IsoEngine = EngineBase<'iso', CurvePoint>;

export interface LleEngine extends EngineBase<'lle', CurvePoint> {
  samples: readonly number[];
}

export interface LtsaEngine extends EngineBase<'ltsa', CurvePoint> {
  samples: readonly number[];
}

export type PreviewEngine =
  | PcaEngine
  | FastEngine
  | UmapEngine
  | TsneEngine
  | TriEngine
  | TopoEngine
  | MdsEngine
  | SammonEngine
  | IsoEngine
  | LleEngine
  | LtsaEngine;

/** One step of the looping animation; `d` is its relative duration. */
export interface PhaseStep {
  d: number;
}

/** Where in the loop a frame is: phase index and progress inside it (0..1). */
export interface Phase {
  idx: number;
  local: number;
}

export interface FrameState extends Phase {
  /** Accumulated animation time, drives pulses and jitter. */
  clock: number;
}
