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

  // A14: When the user prefers reduced motion, the step 2 -> 3 morph is
  // skipped (Angular renders the switch instantly). Read once at init.
  reduceMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // A14: Runtime geometry captured just before the step2 -> step3 swap so Phase 2
  // can animate the *measured* differences away instead of relying on hard-coded
  // pixels: the bordered box height, the y of the first table row (to glide the
  // rail list into place) and the Flip state of the search box + type filter.
  private morphOldHeight = 0;
  private morphRowTop = 0;

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
   * so the movement reads as one directed wave from right to left. The table
   * narrows from full width to the measured left-band width (checkbox + name +
   * missing); the stat columns are clipped off the right edge (overflow hidden).
   * The whole top bar (search + filter + selection chip) and the table header
   * fade out toward the end of the collapse; Step 3's rail header fades in in
   * Phase 2, so the header change is a soft cross-fade across the swap instead of
   * a hard vanish/reappear. (A true width glide is impossible here: Step 3's rail
   * box is only the rail width with overflow hidden, so a full-width search box
   * would just be clipped.) We also capture the box height and the first row's y
   * so Phase 2 can animate those exact deltas away.
   */
  private collapseStep2Then(proceed: () => void): void {
    const container = this.stepContainer;
    const table = container?.querySelector<HTMLElement>('.columns-table-container');
    const actions = container?.querySelector<HTMLElement>('.column-actions');
    if (!container || !table) {
      proceed();
      return;
    }

    // Collapse to the SAME width Step 3's rail uses (one shared token, so the
    // box width does not pop at the swap). Only genuinely layout-dependent values
    // (row-top, box height) are measured at runtime below.
    const firstRow = table.querySelector<HTMLElement>('tbody tr.column-row');
    this.morphRowTop = firstRow ? firstRow.getBoundingClientRect().top : 0;

    const startWidth = table.getBoundingClientRect().width;
    const thead = table.querySelector<HTMLElement>('thead');

    const timeline = gsap.timeline({
      onComplete: () => {
        // Height of the bordered box right before Step 3 replaces it; Phase 2
        // tweens from here to Step 3's natural box height (no vertical jump).
        this.morphOldHeight = table.getBoundingClientRect().height;
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

    // Top bar (search + filter + chip) and the table header fade out in the
    // second half of the collapse; Step 3's rail header fades in in Phase 2, so
    // the header change reads as a soft cross-fade across the swap rather than a
    // hard vanish/reappear.
    const fading = [actions, thead].filter((el): el is HTMLElement => !!el);
    if (fading.length) {
      timeline.to(fading, { autoAlpha: 0, duration: 0.3, ease: 'power1.in' }, 0.3);
    }
  }

  /**
   * A14 Phase 2: after Angular has rendered Step 3, animate away the *measured*
   * differences so nothing jumps: the rail header fades in (cross-fading the old
   * top bar); the rail list slides up from the old row position; the bordered box
   * grows from the old height to its natural one; and the detail well slides in
   * from the right.
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

      // Rail header fades in, completing the cross-fade started in Phase 1.
      const railHeader = container.querySelector<HTMLElement>('.rail-header');
      if (railHeader) {
        timeline.from(railHeader, { autoAlpha: 0, duration: 0.35, ease: 'power1.out' }, 0);
      }

      // Rail list slides up from where the Step 2 rows sat (measured delta), so
      // the column names do not jump down by the rail-header height difference.
      const list = container.querySelector<HTMLElement>('.column-list');
      if (list) {
        const delta = this.morphRowTop - list.getBoundingClientRect().top;
        timeline.from(list, { y: delta, autoAlpha: 0, duration: 0.5, ease: 'power2.out' }, 0);
      }

      // The bordered box grows from the collapsed Step 2 height to Step 3's.
      const box = container.querySelector<HTMLElement>('.config-shell');
      if (box) {
        const natural = box.getBoundingClientRect().height;
        if (this.morphOldHeight > 0 && Math.abs(this.morphOldHeight - natural) > 1) {
          timeline.fromTo(
            box,
            { height: this.morphOldHeight },
            {
              height: natural,
              duration: 0.6,
              ease: 'power2.inOut',
              onComplete: () => {
                box.style.height = '';
              },
            },
            0
          );
        }
      }

      // The detail/config well slides in from the right as one block.
      const well = container.querySelector('.detail-well');
      if (well) {
        timeline.from(well, { xPercent: 40, autoAlpha: 0, duration: 0.6, ease: 'power2.out' }, 0.1);
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
