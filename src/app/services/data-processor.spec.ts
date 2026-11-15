import { DataProcessorService, PythonRuntimeStatus } from './data-processor';
import { DatasetCollection } from '../shared/interfaces/dataset-collection';

interface PostedMessage {
  type?: string;
  requestId?: number;
  [key: string]: unknown;
}

/** Minimal in-memory stand-in for the Pyodide worker. */
class FakeWorker {
  static instances: FakeWorker[] = [];
  onmessage: ((ev: MessageEvent) => void) | null = null;
  onerror: ((ev: ErrorEvent) => void) | null = null;
  onmessageerror: (() => void) | null = null;
  readonly posted: PostedMessage[] = [];
  terminated = false;

  constructor() {
    FakeWorker.instances.push(this);
  }

  postMessage(message: PostedMessage): void {
    this.posted.push(message);
  }

  terminate(): void {
    this.terminated = true;
  }

  /** Deliver a reply from the "worker" to the main thread. */
  reply(data: unknown): void {
    this.onmessage?.({ data } as MessageEvent);
  }

  /** The requests posted so far, by type. */
  types(): (string | undefined)[] {
    return this.posted.map(m => m.type);
  }

  /** The first posted request of `type`. */
  request(type: string): PostedMessage {
    const message = this.posted.find(m => m.type === type);
    if (!message) throw new Error(`no ${type} request was posted`);
    return message;
  }

  /** Reply to the first `type` request: started, then `reply`. */
  answer(type: string, reply: Record<string, unknown>): void {
    const { requestId } = this.request(type);
    this.reply({ type: 'started', requestId });
    this.reply({ ...reply, requestId });
  }
}

describe('DataProcessorService', () => {
  const globals = globalThis as unknown as { Worker: unknown };
  let originalWorker: unknown;
  let service: DataProcessorService;

  const datasetA = { tag: 'A' } as unknown as DatasetCollection;
  const datasetB = { tag: 'B' } as unknown as DatasetCollection;

  /** The worker the service created most recently. */
  const worker = () => {
    const last = FakeWorker.instances.at(-1);
    if (!last) throw new Error('no worker was created');
    return last;
  };

  /** Wait until `count` requests are posted to the current worker (posting waits for the worker's start). */
  async function postedCount(count: number): Promise<FakeWorker> {
    await vi.waitFor(() => expect(FakeWorker.instances.at(-1)?.posted.length).toBe(count));
    return worker();
  }

  /** Resolves to true once `promise` has settled, false while it is still pending. */
  async function isSettled(promise: Promise<unknown>): Promise<boolean> {
    let settled = false;
    promise.then(
      () => (settled = true),
      () => (settled = true)
    );
    for (let i = 0; i < 5; i++) await Promise.resolve();
    return settled;
  }

  beforeEach(() => {
    originalWorker = globals.Worker;
    globals.Worker = FakeWorker;
    FakeWorker.instances = [];
    vi.spyOn(console, 'warn').mockImplementation(() => undefined); // the service logs worker errors
    service = new DataProcessorService();
  });

  afterEach(() => {
    vi.useRealTimers();
    globals.Worker = originalWorker;
  });

  describe('start-up', () => {
    it('creates no worker until Python is needed', () => {
      expect(FakeWorker.instances.length).toBe(0);
    });

    it('creates the worker on the first request, and only one', async () => {
      void service.processWithConfig('a.csv', {});
      void service.detectDuplicates('a.csv');

      const created = await postedCount(2);
      expect(FakeWorker.instances.length).toBe(1);
      expect(created.types()).toEqual(['processWithConfig', 'detectDuplicates']);
    });

    it('preload() starts the worker without a request', async () => {
      service.preload();

      await vi.waitFor(() => expect(FakeWorker.instances.length).toBe(1));
      expect(worker().posted).toEqual([]);
    });

    it('reports the runtime status: idle, starting, ready', async () => {
      const statuses: PythonRuntimeStatus[] = [];
      service.runtimeStatus.subscribe(status => statuses.push(status));

      service.preload();
      await vi.waitFor(() => expect(FakeWorker.instances.length).toBe(1));
      worker().reply({ type: 'ready' });

      expect(statuses).toEqual(['idle', 'starting', 'ready']);
    });

    it('fails waiting requests when Python cannot be loaded, and tries again on the next request', async () => {
      const statuses: PythonRuntimeStatus[] = [];
      service.runtimeStatus.subscribe(status => statuses.push(status));
      const profile = service.profileData('a.csv', new ArrayBuffer(1));
      const first = await postedCount(1);

      first.reply({ type: 'startupFailed', message: 'network error' });

      await expect(profile).rejects.toThrowError('Python could not be loaded: network error');
      expect(first.terminated).toBe(true);
      expect(statuses.at(-1)).toBe('failed');

      void service.detectDuplicates('a.csv');
      await vi.waitFor(() => expect(FakeWorker.instances.length).toBe(2));
    });

    it('does not retry waiting images in a loop when Python cannot be loaded', async () => {
      service.requestThumb('thumbnails-0/1.png');
      const first = await postedCount(1);

      first.reply({ type: 'startupFailed', message: 'offline' });
      await Promise.resolve();

      expect(FakeWorker.instances.length).toBe(1);
    });
  });

  describe('matching replies to requests', () => {
    async function startTwoRequests(): Promise<
      [Promise<DatasetCollection>, Promise<DatasetCollection>, number, number]
    > {
      const a = service.processWithConfig('a.csv', {});
      const b = service.processWithConfig('b.csv', {});
      const [idA, idB] = (await postedCount(2)).posted.map(m => m.requestId as number);
      expect(idA).toBeDefined();
      expect(idA).not.toEqual(idB);
      return [a, b, idA, idB];
    }

    it('resolves two concurrent requests with their own replies', async () => {
      const [a, b, idA, idB] = await startTwoRequests();

      worker().reply({ type: 'processed', dataset: datasetB, requestId: idB });
      worker().reply({ type: 'processed', dataset: datasetA, requestId: idA });

      expect(await a).toBe(datasetA);
      expect(await b).toBe(datasetB);
    });

    it('rejects only the request an error reply belongs to', async () => {
      const [a, b, idA, idB] = await startTwoRequests();

      worker().reply({ type: 'error', message: 'boom', requestId: idA });
      await expect(a).rejects.toThrowError('boom');

      worker().reply({ type: 'processed', dataset: datasetB, requestId: idB });
      expect(await b).toBe(datasetB);
    });

    it('forwards progress of a waiting request only', async () => {
      const progress: number[] = [];
      service.processingProgress.subscribe(p => progress.push(p.progress));
      void service.processWithConfig('a.csv', {});
      const { requestId } = (await postedCount(1)).request('processWithConfig');

      worker().reply({ type: 'processingProgress', step: 's', progress: 30, message: '', requestId });
      worker().reply({ type: 'processingProgress', step: 's', progress: 90, message: '', requestId: -1 });

      expect(progress).toEqual([30]);
    });
  });

  describe('timeouts', () => {
    beforeEach(() => vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] }));

    it('starts the timeout when the worker starts the request, not when it is queued', async () => {
      const processed = service.processWithConfig('a.csv', {});
      const { requestId } = (await postedCount(1)).request('processWithConfig');

      vi.advanceTimersByTime(5 * 60_000); // Python loading, requests ahead of this one
      expect(await isSettled(processed)).toBe(false);

      worker().reply({ type: 'started', requestId });
      vi.advanceTimersByTime(59_000);
      expect(await isSettled(processed)).toBe(false);

      vi.advanceTimersByTime(1_000);
      await expect(processed).rejects.toThrowError('Worker request "processed" timed out after 60000ms');
    });

    it('replaces a worker whose request timed out, and gives the new one the uploaded files', async () => {
      const profiled = service.profileData('a.csv', new ArrayBuffer(3));
      const first = await postedCount(1);
      first.answer('profileData', { type: 'dataProfile', profile: {} });
      await profiled;
      const processed = service.processWithConfig('a.csv', {});
      await postedCount(2);
      first.reply({ type: 'started', requestId: first.request('processWithConfig').requestId });

      vi.advanceTimersByTime(60_000);
      await expect(processed).rejects.toThrowError(/timed out/);
      expect(first.terminated).toBe(true);

      // The retry runs in a new worker, after the file was put back.
      void service.processWithConfig('a.csv', {});
      const second = await postedCount(2);
      expect(second).not.toBe(first);
      expect(second.types()).toEqual(['putFile', 'processWithConfig']);
      expect(second.request('putFile')).toEqual(expect.objectContaining({ fileName: 'a.csv' }));
    });

    it('gives up a worker that does not start within ten minutes', async () => {
      const statuses: PythonRuntimeStatus[] = [];
      service.runtimeStatus.subscribe(status => statuses.push(status));
      const profile = service.profileData('a.csv', new ArrayBuffer(1));
      await postedCount(1);

      vi.advanceTimersByTime(10 * 60_000);

      await expect(profile).rejects.toThrowError('Python did not start within 10 minutes');
      expect(statuses.at(-1)).toBe('failed');
    });
  });

  describe('crashes', () => {
    it('fails the waiting requests when the worker fails, and restores files and archives in the next one', async () => {
      const profiled = service.profileData('a.csv', new ArrayBuffer(2));
      const first = await postedCount(1);
      first.answer('profileData', { type: 'dataProfile', profile: { ok: true } });
      await profiled;
      const unzipped = service.unzip('thumbnails-0', new Blob(['zip']));
      await postedCount(2);
      first.answer('unzip', { type: 'unzipped', folder: 'thumbnails-0', images: ['1.png'], duplicates: [] });
      expect(await unzipped).toEqual(['1.png']);
      const processed = service.processWithConfig('a.csv', {});
      await postedCount(3);

      first.onerror?.({ message: 'out of memory', preventDefault: () => undefined } as ErrorEvent);

      await expect(processed).rejects.toThrowError('the Python worker failed: out of memory');
      void service.detectDuplicates('a.csv');
      const second = await postedCount(3);
      expect(second.types()).toEqual(['putFile', 'unzip', 'detectDuplicates']);
      expect(second.request('unzip')).toEqual(expect.objectContaining({ folder: 'thumbnails-0' }));
    });

    it('replaces the worker after a fatal Pyodide error', async () => {
      const processed = service.processWithConfig('a.csv', {});
      const first = await postedCount(1);

      first.reply({ type: 'crashed', message: 'Pyodide already fatally failed' });

      await expect(processed).rejects.toThrowError(/fatal error: Pyodide already fatally failed/);
      expect(first.terminated).toBe(true);
    });

    it('ignores late messages from a replaced worker', async () => {
      const progress: number[] = [];
      service.processingProgress.subscribe(p => progress.push(p.progress));
      const processed = service.processWithConfig('a.csv', {});
      const first = await postedCount(1);
      const { requestId } = first.request('processWithConfig');
      first.reply({ type: 'crashed', message: 'Aborted()' });
      await expect(processed).rejects.toThrow();

      first.reply({ type: 'processingProgress', step: 's', progress: 50, message: '', requestId });

      expect(progress).toEqual([]);
    });

    it('requests waiting images again from the new worker', async () => {
      service.requestThumb('thumbnails-0/1.png');
      const first = await postedCount(1);

      first.reply({ type: 'crashed', message: 'Aborted()' });

      const second = await postedCount(1);
      expect(second).not.toBe(first);
      expect(second.posted).toEqual([{ type: 'getThumb', file: 'thumbnails-0/1.png' }]);
    });
  });

  describe('files', () => {
    it('pruneFiles needs no worker when none runs', async () => {
      await service.pruneFiles(['a.csv']);

      expect(FakeWorker.instances.length).toBe(0);
    });

    it('sends the keep list to a running worker and resolves on its filesPruned reply', async () => {
      service.preload();
      await vi.waitFor(() => expect(FakeWorker.instances.length).toBe(1));
      const pruned = service.pruneFiles(['current.csv', 'undo.csv']);
      await postedCount(1);

      expect(worker().request('pruneFiles')['keep']).toEqual(['current.csv', 'undo.csv']);
      worker().answer('pruneFiles', { type: 'filesPruned', removed: ['old.csv'] });
      await expect(pruned).resolves.toEqual(undefined);
    });

    it('rejects when the worker reports an error for the prune request', async () => {
      service.preload();
      await vi.waitFor(() => expect(FakeWorker.instances.length).toBe(1));
      const pruned = service.pruneFiles(['a.csv']);
      await postedCount(1);

      worker().answer('pruneFiles', { type: 'error', message: 'unlink failed' });
      await expect(pruned).rejects.toThrowError('unlink failed');
    });

    it('does not restore pruned files in a new worker', async () => {
      const profiled = service.profileData('old.csv', new ArrayBuffer(1));
      const first = await postedCount(1);
      first.answer('profileData', { type: 'dataProfile', profile: {} });
      await profiled;
      const pruned = service.pruneFiles([]);
      await postedCount(2);
      first.answer('pruneFiles', { type: 'filesPruned', removed: ['old.csv'] });
      await pruned;

      first.reply({ type: 'crashed', message: 'Aborted()' });
      void service.detectDuplicates('new.csv');

      expect((await postedCount(1)).types()).toEqual(['detectDuplicates']);
    });

    it('removes an unpacked folder, and does not unpack it in a new worker', async () => {
      const unzipped = service.unzip('thumbnails-0', new Blob(['zip']));
      const first = await postedCount(1);
      first.answer('unzip', { type: 'unzipped', folder: 'thumbnails-0', images: [], duplicates: [] });
      await unzipped;
      const removed = service.removeFolder('thumbnails-0');
      await postedCount(2);
      first.answer('removeFolder', { type: 'folderRemoved', folder: 'thumbnails-0' });
      await removed;

      first.reply({ type: 'crashed', message: 'Aborted()' });
      void service.detectDuplicates('a.csv');

      expect((await postedCount(1)).types()).toEqual(['detectDuplicates']);
    });

    it('removeFolder needs no worker when none runs', async () => {
      await service.removeFolder('thumbnails-3');

      expect(FakeWorker.instances.length).toBe(0);
    });
  });
});
