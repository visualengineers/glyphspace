import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PreprocessingService } from './services/preprocessing.service';
import { ProgressStepperComponent, Step } from './shared/progress-stepper/progress-stepper.component';
import { Step1UploadComponent } from './steps/step1-upload/step1-upload.component';
import { Step2ColumnSelectionComponent } from './steps/step2-column-selection/step2-column-selection.component';
import { Step3DataCleaningComponent } from './steps/step3-data-cleaning/step3-data-cleaning.component';
import { Step4FeatureConfigComponent } from './steps/step4-feature-config/step4-feature-config.component';
import { Step5ProjectionSettingsComponent } from './steps/step5-projection-settings/step5-projection-settings.component';
import { Step6ReviewProcessComponent } from './steps/step6-review-process/step6-review-process.component';
import { DataProfile } from './models/column-statistics';

@Component({
  selector: 'app-preprocessing-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ProgressStepperComponent,
    Step1UploadComponent,
    Step2ColumnSelectionComponent,
    Step3DataCleaningComponent,
    Step4FeatureConfigComponent,
    Step5ProjectionSettingsComponent,
    Step6ReviewProcessComponent
  ],
  templateUrl: './preprocessing-wizard.component.html',
  styleUrl: './preprocessing-wizard.component.scss'
})
export class PreprocessingWizardComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter<void>();

  private subscription = new Subscription();

  currentStep = 0;
  isProcessing = false;
  error: string | null = null;

  steps: Step[] = [
    { label: 'Upload Data', completed: false },
    { label: 'Select Columns', completed: false },
    { label: 'Clean Data', completed: false },
    { label: 'Configure Features', completed: false },
    { label: 'Projection Settings', completed: false },
    { label: 'Review & Process', completed: false }
  ];

  constructor(private preprocessingService: PreprocessingService) { }

  ngOnInit(): void {
    // Subscribe to state changes
    this.subscription.add(
      this.preprocessingService.state$.subscribe(state => {
        this.currentStep = state.currentStep;
        this.isProcessing = state.isProcessing;
        this.error = state.error;

        // Update step completion based on state
        this.updateStepCompletion(state);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private updateStepCompletion(state: any): void {
    this.steps[0].completed = state.dataProfile !== null;
    this.steps[1].completed = state.columnConfigs.size > 0 && state.currentStep > 1;
    this.steps[2].completed = state.currentStep > 2;
    this.steps[3].completed = state.currentStep > 3;
    this.steps[4].completed = state.currentStep > 4;
    this.steps[5].completed = state.processedDataset !== null;
  }

  onStepClick(step: number): void {
    this.preprocessingService.goToStep(step);
  }

  onDataLoaded(profile: DataProfile): void {
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
      case 2: // Data Cleaning
        return true;
      case 3: // Configuration
        return true;
      case 4: // Projection
        return true;
      case 5: // Summary
        return false; // Final step
      default:
        return false;
    }
  }

  reset(): void {
    if (confirm('Are you sure you want to start over? All progress will be lost.')) {
      this.preprocessingService.resetState();
    }
  }

  closeWizard(): void {
    if (confirm('Are you sure you want to close the wizard? Any unsaved progress will be lost.')) {
      this.close.emit();
    }
  }

  onWizardComplete(): void {
    this.close.emit();
  }
}
