import { Component, OnInit, OnDestroy, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Subscription, distinctUntilChanged, map } from 'rxjs';
import { PreprocessingService } from './services/preprocessing.service';
import { ProgressStepperComponent, Step } from './shared/progress-stepper/progress-stepper.component';
import { Step1UploadComponent } from './steps/step1-upload/step1-upload.component';
import { Step2ColumnSelectionComponent } from './steps/step2-column-selection/step2-column-selection.component';
import { Step3ConfigureDataFeaturesComponent } from './steps/step3-configure-data-features/step3-configure-data-features.component';
import { Step4VisualizationSettingsComponent } from './steps/step4-visualization-settings/step4-visualization-settings.component';
import { Step5ReviewProcessingComponent } from './steps/step5-review-processing/step5-review-processing.component';
import { DataProfile } from './models/column-statistics';
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

  private subscription = new Subscription();

  currentStep = 0;
  highestStepVisited = 0; // Track highest step to enable forward navigation
  isProcessing = false;
  error: string | null = null;

  steps: Step[] = [
    { label: 'Upload Data', completed: false },
    { label: 'Select Columns', completed: false },
    { label: 'Configure Data & Features', completed: false },
    { label: 'Visualization Settings', completed: false },
    { label: 'Review & Process', completed: false },
  ];

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

  onDataLoaded(_profile: DataProfile): void {
    // User clicked "Continue to Column Selection" button - proceed to next step
    this.preprocessingService.nextStep();
  }

  nextStep(): void {
    this.preprocessingService.nextStep();
  }

  previousStep(): void {
    this.preprocessingService.previousStep();
  }

  canGoNext(): boolean {
    const state = this.preprocessingService.currentState;

    switch (this.currentStep) {
      case 0: // Upload
        return state.dataProfile !== null;
      case 1: // Column Selection
        return state.columnConfigs.size > 0;
      case 2: // Configure Data & Features
        return true;
      case 3: // Visualization Settings
        return true;
      case 4: // Review & Process
        return false; // Final step - processing happens here
      default:
        return false;
    }
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
