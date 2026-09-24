import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone, Output, EventEmitter } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Subscription } from 'rxjs';
import { PreprocessingService } from '../../services/preprocessing.service';
import { DataLoaderService } from '../../../services/data-loader.service';
import {
  BackgroundStatus,
  ProjectionCancelledError,
  ProjectionResult,
  ProjectionService,
} from '../../../services/projection.service';
import { ToastService } from '../../../services/toast.service';
import { ColumnConfig, ProjectionConfig } from '../../models/column-config';
import { DEFAULT_PROJECTION_CONFIG } from '../../models/preprocessing-state';
import { DataType, getEncodingLabel as encLabelFn, getScalingLabel as scaleLabelFn } from '../../models/data-type.enum';
import { WizardStepId, getStepInfo, stepNumber } from '../../shared/constants/step-info';
import { DataTypeBadgeComponent } from '../../shared/data-type-badge/data-type-badge.component';
import { WizardIssueCardComponent } from '../../shared/wizard-issue-card/wizard-issue-card.component';
import { WizardAnnouncer } from '../../shared/wizard-announcer.service';
import { getColorScaleById } from '../../../shared/interfaces/color-scale';
import {
  WizardIssue,
  classifyProcessingError,
  classifyBackgroundFailure,
  detectPreflightIssues,
} from '../../shared/constants/wizard-error-classes';
import {
  backgroundMethodName,
  buildBackgroundProjectionRuns,
  enabledBackgroundMethodNames,
} from './background-projections';

type ChipStatus = 'ready' | 'computing' | 'queued' | 'failed' | 'cancelled';

/** One entry in the method status bar (FastMap / PCA / UMAP / …). */
interface MethodStatus {
  name: string;
  role: string;
  status: ChipStatus;
  statusLabel: string;
}

/** One row of the background-projection status list. */
export interface BackgroundItem {
  method: string; // status key, e.g. 'tsne'
  name: string; // display name, e.g. 't-SNE'
  status: BackgroundStatus['status'];
  progress: number;
  message: string;
  canRetry: boolean;
}

/** Feature matrix handed from the primary run to the background projections. */
interface PrimaryRunFeatures {
  features: number[][];
  ids: (string | number)[];
}

const CHIP_LABELS: Record<ChipStatus, string> = {
  ready: 'Ready',
  computing: 'Computing…',
  queued: 'Queued',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

const BACKGROUND_CHIP_STATUS: Record<BackgroundStatus['status'], ChipStatus> = {
  pending: 'queued',
  running: 'computing',
  complete: 'ready',
  error: 'failed',
  cancelled: 'cancelled',
};

/** Heading of the background list; takes focus after "Stop all" removes the button. */
const BACKGROUND_HEADING_ID = 'step6-background-heading';

function methodRole(label: string): string {
  if (label.startsWith('FastMap')) return 'Primary';
  if (label === 'PCA') return 'Instant';
  if (label === 't-SNE' || label === 'Sammon') return 'Slow';
  return 'Background';
}

@Component({
  selector: 'app-step6-review-processing',
  standalone: true,
  imports: [NgTemplateOutlet, DataTypeBadgeComponent, WizardIssueCardComponent],
  templateUrl: './step6-review-processing.component.html',
  styleUrl: './step6-review-processing.component.scss',
})
export class Step6ReviewProcessingComponent implements OnInit, OnDestroy {
  @Output() wizardFinish = new EventEmitter<void>();
  getEncodingLabel = encLabelFn;
  getScalingLabel = scaleLabelFn;

  // Review/Summary data
  totalColumns = 0;
  enabledColumns = 0;
  projectionColumns = 0;
  enabledMethods: string[] = [];
  columnConfigs: ColumnConfig[] = [];
  colorFeature: string | null = null;
  colorScaleName = '';
  selectedGlyphFeatures: string[] = [];
  projectionConfig: ProjectionConfig = { ...DEFAULT_PROJECTION_CONFIG };

  // Processing state
  isProcessing = false;
  processingProgress = 0;
  processingStep = '';
  processingComplete = false;
  error: string | null = null;
  showProcessing = false;

  // Background projection status, by method key, and the list rows derived from it
  backgroundProjections = new Map<string, BackgroundStatus>();
  backgroundItems: BackgroundItem[] = [];
  readonly backgroundHeadingId = BACKGROUND_HEADING_ID;

  // A3: structured, persistent issues.
  preflightIssues: WizardIssue[] = []; // shown on the review screen before processing
  blockingIssue: WizardIssue | null = null; // primary (hard) failure — replaces the old bare "error" string
  partialIssues: WizardIssue[] = []; // degraded: some background projections failed (dismissable)
  private dismissedMethods = new Set<string>();

  // Capture dataset info for background projections (survives wizard reset)
  private backgroundDatasetName = '';
  private backgroundTimestamp = '';

  // Expose enums
  DataType = DataType;

  readonly stepInfo = getStepInfo('review');
  // Step numbers shown on the summary cards, e.g. "Step 4".
  readonly projectionStepNumber = stepNumber('projection');
  readonly appearanceStepNumber = stepNumber('appearance');

  private progressSubscription?: Subscription;
  private backgroundStatusSubscription?: Subscription;

  // True while a startProcessing() run is in flight (re-entry guard).
  private runActive = false;
  // Set in ngOnDestroy: async continuations must not touch the destroyed view.
  private destroyed = false;
  // Last processing phase read out, so progress ticks within a phase stay silent.
  private lastAnnouncedPhase = '';

  constructor(
    public preprocessingService: PreprocessingService,
    private dataLoader: DataLoaderService,
    private projectionService: ProjectionService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private announcer: WizardAnnouncer
  ) {}

  ngOnInit(): void {
    const state = this.preprocessingService.currentState;

    // Load color feature and scale
    const colorCol = Array.from(state.columnConfigs.values()).find(c => c.isColorFeature);
    this.colorFeature = colorCol?.name ?? null;
    this.colorScaleName = getColorScaleById(state.colorScaleId).name;

    // Load glyph features
    this.selectedGlyphFeatures = [...state.glyphFeatures];

    // Load projection config
    this.projectionConfig = { ...state.projectionConfig };

    // Prepare review data
    this.prepareReviewData();

    // A3: pre-flight — surface likely failures from signals already in the state.
    this.preflightIssues = detectPreflightIssues(state);

    // A3 / A11 (P-S5-02, P-S5-03): restore the persistent result/status on re-entry.
    // The service is a root singleton, so background statuses and the processed
    // dataset survive closing the wizard. Re-subscribe to keep the method bar and
    // partial-failure detection alive after reopening.
    this.backgroundStatusSubscription = this.projectionService.backgroundStatusObservable.subscribe(statusMap => {
      this.ngZone.run(() => {
        this.syncBackgroundStatus(statusMap);
        this.cdr.detectChanges();
      });
    });

    if (state.error) {
      // A previous run failed and the error survived in the singleton state.
      // Show it as a persistent, classified error screen instead of a stale banner.
      this.blockingIssue = classifyProcessingError(state.error);
      this.showProcessing = true;
      this.isProcessing = false;
      this.processingComplete = false;
    } else if (state.processedDataset) {
      // Processing already finished in an earlier session of this wizard instance:
      // restore the success/result screen rather than the "Start Processing" view.
      this.showProcessing = true;
      this.processingComplete = true;
      this.isProcessing = false;
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    if (this.progressSubscription) {
      this.progressSubscription.unsubscribe();
    }
    if (this.backgroundStatusSubscription) {
      this.backgroundStatusSubscription.unsubscribe();
    }
  }

  // ============================================================================
  // Review/Summary
  // ============================================================================

  prepareReviewData(): void {
    const state = this.preprocessingService.currentState;

    this.totalColumns = state.dataProfile?.columns.length || 0;
    this.columnConfigs = Array.from(state.columnConfigs.values());
    this.enabledColumns = this.columnConfigs.filter(c => c.enabled).length;
    this.projectionColumns = this.columnConfigs.filter(c => c.enabled && c.includeInProjection).length;

    // FastMap is always the primary projection
    this.enabledMethods = ['FastMap (Primary)', ...enabledBackgroundMethodNames(this.projectionConfig)];
  }

  // ============================================================================
  // Processing
  // ============================================================================

  private resetProcessingState(): void {
    this.processingComplete = false;
    this.isProcessing = false;
    this.processingProgress = 0;
    this.processingStep = '';
    this.error = null;
    this.showProcessing = false;
    this.blockingIssue = null;
    this.partialIssues = [];
    this.dismissedMethods.clear();
    this.lastAnnouncedPhase = '';
    // Clear any stale error left in the singleton state (P-S5-03).
    this.preprocessingService.clearError();
  }

  private updateProcessingUI(step: string, progress: number): void {
    this.ngZone.run(() => {
      this.processingStep = step;
      this.processingProgress = progress;
      this.announcePhase(step);
      this.detectChangesIfAlive();
    });
  }

  /** Read out a new processing phase once; repeated ticks of the same phase stay silent. */
  private announcePhase(phase: string): void {
    const text = phase.replace(/(\.\.\.|…)$/, '').trim();
    if (!text || text === this.lastAnnouncedPhase) {
      return;
    }
    this.lastAnnouncedPhase = text;
    this.announcer.announce(`${text}.`);
  }

  /** Render now, unless the step was destroyed while an async run continued. */
  private detectChangesIfAlive(): void {
    if (!this.destroyed) {
      this.cdr.detectChanges();
    }
  }

  /** Minimum time the loading hero stays on screen so a fast run -- or a fast
   *  failure -- is actually perceivable instead of a one-frame flash. */
  private readonly MIN_LOADING_MS = 600;

  /** Resolve after the browser has had a chance to paint, so a state change
   *  made right before heavy work is rendered first. */
  private paintYield(): Promise<void> {
    return new Promise<void>(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
  }

  /** Hold until the loading hero has been visible for at least MIN_LOADING_MS. */
  private async ensureMinVisible(startedAt: number): Promise<void> {
    const remaining = this.MIN_LOADING_MS - (performance.now() - startedAt);
    if (remaining > 0) {
      await new Promise<void>(resolve => setTimeout(resolve, remaining));
    }
  }

  async startProcessing(): Promise<void> {
    // Re-entry guard: a parallel run would race this one and its `finally`
    // would tear down this run's progress subscription.
    if (this.runActive) {
      return;
    }
    this.runActive = true;

    this.releaseEarlierBackgroundRuns();
    this.resetProcessingState();
    this.showProcessing = true;
    this.isProcessing = true;
    this.processingStep = 'Initializing...';
    this.announcer.announce('Processing started.');

    this.progressSubscription?.unsubscribe();
    const progressSubscription = this.preprocessingService.processingProgress.subscribe({
      next: progress => {
        this.processingStep = progress.message || progress.step;
        this.processingProgress = Math.min(progress.progress, 70);
        // Python's final 100 % step is not read out: FastMap still has to run,
        // and completion is announced once the dataset is loaded.
        if (progress.progress < 100) {
          this.announcePhase(progress.step);
        }
        this.detectChangesIfAlive();
      },
    });
    this.progressSubscription = progressSubscription;

    // Keep the loading hero visible for a perceptible minimum, measured from
    // here, and let the browser paint it before the heavy work begins.
    const startedAt = performance.now();
    await this.paintYield();

    try {
      // isProcessing stays up in the service for the whole primary run (not just
      // processData), so the shell keeps undo/redo disabled during FastMap too.
      const primary = await this.preprocessingService.whileProcessing(() => this.runPrimaryProcessing(startedAt));
      this.startBackgroundProjections(primary.features, primary.ids);
    } catch (error: unknown) {
      console.error('Processing failed:', error);
      await this.ensureMinVisible(startedAt);
      this.showProcessingError(error);
    } finally {
      // Only release what this run created.
      progressSubscription.unsubscribe();
      if (this.progressSubscription === progressSubscription) {
        this.progressSubscription = undefined;
      }
      this.runActive = false;
    }
  }

  /**
   * Before a new run: when reprocessing this wizard's dataset, its earlier
   * background projections are outdated, so stop them and clear their statuses
   * (Retry must not re-run old data). Otherwise they belong to a dataset that
   * was already loaded into the dashboard: let them finish, but detached.
   */
  private releaseEarlierBackgroundRuns(): void {
    if (this.preprocessingService.currentState.processedDataset) {
      this.projectionService.terminateAllWorkers();
      this.projectionService.clearBackgroundStatuses();
    } else {
      this.projectionService.detachAll();
    }
  }

  /**
   * Python processing, then the primary FastMap projection.
   *
   * Deliberately not cancellable: the Python step runs in the shared Pyodide
   * worker, and the only way to interrupt it is to terminate that worker, which
   * drops the loaded Python runtime (a slow reload) and the uploaded file held
   * in its virtual FS, so the user would have to upload again. FastMap runs
   * synchronously on the main thread and cannot be interrupted either. Only the
   * optional background projections (one worker each) offer Cancel.
   */
  private async runPrimaryProcessing(startedAt: number): Promise<PrimaryRunFeatures> {
    await this.preprocessingService.processData();

    this.updateProcessingUI('Loading features for projections...', 70);

    const csvText = await this.preprocessingService.getProcessedFeaturesCSV();
    const { features, ids } = this.projectionService.parseCSVFeatures(csvText);

    this.updateProcessingUI('Computing FastMap projection...', 75);

    // Use FastMap as the primary projection
    const fastmapResult = await this.projectionService.runFastMapSync(features, ids);

    this.updateProcessingUI('Loading dataset with FastMap...', 90);

    await this.preprocessingService.addProjectionPositions('fastmap', fastmapResult.positions);

    await this.ensureMinVisible(startedAt);
    this.ngZone.run(() => {
      this.processingProgress = 100;
      this.processingStep = `Dataset loaded with FastMap (${fastmapResult.computeTime}ms)`;
      this.processingComplete = true;
      this.isProcessing = false;
      this.announcer.announce('Processing complete. Your visualization is ready to open in Glyphspace.');
      this.detectChangesIfAlive();
    });

    return { features, ids };
  }

  private showProcessingError(error: unknown): void {
    this.ngZone.run(() => {
      const raw = error instanceof Error ? error.message : String(error);
      this.error = raw;
      // A3: classify into a persistent, actionable issue (cause + fix + target step).
      // Screen readers hear it through the error panel's role="alert" (an
      // assertive announcement including the cause); announcing it through the
      // WizardAnnouncer as well would read the failure twice.
      this.blockingIssue = classifyProcessingError(raw);
      this.isProcessing = false;
      this.processingComplete = false;
      this.detectChangesIfAlive();
    });
  }

  private startBackgroundProjections(features: number[][], ids: (string | number)[]): void {
    // Capture dataset info so background projections can add positions even after wizard reset
    const state = this.preprocessingService.currentState;
    this.backgroundDatasetName = state.datasetName;
    this.backgroundTimestamp = state.timestamp;

    // Note: the background-status subscription is created once in ngOnInit so it
    // also restores the method bar after the wizard is reopened.
    const runs = buildBackgroundProjectionRuns(this.projectionService, this.projectionConfig, features, ids);
    for (const { name, run } of runs) {
      void this.runBackgroundProjection(name, run);
    }
  }

  private async runBackgroundProjection(name: string, computeFn: () => Promise<ProjectionResult>): Promise<void> {
    try {
      const result = await computeFn();

      // Convert positions to the format expected by DataProvider
      const positionsForProvider = result.positions.map(p => ({
        id: p.id,
        position: { x: p.x, y: p.y },
      }));

      // Try to add to wizard state first (if still active)
      await this.preprocessingService.addProjectionPositions(result.method, result.positions);

      const state = this.preprocessingService.currentState;
      if (state.processedDataset) {
        // Wizard still active - update via normal flow
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- processedDataset is an opaque structure from Python processing
        const collection = state.processedDataset as any;
        const datasetKey =
          collection.selectedDataset || (collection.datasets ? Object.keys(collection.datasets)[0] : null);

        if (datasetKey && collection.datasets) {
          const dataset = collection.datasets[datasetKey];
          if (dataset) {
            this.dataLoader.addProcessedDatasetToCollection(state.datasetName, state.timestamp, dataset);
            this.dataLoader.loadProcessedDataset(dataset, state.datasetName, state.timestamp);
          }
        }
      } else if (this.backgroundDatasetName && this.backgroundTimestamp) {
        // Wizard was reset but dataset is already loaded in dashboard
        this.dataLoader.addPositionsToLoadedDataset(
          this.backgroundDatasetName,
          this.backgroundTimestamp,
          result.method,
          positionsForProvider
        );
        // Re-save to IndexedDB with the new projection included
        this.dataLoader.saveDatasetToStorage(this.backgroundDatasetName, this.backgroundTimestamp);
      }

      this.ngZone.run(() => {
        this.toastService.success(`${name} projection ready! (${(result.computeTime / 1000).toFixed(1)}s)`, 4000);
      });
    } catch (error: unknown) {
      if (error instanceof ProjectionCancelledError) {
        // Stopped on purpose (Cancel / Stop all / superseded); the status list shows it.
        return;
      }
      const raw = error instanceof Error ? error.message : String(error);
      console.error(`${name} projection failed:`, error);
      this.ngZone.run(() => {
        // A3 review fix: never surface the raw technical message in the toast.
        // Use the classified, everyday-language title; the full WHY/FIX and the
        // raw detail live in the partial-issue card's collapsible section.
        const issue = classifyBackgroundFailure(name, raw);
        this.toastService.error(issue.title, 6000);
      });
    }
  }

  goToDashboard(): void {
    const state = this.preprocessingService.currentState;

    if (state.processedDataset) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- processedDataset is an opaque structure from Python processing
      const collection = state.processedDataset as any;
      const datasetKey =
        collection.selectedDataset || (collection.datasets ? Object.keys(collection.datasets)[0] : null);

      if (!datasetKey || !collection.datasets) {
        this.error = 'Invalid dataset structure. Please try processing again.';
        return;
      }

      const dataset = collection.datasets[datasetKey];

      if (dataset) {
        this.dataLoader.addProcessedDatasetToCollection(state.datasetName, state.timestamp, dataset);
        this.dataLoader.loadProcessedDataset(dataset, state.datasetName, state.timestamp);
        // Persist to IndexedDB for cross-session survival
        this.dataLoader.saveDatasetToStorage(state.datasetName, state.timestamp);
      } else {
        this.error = 'Failed to load processed dataset';
        return;
      }
    }

    // Running background projections keep going for the dashboard, but can no
    // longer be cancelled or retried from the (reset) wizard.
    this.projectionService.detachAll();

    // Reset wizard state so it's ready for a new upload
    this.preprocessingService.resetState();

    this.wizardFinish.emit();
  }

  goBack(): void {
    this.preprocessingService.previousStep();
  }

  // A6: jump from a review summary card back to the step that owns that setting
  // and scroll the relevant section into view.
  editSetting(step: WizardStepId, targetId: string): void {
    this.preprocessingService.goToStepWithScroll(step, targetId);
  }

  startOver(): void {
    if (confirm('Are you sure you want to start over? All current configuration will be lost.')) {
      // Terminate any running background projection workers
      this.projectionService.terminateAllWorkers();
      this.projectionService.clearBackgroundStatuses();

      // Clear local state
      this.backgroundProjections = new Map();
      this.backgroundItems = [];
      this.resetProcessingState();

      // Reset wizard state
      this.preprocessingService.resetState();
      this.preprocessingService.goToStep('upload');
    }
  }

  // ============================================================================
  // Background projections: cancel / stop all / retry
  // ============================================================================

  /** True while at least one background projection is computing. */
  get hasRunningBackground(): boolean {
    return this.backgroundItems.some(item => item.status === 'running');
  }

  /** Id shared by an item's Cancel and Retry button (only one is shown at a time). */
  backgroundActionId(method: string): string {
    return `step6-background-action-${method}`;
  }

  /** Cancel one running background projection; focus moves to its Retry button. */
  cancelBackgroundProjection(method: string): void {
    if (!this.projectionService.cancel(method)) {
      return;
    }
    this.announcer.announce(`${backgroundMethodName(method)} cancelled. You can retry it.`);
    this.focusElement(this.backgroundActionId(method));
  }

  /** Cancel every running background projection. */
  stopAllBackgroundProjections(): void {
    const stopped = this.projectionService.terminateAllWorkers();
    if (stopped.length === 0) {
      return;
    }
    const noun = stopped.length === 1 ? 'projection' : 'projections';
    this.announcer.announce(`Stopped ${stopped.length} background ${noun}.`);
    this.focusElement(BACKGROUND_HEADING_ID);
  }

  /** Re-run one cancelled or failed background projection with the same data and settings. */
  retryBackgroundProjection(method: string): void {
    if (!this.projectionService.canRetry(method)) {
      return;
    }
    const name = backgroundMethodName(method);
    this.dismissedMethods.delete(method);
    this.announcer.announce(`Retrying ${name}.`);
    void this.runBackgroundProjection(name, () => this.projectionService.retry(method));
    this.focusElement(this.backgroundActionId(method));
  }

  /** Keep keyboard focus in the list after the pressed button was replaced or removed. */
  private focusElement(id: string): void {
    this.detectChangesIfAlive();
    document.getElementById(id)?.focus();
  }

  // ============================================================================
  // A3: persistent status/error screen
  // ============================================================================

  /** Adopt the latest background statuses, rebuild the list rows and the
   *  degraded/partial issue list from any failed background projection. */
  private syncBackgroundStatus(statusMap: Map<string, BackgroundStatus>): void {
    this.backgroundProjections = new Map(statusMap);
    this.backgroundItems = Array.from(statusMap.entries()).map(([method, s]) => ({
      method,
      name: backgroundMethodName(method),
      status: s.status,
      progress: s.progress,
      message: s.message,
      canRetry: this.projectionService.canRetry(method),
    }));
    this.partialIssues = Array.from(statusMap.entries())
      .filter(([method, s]) => s.status === 'error' && !this.dismissedMethods.has(method))
      .map(([method, s]) => classifyBackgroundFailure(method, s.error || s.message));
  }

  /** True once processing succeeded but at least one background projection failed. */
  get isPartialResult(): boolean {
    return this.processingComplete && !this.isProcessing && this.partialIssues.length > 0;
  }

  /** True when the primary run failed (hard, blocking error screen). */
  get isErrorScreen(): boolean {
    return !!this.blockingIssue && !this.isProcessing;
  }

  /** Method status bar (FastMap primary + enabled background methods). */
  get methodStatuses(): MethodStatus[] {
    return this.enabledMethods.map(label => {
      const status = label.startsWith('FastMap') ? this.primaryChipStatus() : this.backgroundChipStatus(label);
      return {
        name: label.replace(' (Primary)', ''),
        role: methodRole(label),
        status,
        statusLabel: CHIP_LABELS[status],
      };
    });
  }

  private primaryChipStatus(): ChipStatus {
    if (this.blockingIssue) return 'failed';
    if (this.processingComplete) return 'ready';
    if (this.isProcessing) return 'computing';
    return 'queued';
  }

  private backgroundChipStatus(label: string): ChipStatus {
    // Background status keys are lowercase alphanumeric ids (e.g. "tsne").
    const key = label.toLowerCase().replace(/[^a-z0-9]/g, '');
    const bg = this.backgroundProjections.get(key);
    if (bg) {
      return BACKGROUND_CHIP_STATUS[bg.status];
    }
    // Not tracked via the worker status stream (e.g. PCA runs instantly):
    // assume ready once the primary run has finished, otherwise queued.
    return this.processingComplete ? 'ready' : 'queued';
  }

  /** "Fix in step N" — reuse the A6 jump/scroll logic and confirm with a toast. */
  fixInStep(issue: WizardIssue): void {
    const number = stepNumber(issue.step);
    const stepName = getStepInfo(issue.step).title;
    if (issue.anchorId) {
      this.preprocessingService.goToStepWithScroll(issue.step, issue.anchorId);
    } else {
      this.preprocessingService.goToStep(issue.step);
    }
    this.toastService.info(`Opening Step ${number} · ${stepName}`, 2500);
  }

  /** Dismiss a partial (optional) issue so the degraded notice can be cleared. */
  dismissIssue(issue: WizardIssue): void {
    const method = this.getMethodForPartialIssue(issue);
    if (method) this.dismissedMethods.add(method);
    this.partialIssues = this.partialIssues.filter(i => i !== issue);
  }

  private getMethodForPartialIssue(issue: WizardIssue): string | null {
    // Titles are "<METHOD> could not be computed".
    const match = issue.title.match(/^(\S+) could not be computed/);
    return match ? match[1].toLowerCase() : null;
  }

  /**
   * Retry / reprocess, keeping all uploaded data and settings. Reachable from
   * both the blocking-error screen and the success screen.
   *
   * A3 review fix: the earlier version only called startProcessing(), so a fast
   * run looked like a brief flash with no confirmation that anything happened.
   * We now announce the retry with a toast and force the processing hero to show
   * (isProcessing/showProcessing) before the async work begins, so the user
   * clearly sees the spinner + progress + method status while it re-runs.
   */
  retryProcessing(): void {
    this.toastService.info('Restarting processing…', 3000);
    // Make the processing state visible immediately, even before startProcessing's
    // own reset runs, so the transition is never just a flicker.
    this.showProcessing = true;
    this.isProcessing = true;
    this.processingComplete = false;
    this.blockingIssue = null;
    this.processingStep = 'Restarting processing…';
    this.cdr.detectChanges();
    this.startProcessing();
  }
}
