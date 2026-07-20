import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WizardIssue, STEP_NAMES } from '../constants/wizard-error-classes';

/**
 * A3: presentational card for a single wizard issue. Shows severity, an
 * everyday-language title, the WHY (cause) and FIX (action naming the step),
 * collapsible technical details, and a "Fix in Schritt N" jump button that the
 * host wires to the A6 step-jump logic. Optionally dismissable (partial issues).
 */
@Component({
  selector: 'app-wizard-issue-card',
  standalone: true,
  imports: [],
  templateUrl: './wizard-issue-card.component.html',
  styleUrl: './wizard-issue-card.component.scss',
})
export class WizardIssueCardComponent {
  @Input({ required: true }) issue!: WizardIssue;
  /** Label shown on the severity pill: Blocking / Warning / Possible issue. */
  @Input() severityLabel = '';
  @Output() fix = new EventEmitter<WizardIssue>();
  @Output() dismiss = new EventEmitter<WizardIssue>();

  readonly STEP_NAMES = STEP_NAMES;
  technicalOpen = false;

  get stepNumber(): number {
    return this.issue.step + 1;
  }

  get stepName(): string {
    return STEP_NAMES[this.issue.step] ?? '';
  }

  get pillLabel(): string {
    if (this.severityLabel) return this.severityLabel;
    return this.issue.severity === 'blocking' ? 'Blocking' : 'Warning';
  }

  toggleTechnical(): void {
    this.technicalOpen = !this.technicalOpen;
  }
}
