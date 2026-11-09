import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DruidModule, druidSpecFor, runDruidProjection } from '../workers/druid-runner';
import {
  ProjectionComputeConfig,
  ProjectionMethod,
  ProjectionResult,
  ProjectionWorkerRequest,
  ProjectionWorkerResponse,
} from '../shared/types/projection.types';

// Re-exported for consumers that import it alongside ProjectionService
export type { ProjectionResult } from '../shared/types/projection.types';

export interface BackgroundStatus {
  method: string;
  status: 'pending' | 'running' | 'complete' | 'error' | 'cancelled';
  progress: number;
  message: string;
  error?: string;
}

/** Rejection reason of a background projection that was stopped on purpose (cancel / terminateAllWorkers). */
export class ProjectionCancelledError extends Error {
  constructor(readonly method: string) {
    super(`${method} was cancelled`);
    this.name = 'ProjectionCancelledError';
  }
}

/** Everything needed to start, or re-start, one background projection. */
interface ProjectionRequest {
  method: ProjectionMethod;
  features: number[][];
  ids: (string | number)[];
  config?: ProjectionComputeConfig;
}

/** One background projection computing in its own worker. */
interface ProjectionJob {
  worker: Worker;
  request: ProjectionRequest;
  reject: (reason: Error) => void;
  /** Set once the job finished or was cancelled; later worker messages are ignored. */
  ended: boolean;
}

/**
 * Loads DruidJS on first use. A dynamic import keeps the library (with its
 * inlined WASM kernels) out of the initial bundle; only FastMap needs it on the
 * main thread, every other method loads it inside its worker.
 */
function loadDruid(): Promise<DruidModule> {
  return import('@saehrimnir/druidjs');
}

/**
 * Computes 2D projections. The primary FastMap projection runs synchronously on
 * the main thread (runFastMapSync) and cannot be interrupted; every optional
 * method runs in its own Web Worker, so it can be cancelled (cancel /
 * terminateAllWorkers) and re-run with the same data and settings (retry).
 */
@Injectable({
  providedIn: 'root',
})
export class ProjectionService {
  private backgroundStatus$ = new BehaviorSubject<Map<string, BackgroundStatus>>(new Map());
  /**
   * The controllable job per method: the latest one started and not yet
   * detached. An earlier job of the same method, or a job released by
   * detachAll(), keeps computing and reporting on its own.
   */
  private jobs = new Map<string, ProjectionJob>();
  /**
   * The latest request per method, kept for retry() until that method completes
   * or detachAll() is called. All entries of one run share the same feature
   * matrix, so this keeps at most one matrix alive.
   */
  private requests = new Map<string, ProjectionRequest>();

  constructor(private ngZone: NgZone) {}

  /**
   * Run FastMap (blocking) - PRIMARY projection for dashboard
   * Fast distance-preserving projection with O(n) complexity
   * Ideal for large datasets (40K+ items)
   *
   * DruidJS is loaded on the first call (see loadDruid), then FastMap runs
   * synchronously on the main thread. computeTime includes that load, in whole ms.
   */
  async runFastMapSync(features: number[][], ids: (string | number)[]): Promise<ProjectionResult> {
    try {
      const { positions, computeTime } = await runDruidProjection(loadDruid, druidSpecFor('fastmap'), features, ids);
      return { method: 'fastmap', positions, computeTime: Math.round(computeTime) };
    } catch (error: unknown) {
      throw new Error(`FastMap failed: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
    }
  }

  /**
   * Run FastMap (background) - runs in Web Worker
   */
  async runFastMap(features: number[][], ids: (string | number)[]): Promise<ProjectionResult> {
    return this.runProjectionInWorker('fastmap', features, ids);
  }

  /**
   * Run IsoMap (background) - runs in Web Worker
   * Non-linear manifold learning projection
   */
  async runIsoMap(
    features: number[][],
    ids: (string | number)[],
    config?: { neighbors?: number }
  ): Promise<ProjectionResult> {
    return this.runProjectionInWorker(
      'isomap',
      features,
      ids,
      config ? { isomapNeighbors: config.neighbors } : undefined
    );
  }

  /**
   * Run PCA in background (Web Worker) - for when IsoMap is primary
   */
  async runPCABackground(features: number[][], ids: (string | number)[]): Promise<ProjectionResult> {
    return this.runProjectionInWorker('pca', features, ids);
  }

  /**
   * Run t-SNE (slow, background) - runs in Web Worker
   * Preserves local structure - great for finding clusters
   */
  async runTSNE(
    features: number[][],
    ids: (string | number)[],
    config: { perplexity: number; iterations: number }
  ): Promise<ProjectionResult> {
    return this.runProjectionInWorker('tsne', features, ids, config);
  }

  /**
   * Run UMAP (slow, background) - runs in Web Worker
   * Balances local and global structure
   */
  async runUMAP(
    features: number[][],
    ids: (string | number)[],
    config: { neighbors: number; minDist: number }
  ): Promise<ProjectionResult> {
    return this.runProjectionInWorker('umap', features, ids, config);
  }

  /**
   * Run MDS (background) - Classical Multidimensional Scaling
   */
  async runMDS(features: number[][], ids: (string | number)[]): Promise<ProjectionResult> {
    return this.runProjectionInWorker('mds', features, ids);
  }

  /**
   * Run LLE (background) - Locally Linear Embedding
   */
  async runLLE(
    features: number[][],
    ids: (string | number)[],
    config?: { neighbors?: number }
  ): Promise<ProjectionResult> {
    return this.runProjectionInWorker('lle', features, ids, config ? { lleNeighbors: config.neighbors } : undefined);
  }

  /**
   * Run LTSA (background) - Local Tangent Space Alignment
   */
  async runLTSA(
    features: number[][],
    ids: (string | number)[],
    config?: { neighbors?: number }
  ): Promise<ProjectionResult> {
    return this.runProjectionInWorker('ltsa', features, ids, config ? { ltsaNeighbors: config.neighbors } : undefined);
  }

  /**
   * Run TriMap (background) - Good for large datasets. Uses DruidJS's defaults.
   */
  async runTriMap(features: number[][], ids: (string | number)[]): Promise<ProjectionResult> {
    return this.runProjectionInWorker('trimap', features, ids);
  }

  /**
   * Run TopoMap (background) - Topology preserving
   */
  async runTopoMap(features: number[][], ids: (string | number)[]): Promise<ProjectionResult> {
    return this.runProjectionInWorker('topomap', features, ids);
  }

  /**
   * Run Sammon (background) - Sammon mapping
   */
  async runSammon(features: number[][], ids: (string | number)[]): Promise<ProjectionResult> {
    return this.runProjectionInWorker('sammon', features, ids);
  }

  /**
   * Run a projection in a Web Worker (non-blocking)
   */
  private runProjectionInWorker(
    method: ProjectionMethod,
    features: number[][],
    ids: (string | number)[],
    config?: ProjectionComputeConfig
  ): Promise<ProjectionResult> {
    return this.startJob({ method, features, ids, config });
  }

  /**
   * Start one background projection in a fresh worker; it becomes the method's
   * controllable job. A still-running earlier job of the same method is not
   * stopped (it may belong to a dataset already handed to the dashboard): it
   * keeps computing, reports its status and settles its own promise.
   */
  private startJob(request: ProjectionRequest): Promise<ProjectionResult> {
    const { method } = request;
    this.requests.set(method, request);

    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL('../workers/projection.worker', import.meta.url), {
        type: 'module',
      });
      const job: ProjectionJob = { worker, request, reject, ended: false };
      this.jobs.set(method, job);
      this.updateBackgroundStatus(method, 'running', 0, `Starting ${method.toUpperCase()}...`);

      worker.onmessage = ({ data }: MessageEvent<ProjectionWorkerResponse>) => {
        this.ngZone.run(() => this.handleWorkerMessage(job, data, resolve));
      };
      worker.onerror = (event: ErrorEvent) => {
        this.ngZone.run(() => this.failJob(job, `${method} worker error`, event.message));
      };

      const message: ProjectionWorkerRequest = {
        type: 'compute',
        method,
        features: request.features,
        ids: request.ids,
        config: request.config,
      };
      worker.postMessage(message);
    });
  }

  private handleWorkerMessage(
    job: ProjectionJob,
    data: ProjectionWorkerResponse,
    resolve: (result: ProjectionResult) => void
  ): void {
    const { method } = job.request;
    if (job.ended) {
      return; // a late message from a cancelled worker
    }
    if (data.type === 'progress') {
      this.updateBackgroundStatus(method, 'running', data.progress || 0, data.message || `Computing ${method}...`);
    } else if (data.type === 'result') {
      this.endJob(job);
      if (this.requests.get(method) === job.request) {
        this.requests.delete(method);
      }
      this.updateBackgroundStatus(method, 'complete', 100, `${method} complete`);
      resolve({ method, positions: data.positions ?? [], computeTime: data.computeTime ?? 0 });
    } else if (data.type === 'error') {
      this.failJob(job, `${method} failed`, data.error ?? 'Unknown error');
    }
  }

  /** The worker reported an error: end the job, mark the method failed (retryable) and reject. */
  private failJob(job: ProjectionJob, summary: string, detail: string): void {
    if (job.ended) {
      return;
    }
    this.endJob(job);
    this.updateBackgroundStatus(job.request.method, 'error', 0, summary, detail);
    job.reject(new Error(`${summary}: ${detail}`));
  }

  /** Terminate the job's worker and, if it is still the method's controllable job, forget it. */
  private endJob(job: ProjectionJob): void {
    job.ended = true;
    job.worker.terminate();
    if (this.jobs.get(job.request.method) === job) {
      this.jobs.delete(job.request.method);
    }
  }

  /**
   * Cancel the running background projection of `method`: terminate its worker,
   * reject its pending promise with ProjectionCancelledError and mark its status
   * 'cancelled'. The request is kept, so retry() can run it again. Returns false
   * when the method has no controllable running job.
   */
  cancel(method: string): boolean {
    const job = this.jobs.get(method);
    if (!job) {
      return false;
    }
    this.endJob(job);
    job.reject(new ProjectionCancelledError(method));
    this.updateBackgroundStatus(method, 'cancelled', 0, 'Cancelled');
    return true;
  }

  /** True while a controllable background projection of `method` is computing. */
  isRunning(method: string): boolean {
    return this.jobs.has(method);
  }

  /** True when retry() can re-run `method`: its last run was cancelled or failed. */
  canRetry(method: string): boolean {
    return !this.jobs.has(method) && this.requests.has(method);
  }

  /** Re-run the last (cancelled or failed) request of `method` with the same data and settings. */
  retry(method: string): Promise<ProjectionResult> {
    const request = this.requests.get(method);
    if (!request) {
      return Promise.reject(new Error(`There is no previous ${method} run to retry`));
    }
    return this.startJob(request);
  }

  /**
   * Hand every running projection over, e.g. once the wizard passes its dataset
   * to the dashboard or starts on a new one: the jobs keep computing and
   * reporting their status, but can no longer be cancelled or retried.
   */
  detachAll(): void {
    this.jobs.clear();
    this.requests.clear();
  }

  /**
   * Parse CSV features exported from Python
   * Format: ID,feature1,feature2,...
   */
  parseCSVFeatures(csvText: string): { features: number[][]; ids: (string | number)[] } {
    try {
      const lines = csvText.trim().split('\n');

      if (lines.length < 2) {
        throw new Error('CSV file is empty or has no data rows');
      }

      // Skip header line
      const dataLines = lines.slice(1);

      const ids: (string | number)[] = [];
      const features: number[][] = [];

      for (const line of dataLines) {
        if (!line.trim()) continue; // Skip empty lines

        const values = line.split(',');
        if (values.length < 2) {
          console.warn('Skipping line with insufficient columns:', line);
          continue;
        }

        // First column is ID
        const id = values[0];
        ids.push(isNaN(Number(id)) ? id : Number(id));

        // Remaining columns are features
        const featureRow = values.slice(1).map(v => {
          const num = parseFloat(v);
          if (isNaN(num)) {
            throw new Error(`Invalid numeric value in features: ${v}`);
          }
          return num;
        });

        features.push(featureRow);
      }

      if (features.length === 0) {
        throw new Error('No valid feature data found in CSV');
      }

      return { features, ids };
    } catch (error: unknown) {
      throw new Error(`Failed to parse CSV features: ${error instanceof Error ? error.message : String(error)}`, {
        cause: error,
      });
    }
  }

  /**
   * Initialize background status for a projection method
   */
  initializeBackgroundStatus(method: string): void {
    this.updateBackgroundStatus(method, 'pending', 0, 'Waiting to start...');
  }

  /**
   * Update background status for a projection method
   */
  private updateBackgroundStatus(
    method: string,
    status: BackgroundStatus['status'],
    progress: number,
    message: string,
    error?: string
  ): void {
    this.ngZone.run(() => {
      const statusMap = this.backgroundStatus$.value;
      statusMap.set(method, { method, status, progress, message, error });
      this.backgroundStatus$.next(new Map(statusMap));
    });
  }

  /**
   * Get current status of a background projection
   */
  getBackgroundStatus(method: string): BackgroundStatus | undefined {
    return this.backgroundStatus$.value.get(method);
  }

  /**
   * Get observable of all background projection statuses
   */
  get backgroundStatusObservable(): Observable<Map<string, BackgroundStatus>> {
    return this.backgroundStatus$.asObservable();
  }

  /**
   * Clear all background statuses (and the requests kept for retry)
   */
  clearBackgroundStatuses(): void {
    this.requests.clear();
    this.backgroundStatus$.next(new Map());
  }

  /**
   * Cancel every running background projection (see cancel()); each is marked
   * 'cancelled'. Returns the methods that were stopped.
   */
  terminateAllWorkers(): string[] {
    return Array.from(this.jobs.keys()).filter(method => this.cancel(method));
  }
}
