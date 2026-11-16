/**
 * Runs DruidJS dimensionality reductions for the projection worker.
 *
 * Every method follows the same steps: load DruidJS, prepare the input,
 * construct the reducer, transform, check the embedding, and map it to
 * `{ id, x, y }`. Only the class name and the constructor parameters differ, so
 * they are described by a {@link DruidSpec} per method. t-SNE is special-cased
 * because it is iterated in chunks to report progress.
 *
 * The parameter objects are typed with DruidJS's own declarations (e.g.
 * `ParametersUMAP`), so a parameter that DruidJS renames or drops fails to
 * compile instead of being silently ignored at runtime.
 *
 * DruidJS returns NaN coordinates for degenerate input (a single varying
 * column, constant columns next to it, columns that only repeat each other,
 * fewer than three rows) instead of failing. {@link prepareProjectionInput}
 * embeds input of rank 0 or 1 exactly without DruidJS and drops constant
 * columns; whatever still comes back non-finite is rejected with an error, so
 * no item silently ends up without a position.
 */

import type * as Druid from '@saehrimnir/druidjs';
import { ProjectionComputeConfig, ProjectionMethod } from '../shared/types/projection.types';

export interface ProjectedPoint {
  /** The item id, always a string: ids are matched as strings everywhere. */
  id: string;
  x: number;
  y: number;
}

export interface ProjectionRun {
  positions: ProjectedPoint[];
  computeTime: number;
}

/** DruidJS classes used by the worker. */
export type DruidClassName =
  'PCA' | 'FASTMAP' | 'ISOMAP' | 'TSNE' | 'UMAP' | 'MDS' | 'LLE' | 'LTSA' | 'TriMap' | 'TopoMap' | 'SAMMON';

/** Second constructor argument of a DruidJS class, as DruidJS declares it (e.g. `Partial<ParametersUMAP>`). */
export type DruidParams<K extends DruidClassName> = NonNullable<ConstructorParameters<(typeof Druid)[K]>[1]>;

/** A DruidJS reducer instance (only what the worker uses). */
export interface DruidReducer {
  transform(iterations?: number): number[][];
}

/** The DruidJS module, reduced to the classes the worker instantiates. */
export type DruidModule = {
  [K in DruidClassName]: new (data: number[][], params: DruidParams<K>) => DruidReducer;
};

export type DruidLoader = () => Promise<DruidModule>;

/** Every method except t-SNE, which {@link runTsneProjection} iterates itself. */
export type DruidSpecClassName = Exclude<DruidClassName, 'TSNE'>;

/** Class and constructor parameters of one DruidJS reduction. */
export interface DruidSpecOf<K extends DruidSpecClassName> {
  className: K;
  params: DruidParams<K>;
}

export type DruidSpec = { [K in DruidSpecClassName]: DruidSpecOf<K> }[DruidSpecClassName];

/** Output dimensionality; DruidJS's default, passed explicitly where the class takes it. */
const TWO_D = { d: 2 } as const;

/** `{ d: 2 }` plus `neighbors` when it is a positive number (0/undefined = DruidJS default, N/10). */
function withNeighbors(neighbors: number | undefined): { d: 2; neighbors?: number } {
  return neighbors && neighbors > 0 ? { ...TWO_D, neighbors } : TWO_D;
}

function umapParams(config: ProjectionComputeConfig | undefined): DruidParams<'UMAP'> {
  if (!config) {
    throw new Error('UMAP requires config with neighbors and minDist');
  }
  return {
    ...TWO_D,
    // 0 neighbors is not a valid UMAP setting and falls back to the default...
    n_neighbors: config.neighbors || 15,
    // ...while min_dist 0 is (tightest clusters), so only a missing value does.
    min_dist: config.minDist ?? 0.1,
    local_connectivity: 1,
  };
}

/** Class and constructor parameters for every method except t-SNE. */
export function druidSpecFor(method: Exclude<ProjectionMethod, 'tsne'>, config?: ProjectionComputeConfig): DruidSpec {
  switch (method) {
    case 'pca':
      return { className: 'PCA', params: TWO_D };
    case 'fastmap':
      return { className: 'FASTMAP', params: TWO_D };
    case 'isomap':
      return { className: 'ISOMAP', params: withNeighbors(config?.isomapNeighbors) };
    case 'umap':
      return { className: 'UMAP', params: umapParams(config) };
    case 'mds':
      return { className: 'MDS', params: TWO_D };
    case 'lle':
      return { className: 'LLE', params: withNeighbors(config?.lleNeighbors) };
    case 'ltsa':
      return { className: 'LTSA', params: withNeighbors(config?.ltsaNeighbors) };
    case 'trimap':
      // DruidJS 0.9 moved TriMap to the reference 1.1.5 algorithm (and dropped
      // `weight_adj`); the wizard runs it with the library's defaults.
      return { className: 'TriMap', params: TWO_D };
    case 'topomap':
      // TopoMap always embeds in 2-D and has no `d` parameter.
      return { className: 'TopoMap', params: {} };
    case 'sammon':
      return { className: 'SAMMON', params: TWO_D };
    default:
      throw new Error(`Unknown projection method: ${method}`);
  }
}

/** Pairs each embedded point with the id of the row it came from. */
export function toPositions(embedding: number[][], ids: readonly (string | number)[]): ProjectedPoint[] {
  return embedding.map((point, idx) => ({ id: String(ids[idx]), x: point[0], y: point[1] }));
}

/**
 * The projection input in the form a method can embed: either the matrix to
 * reduce (without its constant columns) or, for input of rank 0 or 1, its
 * exact 2-D embedding, which DruidJS would return as NaN.
 */
export type PreparedInput = { kind: 'reduce'; features: number[][] } | { kind: 'exact'; embedding: number[][] };

/** Spread below which a column counts as constant, relative to its magnitude (rounding noise). */
const CONSTANT_TOLERANCE = 1e-12;
/** |correlation| from which two columns count as one direction. */
const COLLINEAR_TOLERANCE = 1e-9;

/**
 * Checks the projection input and reduces it to what DruidJS can embed.
 *
 * Constant columns are dropped: they add nothing to any distance, and they make
 * the linear methods return NaN. Without a varying column every item lies at the
 * origin. When every varying column is an affine function of the first (one
 * column, or columns that repeat each other, also every input of two rows), the
 * items lie on a line: they are placed along it, distances preserved, at y = 0.
 */
export function prepareProjectionInput(features: number[][]): PreparedInput {
  const n = features.length;
  if (n === 0) {
    throw new Error('There are no rows to project.');
  }
  const d = features[0].length;
  features.forEach((row, i) => {
    if (row.length !== d) {
      throw new Error(`Row ${i + 1} of the projection input has ${row.length} values instead of ${d}.`);
    }
    if (!row.every(Number.isFinite)) {
      throw new Error(`Invalid numeric value in row ${i + 1} of the projection input.`);
    }
  });

  const varying = varyingColumns(features, d);
  if (varying.length === 0) {
    return { kind: 'exact', embedding: features.map(() => [0, 0]) };
  }
  const reduced = varying.length === d ? features : features.map(row => varying.map(j => row[j]));
  const line = alongOneDirection(reduced);
  return line ? { kind: 'exact', embedding: line.map(t => [t, 0]) } : { kind: 'reduce', features: reduced };
}

function varyingColumns(features: number[][], d: number): number[] {
  const columns: number[] = [];
  for (let j = 0; j < d; j++) {
    let min = Infinity;
    let max = -Infinity;
    for (const row of features) {
      min = Math.min(min, row[j]);
      max = Math.max(max, row[j]);
    }
    if (max - min > CONSTANT_TOLERANCE * Math.max(1, Math.abs(min), Math.abs(max))) {
      columns.push(j);
    }
  }
  return columns;
}

/**
 * The items' coordinates along the line they lie on, or null when they span
 * more than one direction. Every column j is checked against the first, r:
 * x_j - mean_j = a_j (x_r - mean_r) with a_j = cov(r, j) / var(r) when they
 * correlate perfectly; the distance-preserving coordinate is then
 * (x_r - mean_r) * |a|.
 */
function alongOneDirection(features: number[][]): number[] | null {
  const n = features.length;
  const d = features[0].length;
  const means = Array.from({ length: d }, (_, j) => features.reduce((sum, row) => sum + row[j], 0) / n);
  const centred = (row: number[], j: number) => row[j] - means[j];
  const sumOfProducts = (j: number, k: number) =>
    features.reduce((sum, row) => sum + centred(row, j) * centred(row, k), 0);

  const varR = sumOfProducts(0, 0);
  let length = 1; // |a|, with a_r = 1
  for (let j = 1; j < d; j++) {
    const covariance = sumOfProducts(0, j);
    const correlation = Math.abs(covariance) / Math.sqrt(varR * sumOfProducts(j, j));
    if (!(correlation >= 1 - COLLINEAR_TOLERANCE)) {
      return null; // also when rounding made a variance 0 (NaN): leave such input to DruidJS
    }
    length = Math.hypot(length, covariance / varR);
  }
  return features.map(row => centred(row, 0) * length);
}

/** Rejects parameters a method cannot use with `n` rows (DruidJS would return NaN or throw obscurely). */
function assertParametersFit(spec: DruidSpec, n: number): void {
  const params = spec.params as { neighbors?: number; n_neighbors?: number };
  const neighbors = params.neighbors ?? params.n_neighbors;
  if (neighbors !== undefined && neighbors >= n) {
    throw new Error(
      `${spec.className}: ${neighbors} neighbors exceed the ${n} rows to project; choose fewer than ${n} neighbors.`
    );
  }
}

/** Rejects an embedding with a NaN or infinite coordinate: those items would silently have no position. */
export function assertFiniteEmbedding(method: string, embedding: number[][], n: number): void {
  if (embedding.length !== n) {
    throw new Error(`${method} returned ${embedding.length} coordinates for ${n} items.`);
  }
  const invalid = embedding.filter(point => !Number.isFinite(point[0]) || !Number.isFinite(point[1])).length;
  if (invalid > 0) {
    throw new Error(
      `${method} returned invalid coordinates for ${invalid} of ${n} items: the projection input is singular for ` +
        'this method (for example many identical rows, or columns that only repeat each other). Choose other ' +
        'projection columns or another method.'
    );
  }
}

/** Constructs and transforms one DruidJS reducer; computeTime includes loading DruidJS. */
export async function runDruidProjection<K extends DruidSpecClassName>(
  load: DruidLoader,
  spec: DruidSpecOf<K>,
  features: number[][],
  ids: readonly (string | number)[]
): Promise<ProjectionRun> {
  const startTime = performance.now();
  assertIdsFit(features, ids);
  const input = prepareProjectionInput(features);
  if (input.kind === 'exact') {
    return { positions: toPositions(input.embedding, ids), computeTime: performance.now() - startTime };
  }
  assertParametersFit(spec as DruidSpec, features.length);
  const druid = await load();

  const Reducer = druid[spec.className];
  const embedding = new Reducer(input.features, spec.params).transform();
  assertFiniteEmbedding(spec.className, embedding, features.length);

  return { positions: toPositions(embedding, ids), computeTime: performance.now() - startTime };
}

function assertIdsFit(features: readonly unknown[], ids: readonly unknown[]): void {
  if (ids.length !== features.length) {
    throw new Error(`The projection input has ${features.length} rows but ${ids.length} ids.`);
  }
}

export interface TsneConfig {
  perplexity: number;
  iterations: number;
}

/** Iterations per t-SNE transform() call, i.e. how often progress is reported. */
const TSNE_CHUNK_SIZE = 50;

/** Runs t-SNE in chunks of iterations, reporting progress (0-100) after each chunk. */
export async function runTsneProjection(
  load: DruidLoader,
  features: number[][],
  ids: readonly (string | number)[],
  config: TsneConfig,
  onProgress: (progress: number, message: string) => void
): Promise<ProjectionRun> {
  const startTime = performance.now();
  assertIdsFit(features, ids);
  const input = prepareProjectionInput(features);
  if (input.kind === 'exact') {
    onProgress(100, 't-SNE: the items lie on a line');
    return { positions: toPositions(input.embedding, ids), computeTime: performance.now() - startTime };
  }
  if (config.perplexity >= features.length) {
    throw new Error(
      `t-SNE perplexity ${config.perplexity} needs more than ${config.perplexity} rows; there are ` +
        `${features.length}. Choose a perplexity below ${features.length}.`
    );
  }
  const druid = await load();

  const tsne = new druid.TSNE(input.features, { ...TWO_D, perplexity: config.perplexity, epsilon: 10 });
  const totalIterations = config.iterations;
  let embedding: number[][] = [];

  // Each transform() call continues the same optimisation (DruidJS keeps the
  // iteration counter and the momentum/gain state between calls).
  for (let i = 0; i < totalIterations; i += TSNE_CHUNK_SIZE) {
    const iterations = Math.min(TSNE_CHUNK_SIZE, totalIterations - i);
    embedding = tsne.transform(iterations);
    const progress = Math.round(((i + iterations) / totalIterations) * 100);
    onProgress(progress, `t-SNE: ${i + iterations}/${totalIterations} iterations`);
  }
  assertFiniteEmbedding('TSNE', embedding, features.length);

  return { positions: toPositions(embedding, ids), computeTime: performance.now() - startTime };
}
