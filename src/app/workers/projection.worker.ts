/// <reference lib="webworker" />

/**
 * Web Worker for CPU-intensive projection computations
 * Runs DruidJS projections (IsoMap, t-SNE, UMAP) in a separate thread
 * to prevent blocking the main UI thread.
 */

import { ProjectionWorkerRequest, ProjectionWorkerResponse } from '../shared/types/projection.types';

// Local type aliases for cleaner code within this worker
type ProjectionRequest = ProjectionWorkerRequest;
type ProjectionResponse = ProjectionWorkerResponse;

// Import DruidJS dynamically
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- DruidJS module is dynamically imported and has incomplete type definitions
let druid: any = null;

async function loadDruidJS() {
  if (!druid) {
    druid = await import('@saehrimnir/druidjs');
  }
  return druid;
}

/**
 * Run PCA projection
 */
async function runPCA(
  features: number[][],
  ids: (string | number)[]
): Promise<{ positions: { id: string | number; x: number; y: number }[]; computeTime: number }> {
  const startTime = performance.now();
  const druidModule = await loadDruidJS();

  const pca = new druidModule.PCA(features, 2);
  const embedding = pca.transform();

  const positions = embedding.map((point: number[], idx: number) => ({
    id: ids[idx],
    x: point[0],
    y: point[1],
  }));

  const computeTime = performance.now() - startTime;
  return { positions, computeTime };
}

/**
 * Run FastMap projection
 * Fast distance-preserving projection - O(n) complexity, ideal for large datasets
 */
async function runFastMap(
  features: number[][],
  ids: (string | number)[]
): Promise<{ positions: { id: string | number; x: number; y: number }[]; computeTime: number }> {
  const startTime = performance.now();
  const druidModule = await loadDruidJS();

  const fastmap = new druidModule.FASTMAP(features, 2);
  const embedding = fastmap.transform();

  const positions = embedding.map((point: number[], idx: number) => ({
    id: ids[idx],
    x: point[0],
    y: point[1],
  }));

  const computeTime = performance.now() - startTime;
  return { positions, computeTime };
}

/**
 * Run IsoMap projection
 * Non-linear manifold learning that preserves geodesic distances
 */
async function runIsoMap(
  features: number[][],
  ids: (string | number)[],
  neighbors?: number
): Promise<{ positions: { id: string | number; x: number; y: number }[]; computeTime: number }> {
  const startTime = performance.now();
  const druidModule = await loadDruidJS();

  // neighbors = 0 or undefined means auto (let DruidJS decide)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- DruidJS constructor options are not fully typed
  const options: any = { d: 2 };
  if (neighbors && neighbors > 0) {
    options.neighbors = neighbors;
  }
  const isomap = new druidModule.ISOMAP(features, options);
  const embedding = isomap.transform();

  const positions = embedding.map((point: number[], idx: number) => ({
    id: ids[idx],
    x: point[0],
    y: point[1],
  }));

  const computeTime = performance.now() - startTime;
  return { positions, computeTime };
}

/**
 * Run t-SNE projection with progress updates
 */
async function runTSNE(
  features: number[][],
  ids: (string | number)[],
  config: { perplexity: number; iterations: number }
): Promise<{ positions: { id: string | number; x: number; y: number }[]; computeTime: number }> {
  const startTime = performance.now();
  const druidModule = await loadDruidJS();

  const tsne = new druidModule.TSNE(features, {
    d: 2,
    perplexity: config.perplexity,
    epsilon: 10,
  });

  // Run iterations in chunks to allow progress updates
  const chunkSize = 50;
  const totalIterations = config.iterations;
  let embedding: number[][] = [];

  for (let i = 0; i < totalIterations; i += chunkSize) {
    const iterations = Math.min(chunkSize, totalIterations - i);
    embedding = tsne.transform(iterations);

    // Send progress update
    const progress = Math.round(((i + iterations) / totalIterations) * 100);
    postMessage({
      type: 'progress',
      method: 'tsne',
      progress,
      message: `t-SNE: ${i + iterations}/${totalIterations} iterations`,
    } as ProjectionResponse);
  }

  const positions = embedding.map((point: number[], idx: number) => ({
    id: ids[idx],
    x: point[0],
    y: point[1],
  }));

  const computeTime = performance.now() - startTime;
  return { positions, computeTime };
}

/**
 * Run UMAP projection
 */
async function runUMAP(
  features: number[][],
  ids: (string | number)[],
  config: { neighbors: number; minDist: number }
): Promise<{ positions: { id: string | number; x: number; y: number }[]; computeTime: number }> {
  const startTime = performance.now();
  const druidModule = await loadDruidJS();

  const umap = new druidModule.UMAP(features, {
    d: 2,
    n_neighbors: config.neighbors,
    min_dist: config.minDist,
    local_connectivity: 1,
  });

  const embedding = umap.transform();

  const positions = embedding.map((point: number[], idx: number) => ({
    id: ids[idx],
    x: point[0],
    y: point[1],
  }));

  const computeTime = performance.now() - startTime;
  return { positions, computeTime };
}

/**
 * Run MDS projection - Classical Multidimensional Scaling
 */
async function runMDS(
  features: number[][],
  ids: (string | number)[]
): Promise<{ positions: { id: string | number; x: number; y: number }[]; computeTime: number }> {
  const startTime = performance.now();
  const druidModule = await loadDruidJS();

  const mds = new druidModule.MDS(features, 2);
  const embedding = mds.transform();

  const positions = embedding.map((point: number[], idx: number) => ({
    id: ids[idx],
    x: point[0],
    y: point[1],
  }));

  const computeTime = performance.now() - startTime;
  return { positions, computeTime };
}

/**
 * Run LLE projection - Locally Linear Embedding
 */
async function runLLE(
  features: number[][],
  ids: (string | number)[],
  neighbors?: number
): Promise<{ positions: { id: string | number; x: number; y: number }[]; computeTime: number }> {
  const startTime = performance.now();
  const druidModule = await loadDruidJS();

  // neighbors = 0 or undefined means auto (let DruidJS decide)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- DruidJS constructor options are not fully typed
  const options: any = { d: 2 };
  if (neighbors && neighbors > 0) {
    options.neighbors = neighbors;
  }
  const lle = new druidModule.LLE(features, options);
  const embedding = lle.transform();

  const positions = embedding.map((point: number[], idx: number) => ({
    id: ids[idx],
    x: point[0],
    y: point[1],
  }));

  const computeTime = performance.now() - startTime;
  return { positions, computeTime };
}

/**
 * Run LTSA projection - Local Tangent Space Alignment
 */
async function runLTSA(
  features: number[][],
  ids: (string | number)[],
  neighbors?: number
): Promise<{ positions: { id: string | number; x: number; y: number }[]; computeTime: number }> {
  const startTime = performance.now();
  const druidModule = await loadDruidJS();

  // neighbors = 0 or undefined means auto (let DruidJS decide)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- DruidJS constructor options are not fully typed
  const options: any = { d: 2 };
  if (neighbors && neighbors > 0) {
    options.neighbors = neighbors;
  }
  const ltsa = new druidModule.LTSA(features, options);
  const embedding = ltsa.transform();

  const positions = embedding.map((point: number[], idx: number) => ({
    id: ids[idx],
    x: point[0],
    y: point[1],
  }));

  const computeTime = performance.now() - startTime;
  return { positions, computeTime };
}

/**
 * Run TriMap projection - Good for large datasets
 */
async function runTriMap(
  features: number[][],
  ids: (string | number)[],
  weightAdj?: number
): Promise<{ positions: { id: string | number; x: number; y: number }[]; computeTime: number }> {
  const startTime = performance.now();
  const druidModule = await loadDruidJS();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- DruidJS constructor options are not fully typed
  const options: any = { d: 2 };
  if (weightAdj && weightAdj > 0) {
    options.weight_adj = weightAdj;
  }
  const trimap = new druidModule.TriMap(features, options);
  const embedding = trimap.transform();

  const positions = embedding.map((point: number[], idx: number) => ({
    id: ids[idx],
    x: point[0],
    y: point[1],
  }));

  const computeTime = performance.now() - startTime;
  return { positions, computeTime };
}

/**
 * Run TopoMap projection - Topology preserving
 */
async function runTopoMap(
  features: number[][],
  ids: (string | number)[]
): Promise<{ positions: { id: string | number; x: number; y: number }[]; computeTime: number }> {
  const startTime = performance.now();
  const druidModule = await loadDruidJS();

  const topomap = new druidModule.TopoMap(features, 2);
  const embedding = topomap.transform();

  const positions = embedding.map((point: number[], idx: number) => ({
    id: ids[idx],
    x: point[0],
    y: point[1],
  }));

  const computeTime = performance.now() - startTime;
  return { positions, computeTime };
}

/**
 * Run Sammon mapping
 */
async function runSammon(
  features: number[][],
  ids: (string | number)[]
): Promise<{ positions: { id: string | number; x: number; y: number }[]; computeTime: number }> {
  const startTime = performance.now();
  const druidModule = await loadDruidJS();

  const sammon = new druidModule.SAMMON(features, 2);
  const embedding = sammon.transform();

  const positions = embedding.map((point: number[], idx: number) => ({
    id: ids[idx],
    x: point[0],
    y: point[1],
  }));

  const computeTime = performance.now() - startTime;
  return { positions, computeTime };
}

/**
 * Handle incoming messages
 */
addEventListener('message', async ({ data }: MessageEvent<ProjectionRequest>) => {
  try {
    if (data.type === 'compute') {
      let result: { positions: { id: string | number; x: number; y: number }[]; computeTime: number };

      switch (data.method) {
        case 'pca':
          result = await runPCA(data.features, data.ids);
          break;

        case 'fastmap':
          result = await runFastMap(data.features, data.ids);
          break;

        case 'isomap':
          result = await runIsoMap(data.features, data.ids, data.config?.isomapNeighbors);
          break;

        case 'tsne':
          if (!data.config) {
            throw new Error('t-SNE requires config with perplexity and iterations');
          }
          result = await runTSNE(data.features, data.ids, {
            perplexity: data.config.perplexity || 30,
            iterations: data.config.iterations || 1000,
          });
          break;

        case 'umap':
          if (!data.config) {
            throw new Error('UMAP requires config with neighbors and minDist');
          }
          result = await runUMAP(data.features, data.ids, {
            neighbors: data.config.neighbors || 15,
            minDist: data.config.minDist || 0.1,
          });
          break;

        case 'mds':
          result = await runMDS(data.features, data.ids);
          break;

        case 'lle':
          result = await runLLE(data.features, data.ids, data.config?.lleNeighbors);
          break;

        case 'ltsa':
          result = await runLTSA(data.features, data.ids, data.config?.ltsaNeighbors);
          break;

        case 'trimap':
          result = await runTriMap(data.features, data.ids, data.config?.trimapWeightAdj);
          break;

        case 'topomap':
          result = await runTopoMap(data.features, data.ids);
          break;

        case 'sammon':
          result = await runSammon(data.features, data.ids);
          break;

        default:
          throw new Error(`Unknown projection method: ${data.method}`);
      }

      postMessage({
        type: 'result',
        method: data.method,
        positions: result.positions,
        computeTime: result.computeTime,
      } as ProjectionResponse);
    }
  } catch (error: unknown) {
    postMessage({
      type: 'error',
      method: data.method,
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ProjectionResponse);
  }
});
