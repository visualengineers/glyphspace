import { Injectable, Injector, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PreprocessingService } from './preprocessing.service';
import { storeProjectionPositions } from './processing-config';
import { uniqueDatasetName } from './dataset-name';
import { ProcessedCollection, processedDatasetOf } from '../models/processed-collection';
import { ProjectionConfig } from '../models/column-config';
import { DataLoaderService } from '../../services/data-loader.service';
import { ProjectionCancelledError, ProjectionResult, ProjectionService } from '../../services/projection.service';
import { ThumbnailService } from '../../services/thumbnail.service';
import { ToastService } from '../../services/toast.service';
import { classifyBackgroundFailure } from '../shared/constants/wizard-error-classes';
import {
  backgroundMethodName,
  buildBackgroundProjectionRuns,
} from '../steps/step6-review-processing/background-projections';

export type RunPhase = 'processing' | 'complete' | 'failed';

/** What the review step shows of the current processing run. */
export interface RunStatus {
  /** Increases with every run, so a status of one run is never taken for another's. */
  readonly id: number;
  readonly phase: RunPhase;
  /** Progress of the primary run (Python, then FastMap), 0–100. */
  readonly progress: number;
  /** The current phase, read out once by screen readers; '' before the first one. */
  readonly stage: string;
  /** The line under the progress bar, or the result summary once complete. */
  readonly message: string;
  /** Raw message of a failed run. */
  readonly error: string | null;
}

/** One press of Start Processing (or Reprocess, Try again). */
interface Run {
  readonly id: number;
  /** PreprocessingService.processingInputsKey when the run started. */
  readonly inputs: string;
  readonly datasetName: string;
  readonly timestamp: string;
  readonly projectionConfig: ProjectionConfig;
  status: RunStatus;
  promise: Promise<void>;
  /** The run's own result; background projections add their positions to it. */
  collection: ProcessedCollection | null;
  /** The item-image ZIP chosen when the run started. */
  archive: Blob | undefined;
  /** Where the dataset went, once "Open in Glyphspace" handed it to the dashboard. */
  handedOver: { name: string; timestamp: string } | null;
  /** Outdated: its file or settings changed, the wizard was reset or a new run started. */
  discarded: boolean;
}

/** Resolves after the browser has painted, so a phase shown before heavy main-thread work is seen. */
function nextPaint(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Owns the processing run of the wizard: Python processing, the primary FastMap
 * projection, the background projections, and the hand-over to the dashboard.
 *
 * Every run keeps its own dataset (name, timestamp, collection): whatever
 * finishes later, a background projection above all, acts on the run it
 * belongs to, never on whatever the wizard holds at that time. A run is
 * discarded as soon as the file or a setting it was started for changes (or
 * the wizard is reset); its background projections are cancelled then, unless
 * it was already handed to the dashboard, which receives them. The review step
 * only renders `status$` and the projection statuses, so closing and reopening
 * the wizard during a run shows that run.
 */
@Injectable({ providedIn: 'root' })
export class ProcessingRunService {
  /** Minimum time a run stays in the processing phase, so a fast run or failure is perceivable. */
  minimumRunMs = 600;

  private lastRunId = 0;
  private current: Run | null = null;
  private readonly statusSubject = new BehaviorSubject<RunStatus | null>(null);
  readonly status$: Observable<RunStatus | null> = this.statusSubject.asObservable();

  constructor(
    private preprocessing: PreprocessingService,
    private projections: ProjectionService,
    private dataLoader: DataLoaderService,
    private toast: ToastService,
    private ngZone: NgZone,
    private injector: Injector
  ) {
    this.preprocessing.state$.subscribe(() => this.discardIfOutdated());
  }

  /** Status of the current run; null when there is none (or it was discarded). */
  get status(): RunStatus | null {
    return this.statusSubject.value;
  }

  /**
   * Process the uploaded file with the current settings. While a run is in its
   * processing phase, a further call joins it. An earlier, finished run is
   * replaced: its result and background projections are outdated.
   */
  start(): Promise<void> {
    if (this.current && this.current.status.phase === 'processing') {
      return this.current.promise;
    }
    this.discard();

    const state = this.preprocessing.currentState;
    const id = ++this.lastRunId;
    const run: Run = {
      id,
      inputs: this.preprocessing.processingInputsKey,
      datasetName: state.datasetName,
      timestamp: state.timestamp,
      projectionConfig: { ...state.projectionConfig },
      status: { id, phase: 'processing', progress: 0, stage: '', message: 'Initializing...', error: null },
      promise: Promise.resolve(),
      collection: null,
      archive: undefined,
      handedOver: null,
      discarded: false,
    };
    this.current = run;
    this.statusSubject.next(run.status);
    run.promise = this.execute(run);
    return run.promise;
  }

  /**
   * Drop the current run: it no longer shows, its result is cleared and its
   * background projections are cancelled. A run already handed to the
   * dashboard is not current any more and keeps going.
   */
  discard(): void {
    const run = this.current;
    if (!run) return;
    run.discarded = true;
    this.current = null;
    this.projections.terminateAllWorkers();
    this.projections.clearBackgroundStatuses();
    this.preprocessing.clearProcessingResult();
    this.statusSubject.next(null);
  }

  /**
   * "Open in Glyphspace": add the result to the dashboard's datasets, show it
   * there and keep it in IndexedDB (with the item images chosen in Step 1, or
   * without any), then reset the wizard. Running background projections keep
   * computing for that dataset. Returns false when there is no current result.
   */
  openInDashboard(): boolean {
    const run = this.current;
    const dataset = run?.collection ? processedDatasetOf(run.collection) : undefined;
    if (!run || run.discarded || run.status.phase !== 'complete' || !dataset) {
      return false;
    }
    // The name was free at upload time; keep a dataset created since then intact.
    const name = uniqueDatasetName(run.datasetName, this.dataLoader.getDataSetNames());
    const timestamp = run.timestamp;
    run.handedOver = { name, timestamp };

    // Before the dataset loads, so it never shows the images of an earlier dataset of that name.
    this.handOverImages(run, name);
    this.dataLoader.addProcessedDatasetToCollection(name, timestamp, dataset);
    this.dataLoader.loadProcessedDataset(dataset, name, timestamp);
    void this.dataLoader.saveDatasetToStorage(name, timestamp);

    // They keep computing for the dashboard, but leave the wizard's status list.
    this.projections.detachAll();
    this.current = null;
    this.statusSubject.next(null);
    this.preprocessing.resetState();
    return true;
  }

  /** Cancel one background projection of the current run. */
  cancelBackground(method: string): boolean {
    return this.projections.cancel(method);
  }

  /** Cancel every background projection of the current run; returns the methods stopped. */
  stopAllBackground(): string[] {
    return this.projections.terminateAllWorkers();
  }

  /** Re-run one cancelled or failed background projection of the current, finished run. */
  retryBackground(method: string): boolean {
    const run = this.current;
    if (!run || run.status.phase !== 'complete' || !this.projections.canRetry(method)) {
      return false;
    }
    this.track(run, backgroundMethodName(method), this.projections.retry(method));
    return true;
  }

  // ── The run ────────────────────────────────────────────────────────────

  private discardIfOutdated(): void {
    const run = this.current;
    if (run && run.inputs !== this.preprocessing.processingInputsKey) {
      this.discard();
    }
  }

  private isCurrent(run: Run): boolean {
    return this.current === run && !run.discarded;
  }

  private publish(run: Run, changes: Partial<RunStatus>): void {
    run.status = { ...run.status, ...changes };
    if (this.current === run) {
      this.ngZone.run(() => this.statusSubject.next(run.status));
    }
  }

  private advance(run: Run, progress: number, phase: string): void {
    this.publish(run, { progress, stage: phase, message: phase });
  }

  private async execute(run: Run): Promise<void> {
    const startedAt = performance.now();
    const progress = this.preprocessing.processingProgress.subscribe(update => {
      if (!this.isCurrent(run) || run.status.phase !== 'processing') return;
      this.publish(run, {
        progress: Math.min(update.progress, 70),
        message: update.message || update.step,
        // Python's final 100 % is not a phase of its own: FastMap still has to run.
        stage: update.progress < 100 ? update.step : run.status.stage,
      });
    });
    try {
      // isProcessing stays up for the whole primary run, FastMap included, so
      // undo/redo stay blocked until the result is complete.
      await this.preprocessing.whileProcessing(() => this.runPrimary(run, startedAt));
    } catch (error: unknown) {
      if (!this.isCurrent(run)) return;
      console.error('Processing failed:', error);
      await this.holdMinimum(startedAt);
      if (this.isCurrent(run)) this.publish(run, { phase: 'failed', error: errorText(error) });
    } finally {
      progress.unsubscribe();
    }
  }

  /**
   * Python processing, then the primary FastMap projection, then the background
   * projections. Stops quietly whenever the run was discarded meanwhile.
   *
   * Not cancellable: the Python step runs in the shared Pyodide worker, and the
   * only way to interrupt it is to terminate that worker, which drops the loaded
   * Python runtime (a slow reload) and the uploaded file held in its virtual FS.
   * FastMap runs synchronously on the main thread and cannot be interrupted
   * either. Only the background projections (one worker each) can be cancelled.
   */
  private async runPrimary(run: Run, startedAt: number): Promise<void> {
    run.archive = await this.preprocessing.thumbnailArchive();
    const collection = await this.preprocessing.processInWorker();
    if (!this.isCurrent(run)) return;

    this.advance(run, 70, 'Loading features for projections...');
    const csvText = await this.preprocessing.getProcessedFeaturesCSV();
    const { features, ids } = this.projections.parseCSVFeatures(csvText);
    if (!this.isCurrent(run)) return;

    this.advance(run, 75, 'Computing FastMap projection...');
    // FastMap blocks the main thread: let the phase render first.
    await nextPaint();
    if (!this.isCurrent(run)) return;
    const fastmap = await this.projections.runFastMapSync(features, ids);
    if (!this.isCurrent(run)) return;

    this.advance(run, 90, 'Preparing the dataset...');
    storeProjectionPositions(collection, 'fastmap', fastmap.positions);
    run.collection = collection;
    if (!this.preprocessing.adoptProcessingResult(collection, run.inputs)) {
      this.discard();
      return;
    }

    await this.holdMinimum(startedAt);
    if (!this.isCurrent(run)) return;
    this.publish(run, {
      phase: 'complete',
      progress: 100,
      message: `FastMap layout ready (${fastmap.computeTime} ms)`,
    });

    const background = buildBackgroundProjectionRuns(this.projections, run.projectionConfig, features, ids);
    for (const { name, run: compute } of background) {
      this.track(run, name, compute());
    }
  }

  private async holdMinimum(startedAt: number): Promise<void> {
    const remaining = this.minimumRunMs - (performance.now() - startedAt);
    if (remaining > 0) {
      await new Promise<void>(resolve => setTimeout(resolve, remaining));
    }
  }

  // ── Background projections ─────────────────────────────────────────────

  /** Deliver a background projection to the run it belongs to when it finishes. */
  private track(run: Run, name: string, computation: Promise<ProjectionResult>): void {
    computation.then(
      result => this.ngZone.run(() => this.deliver(run, name, result)),
      (error: unknown) => this.ngZone.run(() => this.reportFailure(run, name, error))
    );
  }

  private deliver(run: Run, name: string, result: ProjectionResult): void {
    if (run.discarded) return;
    if (run.handedOver) {
      // The dataset is in the dashboard: add the layout there and keep it.
      const { name: dataset, timestamp } = run.handedOver;
      const positions = result.positions.map(p => ({ id: p.id, position: { x: p.x, y: p.y } }));
      if (!this.dataLoader.addPositionsToLoadedDataset(dataset, timestamp, result.method, positions)) {
        return; // deleted meanwhile
      }
      void this.dataLoader.saveDatasetToStorage(dataset, timestamp);
    } else if (run.collection) {
      // Still in the wizard: part of the dataset once it is opened.
      storeProjectionPositions(run.collection, result.method, result.positions);
    }
    this.toast.success(`${name} projection ready! (${(result.computeTime / 1000).toFixed(1)}s)`, 4000);
  }

  private reportFailure(run: Run, name: string, error: unknown): void {
    if (error instanceof ProjectionCancelledError || run.discarded) {
      return; // stopped on purpose, or outdated; the status list shows a cancel
    }
    console.error(`${name} projection failed:`, error);
    // The classified, everyday-language title only; the details are in the
    // partial-issue card of the review step.
    this.toast.error(classifyBackgroundFailure(name, errorText(error)).title, 6000);
  }

  // ── Item images ─────────────────────────────────────────────────────────

  /**
   * Keep the run's item-image ZIP with the dataset, or make sure the dataset
   * has none: an archive stored under the name earlier must not show up.
   */
  private handOverImages(run: Run, dataset: string): void {
    if (!run.archive) {
      void this.injector.get(ThumbnailService).detachArchive(dataset);
      return;
    }
    this.dataLoader
      .attachThumbnails(dataset, run.archive)
      .then(count =>
        this.ngZone.run(() => {
          if (count > 0) {
            this.toast.success(`${count} item images added for the Image glyph type.`, 4000);
          } else {
            this.toast.warning('The image ZIP contains no JPG, PNG or WebP pictures.');
          }
        })
      )
      .catch((error: unknown) => console.warn('[ProcessingRunService] The item images could not be kept:', error));
  }
}
