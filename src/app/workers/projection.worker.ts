/// <reference lib="webworker" />

/**
 * Web Worker for CPU-intensive projection computations
 * Runs DruidJS projections (IsoMap, t-SNE, UMAP) in a separate thread
 * to prevent blocking the main UI thread.
 */

// Worker message types
interface ProjectionRequest {
  type: 'compute';
  method: 'pca' | 'isomap' | 'tsne' | 'umap';
  features: number[][];
  ids: (string | number)[];
  config?: {
    perplexity?: number;
    iterations?: number;
    neighbors?: number;
    minDist?: number;
  };
}

interface ProjectionResponse {
  type: 'result' | 'error' | 'progress';
  method?: string;
  positions?: Array<{ id: string | number; x: number; y: number }>;
  computeTime?: number;
  error?: string;
  progress?: number;
  message?: string;
}

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

  const pca = new druidModule.PCA(features, 2);
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
 * Run IsoMap projection
 * Non-linear manifold learning that preserves geodesic distances
 */
async function runIsoMap(
  features: number[][],
  ids: (string | number)[]
): Promise<{ positions: Array<{ id: string | number; x: number; y: number }>; computeTime: number }> {
  const startTime = performance.now();
  const druidModule = await loadDruidJS();

  const isomap = new druidModule.ISOMAP(features, 2);
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

        case 'isomap':
          result = await runIsoMap(data.features, data.ids);
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
