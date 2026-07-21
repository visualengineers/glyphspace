import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  viewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { Subscription, distinctUntilChanged, map } from 'rxjs';
import { PreprocessingService } from './services/preprocessing.service';
import { ProgressStepperComponent, Step } from './shared/progress-stepper/progress-stepper.component';
import { WIZARD_STEP, WizardStep } from './shared/wizard-step';
import { STEP_INFO } from './shared/constants/step-info';
import { Step1UploadComponent } from './steps/step1-upload/step1-upload.component';
import { Step2ColumnSelectionComponent } from './steps/step2-column-selection/step2-column-selection.component';
import { Step3ConfigureDataFeaturesComponent } from './steps/step3-configure-data-features/step3-configure-data-features.component';
import { Step4VisualizationSettingsComponent } from './steps/step4-visualization-settings/step4-visualization-settings.component';
import { Step5ReviewProcessingComponent } from './steps/step5-review-processing/step5-review-processing.component';
import { PreprocessingState } from './models/preprocessing-state';
import { gsap } from 'gsap';

// A14: Rail width, shared with `$wizard-rail-width` in _wizard-shared.scss. Step 2
// collapses to exactly this width so the leftover name band lines up with Step 3's
// rail (one shared value on both sides — no per-side pixel drift). Values that are
// genuinely layout-dependent (row-top, box height) are measured at runtime.
const WIZARD_RAIL_WIDTH = 320;

// Global speed factor for the Step 2 -> 3 morph (1 = production; lower = slower,
// useful for frame-by-frame inspection).
const MORPH_TIMESCALE = 1;

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

  // A14: true only while the Step 2 -> 3 morph runs. Tints the step-container
  // backdrop grey so the areas revealed by the collapse / behind the sliding
  // detail well are never a white flash.
  morphing = false;

  // A14: When the user prefers reduced motion, the step 2 -> 3 morph is
  // skipped (Angular renders the switch instantly). Read once at init.
  reduceMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  constructor(
    private preprocessingService: PreprocessingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Subscribe to state changes
    this.subscription.add(
      this.preprocessingService.state$.subscribe(state => {
        const nextStep = state.currentStep;

        // A14: The forward Step 2 -> 3 morph is driven entirely from onProceed
        // (Phase 1 collapse -> swap -> Phase 2 entrance, all in one flow) so the
        // entrance can be set up synchronously right after the swap. This
        // subscription just tracks state; it no longer triggers the animation.
        this.currentStep = nextStep;
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

  private get stepContainer(): HTMLElement | null {
    return this.wizardContent?.nativeElement?.querySelector('.step-container') ?? null;
  }

  /**
   * A14: Central handler for the primary "continue" button. For the Step 2 -> 3
   * transition (with motion enabled) it first collapses Step 2's table down to
   * the rail width (Phase 1) and only then advances the wizard, so the swap
   * happens while both steps share the same narrow geometry. Every other step
   * proceeds immediately.
   */
  onProceed(step: WizardStep): void {
    if (this.currentStep === 1 && !this.reduceMotion) {
      this.morphing = true;
      this.collapseStep2Then(() => step.proceed());
      return;
    }
    step.proceed();
  }

  /**
   * A14 Phase 1: collapse Step 2 on the *live* table (before the component swap).
   * The only motion is horizontal: the table narrows from full width to the rail
   * width, clipping the stat columns off the right edge (overflow hidden). Step 2
   * stays fully opaque the whole time (no fade), so there is no transparent frame.
   * On completion we swap to Step 3 and start Phase 2 synchronously.
   */
  private collapseStep2Then(proceed: () => void): void {
    const container = this.stepContainer;
    const table = container?.querySelector<HTMLElement>('.columns-table-container');
    if (!container || !table) {
      proceed();
      return;
    }

    const startWidth = table.getBoundingClientRect().width;

    const timeline = gsap.timeline({
      onComplete: () => {
        // Swap to Step 3, force Angular to render it into the DOM *now*, then set
        // up the entrance synchronously (still inside GSAP's pre-paint tick) so
        // Step 3's start state is applied before the first paint.
        proceed();
        this.cdr.detectChanges();
        this.animateStep3Entrance();
      },
    });
    timeline.timeScale(MORPH_TIMESCALE);

    // The table narrows to the rail width (shared token); stat columns are wiped
    // off the right edge -> the one directed right-to-left wave.
    timeline.fromTo(
      table,
      { width: startWidth, overflow: 'hidden' },
      { width: WIZARD_RAIL_WIDTH, duration: 0.6, ease: 'power2.inOut' },
      0
    );
  }

  /**
   * A14 Phase 2: Step 3 appears fully opaque immediately (NO opacity fade) so
   * there is never a transparent/white frame during the component swap. The only
   * entrance motion is the detail well sliding in from the right; its start state
   * is applied synchronously (right after detectChanges, before the browser
   * paints) so there is no one-frame flash of it at its final position.
   */
  private animateStep3Entrance(): void {
    const container = this.stepContainer;
    const well = container?.querySelector<HTMLElement>('.detail-well');
    const endMorph = () => {
      this.morphing = false;
      this.cdr.detectChanges();
    };
    if (!well) {
      endMorph();
      return;
    }
    const tween = gsap.from(well, {
      xPercent: 40,
      duration: 0.6,
      ease: 'power2.out',
      onComplete: endMorph,
    });
    tween.timeScale(MORPH_TIMESCALE);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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
