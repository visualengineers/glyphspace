import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as druid from '@saehrimnir/druidjs';
import {
  ProjectionMethod,
  ProjectionResult,
  ProjectionWorkerRequest,
  ProjectionWorkerResponse,
} from '../shared/types/projection.types';

// Re-export types for backward compatibility
export type {
  ProjectionMethod,
  ProjectionResult,
  ProjectionComputeConfig,
  ProjectionWorkerRequest,
  ProjectionWorkerResponse,
} from '../shared/types/projection.types';

export interface BackgroundStatus {
  method: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  progress: number;
  message: string;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectionService {
  private backgroundStatus$ = new BehaviorSubject<Map<string, BackgroundStatus>>(new Map());
  private workers = new Map<string, Worker>();

  constructor(private ngZone: NgZone) {}

  /**
   * Run PCA (fast, blocking) - runs synchronously on main thread
   */
  async runPCA(features: number[][], ids: (string | number)[]): Promise<ProjectionResult> {
    const startTime = Date.now();

    try {
      // DruidJS PCA: new druid.PCA(data, components).transform()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- DruidJS type definitions are incomplete
      const pca = new (druid as any).PCA(features, 2); // 2 components for 2D visualization
      const embedding = pca.transform();

      const positions = embedding.map((coords: number[], i: number) => ({
        id: ids[i],
        x: coords[0],
        y: coords[1],
      }));

      return {
        method: 'pca',
        positions,
        computeTime: Date.now() - startTime,
      };
    } catch (error: unknown) {
      throw new Error(`PCA failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Run FastMap (blocking) - PRIMARY projection for dashboard
   * Fast distance-preserving projection with O(n) complexity
   * Ideal for large datasets (40K+ items)
   */
  async runFastMapSync(features: number[][], ids: (string | number)[]): Promise<ProjectionResult> {
    const startTime = Date.now();

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- DruidJS type definitions are incomplete
      const fastmap = new (druid as any).FASTMAP(features, 2);
      const embedding = fastmap.transform();

      const positions = embedding.map((coords: number[], i: number) => ({
        id: ids[i],
        x: coords[0],
        y: coords[1],
      }));

      return {
        method: 'fastmap',
        positions,
        computeTime: Date.now() - startTime,
      };
    } catch (error: unknown) {
      throw new Error(`FastMap failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Run IsoMap (blocking) - Non-linear manifold learning
   * Preserves geodesic distances - slower than FastMap but better structure preservation
   */
  async runIsoMapSync(features: number[][], ids: (string | number)[]): Promise<ProjectionResult> {
    const startTime = Date.now();

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- DruidJS type definitions are incomplete
      const isomap = new (druid as any).ISOMAP(features, 2);
      const embedding = isomap.transform();

      const positions = embedding.map((coords: number[], i: number) => ({
        id: ids[i],
        x: coords[0],
        y: coords[1],
      }));

      return {
        method: 'isomap',
        positions,
        computeTime: Date.now() - startTime,
      };
    } catch (error: unknown) {
      throw new Error(`IsoMap failed: ${error instanceof Error ? error.message : String(error)}`);
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
   * Run TriMap (background) - Good for large datasets
   */
  async runTriMap(
    features: number[][],
    ids: (string | number)[],
    config?: { weightAdj?: number }
  ): Promise<ProjectionResult> {
    return this.runProjectionInWorker(
      'trimap',
      features,
      ids,
      config ? { trimapWeightAdj: config.weightAdj } : undefined
    );
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
  private async runProjectionInWorker(
    method: ProjectionMethod,
    features: number[][],
    ids: (string | number)[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- config varies per projection method
    config?: any
  ): Promise<ProjectionResult> {
    return new Promise((resolve, reject) => {
      // Create worker for this projection
      const worker = new Worker(new URL('../workers/projection.worker', import.meta.url), {
        type: 'module',
      });

      this.workers.set(method, worker);
      this.updateBackgroundStatus(method, 'running', 0, `Starting ${method.toUpperCase()}...`);

      // Handle messages from worker
      worker.onmessage = ({ data }: MessageEvent<ProjectionWorkerResponse>) => {
        this.ngZone.run(() => {
          if (data.type === 'progress') {
            // Update progress status
            this.updateBackgroundStatus(
              method,
              'running',
              data.progress || 0,
              data.message || `Computing ${method}...`
            );
          } else if (data.type === 'result') {
            // Computation complete
            this.updateBackgroundStatus(method, 'complete', 100, `${method} complete`);
            worker.terminate();
            this.workers.delete(method);
            resolve({
              // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ProjectionMethod type narrowing not available here
              method: method as any,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- guaranteed present when data.type === 'result'
              positions: data.positions!,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- guaranteed present when data.type === 'result'
              computeTime: data.computeTime!,
            });
          } else if (data.type === 'error') {
            // Error occurred
            this.updateBackgroundStatus(method, 'error', 0, `${method} failed`, data.error);
            worker.terminate();
            this.workers.delete(method);
            reject(new Error(`${method} failed: ${data.error}`));
          }
        });
      };

      worker.onerror = error => {
        this.ngZone.run(() => {
          this.updateBackgroundStatus(method, 'error', 0, `${method} worker error`, error.message);
          worker.terminate();
          this.workers.delete(method);
          reject(new Error(`${method} worker error: ${error.message}`));
        });
      };

      // Send computation request to worker
      const request: ProjectionWorkerRequest = {
        type: 'compute',
        method,
        features,
        ids,
        config,
      };
      worker.postMessage(request);
    });
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
      throw new Error(`Failed to parse CSV features: ${error instanceof Error ? error.message : String(error)}`);
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
   * Clear all background statuses
   */
  clearBackgroundStatuses(): void {
    this.backgroundStatus$.next(new Map());
  }

  /**
   * Terminate all running workers
   */
  terminateAllWorkers(): void {
    this.workers.forEach((worker, _method) => {
      worker.terminate();
    });
    this.workers.clear();
  }
}
