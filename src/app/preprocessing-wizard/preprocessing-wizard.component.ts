import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PreprocessingService } from './services/preprocessing.service';
import { ProgressStepperComponent, Step } from './shared/progress-stepper/progress-stepper.component';
import { Step1UploadComponent } from './steps/step1-upload/step1-upload.component';
import { Step2ColumnSelectionComponent } from './steps/step2-column-selection/step2-column-selection.component';
import { Step3ConfigureDataFeaturesComponent } from './steps/step3-configure-data-features/step3-configure-data-features.component';
import { Step4VisualizationSettingsComponent } from './steps/step4-visualization-settings/step4-visualization-settings.component';
import { DataProfile } from './models/column-statistics';

@Component({
  selector: 'app-preprocessing-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ProgressStepperComponent,
    Step1UploadComponent,
    Step2ColumnSelectionComponent,
    Step3ConfigureDataFeaturesComponent,
    Step4VisualizationSettingsComponent
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
    { label: 'Configure Data & Features', completed: false },
    { label: 'Visualization Settings', completed: false }
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
    this.steps[3].completed = state.processedDataset !== null;
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
      case 2: // Configure Data & Features
        return true;
      case 3: // Visualization Settings
        return false; // Final step - processing happens here
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
    this.close.emit();
  }

  onWizardComplete(): void {
    this.close.emit();
  }
}
