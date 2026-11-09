/// <reference lib="webworker" />

/**
 * Web Worker for CPU-intensive projection computations
 * Runs DruidJS projections (IsoMap, t-SNE, UMAP) in a separate thread
 * to prevent blocking the main UI thread.
 *
 * DruidJS (0.9+) uses its WASM kernels here when the engine supports WASM SIMD
 * and falls back to JS otherwise. Its worker pool is Node-only
 * (`parallel_available()` is false in browsers), so no nested workers are spawned.
 */

// Imported statically: the worker exists only to run DruidJS, so one
// self-contained worker bundle saves a chunk request per worker start.
import * as druid from '@saehrimnir/druidjs';
import { ProjectionWorkerRequest, ProjectionWorkerResponse } from '../shared/types/projection.types';
import { DruidModule, ProjectionRun, druidSpecFor, runDruidProjection, runTsneProjection } from './druid-runner';

// Local type aliases for cleaner code within this worker
type ProjectionRequest = ProjectionWorkerRequest;
type ProjectionResponse = ProjectionWorkerResponse;

const loadDruidJS = (): Promise<DruidModule> => Promise.resolve(druid);

function compute(data: ProjectionRequest): Promise<ProjectionRun> {
  if (data.method !== 'tsne') {
    return runDruidProjection(loadDruidJS, druidSpecFor(data.method, data.config), data.features, data.ids);
  }
  if (!data.config) {
    throw new Error('t-SNE requires config with perplexity and iterations');
  }
  const config = { perplexity: data.config.perplexity || 30, iterations: data.config.iterations || 1000 };
  return runTsneProjection(loadDruidJS, data.features, data.ids, config, (progress, message) =>
    postMessage({ type: 'progress', method: 'tsne', progress, message } as ProjectionResponse)
  );
}

/**
 * Handle incoming messages
 */
addEventListener('message', async ({ data }: MessageEvent<ProjectionRequest>) => {
  try {
    if (data.type === 'compute') {
      const result = await compute(data);

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
