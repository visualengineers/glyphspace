import { DEFAULT_CLEANING_CONFIG, DEFAULT_PROJECTION_CONFIG, PreprocessingState } from '../models/preprocessing-state';
import { ColumnConfig, ProjectionConfig } from '../models/column-config';
import { LAST_STEP_INDEX, WizardStepId, stepIndex } from '../shared/constants/step-info';

export const STORAGE_KEY = 'glyphspace_preprocessing_state';

/**
 * Version of the persisted layout.
 * - 1 (saved without a version field): five steps — 0 upload, 1 columns,
 *   2 features, 3 visualization (projection + glyphs + color), 4 review.
 * - 2: six steps — visualization split into projection and appearance, so
 *   review moved from index 4 to 5.
 */
export const STORAGE_VERSION = 2;

/** Step ids of the version-1 layout, by their old index. */
const V1_STEPS: readonly WizardStepId[] = ['upload', 'columns', 'features', 'projection', 'review'];

/** The slice of PreprocessingState that survives a page reload. */
type PersistedState = Pick<
  PreprocessingState,
  | 'currentStep'
  | 'dataProfile'
  | 'rawFileName'
  | 'cleaningConfig'
  | 'projectionConfig'
  | 'datasetName'
  | 'timestamp'
  | 'glyphFeatures'
  | 'tooltipFeatures'
  | 'colorScaleMode'
  | 'colorScaleId'
>;

interface SerializedState extends PersistedState {
  version: number;
  columnConfigs: [string, ColumnConfig][];
}

/**
 * Map a saved step index to the current layout. Version-1 indices are
 * translated through their step id (old 3 → projection, old 4 → review);
 * anything that is not a valid index falls back to the first step.
 */
export function migrateStoredStep(step: unknown, version: number): number {
  if (typeof step !== 'number' || !Number.isInteger(step) || step < 0) {
    return 0;
  }
  if (version < 2) {
    const id = V1_STEPS[step];
    return id ? stepIndex(id) : 0;
  }
  return step <= LAST_STEP_INDEX ? step : 0;
}

/** Build the JSON-safe, versioned payload written to localStorage. */
export function serializeState(state: PreprocessingState): SerializedState {
  return {
    version: STORAGE_VERSION,
    currentStep: state.currentStep,
    dataProfile: state.dataProfile,
    rawFileName: state.rawFileName,
    columnConfigs: Array.from(state.columnConfigs.entries()),
    cleaningConfig: state.cleaningConfig,
    projectionConfig: state.projectionConfig,
    datasetName: state.datasetName,
    timestamp: state.timestamp,
    glyphFeatures: state.glyphFeatures,
    tooltipFeatures: state.tooltipFeatures,
    colorScaleMode: state.colorScaleMode,
    colorScaleId: state.colorScaleId,
  };
}

/**
 * The saved projection config over the defaults. Only current settings with a
 * value of the default's type are taken, so settings that no longer exist
 * (e.g. TriMap's former `trimapWeightAdj`) are dropped instead of being carried
 * along and saved again.
 */
export function restoreProjectionConfig(saved: unknown): ProjectionConfig {
  const source: Partial<Record<string, unknown>> = typeof saved === 'object' && saved !== null ? saved : {};
  const entries = Object.entries(DEFAULT_PROJECTION_CONFIG).map(([key, fallback]) => {
    const value = source[key];
    return [key, typeof value === typeof fallback ? value : fallback];
  });
  return Object.fromEntries(entries) as ProjectionConfig;
}

/**
 * Parse a stored payload (any version) into a state update, migrating the step
 * index to the current layout. Returns null for an empty or non-object payload.
 * Throws on malformed JSON; the caller decides how to report that.
 */
export function deserializeState(raw: string | null): Partial<PreprocessingState> | null {
  if (!raw) return null;
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== 'object' || parsed === null) return null;

  const saved = parsed as Partial<SerializedState>;
  const version = typeof saved.version === 'number' ? saved.version : 1;
  return {
    currentStep: migrateStoredStep(saved.currentStep, version),
    dataProfile: saved.dataProfile ?? null,
    rawFileName: saved.rawFileName ?? null,
    columnConfigs: new Map(saved.columnConfigs ?? []),
    cleaningConfig: { ...DEFAULT_CLEANING_CONFIG, ...saved.cleaningConfig },
    projectionConfig: restoreProjectionConfig(saved.projectionConfig),
    datasetName: saved.datasetName ?? '',
    timestamp: saved.timestamp ?? '',
    glyphFeatures: saved.glyphFeatures ?? [],
    tooltipFeatures: saved.tooltipFeatures ?? [],
    colorScaleMode: saved.colorScaleMode === 'categorical' ? 'categorical' : 'continuous',
    colorScaleId:
      typeof saved.colorScaleId === 'number' && Number.isInteger(saved.colorScaleId) ? saved.colorScaleId : 0,
  };
}
