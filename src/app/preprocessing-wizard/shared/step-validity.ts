import { PreprocessingState } from '../models/preprocessing-state';
import { isFeatureColumn } from '../models/column-config';
import { predictEncodedFeatureNames } from '../services/processing-config';
import { MAX_GLYPH_AXES, MIN_GLYPH_AXES } from '../../glyph/glyph-axes';
import { WIZARD_STEPS, WizardStepId, stepIndex } from './constants/step-info';

/** The part of the wizard state that decides which steps are done and open. */
export type StepValidityState = Pick<
  PreprocessingState,
  | 'currentStep'
  | 'furthestStep'
  | 'dataProfile'
  | 'uploadMissing'
  | 'columnConfigs'
  | 'glyphFeatures'
  | 'processedDataset'
>;

/**
 * Whether the glyph selection fits the data: 3–8 features, each one a feature
 * the current settings produce (see predictEncodedFeatureNames).
 */
export function isGlyphSelectionValid(
  state: Pick<StepValidityState, 'columnConfigs' | 'dataProfile' | 'glyphFeatures'>
): boolean {
  const count = state.glyphFeatures.length;
  if (count < MIN_GLYPH_AXES || count > MAX_GLYPH_AXES) return false;
  const produced = new Set(predictEncodedFeatureNames(state));
  return state.glyphFeatures.every(feature => produced.has(feature));
}

/**
 * Whether the settings of a step let the wizard go past it. The same rules as
 * the steps' own Continue buttons (canProceed), but read from the state, so
 * the stepper and the review step can check steps that are not shown.
 */
export function isStepValid(id: WizardStepId, state: StepValidityState): boolean {
  const configs = Array.from(state.columnConfigs.values());
  switch (id) {
    case 'upload':
      return state.dataProfile !== null && !state.uploadMissing;
    case 'columns':
      return configs.some(isFeatureColumn);
    case 'features':
      return true;
    case 'projection':
      return configs.some(config => isFeatureColumn(config) && config.includeInProjection);
    case 'appearance':
      return isGlyphSelectionValid(state);
    case 'review':
      return state.processedDataset !== null;
  }
}

/** The first step before step `index` whose settings are not valid, or null. */
export function firstInvalidStepBefore(state: StepValidityState, index: number): WizardStepId | null {
  return WIZARD_STEPS.slice(0, index).find(step => !isStepValid(step.id, state))?.id ?? null;
}

/**
 * Whether the user may open step `index` from the stepper: every step up to the
 * current one; a later step only when every step before it is valid and the
 * user has opened the step before it already (at most one step beyond the
 * furthest one), so a new file is walked through in order.
 */
export function isStepReachable(state: StepValidityState, index: number): boolean {
  if (index < 0 || index >= WIZARD_STEPS.length) return false;
  if (index <= state.currentStep) return true;
  if (index > state.furthestStep + 1) return false;
  return firstInvalidStepBefore(state, index) === null;
}

/**
 * Whether the stepper shows a step as completed: the upload once a file is
 * loaded, the review once a current processing result exists, every other step
 * once the user moved past it and its settings are valid.
 */
export function isStepCompleted(id: WizardStepId, state: StepValidityState): boolean {
  if (id === 'upload' || id === 'review') return isStepValid(id, state);
  return state.furthestStep > stepIndex(id) && isStepValid(id, state);
}
