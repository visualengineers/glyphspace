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
import { stepTransition } from './animations/step-transition.animations';

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
  animations: [stepTransition],
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

  // A14: When the user prefers reduced motion, the step 2 -> 3 transition is
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
