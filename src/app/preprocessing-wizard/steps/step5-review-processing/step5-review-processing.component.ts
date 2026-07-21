import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone, Output, EventEmitter } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Subscription } from 'rxjs';
import { PreprocessingService } from '../../services/preprocessing.service';
import { DataLoaderService } from '../../../services/data-loader.service';
import { ProjectionService, ProjectionResult } from '../../../services/projection.service';
import { ToastService } from '../../../services/toast.service';
import { ColumnConfig, ProjectionConfig } from '../../models/column-config';
import { DataType, getEncodingLabel as encLabelFn, getScalingLabel as scaleLabelFn } from '../../models/data-type.enum';
import { STEP_INFO } from '../../shared/constants/step-info';
import { DataTypeBadgeComponent } from '../../shared/data-type-badge/data-type-badge.component';
import { WizardIssueCardComponent } from '../../shared/wizard-issue-card/wizard-issue-card.component';
import {
  WizardIssue,
  STEP_NAMES,
  classifyProcessingError,
  classifyBackgroundFailure,
  detectPreflightIssues,
} from '../../shared/constants/wizard-error-classes';

/** One entry in the method status bar (FastMap / PCA / UMAP / …). */
interface MethodStatus {
  name: string;
  role: string;
  status: 'ready' | 'computing' | 'queued' | 'failed';
  statusLabel: string;
}

@Component({
  selector: 'app-step5-review-processing',
  standalone: true,
  imports: [NgTemplateOutlet, DataTypeBadgeComponent, WizardIssueCardComponent],
  templateUrl: './step5-review-processing.component.html',
  styleUrl: './step5-review-processing.component.scss',
})
export class Step5ReviewProcessingComponent implements OnInit, OnDestroy {
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
  selectedGlyphFeatures: string[] = [];
  projectionConfig!: ProjectionConfig;

  // Processing state
  isProcessing = false;
  processingProgress = 0;
  processingStep = '';
  processingComplete = false;
  error: string | null = null;
  showProcessing = false;

  // Background projection status
  backgroundProjections = new Map<string, { status: string; progress: number; message: string; error?: string }>();

  // A3: structured, persistent issues.
  preflightIssues: WizardIssue[] = []; // shown on the review screen before processing
  blockingIssue: WizardIssue | null = null; // primary (hard) failure — replaces the old bare "error" string
  partialIssues: WizardIssue[] = []; // degraded: some background projections failed (dismissable)
  private dismissedMethods = new Set<string>();
  private expandedTechnical = new Set<string>();

  readonly STEP_NAMES = STEP_NAMES;

  // Capture dataset info for background projections (survives wizard reset)
  private backgroundDatasetName = '';
  private backgroundTimestamp = '';

  // Expose enums
  DataType = DataType;

  readonly stepInfo = STEP_INFO[4]; // Step 5 (index 4)

  private progressSubscription?: Subscription;
  private backgroundStatusSubscription?: Subscription;

  constructor(
    public preprocessingService: PreprocessingService,
    private dataLoader: DataLoaderService,
    private projectionService: ProjectionService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    const state = this.preprocessingService.currentState;

    // Load color feature
    const colorCol = Array.from(state.columnConfigs.values()).find(c => c.isColorFeature);
    this.colorFeature = colorCol?.name ?? null;

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
    this.enabledMethods = ['FastMap (Primary)'];
    if (this.projectionConfig.enablePCA) this.enabledMethods.push('PCA');
    if (this.projectionConfig.enableIsoMap) this.enabledMethods.push('IsoMap');
    if (this.projectionConfig.enableMDS) this.enabledMethods.push('MDS');
    if (this.projectionConfig.enableLLE) this.enabledMethods.push('LLE');
    if (this.projectionConfig.enableLTSA) this.enabledMethods.push('LTSA');
    if (this.projectionConfig.enableTSNE) this.enabledMethods.push('t-SNE');
    if (this.projectionConfig.enableUMAP) this.enabledMethods.push('UMAP');
    if (this.projectionConfig.enableTriMap) this.enabledMethods.push('TriMap');
    if (this.projectionConfig.enableTopoMap) this.enabledMethods.push('TopoMap');
    if (this.projectionConfig.enableSammon) this.enabledMethods.push('Sammon');
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
    this.expandedTechnical.clear();
    // Clear any stale error left in the singleton state (P-S5-03).
    this.preprocessingService.clearError();
  }

  private updateProcessingUI(step: string, progress: number): void {
    this.ngZone.run(() => {
      this.processingStep = step;
      this.processingProgress = progress;
      this.cdr.detectChanges();
    });
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
    this.resetProcessingState();
    this.showProcessing = true;
    this.isProcessing = true;
    this.processingStep = 'Initializing...';

    this.progressSubscription = this.preprocessingService.processingProgress.subscribe({
      next: progress => {
        this.processingStep = progress.message || progress.step;
        this.processingProgress = Math.min(progress.progress, 70);
        this.cdr.detectChanges();
      },
    });

    // Keep the loading hero visible for a perceptible minimum, measured from
    // here, and let the browser paint it before the heavy work begins.
    const startedAt = performance.now();
    await this.paintYield();

    try {
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
        this.cdr.detectChanges();
      });

      this.startBackgroundProjections(features, ids);
    } catch (error: unknown) {
      console.error('Processing failed:', error);
      await this.ensureMinVisible(startedAt);
      this.ngZone.run(() => {
        const raw = error instanceof Error ? error.message : String(error);
        this.error = raw;
        // A3: classify into a persistent, actionable issue (cause + fix + target step).
        this.blockingIssue = classifyProcessingError(raw);
        this.isProcessing = false;
        this.processingComplete = false;
        this.cdr.detectChanges();
      });
    } finally {
      if (this.progressSubscription) {
        this.progressSubscription.unsubscribe();
        this.progressSubscription = undefined;
      }
    }
  }

  private async startBackgroundProjections(features: number[][], ids: (string | number)[]): Promise<void> {
    const config = this.projectionConfig;

    // Capture dataset info so background projections can add positions even after wizard reset
    const state = this.preprocessingService.currentState;
    this.backgroundDatasetName = state.datasetName;
    this.backgroundTimestamp = state.timestamp;

    // Note: the background-status subscription is created once in ngOnInit so it
    // also restores the method bar after the wizard is reopened.

    // Data-driven projection registry: each entry maps a config flag to its runner
    const projections: { enabled: boolean; name: string; run: () => Promise<ProjectionResult> }[] = [
      { enabled: config.enablePCA, name: 'PCA', run: () => this.projectionService.runPCABackground(features, ids) },
      {
        enabled: config.enableIsoMap,
        name: 'IsoMap',
        run: () => this.projectionService.runIsoMap(features, ids, { neighbors: config.isomapNeighbors }),
      },
      { enabled: config.enableMDS, name: 'MDS', run: () => this.projectionService.runMDS(features, ids) },
      {
        enabled: config.enableLLE,
        name: 'LLE',
        run: () => this.projectionService.runLLE(features, ids, { neighbors: config.lleNeighbors }),
      },
      {
        enabled: config.enableLTSA,
        name: 'LTSA',
        run: () => this.projectionService.runLTSA(features, ids, { neighbors: config.ltsaNeighbors }),
      },
      {
        enabled: config.enableTSNE,
        name: 't-SNE',
        run: () =>
          this.projectionService.runTSNE(features, ids, {
            perplexity: config.tsnePerplexity,
            iterations: config.tsneIterations,
          }),
      },
      {
        enabled: config.enableUMAP,
        name: 'UMAP',
        run: () =>
          this.projectionService.runUMAP(features, ids, {
            neighbors: config.umapNeighbors,
            minDist: config.umapMinDist,
          }),
      },
      {
        enabled: config.enableTriMap,
        name: 'TriMap',
        run: () => this.projectionService.runTriMap(features, ids, { weightAdj: config.trimapWeightAdj }),
      },
      { enabled: config.enableTopoMap, name: 'TopoMap', run: () => this.projectionService.runTopoMap(features, ids) },
      { enabled: config.enableSammon, name: 'Sammon', run: () => this.projectionService.runSammon(features, ids) },
    ];

    for (const proj of projections) {
      if (proj.enabled) {
        this.runBackgroundProjection(proj.name, proj.run);
      }
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

    // Reset wizard state so it's ready for a new upload
    this.preprocessingService.resetState();

    this.wizardFinish.emit();
  }

  goBack(): void {
    this.preprocessingService.previousStep();
  }

  // A6: jump from a review summary card back to the step that owns that setting
  // and scroll the relevant section into view.
  editSetting(step: number, targetId: string): void {
    this.preprocessingService.goToStepWithScroll(step, targetId);
  }

  startOver(): void {
    if (confirm('Are you sure you want to start over? All current configuration will be lost.')) {
      // Terminate any running background projection workers
      this.projectionService.terminateAllWorkers();
      this.projectionService.clearBackgroundStatuses();

      // Clear local state
      this.backgroundProjections.clear();
      this.resetProcessingState();

      // Reset wizard state
      this.preprocessingService.resetState();
      this.preprocessingService.goToStep(0);
    }
  }

  getBackgroundProjectionsArray(): { method: string; status: string; progress: number; message: string }[] {
    const result: { method: string; status: string; progress: number; message: string }[] = [];
    this.backgroundProjections.forEach((value, key) => {
      result.push({ method: key, ...value });
    });
    return result;
  }

  // ============================================================================
  // A3: persistent status/error screen
  // ============================================================================

  /** Copy the latest background status into the local map and rebuild the
   *  degraded/partial issue list from any failed background projections. */
  private syncBackgroundStatus(
    statusMap: Map<string, { status: string; progress: number; message: string; error?: string }>
  ): void {
    this.backgroundProjections.clear();
    statusMap.forEach((status, method) => {
      this.backgroundProjections.set(method, {
        status: status.status,
        progress: status.progress,
        message: status.message,
        error: status.error,
      });
    });

    this.partialIssues = [];
    this.backgroundProjections.forEach((value, method) => {
      if (value.status === 'error' && !this.dismissedMethods.has(method)) {
        this.partialIssues.push(classifyBackgroundFailure(method, value.error || value.message));
      }
    });
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
    const roleFor = (name: string): string => {
      if (name.startsWith('FastMap')) return 'Primary';
      if (name === 'PCA') return 'Instant';
      if (name === 't-SNE' || name === 'Sammon') return 'Slow';
      return 'Background';
    };

    return this.enabledMethods.map(label => {
      const isPrimary = label.startsWith('FastMap');
      // Background status keys are lowercase alphanumeric ids (e.g. "tsne").
      const key = label
        .replace(' (Primary)', '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
      let status: MethodStatus['status'];

      if (isPrimary) {
        if (this.blockingIssue) status = 'failed';
        else if (this.processingComplete) status = 'ready';
        else if (this.isProcessing) status = 'computing';
        else status = 'queued';
      } else {
        const bg = this.backgroundProjections.get(key);
        if (bg) {
          if (bg.status === 'complete') status = 'ready';
          else if (bg.status === 'running') status = 'computing';
          else if (bg.status === 'error') status = 'failed';
          else status = 'queued';
        } else {
          // Not tracked via the worker status stream (e.g. PCA runs instantly):
          // assume ready once the primary run has finished, otherwise queued.
          status = this.processingComplete ? 'ready' : 'queued';
        }
      }

      const labels: Record<MethodStatus['status'], string> = {
        ready: 'Ready',
        computing: 'Computing…',
        queued: 'Queued',
        failed: 'Failed',
      };

      return { name: label.replace(' (Primary)', ''), role: roleFor(label), status, statusLabel: labels[status] };
    });
  }

  /** "Fix in Schritt N" — reuse the A6 jump/scroll logic and confirm with a toast. */
  fixInStep(issue: WizardIssue): void {
    const stepNumber = issue.step + 1;
    const stepName = STEP_NAMES[issue.step] ?? '';
    if (issue.anchorId) {
      this.preprocessingService.goToStepWithScroll(issue.step, issue.anchorId);
    } else {
      this.preprocessingService.goToStep(issue.step);
    }
    this.toastService.info(`Opening Step ${stepNumber} · ${stepName}`, 2500);
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

  toggleTechnical(id: string): void {
    if (this.expandedTechnical.has(id)) this.expandedTechnical.delete(id);
    else this.expandedTechnical.add(id);
  }

  isTechnicalExpanded(id: string): boolean {
    return this.expandedTechnical.has(id);
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
    this.toastService.info('Verarbeitung wird erneut gestartet…', 3000);
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
