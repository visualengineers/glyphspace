import { DataProcessorService } from './data-processor';
import { DatasetCollection } from '../shared/interfaces/dataset-collection';

interface PostedMessage {
  type?: string;
  requestId?: unknown;
  [key: string]: unknown;
}

/** Minimal in-memory stand-in for the Pyodide worker. */
class FakeWorker {
  static last: FakeWorker | null = null;
  onmessage: ((ev: MessageEvent) => void) | null = null;
  readonly posted: PostedMessage[] = [];

  constructor() {
    FakeWorker.last = this;
  }

  postMessage(message: PostedMessage): void {
    this.posted.push(message);
  }

  terminate(): void {
    // no-op
  }

  /** Deliver a reply from the "worker" to the main thread. */
  reply(data: unknown): void {
    this.onmessage?.({ data } as MessageEvent);
  }
}

/**
 * Concurrent processWithConfig() runs all answer with type 'processed', so
 * replies must be matched to their request by a per-request id rather than by
 * type, or concurrent requests resolve/reject with each other's replies.
 */
describe('DataProcessorService – request/reply matching', () => {
  const globals = globalThis as unknown as { Worker: unknown };
  let originalWorker: unknown;
  let service: DataProcessorService;
  let worker: FakeWorker;

  const datasetA = { tag: 'A' } as unknown as DatasetCollection;
  const datasetB = { tag: 'B' } as unknown as DatasetCollection;

  beforeEach(() => {
    originalWorker = globals.Worker;
    globals.Worker = FakeWorker;
    vi.spyOn(console, 'warn').mockImplementation(() => undefined); // the service logs worker errors
    service = new DataProcessorService();
    if (!FakeWorker.last) {
      throw new Error('FakeWorker was not constructed');
    }
    worker = FakeWorker.last;
  });

  afterEach(() => {
    globals.Worker = originalWorker;
    FakeWorker.last = null;
  });

  function startTwoRequests(): [Promise<DatasetCollection>, Promise<DatasetCollection>, unknown, unknown] {
    const a = service.processWithConfig('a.csv', {});
    const b = service.processWithConfig('b.csv', {});
    expect(worker.posted.length).toBe(2);
    const [idA, idB] = worker.posted.map(m => m.requestId);
    expect(idA).toBeDefined();
    expect(idA).not.toEqual(idB);
    return [a, b, idA, idB];
  }

  it('resolves two concurrent requests with their own replies', async () => {
    const [a, b, idA, idB] = startTwoRequests();

    worker.reply({ type: 'processed', dataset: datasetB, requestId: idB });
    worker.reply({ type: 'processed', dataset: datasetA, requestId: idA });

    expect(await a).toBe(datasetA);
    expect(await b).toBe(datasetB);
  });

  it('rejects only the request an error reply belongs to', async () => {
    const [a, b, idA, idB] = startTwoRequests();

    worker.reply({ type: 'error', message: 'boom', requestId: idA });
    await expect(a).rejects.toThrowError('boom');

    worker.reply({ type: 'processed', dataset: datasetB, requestId: idB });
    expect(await b).toBe(datasetB);
  });

  describe('pruneFiles', () => {
    /** Resolves to true once `promise` has settled, false while it is still pending. */
    async function isSettled(promise: Promise<unknown>): Promise<boolean> {
      let settled = false;
      promise.then(
        () => (settled = true),
        () => (settled = true)
      );
      await Promise.resolve();
      await Promise.resolve();
      return settled;
    }

    it('sends the keep list to the worker and resolves on its filesPruned reply', async () => {
      const pruned = service.pruneFiles(['current.csv', 'undo.csv']);

      expect(worker.posted.length).toBe(1);
      const [request] = worker.posted;
      expect(request.type).toBe('pruneFiles');
      expect(request['keep']).toEqual(['current.csv', 'undo.csv']);

      worker.reply({ type: 'filesPruned', removed: ['old.csv'], requestId: request.requestId });
      await expect(pruned).resolves.toEqual(undefined);
    });

    it('ignores a filesPruned reply that belongs to another request', async () => {
      const pruned = service.pruneFiles([]);
      const [request] = worker.posted;

      worker.reply({ type: 'filesPruned', removed: [], requestId: -1 });
      expect(await isSettled(pruned)).toBe(false);

      worker.reply({ type: 'filesPruned', removed: [], requestId: request.requestId });
      await expect(pruned).resolves.not.toThrow();
    });

    it('rejects when the worker reports an error for the prune request', async () => {
      const pruned = service.pruneFiles(['a.csv']);
      const [request] = worker.posted;

      worker.reply({ type: 'error', message: 'unlink failed', requestId: request.requestId });
      await expect(pruned).rejects.toThrowError('unlink failed');
    });
  });
});
