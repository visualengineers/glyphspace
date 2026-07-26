import { InjectionToken } from '@angular/core';

/**
 * Contract that each navigable wizard step (steps 1–4) implements so the
 * shell can render a single, centralized navigation bar instead of every
 * step carrying its own footer buttons.
 *
 * The shell resolves the currently rendered step via the WIZARD_STEP token
 * (see PreprocessingWizardComponent). Step 5 (Review & Process) has its own
 * context-dependent footer and deliberately does not provide the token.
 */
export interface WizardStep {
  /** Whether the primary "continue" action is currently allowed. */
  canProceed(): boolean;

  /** Advances the wizard to the next step (guarded by canProceed). */
  proceed(): void;

  /** Label of the primary button, e.g. "Continue to Column Selection". */
  readonly primaryLabel: string;

  /** Optional hint shown next to the disabled primary button. */
  readonly disabledHint?: string;
}

export const WIZARD_STEP = new InjectionToken<WizardStep>('WIZARD_STEP');
