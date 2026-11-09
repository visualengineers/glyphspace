/**
 * Wizard step registry: one ordered list of named steps. Everything that needs
 * to know "which step" uses a WizardStepId; the numeric position (the index
 * kept in PreprocessingState.currentStep and shown to the user as "Step N") is
 * derived from this list through the helpers below, so reordering or inserting
 * a step only touches WIZARD_STEPS.
 */

export type WizardStepId = 'upload' | 'columns' | 'features' | 'projection' | 'appearance' | 'review';

export interface StepInfo {
  id: WizardStepId;
  title: string;
  purpose: string;
}

export const WIZARD_STEPS: readonly StepInfo[] = [
  {
    id: 'upload',
    title: 'Upload Data',
    purpose: 'Upload your CSV file to begin analyzing and preparing your data for visualization',
  },
  {
    id: 'columns',
    title: 'Select Columns',
    purpose:
      'Choose which columns to keep under consideration for the analysis. Deselect ID fields and irrelevant columns.',
  },
  {
    id: 'features',
    title: 'Configure Data & Features',
    purpose:
      'Configure data types, encoding, scaling, outliers, and cleaning for each column. Select a column to view and edit its options.',
  },
  {
    id: 'projection',
    title: 'Projection',
    purpose: 'Choose which columns feed the projection and pick the projection methods and their parameters.',
  },
  {
    id: 'appearance',
    title: 'Glyphs & Color',
    purpose:
      "Pick the glyph features and the color mapping for the dashboard's initial view. You can change them later.",
  },
  {
    id: 'review',
    title: 'Review & Process',
    purpose: 'Review your configuration summary and process the data for visualization.',
  },
];

/** Index of the last step (the review step). */
export const LAST_STEP_INDEX = WIZARD_STEPS.length - 1;

/** 0-based position of a step, as stored in PreprocessingState.currentStep. */
export function stepIndex(id: WizardStepId): number {
  return WIZARD_STEPS.findIndex(step => step.id === id);
}

/** The step at a 0-based position, or null when the index is out of range. */
export function stepIdAt(index: number): WizardStepId | null {
  return WIZARD_STEPS[index]?.id ?? null;
}

/** 1-based number shown to the user ("Step 4"). */
export function stepNumber(id: WizardStepId): number {
  return stepIndex(id) + 1;
}

/** Title and purpose of a step. */
export function getStepInfo(id: WizardStepId): StepInfo {
  const info = WIZARD_STEPS.find(step => step.id === id);
  if (!info) {
    throw new Error(`Unknown wizard step: ${id}`);
  }
  return info;
}

/** Human-readable reference used in fix instructions, e.g. "Step 4 (Projection)". */
export function stepLabel(id: WizardStepId): string {
  return `Step ${stepNumber(id)} (${getStepInfo(id).title})`;
}
