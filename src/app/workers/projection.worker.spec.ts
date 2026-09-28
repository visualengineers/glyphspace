import {
  ProjectionComputeConfig,
  ProjectionMethod,
  ProjectionWorkerRequest,
  ProjectionWorkerResponse,
} from '../shared/types/projection.types';

/**
 * Smoke test of the real projection worker: every method runs with the real
 * DruidJS inside a module Web Worker (with its WASM kernels where the browser
 * supports them), using the same messages ProjectionService sends.
 *
 * The worker is started from its source URL: under the unit-test builder the
 * `new Worker(new URL(...))` in ProjectionService points at a bundle the test
 * server does not serve. Keeping the URL in its own variable stops the builder
 * from treating this spec's worker the same way.
 */
const WORKER_URL = new URL('./projection.worker', import.meta.url);

/** mulberry32: seedable PRNG, so the dataset is identical on every run. */
function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Three noisy clusters in 6-D, in [0, 1] like the wizard's default scaling. */
function seededDataset(rows: number): { features: number[][]; ids: string[] } {
  const random = createRandom(20260924);
  const features = Array.from({ length: rows }, (_, i) =>
    Array.from({ length: 6 }, (_, dim) => ((i % 3 === dim % 3 ? 0.7 : 0.2) + random() * 0.25) / 0.95)
  );
  return { features, ids: features.map((_, i) => `row-${i}`) };
}

/** Starts a projection worker, sends one compute request and collects its messages until the result. */
function compute(request: ProjectionWorkerRequest): Promise<ProjectionWorkerResponse[]> {
  const worker = new Worker(WORKER_URL, { type: 'module' });
  const messages: ProjectionWorkerResponse[] = [];
  return new Promise<ProjectionWorkerResponse[]>((resolve, reject) => {
    worker.onmessage = ({ data }: MessageEvent<ProjectionWorkerResponse>) => {
      messages.push(data);
      if (data.type !== 'progress') resolve(messages);
    };
    worker.onerror = event => reject(new Error(`worker failed to run: ${event.message}`));
    worker.postMessage(request);
  }).finally(() => worker.terminate());
}

describe('projection worker – every DruidJS method in a module worker', () => {
  const { features, ids } = seededDataset(90);

  const cases: [ProjectionMethod, ProjectionComputeConfig | undefined][] = [
    ['pca', undefined],
    ['fastmap', undefined],
    ['mds', undefined],
    ['isomap', { isomapNeighbors: 8 }],
    ['lle', { lleNeighbors: 10 }],
    ['ltsa', { ltsaNeighbors: 10 }],
    ['trimap', undefined],
    ['topomap', undefined],
    ['umap', { neighbors: 15, minDist: 0.1 }],
    ['sammon', undefined],
    ['tsne', { perplexity: 20, iterations: 100 }],
  ];

  for (const [method, config] of cases) {
    it(`${method}: one finite 2-D position per row, in row order`, async () => {
      const messages = await compute({ type: 'compute', method, features, ids, config });
      const result = messages[messages.length - 1];

      expect(result).toEqual(expect.objectContaining({ type: 'result', method }));
      const positions = result.positions ?? [];
      expect(positions.map(p => p.id)).toEqual(ids);
      expect(positions.every(p => Number.isFinite(p.x) && Number.isFinite(p.y))).toBe(true);
      // Not collapsed onto a single point.
      expect(new Set(positions.map(p => `${p.x},${p.y}`)).size).toBeGreaterThan(1);
    });
  }

  it('reports t-SNE progress per chunk of 50 iterations before the result', async () => {
    const messages = await compute({
      type: 'compute',
      method: 'tsne',
      features,
      ids,
      config: { perplexity: 20, iterations: 100 },
    });

    expect(messages.map(m => [m.type, m.progress])).toEqual([
      ['progress', 50],
      ['progress', 100],
      ['result', undefined],
    ]);
  });

  it('reports a DruidJS failure as an error message', async () => {
    // UMAP needs more rows than neighbours.
    const messages = await compute({
      type: 'compute',
      method: 'umap',
      features: features.slice(0, 10),
      ids: ids.slice(0, 10),
      config: { neighbors: 15, minDist: 0.1 },
    });

    expect(messages).toEqual([
      expect.objectContaining({ type: 'error', method: 'umap', error: expect.stringContaining('n_neighbors') }),
    ]);
  });
});
