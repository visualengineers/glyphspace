import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WizardIssue } from '../constants/wizard-error-classes';
import { getStepInfo, stepNumber } from '../constants/step-info';

let nextIssueCardId = 0;

/**
 * A3: presentational card for a single wizard issue. Shows severity, an
 * everyday-language title, the WHY (cause) and FIX (action naming the step),
 * collapsible technical details, and a "Fix in step N" jump button that the
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

  technicalOpen = false;

  /** Id of the collapsible technical details (target of the toggle's aria-controls). */
  readonly detailsId = `wizard-issue-details-${nextIssueCardId++}`;

  get stepNumber(): number {
    return stepNumber(this.issue.step);
  }

  get stepName(): string {
    return getStepInfo(this.issue.step).title;
  }

  get pillLabel(): string {
    if (this.severityLabel) return this.severityLabel;
    return this.issue.severity === 'blocking' ? 'Blocking' : 'Warning';
  }

  toggleTechnical(): void {
    this.technicalOpen = !this.technicalOpen;
  }
}
