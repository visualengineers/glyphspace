import { Injectable } from '@angular/core';
import { DatasetCollection } from '../shared/interfaces/dataset-collection';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { WorkerReply } from '../shared/interfaces/pyodide-messages';

@Injectable({ providedIn: 'root' })
export class DataProcessorService {
  private worker = new Worker(new URL('../workers/pyodide.worker', import.meta.url), { type: 'module' });

  private thumbCache = new Map<string, ImageBitmap>();
  private thumbSubjects = new Map<string, BehaviorSubject<ImageBitmap | null>>();

  private message$ = new Subject<WorkerReply>();
  private processingProgress$ = new Subject<{ step: string; progress: number; message: string }>();

  constructor() {
    // Route all incoming messages into Subject
    this.worker.onmessage = ({ data }) => {
      this.message$.next(data);
    };

    // Handle thumbnail responses and progress updates
    this.message$.subscribe(msg => {
      if (msg.type === 'thumb') {
        this.handleThumb(msg.file, msg.data);
      } else if (msg.type === 'error') {
        console.warn('[PyodideWorker]', msg.message);
      } else if (msg.type === 'processingProgress') {
        this.processingProgress$.next({
          step: msg.step,
          progress: msg.progress,
          message: msg.message,
        });
      }
    });
  }

  async unzip(file: File): Promise<string> {
    const result = await this.sendRequestUntil<WorkerReply & { type: 'unzipped' }>('unzipped', {
      type: 'unzip',
      fileName: file.name,
      buffer: await file.arrayBuffer(),
    });
    return result.folder;
  }

  async process(file: File): Promise<DatasetCollection> {
    const result = await this.sendRequestUntil<WorkerReply & { type: 'processed' }>('processed', {
      type: 'process',
      fileName: file.name,
      buffer: await file.arrayBuffer(),
    });
    return result.dataset;
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
      this.worker.postMessage({ type: 'getThumb', file });
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- entry is guaranteed by the thumbSubjects.set() above
    return this.thumbSubjects.get(file)!.asObservable();
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

  /**
   * Utility to wait for a specific message type (optionally filtered)
   */
  private sendRequestUntil<T extends WorkerReply>(
    type: T['type'],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- worker messages are dynamically typed
    message: any,
    matchFn: (msg: T) => boolean = () => true,
    timeoutMs = 60000
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        sub.unsubscribe();
        reject(new Error(`Worker request "${type}" timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      const sub = this.message$.subscribe(msg => {
        if (msg.type === 'error') {
          clearTimeout(timer);
          sub.unsubscribe();
          reject(msg.message);
        } else if (msg.type === type && matchFn(msg as T)) {
          clearTimeout(timer);
          sub.unsubscribe();
          resolve(msg as T);
        }
      });

      this.worker.postMessage(message);
    });
  }
}
