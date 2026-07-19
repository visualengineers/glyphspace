import { Component, OnInit, OnDestroy, Output, EventEmitter, ViewChild, ElementRef, viewChild } from '@angular/core';
import { Subscription, distinctUntilChanged, map } from 'rxjs';
import { PreprocessingService } from './services/preprocessing.service';
import { ProgressStepperComponent, Step } from './shared/progress-stepper/progress-stepper.component';
import { WIZARD_STEP } from './shared/wizard-step';
import { STEP_INFO } from './shared/constants/step-info';
import { Step1UploadComponent } from './steps/step1-upload/step1-upload.component';
import { Step2ColumnSelectionComponent } from './steps/step2-column-selection/step2-column-selection.component';
import { Step3ConfigureDataFeaturesComponent } from './steps/step3-configure-data-features/step3-configure-data-features.component';
import { Step4VisualizationSettingsComponent } from './steps/step4-visualization-settings/step4-visualization-settings.component';
import { Step5ReviewProcessingComponent } from './steps/step5-review-processing/step5-review-processing.component';
import { PreprocessingState } from './models/preprocessing-state';
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';

// A14: Register the Flip plugin once at module load. Flip morphs elements across
// the step2 -> step3 @switch component swap by matching `data-flip-id`.
gsap.registerPlugin(Flip);

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

        // A14: Only the forward Step 2 -> Step 3 transition morphs. Capture the
        // Flip state while step2 is still rendered (this subscriber runs
        // synchronously before Angular re-renders the @switch), then trigger the
        // morph after the new DOM is in place.
        const shouldMorph = previousStep === 1 && nextStep === 2 && !this.reduceMotion;
        const flipState = shouldMorph ? this.captureMorphState() : null;

        this.currentStep = nextStep;
        this.isProcessing = state.isProcessing;
        this.error = state.error;

        // Track highest step visited for navigation
        if (state.currentStep > this.highestStepVisited) {
          this.highestStepVisited = state.currentStep;
        }

        // Update step completion based on state
        this.updateStepCompletion(state);

        if (flipState) {
          this.runStepMorph(flipState);
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
   * A14: Capture the GSAP Flip state of the step-2 column list + search box
   * (matched across the swap via `data-flip-id`) plus the stat columns that are
   * about to leave. Must run while step 2 is still in the DOM.
   */
  private captureMorphState(): Flip.FlipState | null {
    const container = this.stepContainer;
    if (!container) {
      return null;
    }

    // Matched, morphing elements (column rows + search box + type filter) share a
    // data-flip-id with their step-3 counterparts. The stat cells + select-all
    // header cell are captured too so Flip can animate them out via onLeave (they
    // only exist in step 2, so their DOM nodes get disconnected by the swap).
    // NOTE: `.col-missing` is part of the left band now (it morphs with the row),
    // so it is NOT in the leave set.
    const morphTargets = Array.from(container.querySelectorAll('[data-flip-id]'));
    const leaveTargets = Array.from(
      container.querySelectorAll('.col-type, .col-count, .col-unique, .col-distribution, thead .col-checkbox')
    );

    this.morphOldHeight = container.offsetHeight;
    return Flip.getState([...morphTargets, ...leaveTargets]);
  }

  /**
   * A14: After Angular has rendered step 3, morph from the captured state:
   * matched left-band rows / search box / type filter glide from the table into
   * the master-rail geometry (small delta since both steps now share the rail
   * width, header controls and list height), the stat columns collapse away
   * (onLeave), and the detail well enters from the right (onEnter). The container
   * height is tweened in the same timeline only if a residual mismatch remains.
   */
  private runStepMorph(state: Flip.FlipState): void {
    // setTimeout(0) fires after Angular's change detection has swapped the DOM,
    // mirroring the existing scrollToTop pattern.
    setTimeout(() => {
      const container = this.stepContainer;
      if (!container) {
        return;
      }

      const timeline = Flip.from(state, {
        targets: container.querySelectorAll('[data-flip-id]'),
        duration: 0.5,
        ease: 'power2.inOut',
        absolute: true,
        // Stat columns / select-all: fade out with a small rightward drift as the
        // detail well slides in over that area.
        onLeave: leaving =>
          gsap.to(leaving, {
            x: 24,
            autoAlpha: 0,
            duration: 0.3,
            ease: 'power2.in',
          }),
      });

      // onEnter (step-3 only): the detail/config well slides in from the right.
      // The type filter now morphs (shared data-flip-id) instead of appearing.
      const well = container.querySelector('.detail-well');
      if (well) {
        timeline.from(well, { xPercent: 40, autoAlpha: 0, duration: 0.5, ease: 'power2.out' }, 0);
      }

      // Animate the container height old -> new to prevent a vertical jump, then
      // release the inline height so flex layout resumes.
      const newHeight = container.offsetHeight;
      if (this.morphOldHeight > 0 && Math.abs(this.morphOldHeight - newHeight) > 1) {
        timeline.fromTo(
          container,
          { height: this.morphOldHeight },
          {
            height: newHeight,
            duration: 0.5,
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
