import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  NgZone,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Subscription } from 'rxjs';
import { PreprocessingService } from '../../services/preprocessing.service';
import { ProcessingRunService, RunStatus } from '../../services/processing-run.service';
import { BackgroundStatus, ProjectionService } from '../../../services/projection.service';
import { ToastService } from '../../../services/toast.service';
import { ColumnConfig, ProjectionConfig, isFeatureColumn, isMetadataColumn } from '../../models/column-config';
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
  detectStartBlockers,
} from '../../shared/constants/wizard-error-classes';
import { backgroundMethodName, enabledBackgroundMethodNames } from './background-projections';

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

/**
 * Review & Process. Shows the summary before a run and the current run after:
 * the run itself (Python, FastMap, background projections, hand-over) belongs
 * to ProcessingRunService, so it goes on when this step is closed, and this
 * step shows it again when reopened.
 */
@Component({
  selector: 'app-step6-review-processing',
  standalone: true,
  imports: [NgTemplateOutlet, DataTypeBadgeComponent, WizardIssueCardComponent],
  templateUrl: './step6-review-processing.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './step6-review-processing.component.scss',
})
export class Step6ReviewProcessingComponent implements OnInit, OnDestroy {
  @Output() wizardFinish = new EventEmitter<void>();
  getEncodingLabel = encLabelFn;
  getScalingLabel = scaleLabelFn;

  // Review/Summary data
  totalColumns = 0;
  enabledColumns = 0;
  metadataColumns = 0;
  projectionColumns = 0;
  readonly isMetadataColumn = isMetadataColumn;
  enabledMethods: string[] = [];
  columnConfigs: ColumnConfig[] = [];
  colorFeature: string | null = null;
  colorScaleName = '';
  selectedGlyphFeatures: string[] = [];
  projectionConfig: ProjectionConfig = { ...DEFAULT_PROJECTION_CONFIG };

  // The current run, as shown (see applyRunStatus)
  isProcessing = false;
  processingProgress = 0;
  processingStep = '';
  processingComplete = false;
  showProcessing = false;

  // Background projection status, by method key, and the list rows derived from it
  backgroundProjections = new Map<string, BackgroundStatus>();
  backgroundItems: BackgroundItem[] = [];
  readonly backgroundHeadingId = BACKGROUND_HEADING_ID;

  // A3: structured, persistent issues.
  startBlockers: WizardIssue[] = []; // settings that make processing impossible (Start is disabled)
  preflightIssues: WizardIssue[] = []; // shown on the review screen before processing
  blockingIssue: WizardIssue | null = null; // primary (hard) failure of the run
  partialIssues: WizardIssue[] = []; // degraded: some background projections failed (dismissable)
  private dismissedMethods = new Set<string>();

  // Expose enums
  DataType = DataType;

  readonly stepInfo = getStepInfo('review');
  // Step numbers shown on the summary cards, e.g. "Step 4".
  readonly projectionStepNumber = stepNumber('projection');
  readonly appearanceStepNumber = stepNumber('appearance');

  private readonly subscription = new Subscription();

  // The run shown, and the phase read out last (progress ticks within a phase stay silent).
  private shownRun: RunStatus | null = null;
  private lastAnnouncedPhase = '';

  constructor(
    public preprocessingService: PreprocessingService,
    private runService: ProcessingRunService,
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

    // A3: what stops processing, and what will likely make it fail.
    this.startBlockers = detectStartBlockers(state);
    this.preflightIssues = detectPreflightIssues(state);

    // The run and the background statuses live in root services, so they
    // survive closing the wizard; reopening shows the run where it is.
    this.subscription.add(
      this.projectionService.backgroundStatusObservable.subscribe(statusMap => {
        this.ngZone.run(() => {
          this.syncBackgroundStatus(statusMap);
          this.cdr.detectChanges();
        });
      })
    );
    this.subscription.add(this.runService.status$.subscribe(status => this.applyRunStatus(status)));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // ============================================================================
  // Review/Summary
  // ============================================================================

  prepareReviewData(): void {
    const state = this.preprocessingService.currentState;

    this.totalColumns = state.dataProfile?.columns.length || 0;
    this.columnConfigs = Array.from(state.columnConfigs.values());
    this.enabledColumns = this.columnConfigs.filter(c => c.enabled).length;
    this.metadataColumns = this.columnConfigs.filter(isMetadataColumn).length;
    this.projectionColumns = this.columnConfigs.filter(c => isFeatureColumn(c) && c.includeInProjection).length;

    // FastMap is always the primary projection
    this.enabledMethods = ['FastMap (Primary)', ...enabledBackgroundMethodNames(this.projectionConfig)];
  }

  /** False while a setting makes processing impossible (see startBlockers). */
  get canStartProcessing(): boolean {
    return this.startBlockers.length === 0;
  }

  // ============================================================================
  // Processing
  // ============================================================================

  /** Show the current run: progress, the result or the failure; the review summary when there is none. */
  private applyRunStatus(status: RunStatus | null): void {
    const previous = this.shownRun;
    this.shownRun = status;
    if (status && status.id !== previous?.id) {
      this.lastAnnouncedPhase = '';
      this.dismissedMethods.clear();
      this.partialIssues = [];
    }

    this.showProcessing = status !== null;
    this.isProcessing = status?.phase === 'processing';
    this.processingComplete = status?.phase === 'complete';
    this.processingProgress = status?.progress ?? 0;
    this.processingStep = status?.message ?? '';
    // A3: a failure is a persistent, actionable issue (cause + fix + target
    // step). Screen readers hear it through the error panel's role="alert",
    // which includes the cause; announcing it as well would read it twice.
    this.blockingIssue = status?.phase === 'failed' ? classifyProcessingError(status.error ?? '') : null;

    if (status?.phase === 'processing' && status.stage) {
      this.announcePhase(status.stage);
    }
    // Only a completion seen happening; a result already there on reopening is not news.
    if (status?.phase === 'complete' && previous?.id === status.id && previous.phase !== 'complete') {
      this.announcer.announce('Processing complete. Your visualization is ready to open in Glyphspace.');
    }
    this.cdr.detectChanges();
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

  /** Start a run with the current settings; resolves when its primary part has finished. */
  async startProcessing(): Promise<void> {
    if (!this.canStartProcessing || this.runService.status?.phase === 'processing') {
      return;
    }
    this.announcer.announce('Processing started.');
    await this.runService.start();
  }

  goToDashboard(): void {
    if (!this.runService.openInDashboard()) {
      this.toastService.error('The processed dataset is no longer available. Please process it again.');
      return;
    }
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
      // Stops the run's background projections; the reset clears the rest.
      this.runService.discard();
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
    if (!this.runService.cancelBackground(method)) {
      return;
    }
    this.announcer.announce(`${backgroundMethodName(method)} cancelled. You can retry it.`);
    this.focusElement(this.backgroundActionId(method));
  }

  /** Cancel every running background projection. */
  stopAllBackgroundProjections(): void {
    const stopped = this.runService.stopAllBackground();
    if (stopped.length === 0) {
      return;
    }
    const noun = stopped.length === 1 ? 'projection' : 'projections';
    this.announcer.announce(`Stopped ${stopped.length} background ${noun}.`);
    this.focusElement(BACKGROUND_HEADING_ID);
  }

  /** Re-run one cancelled or failed background projection with the same data and settings. */
  retryBackgroundProjection(method: string): void {
    this.dismissedMethods.delete(method);
    if (!this.runService.retryBackground(method)) {
      return;
    }
    this.announcer.announce(`Retrying ${backgroundMethodName(method)}.`);
    this.focusElement(this.backgroundActionId(method));
  }

  /** Keep keyboard focus in the list after the pressed button was replaced or removed. */
  private focusElement(id: string): void {
    this.cdr.detectChanges();
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
   * both the blocking-error screen and the success screen. A toast confirms
   * it, and the new run's progress replaces the result at once.
   */
  retryProcessing(): void {
    this.toastService.info('Restarting processing…', 3000);
    void this.startProcessing();
  }
}
