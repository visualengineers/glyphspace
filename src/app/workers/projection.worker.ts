/// <reference lib="webworker" />

/**
 * Web Worker for CPU-intensive projection computations
 * Runs DruidJS projections (IsoMap, t-SNE, UMAP) in a separate thread
 * to prevent blocking the main UI thread.
 */

import {
  ProjectionMethod,
  ProjectionComputeConfig,
  ProjectionWorkerRequest,
  ProjectionWorkerResponse
} from '../shared/types/projection.types';

// Local type aliases for cleaner code within this worker
type ProjectionRequest = ProjectionWorkerRequest;
type ProjectionResponse = ProjectionWorkerResponse;

// Import DruidJS dynamically
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
): Promise<{ positions: Array<{ id: string | number; x: number; y: number }>; computeTime: number }> {
  const startTime = performance.now();
  const druidModule = await loadDruidJS();

  // Center the data first (subtract column means)
  // DruidJS PCA computes eigenvectors from centered data but projects uncentered data
  const nRows = features.length;
  const nCols = features[0].length;

  // Compute column means
  const means = new Array(nCols).fill(0);
  for (let i = 0; i < nRows; i++) {
    for (let j = 0; j < nCols; j++) {
      means[j] += features[i][j];
    }
  }
  for (let j = 0; j < nCols; j++) {
    means[j] /= nRows;
  }

  // Center the data
  const centeredFeatures = features.map(row =>
    row.map((val, j) => val - means[j])
  );

  const pca = new druidModule.PCA(centeredFeatures, { d: 2 });
  const embedding = pca.transform();

  const positions = embedding.map((point: number[], idx: number) => ({
    id: ids[idx],
    x: point[0],
    y: point[1]
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
): Promise<{ positions: Array<{ id: string | number; x: number; y: number }>; computeTime: number }> {
  const startTime = performance.now();
  const druidModule = await loadDruidJS();

  const fastmap = new druidModule.FASTMAP(features, { d: 2 });
  const embedding = fastmap.transform();

  const positions = embedding.map((point: number[], idx: number) => ({
    id: ids[idx],
    x: point[0],
    y: point[1]
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
): Promise<{ positions: Array<{ id: string | number; x: number; y: number }>; computeTime: number }> {
  const startTime = performance.now();
  const druidModule = await loadDruidJS();

  // neighbors = 0 or undefined means auto (let DruidJS decide)
  const options: any = { d: 2 };
  if (neighbors && neighbors > 0) {
    options.neighbors = neighbors;
  }
  const isomap = new druidModule.ISOMAP(features, options);
  const embedding = isomap.transform();

  const positions = embedding.map((point: number[], idx: number) => ({
    id: ids[idx],
    x: point[0],
    y: point[1]
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
): Promise<{ positions: Array<{ id: string | number; x: number; y: number }>; computeTime: number }> {
  const startTime = performance.now();
  const druidModule = await loadDruidJS();

  const tsne = new druidModule.TSNE(features, {
    d: 2,
    perplexity: config.perplexity,
    epsilon: 10
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
      message: `t-SNE: ${i + iterations}/${totalIterations} iterations`
    } as ProjectionResponse);
  }

  const positions = embedding.map((point: number[], idx: number) => ({
    id: ids[idx],
    x: point[0],
    y: point[1]
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
): Promise<{ positions: Array<{ id: string | number; x: number; y: number }>; computeTime: number }> {
  const startTime = performance.now();
  const druidModule = await loadDruidJS();

  const umap = new druidModule.UMAP(features, {
    d: 2,
    n_neighbors: config.neighbors,
    min_dist: config.minDist,
    local_connectivity: 1
  });

  const embedding = umap.transform();

  const positions = embedding.map((point: number[], idx: number) => ({
    id: ids[idx],
    x: point[0],
    y: point[1]
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
): Promise<{ positions: Array<{ id: string | number; x: number; y: number }>; computeTime: number }> {
  const startTime = performance.now();
  const druidModule = await loadDruidJS();

  const mds = new druidModule.MDS(features, { d: 2 });
  const embedding = mds.transform();

  const positions = embedding.map((point: number[], idx: number) => ({
    id: ids[idx],
    x: point[0],
    y: point[1]
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
): Promise<{ positions: Array<{ id: string | number; x: number; y: number }>; computeTime: number }> {
  const startTime = performance.now();
  const druidModule = await loadDruidJS();

  // neighbors = 0 or undefined means auto (let DruidJS decide)
  const options: any = { d: 2 };
  if (neighbors && neighbors > 0) {
    options.neighbors = neighbors;
  }
  const lle = new druidModule.LLE(features, options);
  const embedding = lle.transform();

  const positions = embedding.map((point: number[], idx: number) => ({
    id: ids[idx],
    x: point[0],
    y: point[1]
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
): Promise<{ positions: Array<{ id: string | number; x: number; y: number }>; computeTime: number }> {
  const startTime = performance.now();
  const druidModule = await loadDruidJS();

  // neighbors = 0 or undefined means auto (let DruidJS decide)
  const options: any = { d: 2 };
  if (neighbors && neighbors > 0) {
    options.neighbors = neighbors;
  }
  const ltsa = new druidModule.LTSA(features, options);
  const embedding = ltsa.transform();

  const positions = embedding.map((point: number[], idx: number) => ({
    id: ids[idx],
    x: point[0],
    y: point[1]
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
): Promise<{ positions: Array<{ id: string | number; x: number; y: number }>; computeTime: number }> {
  const startTime = performance.now();
  const druidModule = await loadDruidJS();

  const options: any = { d: 2 };
  if (weightAdj && weightAdj > 0) {
    options.weight_adj = weightAdj;
  }
  const trimap = new druidModule.TriMap(features, options);
  const embedding = trimap.transform();

  const positions = embedding.map((point: number[], idx: number) => ({
    id: ids[idx],
    x: point[0],
    y: point[1]
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
): Promise<{ positions: Array<{ id: string | number; x: number; y: number }>; computeTime: number }> {
  const startTime = performance.now();
  const druidModule = await loadDruidJS();

  const topomap = new druidModule.TopoMap(features, { d: 2 });
  const embedding = topomap.transform();

  const positions = embedding.map((point: number[], idx: number) => ({
    id: ids[idx],
    x: point[0],
    y: point[1]
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
): Promise<{ positions: Array<{ id: string | number; x: number; y: number }>; computeTime: number }> {
  const startTime = performance.now();
  const druidModule = await loadDruidJS();

  const sammon = new druidModule.SAMMON(features, { d: 2 });
  const embedding = sammon.transform();

  const positions = embedding.map((point: number[], idx: number) => ({
    id: ids[idx],
    x: point[0],
    y: point[1]
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
      let result: { positions: Array<{ id: string | number; x: number; y: number }>; computeTime: number };

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
            iterations: data.config.iterations || 1000
          });
          break;

        case 'umap':
          if (!data.config) {
            throw new Error('UMAP requires config with neighbors and minDist');
          }
          result = await runUMAP(data.features, data.ids, {
            neighbors: data.config.neighbors || 15,
            minDist: data.config.minDist || 0.1
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
        computeTime: result.computeTime
      } as ProjectionResponse);
    }
  } catch (error: any) {
    postMessage({
      type: 'error',
      method: data.method,
      error: error.message || 'Unknown error'
    } as ProjectionResponse);
  }
});
