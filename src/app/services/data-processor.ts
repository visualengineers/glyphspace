import { Injectable } from '@angular/core';
import { DatasetCollection } from '../shared/interfaces/dataset-collection';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { WorkerReply, WorkerRequest } from '../shared/interfaces/pyodide-messages';

/**
 * A worker reply as received on the main thread. Replies to a request sent via
 * sendRequestUntil() echo that request's `requestId` (see pyodide.worker.ts).
 */
type TaggedWorkerReply = WorkerReply & { requestId?: number };

/**
 * The state of the Python runtime: no worker yet (or it was replaced and none
 * is needed yet), loading Pyodide and its packages, ready, or loading failed.
 */
export type PythonRuntimeStatus = 'idle' | 'starting' | 'ready' | 'failed';

/** Time one request may take once the worker has started it (see 'started'). */
const REQUEST_TIMEOUT_MS = 60_000;

/**
 * Time the worker may take to load Pyodide, pandas and scikit-learn (about
 * 40 MB) before it is given up. Generous: a slow connection needs minutes, and
 * requests do not count this time against their own timeout.
 */
const STARTUP_TIMEOUT_MS = 10 * 60_000;

/** A request waiting for its reply. */
interface PendingRequest {
  type: WorkerReply['type'];
  matches: (msg: TaggedWorkerReply) => boolean;
  resolve: (msg: TaggedWorkerReply) => void;
  reject: (error: Error) => void;
  timeoutMs: number;
  timer?: ReturnType<typeof setTimeout>;
}

/**
 * The client of the Pyodide worker (pyodide.worker.ts).
 *
 * The worker is created on first need (a request, or preload() when the wizard
 * opens), so a visitor who only looks at the bundled datasets never downloads
 * the Python runtime. Each request's timeout starts when the worker begins
 * handling it, so neither the runtime's start-up nor the requests queued ahead
 * count against it.
 *
 * The worker's file system holds files this service wrote: the uploaded CSV
 * files (profileData) and the unpacked image archives (unzip). The service
 * keeps their contents, so when the worker has to be replaced (it crashed, or a
 * request timed out and is still running in it), the new worker gets the same
 * files before any further request: callers see their pending requests fail,
 * but not the next ones.
 */
@Injectable({ providedIn: 'root' })
export class DataProcessorService {
  private worker: Worker | null = null;
  /** Resolves once the current worker is created and has its files back. */
  private workerReady: Promise<Worker> | null = null;
  private startupTimer?: ReturnType<typeof setTimeout>;
  private status$ = new BehaviorSubject<PythonRuntimeStatus>('idle');

  /** Uploaded input files by name: what a new worker must be given again. */
  private inputs = new Map<string, Blob>();
  /** Image archives by the worker folder they are unpacked into. */
  private archives = new Map<string, Blob>();

  private thumbCache = new Map<string, ImageBitmap>();
  private thumbSubjects = new Map<string, BehaviorSubject<ImageBitmap | null>>();

  // Monotonic id attached to every request so its reply can be matched even when
  // several requests expecting the same reply type are in flight.
  private nextRequestId = 0;
  private pending = new Map<number, PendingRequest>();
  private processingProgress$ = new Subject<{ step: string; progress: number; message: string }>();

  /** The state of the Python runtime (see PythonRuntimeStatus). */
  get runtimeStatus(): Observable<PythonRuntimeStatus> {
    return this.status$.asObservable();
  }

  /** Start the worker now, so Python is ready when the wizard needs it. */
  preload(): void {
    this.ensureWorker().catch(error => console.warn('[PyodideWorker] The worker could not be started:', error));
  }

  /**
   * Unpack the image files of a ZIP archive into the worker folder `folder`;
   * returns their names. Once unpacked, the archive is kept, so a replaced
   * worker gets the folder again.
   */
  async unzip(folder: string, archive: Blob): Promise<string[]> {
    const result = await this.sendRequestUntil<WorkerReply & { type: 'unzipped' }>(
      'unzipped',
      { type: 'unzip', folder, buffer: await archive.arrayBuffer() },
      msg => msg.folder === folder
    );
    this.archives.set(folder, archive); // the worker holds the folder now
    if (result.duplicates.length > 0) {
      console.warn(
        `[PyodideWorker] ${result.duplicates.length} archive files repeat an image name and were skipped:`,
        result.duplicates
      );
    }
    return result.images;
  }

  /** Delete an unpacked folder (see unzip) that is no longer used. */
  async removeFolder(folder: string): Promise<void> {
    this.archives.delete(folder);
    if (!this.workerReady) {
      return; // no worker, so no folder
    }
    await this.sendRequestUntil<WorkerReply & { type: 'folderRemoved' }>(
      'folderRemoved',
      { type: 'removeFolder', folder },
      msg => msg.folder === folder
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- returns dynamically typed JSON from the worker filesystem
  async fetchJson(file: string): Promise<any> {
    const result = await this.sendRequestUntil<WorkerReply & { type: 'json' }>(
      'json',
      {
        type: 'getJson',
        file,
      },
      msg => msg.file === file
    );
    return result.data;
  }

  // Preprocessing methods
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- returns dynamically shaped profile data from Python
  async profileData(fileName: string, buffer: ArrayBuffer): Promise<any> {
    const result = await this.sendRequestUntil<WorkerReply & { type: 'dataProfile' }>('dataProfile', {
      type: 'profileData',
      fileName,
      buffer,
    });
    // The worker holds the file now. A Blob keeps the content for a replaced
    // worker without holding a second ArrayBuffer in memory.
    this.inputs.set(fileName, new Blob([buffer]));
    return result.profile;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- returns dynamically shaped histogram data from Python
  async computeHistogram(fileName: string, columnName: string, bins = 50): Promise<any> {
    const result = await this.sendRequestUntil<WorkerReply & { type: 'histogram' }>(
      'histogram',
      {
        type: 'computeHistogram',
        fileName,
        columnName,
        bins,
      },
      msg => msg.columnName === columnName
    );
    return result.data;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- returns dynamically shaped outlier data from Python
  async detectOutliers(fileName: string, columnName: string, method: string): Promise<any> {
    const result = await this.sendRequestUntil<WorkerReply & { type: 'outliers' }>(
      'outliers',
      {
        type: 'detectOutliers',
        fileName,
        columnName,
        method,
      },
      msg => msg.columnName === columnName
    );
    return result.data;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- returns dynamically shaped duplicate data from Python
  async detectDuplicates(fileName: string, subsetColumns?: string[]): Promise<any> {
    const result = await this.sendRequestUntil<WorkerReply & { type: 'duplicates' }>(
      'duplicates',
      {
        type: 'detectDuplicates',
        fileName,
        subsetColumns,
      },
      msg => msg.type === 'duplicates'
    );
    return result.data;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- config is a dynamic processing configuration object
  async processWithConfig(fileName: string, config: any): Promise<DatasetCollection> {
    const result = await this.sendRequestUntil<WorkerReply & { type: 'processed' }>('processed', {
      type: 'processWithConfig',
      fileName,
      config,
    });
    return result.dataset;
  }

  /**
   * Get processed features CSV exported by Python for JavaScript projections
   * This is called after processWithConfig to retrieve the feature matrix
   */
  async getProcessedFeatures(): Promise<string> {
    const result = await this.sendRequestUntil<WorkerReply & { type: 'processedFeatures' }>('processedFeatures', {
      type: 'getProcessedFeatures',
    });
    return result.data;
  }

  /**
   * Delete uploaded input files (and their derived result files) from the
   * worker's virtual FS, except those listed in `keep`. The caller passes every
   * file name still referenced by the current state and the undo/redo history.
   */
  async pruneFiles(keep: string[]): Promise<void> {
    const keepSet = new Set(keep);
    for (const fileName of this.inputs.keys()) {
      if (!keepSet.has(fileName)) this.inputs.delete(fileName);
    }
    if (!this.workerReady) {
      return; // no worker, so no files to delete
    }
    await this.sendRequestUntil<WorkerReply & { type: 'filesPruned' }>('filesPruned', {
      type: 'pruneFiles',
      keep,
    });
  }

  /**
   * Observable for processing progress updates
   */
  get processingProgress(): Observable<{ step: string; progress: number; message: string }> {
    return this.processingProgress$.asObservable();
  }

  /**
   * Reactive thumbnail access — use in rendering logic
   */
  requestThumb(file: string): Observable<ImageBitmap | null> {
    if (this.thumbCache.has(file)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- guarded by `if (this.thumbCache.has(file))` above
      return of(this.thumbCache.get(file)!);
    }

    if (!this.thumbSubjects.has(file)) {
      const subject = new BehaviorSubject<ImageBitmap | null>(null);
      this.thumbSubjects.set(file, subject);
      void this.postThumbRequest(file);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- entry is guaranteed by the thumbSubjects.set() above
    return this.thumbSubjects.get(file)!.asObservable();
  }

  // -- The worker ------------------------------------------------------------

  /** The worker, created on first use; a replaced worker first gets the files back. */
  private ensureWorker(): Promise<Worker> {
    this.workerReady ??= this.startWorker().catch((error: unknown) => {
      this.workerReady = null; // let the next request try again
      throw error;
    });
    return this.workerReady;
  }

  private async startWorker(): Promise<Worker> {
    const worker = this.createWorker();
    this.worker = worker;
    this.status$.next('starting');
    worker.onmessage = ({ data }: MessageEvent<TaggedWorkerReply>) => this.handleMessage(worker, data);
    worker.onerror = (event: ErrorEvent) => {
      event.preventDefault();
      this.replaceWorker(worker, `the Python worker failed: ${event.message || 'unknown error'}`);
    };
    worker.onmessageerror = () => this.replaceWorker(worker, 'a message from the Python worker could not be read');
    this.startupTimer = setTimeout(() => {
      this.replaceWorker(worker, `Python did not start within ${STARTUP_TIMEOUT_MS / 60_000} minutes`, false);
      this.status$.next('failed');
    }, STARTUP_TIMEOUT_MS);
    await this.restoreFiles(worker);
    return worker;
  }

  /** Separate from startWorker so the bundler sees the `new Worker(new URL(...))` pattern. */
  private createWorker(): Worker {
    return new Worker(new URL('../workers/pyodide.worker', import.meta.url), { type: 'module' });
  }

  /**
   * Give a new worker the files the previous one held. The requests are queued
   * in the worker ahead of everything sent later, which waits for workerReady.
   */
  private async restoreFiles(worker: Worker): Promise<void> {
    const restore = (message: WorkerRequest, type: WorkerReply['type']) =>
      this.post(worker, message, type, () => true, REQUEST_TIMEOUT_MS).catch(error =>
        console.warn('[PyodideWorker] A file could not be restored in the new worker:', error)
      );
    for (const [fileName, content] of this.inputs) {
      void restore({ type: 'putFile', fileName, buffer: await content.arrayBuffer() }, 'filePut');
    }
    for (const [folder, archive] of this.archives) {
      void restore({ type: 'unzip', folder, buffer: await archive.arrayBuffer() }, 'unzipped');
    }
  }

  /**
   * Fail every pending request with `reason` and drop the worker; the next
   * request starts a new one. After a crash or a timeout, thumbnails still
   * waiting are requested again right away (`retryThumbs`); after a failed
   * start-up they are not, or an unreachable CDN would be retried in a loop.
   */
  private replaceWorker(worker: Worker, reason: string, retryThumbs = true): void {
    if (this.worker !== worker) {
      return; // already replaced
    }
    clearTimeout(this.startupTimer);
    worker.terminate();
    this.worker = null;
    this.workerReady = null;
    this.status$.next('idle');

    const pending = Array.from(this.pending.values());
    this.pending.clear();
    for (const request of pending) {
      clearTimeout(request.timer);
      request.reject(new Error(reason));
    }

    if (retryThumbs) {
      for (const file of Array.from(this.thumbSubjects.keys())) {
        void this.postThumbRequest(file);
      }
    }
  }

  private handleMessage(worker: Worker, msg: TaggedWorkerReply): void {
    if (worker !== this.worker) {
      return; // a late message from a replaced worker
    }
    switch (msg.type) {
      case 'ready':
        clearTimeout(this.startupTimer);
        this.status$.next('ready');
        return;
      case 'startupFailed':
        this.replaceWorker(worker, `Python could not be loaded: ${msg.message}`, false);
        this.status$.next('failed');
        return;
      case 'crashed':
        this.replaceWorker(worker, `the Python worker stopped after a fatal error: ${msg.message}`);
        return;
      case 'thumb':
        void this.handleThumb(msg.file, msg.data);
        return;
      case 'error':
        console.warn('[PyodideWorker]', msg.message);
        break;
      case 'processingProgress':
        // Only progress of a request still waiting: never of a request already given up.
        if (msg.requestId !== undefined && this.pending.has(msg.requestId)) {
          this.processingProgress$.next({ step: msg.step, progress: msg.progress, message: msg.message });
        }
        return;
    }
    this.settle(worker, msg);
  }

  /** Match a reply to its pending request: start its timeout, or resolve or reject it. */
  private settle(worker: Worker, msg: TaggedWorkerReply): void {
    const request = msg.requestId === undefined ? undefined : this.pending.get(msg.requestId);
    if (!request || msg.requestId === undefined) {
      return;
    }
    const requestId = msg.requestId;
    if (msg.type === 'started') {
      request.timer = setTimeout(() => {
        request.reject(new Error(`Worker request "${request.type}" timed out after ${request.timeoutMs}ms`));
        this.pending.delete(requestId);
        // The request keeps running in the worker and would hold up every later
        // one: replace the worker (its files are restored).
        this.replaceWorker(worker, `the Python worker was restarted after a request timed out`);
      }, request.timeoutMs);
    } else if (msg.type === 'error') {
      this.finish(requestId, request);
      // Wrap the worker message in an Error so the real cause survives the
      // `instanceof Error` check downstream (was rejected as a bare string,
      // which forced the generic "Processing failed" fallback).
      request.reject(new Error(typeof msg.message === 'string' ? msg.message : 'Worker reported an error'));
    } else if (msg.type === request.type && request.matches(msg)) {
      this.finish(requestId, request);
      request.resolve(msg);
    }
  }

  private finish(requestId: number, request: PendingRequest): void {
    clearTimeout(request.timer);
    this.pending.delete(requestId);
  }

  /**
   * Send a request and wait for its reply of the given type (optionally filtered).
   * Replies are matched by a per-request id that the worker echoes back, so
   * concurrent requests of the same reply type (e.g. two processWithConfig runs,
   * which both answer with 'processed') never resolve or reject with each other's
   * replies.
   */
  private async sendRequestUntil<T extends WorkerReply>(
    type: T['type'],
    message: WorkerRequest,
    matchFn: (msg: T) => boolean = () => true,
    timeoutMs = REQUEST_TIMEOUT_MS
  ): Promise<T> {
    const worker = await this.ensureWorker();
    return this.post(worker, message, type, matchFn as (msg: TaggedWorkerReply) => boolean, timeoutMs) as Promise<T>;
  }

  private post(
    worker: Worker,
    message: WorkerRequest,
    type: WorkerReply['type'],
    matches: (msg: TaggedWorkerReply) => boolean,
    timeoutMs: number
  ): Promise<TaggedWorkerReply> {
    if (worker !== this.worker) {
      // Replaced while the caller waited for it (it crashed while getting its files back).
      return Promise.reject(new Error('The Python worker was restarted; try again.'));
    }
    const requestId = ++this.nextRequestId;
    return new Promise<TaggedWorkerReply>((resolve, reject) => {
      this.pending.set(requestId, { type, matches, resolve, reject, timeoutMs });
      worker.postMessage({ ...message, requestId });
    });
  }

  private async postThumbRequest(file: string): Promise<void> {
    // getThumb is fire-and-forget: its 'thumb' reply is routed by file name.
    try {
      const worker = await this.ensureWorker();
      worker.postMessage({ type: 'getThumb', file } satisfies WorkerRequest);
    } catch (error) {
      console.warn(`[PyodideWorker] The image "${file}" could not be requested:`, error);
    }
  }

  /**
   * Handle incoming thumbnail data
   */
  private async handleThumb(file: string, buffer: ArrayBuffer) {
    try {
      const blob = new Blob([new Uint8Array(buffer)], {
        type: this.guessMimeType(file),
      });
      const img = await createImageBitmap(blob);
      this.thumbCache.set(file, img);

      const subject = this.thumbSubjects.get(file);
      if (subject) {
        subject.next(img);
        subject.complete();
        this.thumbSubjects.delete(file);
      }
    } catch (err) {
      console.error(`Failed to decode thumbnail "${file}":`, err);
    }
  }

  private guessMimeType(file: string): string {
    if (file.endsWith('.png')) return 'image/png';
    if (file.endsWith('.jpg') || file.endsWith('.jpeg')) return 'image/jpeg';
    if (file.endsWith('.webp')) return 'image/webp';
    return 'application/octet-stream';
  }
}
