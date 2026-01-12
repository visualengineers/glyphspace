import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Step {
  label: string;
  icon?: string;
  completed: boolean;
}

@Component({
  selector: 'app-progress-stepper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-stepper.component.html',
  styleUrl: './progress-stepper.component.scss'
})
export class ProgressStepperComponent {
  @Input() steps: Step[] = [];
  @Input() currentStep: number = 0;
  @Output() stepClick = new EventEmitter<number>();

  onStepClick(index: number): void {
    if (index <= this.currentStep) {
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
    return index <= this.currentStep;
  }
}
