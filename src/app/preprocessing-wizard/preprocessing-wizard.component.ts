import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  viewChild,
  HostListener,
} from '@angular/core';
import { Subscription, distinctUntilChanged, map } from 'rxjs';
import { PreprocessingService, UndoRedoInfo } from './services/preprocessing.service';
import { HistoryStatus } from './models/preprocessing-state';
import { ProgressStepperComponent, Step } from './shared/progress-stepper/progress-stepper.component';
import { WIZARD_STEP } from './shared/wizard-step';
import { STEP_INFO } from './shared/constants/step-info';
import { Step1UploadComponent } from './steps/step1-upload/step1-upload.component';
import { Step2ColumnSelectionComponent } from './steps/step2-column-selection/step2-column-selection.component';
import { Step3ConfigureDataFeaturesComponent } from './steps/step3-configure-data-features/step3-configure-data-features.component';
import { Step4VisualizationSettingsComponent } from './steps/step4-visualization-settings/step4-visualization-settings.component';
import { Step5ReviewProcessingComponent } from './steps/step5-review-processing/step5-review-processing.component';
import { PreprocessingState } from './models/preprocessing-state';

@Component({
  selector: 'app-preprocessing-wizard',
  standalone: true,
  imports: [
    ProgressStepperComponent,
    Step1UploadComponent,
    Step2ColumnSelectionComponent,
    Step3ConfigureDataFeaturesComponent,
    Step4VisualizationSettingsComponent,
    Step5ReviewProcessingComponent,
  ],
  templateUrl: './preprocessing-wizard.component.html',
  styleUrl: './preprocessing-wizard.component.scss',
})
export class PreprocessingWizardComponent implements OnInit, OnDestroy {
  @Output() wizardClose = new EventEmitter<void>();
  @ViewChild('wizardContent') wizardContent!: ElementRef<HTMLElement>;

  // Currently rendered step (1–4) exposed through the WIZARD_STEP token so the
  // shell can drive the centralized navigation bar. Undefined on step 5, which
  // keeps its own context-dependent footer.
  readonly activeStep = viewChild(WIZARD_STEP);

  private subscription = new Subscription();

  currentStep = 0;
  highestStepVisited = 0; // Track highest step to enable forward navigation
  isProcessing = false;
  error: string | null = null;

  // A4: undo/redo history state, driven by the service's history$ stream.
  history: HistoryStatus = { canUndo: false, canRedo: false, undoLabel: null, redoLabel: null };
  // Toggled off/on to force the current step to re-instantiate after an undo/redo,
  // so steps that cache state in ngOnInit re-read the restored snapshot.
  stepVisible = true;

  // A4: dezenter Undo/Redo-Hinweis, in die untere Navigationsleiste eingebettet
  // (statt eines schwebenden Toasts). Single-Slot: ein neuer Hinweis ersetzt den
  // vorherigen, ein Timer blendet ihn nach kurzer Zeit wieder aus.
  historyHint: { message: string; step: number | null; anchorId: string | null } | null = null;
  private historyHintTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly HISTORY_HINT_MS = 5000;

  // Labels and descriptions come from STEP_INFO so the sidebar stays the single
  // source of truth for step titles/purposes (no duplication in the work area).
  steps: Step[] = Object.keys(STEP_INFO)
    .map(Number)
    .sort((a, b) => a - b)
    .map(i => ({
      label: STEP_INFO[i].title,
      description: STEP_INFO[i].purpose,
      completed: false,
    }));

  constructor(private preprocessingService: PreprocessingService) {}

  ngOnInit(): void {
    // Subscribe to state changes
    this.subscription.add(
      this.preprocessingService.state$.subscribe(state => {
        this.currentStep = state.currentStep;
        this.isProcessing = state.isProcessing;
        this.error = state.error;

        // Track highest step visited for navigation
        if (state.currentStep > this.highestStepVisited) {
          this.highestStepVisited = state.currentStep;
        }

        // Update step completion based on state
        this.updateStepCompletion(state);
      })
    );

    // Scroll to top when step changes
    this.subscription.add(
      this.preprocessingService.state$
        .pipe(
          map(state => state.currentStep),
          distinctUntilChanged()
        )
        .subscribe(() => {
          this.scrollToTop();
        })
    );

    // A4: keep the undo/redo toolbar in sync with the history stack.
    this.subscription.add(
      this.preprocessingService.history$.subscribe(status => {
        this.history = status;
      })
    );

    // A4: after an undo/redo reinstalls a snapshot, force the visible step to
    // rebuild so it reflects the restored state (steps read state once on init).
    this.subscription.add(
      this.preprocessingService.stateRestored$.subscribe(() => {
        this.reloadCurrentStep();
      })
    );
  }

  // ── A4: Undo/Redo ─────────────────────────────────────────────────────────

  undo(): void {
    const info = this.preprocessingService.undo();
    if (info) {
      this.showHistoryHint(info, 'zurückgesetzt');
    }
  }

  redo(): void {
    const info = this.preprocessingService.redo();
    if (info) {
      this.showHistoryHint(info, 'wiederhergestellt');
    }
  }

  /**
   * A4: zeigt einen dezenten, nicht stapelnden Hinweis in der Navigationsleiste.
   * Nennt die konkret geänderte Einstellung; der Timer blendet ihn wieder aus.
   */
  private showHistoryHint(info: UndoRedoInfo, verb: 'zurückgesetzt' | 'wiederhergestellt'): void {
    this.historyHint = {
      message: `${info.settingLabel} wurde ${verb}`,
      step: info.step,
      anchorId: info.anchorId,
    };
    if (this.historyHintTimer) {
      clearTimeout(this.historyHintTimer);
    }
    this.historyHintTimer = setTimeout(() => {
      this.historyHint = null;
      this.historyHintTimer = null;
    }, this.HISTORY_HINT_MS);
  }

  /** Deep-link from the hint to the changed setting, then dismiss the hint. */
  showHistoryChange(): void {
    const hint = this.historyHint;
    if (hint && hint.step !== null && hint.anchorId) {
      this.preprocessingService.goToStepWithScroll(hint.step, hint.anchorId);
    }
    this.dismissHistoryHint();
  }

  private dismissHistoryHint(): void {
    this.historyHint = null;
    if (this.historyHintTimer) {
      clearTimeout(this.historyHintTimer);
      this.historyHintTimer = null;
    }
  }

  get undoTooltip(): string {
    return this.history.canUndo && this.history.undoLabel
      ? `Rückgängig: ${this.history.undoLabel}`
      : 'Nichts rückgängig zu machen';
  }

  get redoTooltip(): string {
    return this.history.canRedo && this.history.redoLabel
      ? `Wiederherstellen: ${this.history.redoLabel}`
      : 'Nichts wiederherzustellen';
  }

  /**
   * Global wizard shortcuts: Strg+Z = undo, Strg+Umschalt+Z (or Strg+Y) = redo.
   * When focus is inside a text input/textarea/contenteditable we do nothing and
   * let the browser's native field-level undo run instead.
   */
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const ctrl = event.ctrlKey || event.metaKey;
    if (!ctrl) return;

    const key = event.key.toLowerCase();
    const isUndo = key === 'z' && !event.shiftKey;
    const isRedo = (key === 'z' && event.shiftKey) || key === 'y';
    if (!isUndo && !isRedo) return;

    if (this.isEditableTarget(event.target)) return;

    event.preventDefault();
    if (isRedo) {
      this.redo();
    } else {
      this.undo();
    }
  }

  private isEditableTarget(target: EventTarget | null): boolean {
    const el = target as HTMLElement | null;
    if (!el) return false;
    const tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
  }

  private reloadCurrentStep(): void {
    this.stepVisible = false;
    setTimeout(() => {
      this.stepVisible = true;
    }, 0);
  }

  private scrollToTop(): void {
    // Use setTimeout to ensure scroll happens after Angular renders the new step content
    setTimeout(() => {
      // Scroll the wizard content container to top
      if (this.wizardContent?.nativeElement) {
        this.wizardContent.nativeElement.scrollTop = 0;
      }
      // Also scroll the window/document in case wizard is in a scrollable container
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 0);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.historyHintTimer) {
      clearTimeout(this.historyHintTimer);
    }
  }

  private updateStepCompletion(state: PreprocessingState): void {
    // Mark steps as completed based on:
    // 1. Whether the step's required data exists
    // 2. Whether the user has visited beyond this step (highestStepVisited)
    this.steps[0].completed = state.dataProfile !== null;
    this.steps[1].completed = state.columnConfigs.size > 0 && this.highestStepVisited > 1;
    this.steps[2].completed = this.highestStepVisited > 2;
    this.steps[3].completed = this.highestStepVisited > 3;
    this.steps[4].completed = state.processedDataset !== null;
  }

  onStepClick(step: number): void {
    this.preprocessingService.goToStep(step);
  }

  previousStep(): void {
    this.preprocessingService.previousStep();
  }

  reset(): void {
    if (confirm('Are you sure you want to start over? All progress will be lost.')) {
      this.highestStepVisited = 0; // Reset navigation tracking
      this.preprocessingService.resetState();
    }
  }

  closeWizard(): void {
    this.wizardClose.emit();
  }

  onWizardComplete(): void {
    this.wizardClose.emit();
  }
}
