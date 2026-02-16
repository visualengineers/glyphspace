import { Component, Input, Output, EventEmitter } from '@angular/core';
export interface Step {
  label: string;
  icon?: string;
  completed: boolean;
}

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

  isStepClickable(index: number): boolean {
    // Allow clicking on:
    // 1. Any previous step (go back)
    // 2. Any completed step (including forward navigation to re-visit completed steps)
    return index <= this.currentStep || this.steps[index]?.completed;
  }
}
