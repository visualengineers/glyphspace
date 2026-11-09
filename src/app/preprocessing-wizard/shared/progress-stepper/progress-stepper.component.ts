import { Component, Input, Output, EventEmitter } from '@angular/core';
export interface Step {
  label: string;
  /** Purpose of the step, shown for the current (and upcoming) steps. */
  description?: string;
  /** What was chosen in the step, shown instead of the purpose once it is completed. */
  summary?: string;
  icon?: string;
  completed: boolean;
}

let nextStepperId = 0;

@Component({
  selector: 'app-progress-stepper',
  standalone: true,
  imports: [],
  templateUrl: './progress-stepper.component.html',
  styleUrl: './progress-stepper.component.scss',
})
export class ProgressStepperComponent {
  @Input() steps: Step[] = [];
  @Input() currentStep = 0;
  @Input() vertical = false;
  @Output() stepClick = new EventEmitter<number>();

  private readonly idPrefix = `wizard-stepper-${nextStepperId++}`;

  onStepClick(index: number): void {
    // Allow navigation to previous steps or completed steps
    if (this.isStepClickable(index)) {
      this.stepClick.emit(index);
    }
  }

  isStepActive(index: number): boolean {
    return index === this.currentStep;
  }

  isStepCompleted(index: number): boolean {
    return this.steps[index]?.completed || index < this.currentStep;
  }

  /** Completed steps other than the current one show their summary instead of the purpose. */
  showsSummary(index: number): boolean {
    return this.isStepCompleted(index) && !this.isStepActive(index) && !!this.steps[index]?.summary;
  }

  /** The line under the label: summary for completed steps, otherwise the purpose. */
  stepDetail(index: number): string {
    const step = this.steps[index];
    if (!step) return '';
    return (this.showsSummary(index) ? step.summary : step.description) ?? '';
  }

  labelId(index: number): string {
    return `${this.idPrefix}-label-${index}`;
  }

  detailId(index: number): string {
    return `${this.idPrefix}-detail-${index}`;
  }

  isStepClickable(index: number): boolean {
    // Reachable steps are:
    // 1. The current step and every step before it (go back at will)
    // 2. Any step already completed
    // 3. The step directly after the furthest completed step, so the next
    //    step to fill in stays reachable even after navigating backwards
    if (index <= this.currentStep) {
      return true;
    }
    if (this.steps[index]?.completed) {
      return true;
    }
    return index <= this.lastCompletedStepIndex() + 1;
  }

  private lastCompletedStepIndex(): number {
    let last = -1;
    for (let i = 0; i < this.steps.length; i++) {
      if (this.steps[i]?.completed) {
        last = i;
      }
    }
    return last;
  }
}
