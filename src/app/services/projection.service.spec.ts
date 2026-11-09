import { TestBed } from '@angular/core/testing';
import { ProjectionCancelledError, ProjectionService } from './projection.service';
import { ProjectionWorkerRequest, ProjectionWorkerResponse } from '../shared/types/projection.types';

/** Minimal in-memory stand-in for a projection worker. */
class FakeWorker {
  static instances: FakeWorker[] = [];
  onmessage: ((ev: MessageEvent<ProjectionWorkerResponse>) => void) | null = null;
  onerror: ((ev: ErrorEvent) => void) | null = null;
  readonly posted: ProjectionWorkerRequest[] = [];
  terminated = false;

  constructor() {
    FakeWorker.instances.push(this);
  }

  postMessage(message: ProjectionWorkerRequest): void {
    this.posted.push(message);
  }

  terminate(): void {
    this.terminated = true;
  }

  /** Deliver a message from the "worker" to the main thread. */
  emit(data: ProjectionWorkerResponse): void {
    this.onmessage?.({ data } as MessageEvent<ProjectionWorkerResponse>);
  }

  /** Raise an uncaught worker error. */
  crash(message: string): void {
    this.onerror?.({ message } as ErrorEvent);
  }
}

describe('ProjectionService – background projections', () => {
  const globals = globalThis as unknown as { Worker: unknown };
  let originalWorker: unknown;
  let service: ProjectionService;

  const features = [
    [1, 2],
    [3, 4],
  ];
  const ids = ['a', 'b'];
  const positions = [
    { id: 'a', x: 0, y: 1 },
    { id: 'b', x: 2, y: 3 },
  ];

  beforeEach(() => {
    originalWorker = globals.Worker;
    globals.Worker = FakeWorker;
    FakeWorker.instances = [];
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectionService);
  });

  afterEach(() => {
    globals.Worker = originalWorker;
    FakeWorker.instances = [];
  });

  function lastWorker(): FakeWorker {
    const worker = FakeWorker.instances[FakeWorker.instances.length - 1];
    if (!worker) {
      throw new Error('No worker was started');
    }
    return worker;
  }

  function statusOf(method: string): string | undefined {
    return service.getBackgroundStatus(method)?.status;
  }

  function startUmap(): Promise<unknown> {
    return service.runUMAP(features, ids, { neighbors: 15, minDist: 0.1 });
  }

  it('computes in a worker, reports progress and resolves with the result', async () => {
    const run = service.runMDS(features, ids);
    const worker = lastWorker();
    expect(worker.posted[0]).toEqual(expect.objectContaining({ type: 'compute', method: 'mds', features, ids }));
    expect(statusOf('mds')).toBe('running');

    worker.emit({ type: 'progress', progress: 40, message: 'Iterating' });
    expect(service.getBackgroundStatus('mds')?.progress).toBe(40);

    worker.emit({ type: 'result', positions, computeTime: 12 });
    expect(await run).toEqual({ method: 'mds', positions, computeTime: 12 });
    expect(statusOf('mds')).toBe('complete');
    expect(worker.terminated).toBe(true);
    expect(service.isRunning('mds')).toBe(false);
    expect(service.canRetry('mds')).toBe(false);
  });

  describe('cancel', () => {
    it('terminates the worker, rejects the run and marks the method cancelled', async () => {
      const run = startUmap();
      const worker = lastWorker();

      expect(service.cancel('umap')).toBe(true);

      await expect(run).rejects.toEqual(expect.any(ProjectionCancelledError));
      expect(worker.terminated).toBe(true);
      expect(statusOf('umap')).toBe('cancelled');
      expect(service.isRunning('umap')).toBe(false);
      expect(service.canRetry('umap')).toBe(true);
    });

    it('returns false and changes nothing for a method that is not running', async () => {
      const run = service.runMDS(features, ids);
      lastWorker().emit({ type: 'result', positions, computeTime: 1 });
      await run;

      expect(service.cancel('mds')).toBe(false);
      expect(service.cancel('tsne')).toBe(false);
      expect(statusOf('mds')).toBe('complete');
      expect(service.getBackgroundStatus('tsne')).toBeUndefined();
    });

    it('ignores late messages from a cancelled worker', async () => {
      const run = startUmap();
      const worker = lastWorker();
      service.cancel('umap');
      await expect(run).rejects.toThrow();

      worker.emit({ type: 'progress', progress: 90 });
      worker.emit({ type: 'result', positions, computeTime: 5 });

      expect(statusOf('umap')).toBe('cancelled');
      expect(service.canRetry('umap')).toBe(true);
    });

    it('leaves the other running methods alone', () => {
      startUmap().catch(() => undefined);
      const tsne = service.runTSNE(features, ids, { perplexity: 30, iterations: 100 });

      service.cancel('umap');

      expect(service.isRunning('tsne')).toBe(true);
      expect(statusOf('tsne')).toBe('running');
      tsne.catch(() => undefined);
    });
  });

  describe('terminateAllWorkers', () => {
    it('cancels every running method and reports which ones were stopped', async () => {
      const umap = startUmap();
      const tsne = service.runTSNE(features, ids, { perplexity: 30, iterations: 100 });
      const mds = service.runMDS(features, ids);
      FakeWorker.instances[2].emit({ type: 'result', positions, computeTime: 1 });
      await mds;

      const stopped = service.terminateAllWorkers();

      expect(stopped.sort()).toEqual(['tsne', 'umap']);
      expect(FakeWorker.instances.every(w => w.terminated)).toBe(true);
      expect(statusOf('umap')).toBe('cancelled');
      expect(statusOf('tsne')).toBe('cancelled');
      expect(statusOf('mds')).toBe('complete');
      await expect(umap).rejects.toEqual(expect.any(ProjectionCancelledError));
      await expect(tsne).rejects.toEqual(expect.any(ProjectionCancelledError));
    });

    it('returns an empty list when nothing is running', () => {
      expect(service.terminateAllWorkers()).toEqual([]);
    });
  });

  describe('retry', () => {
    it('re-runs a cancelled method with the same data and settings in a new worker', async () => {
      startUmap().catch(() => undefined);
      const first = lastWorker();
      service.cancel('umap');

      const retried = service.retry('umap');
      const second = lastWorker();

      expect(second).not.toBe(first);
      expect(second.posted[0]).toEqual(first.posted[0]);
      expect(statusOf('umap')).toBe('running');
      expect(service.canRetry('umap')).toBe(false);

      second.emit({ type: 'result', positions, computeTime: 7 });
      expect(await retried).toEqual({ method: 'umap', positions, computeTime: 7 });
      expect(statusOf('umap')).toBe('complete');
      expect(service.canRetry('umap')).toBe(false);
    });

    it('re-runs a method whose worker reported an error', async () => {
      const run = service.runLLE(features, ids, { neighbors: 5 });
      lastWorker().emit({ type: 'error', error: 'singular matrix' });
      await expect(run).rejects.toThrowError('lle failed: singular matrix');
      expect(statusOf('lle')).toBe('error');
      expect(service.canRetry('lle')).toBe(true);

      const retried = service.retry('lle');
      expect(lastWorker().posted[0].config).toEqual({ lleNeighbors: 5 });
      lastWorker().emit({ type: 'result', positions, computeTime: 3 });
      await expect(retried).resolves.not.toThrow();
    });

    it('re-runs a method whose worker crashed', async () => {
      const run = service.runSammon(features, ids);
      lastWorker().crash('out of memory');
      await expect(run).rejects.toThrowError('sammon worker error: out of memory');
      expect(statusOf('sammon')).toBe('error');

      expect(service.canRetry('sammon')).toBe(true);
      service.retry('sammon').catch(() => undefined);
      expect(statusOf('sammon')).toBe('running');
    });

    it('rejects when there is no previous run of the method', async () => {
      await expect(service.retry('tsne')).rejects.toThrowError('There is no previous tsne run to retry');
    });

    it('forgets retryable runs when the statuses are cleared or the jobs are detached', () => {
      startUmap().catch(() => undefined);
      service.runMDS(features, ids).catch(() => undefined);
      service.terminateAllWorkers();

      service.detachAll();
      expect(service.canRetry('umap')).toBe(false);

      service.runTopoMap(features, ids).catch(() => undefined);
      service.cancel('topomap');
      service.clearBackgroundStatuses();
      expect(service.canRetry('topomap')).toBe(false);
      expect(service.getBackgroundStatus('topomap')).toBeUndefined();
    });
  });

  describe('runs of an earlier dataset', () => {
    it('keeps an earlier run of the same method computing; only the newer one is controllable', async () => {
      const earlier = startUmap();
      const earlierWorker = lastWorker();
      const newer = startUmap();
      const newerWorker = lastWorker();
      expect(earlierWorker.terminated).toBe(false);

      expect(service.cancel('umap')).toBe(true);
      await expect(newer).rejects.toEqual(expect.any(ProjectionCancelledError));
      expect(newerWorker.terminated).toBe(true);

      earlierWorker.emit({ type: 'result', positions, computeTime: 4 });
      expect(await earlier).toEqual({ method: 'umap', positions, computeTime: 4 });
      expect(earlierWorker.terminated).toBe(true);
      // The newer run was cancelled, so it stays retryable.
      expect(service.canRetry('umap')).toBe(true);
    });

    it('lets detached runs finish and report, but no longer cancels or retries them', async () => {
      const run = startUmap();
      const worker = lastWorker();

      service.detachAll();

      expect(service.isRunning('umap')).toBe(false);
      expect(service.cancel('umap')).toBe(false);
      expect(service.terminateAllWorkers()).toEqual([]);
      expect(worker.terminated).toBe(false);

      worker.emit({ type: 'progress', progress: 70 });
      expect(service.getBackgroundStatus('umap')?.progress).toBe(70);

      worker.emit({ type: 'result', positions, computeTime: 9 });
      expect(await run).toEqual({ method: 'umap', positions, computeTime: 9 });
      expect(statusOf('umap')).toBe('complete');
      expect(service.canRetry('umap')).toBe(false);
    });
  });
});

describe('ProjectionService – primary FastMap on the main thread', () => {
  let service: ProjectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectionService);
  });

  it('loads DruidJS on demand and projects every row to finite 2-D coordinates', async () => {
    const features = Array.from({ length: 40 }, (_, i) => [Math.sin(i), Math.cos(i / 3), (i % 7) / 7, i / 40]);
    const ids = features.map((_, i) => `row-${i}`);
    const workerSpy = vi.spyOn(globalThis, 'Worker');

    const result = await service.runFastMapSync(features, ids);

    expect(result.method).toBe('fastmap');
    expect(result.positions.map(p => p.id)).toEqual(ids);
    expect(result.positions.every(p => Number.isFinite(p.x) && Number.isFinite(p.y))).toBe(true);
    expect(Number.isInteger(result.computeTime)).toBe(true);
    expect(workerSpy).not.toHaveBeenCalled();
  });

  it('reports a DruidJS failure as a FastMap error', async () => {
    const ragged = [[1, 2], [3]];

    await expect(service.runFastMapSync(ragged, ['a', 'b'])).rejects.toThrowError(/^FastMap failed: /);
  });
});
