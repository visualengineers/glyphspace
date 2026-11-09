/**
 * Runs DruidJS dimensionality reductions for the projection worker.
 *
 * Every method follows the same steps: load DruidJS, construct the reducer,
 * transform, and map the embedding to `{ id, x, y }`. Only the class name and
 * the constructor parameters differ, so they are described by a
 * {@link DruidSpec} per method. t-SNE is special-cased because it is iterated
 * in chunks to report progress.
 *
 * The parameter objects are typed with DruidJS's own declarations (e.g.
 * `ParametersUMAP`), so a parameter that DruidJS renames or drops fails to
 * compile instead of being silently ignored at runtime.
 */

import type * as Druid from '@saehrimnir/druidjs';
import { ProjectionComputeConfig, ProjectionMethod } from '../shared/types/projection.types';

export interface ProjectedPoint {
  id: string | number;
  x: number;
  y: number;
}

export interface ProjectionRun {
  positions: ProjectedPoint[];
  computeTime: number;
}

/** DruidJS classes used by the worker. */
export type DruidClassName =
  | 'PCA'
  | 'FASTMAP'
  | 'ISOMAP'
  | 'TSNE'
  | 'UMAP'
  | 'MDS'
  | 'LLE'
  | 'LTSA'
  | 'TriMap'
  | 'TopoMap'
  | 'SAMMON';

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
  return embedding.map((point, idx) => ({ id: ids[idx], x: point[0], y: point[1] }));
}

/** Constructs and transforms one DruidJS reducer; computeTime includes loading DruidJS. */
export async function runDruidProjection<K extends DruidSpecClassName>(
  load: DruidLoader,
  spec: DruidSpecOf<K>,
  features: number[][],
  ids: readonly (string | number)[]
): Promise<ProjectionRun> {
  const startTime = performance.now();
  const druid = await load();

  const Reducer = druid[spec.className];
  const positions = toPositions(new Reducer(features, spec.params).transform(), ids);

  return { positions, computeTime: performance.now() - startTime };
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
  const druid = await load();

  const tsne = new druid.TSNE(features, { ...TWO_D, perplexity: config.perplexity, epsilon: 10 });
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

  return { positions: toPositions(embedding, ids), computeTime: performance.now() - startTime };
}
