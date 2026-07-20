import { Component, OnInit, OnDestroy, Output, EventEmitter, ViewChild, ElementRef, viewChild } from '@angular/core';
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

// A14: Shared rail width (mirrors `$wizard-rail-width` in _wizard-shared.scss).
// Step 2's table collapses to exactly this width before the swap so the leftover
// name band lines up 1:1 with Step 3's master rail.
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

  // A14: When the user prefers reduced motion, the step 2 -> 3 morph is
  // skipped (Angular renders the switch instantly). Read once at init.
  reduceMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // A14: Cached natural height of `.step-container` captured just before the
  // step2 -> step3 swap, used to animate the container height during the morph
  // so there is no vertical jump.
  private morphOldHeight = 0;

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
        const previousStep = this.currentStep;
        const nextStep = state.currentStep;

        // A14: Only the forward Step 2 -> Step 3 transition is animated. Phase 1
        // (collapsing Step 2's table to the rail width) already ran in onProceed
        // before this state change fired; here we run Phase 2 after the swap.
        const shouldMorph = previousStep === 1 && nextStep === 2 && !this.reduceMotion;

        this.currentStep = nextStep;
        this.isProcessing = state.isProcessing;
        this.error = state.error;

        // Track highest step visited for navigation
        if (state.currentStep > this.highestStepVisited) {
          this.highestStepVisited = state.currentStep;
        }

        // Update step completion based on state
        this.updateStepCompletion(state);

        if (shouldMorph) {
          this.runDetailEntrance();
        }
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
      this.collapseStep2Then(() => step.proceed());
      return;
    }
    step.proceed();
  }

  /**
   * A14 Phase 1: collapse Step 2 on the *live* table (before the component swap),
   * so the movement reads as one directed wave from right to left. The table and
   * the search/filter bar shrink from full width down to the rail width; the stat
   * columns are clipped away at the right edge (overflow hidden). When the wave
   * finishes we snapshot the height and run `proceed()`, which triggers Phase 2.
   */
  private collapseStep2Then(proceed: () => void): void {
    const container = this.stepContainer;
    const table = container?.querySelector<HTMLElement>('.columns-table-container');
    const actions = container?.querySelector<HTMLElement>('.column-actions');
    if (!container || !table) {
      proceed();
      return;
    }

    const startWidth = table.getBoundingClientRect().width;
    const timeline = gsap.timeline({
      onComplete: () => {
        // Height the collapsed table occupies right before Step 3 replaces it;
        // Phase 2 tweens from here to Step 3's natural height (no vertical jump).
        this.morphOldHeight = container.offsetHeight;
        proceed();
      },
    });
    timeline.timeScale(MORPH_TIMESCALE);

    // The table narrows to the rail width; stat columns are wiped off the right.
    timeline.fromTo(
      table,
      { width: startWidth, overflow: 'hidden' },
      { width: WIZARD_RAIL_WIDTH, duration: 0.6, ease: 'power2.inOut' },
      0
    );

    // The search/filter bar shrinks in lockstep and fades so its reflow (filter
    // wrapping under the search) is not visible.
    if (actions) {
      timeline.fromTo(
        actions,
        { maxWidth: startWidth, overflow: 'hidden' },
        { maxWidth: WIZARD_RAIL_WIDTH, autoAlpha: 0, duration: 0.5, ease: 'power2.in' },
        0
      );
    }
  }

  /**
   * A14 Phase 2: after Angular has rendered Step 3, the detail/config well slides
   * in from the right as one block while the rail list fades in over the (already
   * collapsed) name band. The container height is tweened old -> new to avoid a
   * vertical jump, then the inline height is released so flex layout resumes.
   */
  private runDetailEntrance(): void {
    // setTimeout(0) fires after Angular's change detection has swapped the DOM,
    // mirroring the existing scrollToTop pattern.
    setTimeout(() => {
      const container = this.stepContainer;
      if (!container) {
        return;
      }

      const timeline = gsap.timeline();
      timeline.timeScale(MORPH_TIMESCALE);

      const list = container.querySelector('.column-list');
      if (list) {
        timeline.from(list, { autoAlpha: 0, duration: 0.3, ease: 'power1.out' }, 0);
      }

      const well = container.querySelector('.detail-well');
      if (well) {
        timeline.from(well, { xPercent: 40, autoAlpha: 0, duration: 0.6, ease: 'power2.out' }, 0.1);
      }

      const newHeight = container.offsetHeight;
      if (this.morphOldHeight > 0 && Math.abs(this.morphOldHeight - newHeight) > 1) {
        timeline.fromTo(
          container,
          { height: this.morphOldHeight },
          {
            height: newHeight,
            duration: 0.6,
            ease: 'power2.inOut',
            onComplete: () => {
              container.style.height = '';
            },
          },
          0
        );
      }
    }, 0);
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
