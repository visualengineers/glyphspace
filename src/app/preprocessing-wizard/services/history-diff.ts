import { DataProfile } from '../models/column-statistics';
import { ColumnConfig, CleaningConfig, ProjectionConfig } from '../models/column-config';
import { WizardStepId } from '../shared/constants/step-info';

/**
 * A4 – Undo/Redo. The subset of PreprocessingState that undo restores. Transient
 * UI fields (currentStep, isProcessing, error, processedDataset, …) are left out
 * so undoing a data-config change never yanks the user to another step or discards
 * an in-flight processing run.
 */
export interface HistorySnapshot {
  rawFileName: string | null;
  dataProfile: DataProfile | null;
  columnConfigs: Map<string, ColumnConfig>;
  cleaningConfig: CleaningConfig;
  projectionConfig: ProjectionConfig;
  datasetName: string;
  timestamp: string;
  glyphFeatures: string[];
  tooltipFeatures: string[];
  colorScaleMode: 'continuous' | 'categorical';
  colorScaleId: number;
}

/**
 * Deep copy of the undoable slice: column configs and arrays are copied, so
 * later in-place edits cannot reach it. Used both to capture the current state
 * (a PreprocessingState is a superset) and to restore a stored snapshot while
 * keeping the history entry pristine.
 */
export function copySnapshot(source: HistorySnapshot): HistorySnapshot {
  return {
    rawFileName: source.rawFileName,
    dataProfile: source.dataProfile, // replaced wholesale on re-upload; reference is safe
    columnConfigs: new Map(Array.from(source.columnConfigs.entries()).map(([name, config]) => [name, { ...config }])),
    cleaningConfig: { ...source.cleaningConfig },
    projectionConfig: { ...source.projectionConfig },
    datasetName: source.datasetName,
    timestamp: source.timestamp,
    glyphFeatures: [...source.glyphFeatures],
    tooltipFeatures: [...source.tooltipFeatures],
    colorScaleMode: source.colorScaleMode,
    colorScaleId: source.colorScaleId,
  };
}

/**
 * A4: result of an undo()/redo() call. Beyond the action label it names the single
 * setting that changed (settingLabel) and where it lives (step id + scroll anchor),
 * so the shell can show a precise hint and offer a "Show change" deep-link.
 */
export interface UndoRedoInfo {
  actionLabel: string; // original history label of the reverted/re-applied action
  settingLabel: string; // human name of the changed setting (e.g. "Encoding")
  step: WizardStepId | null; // wizard step that holds the setting, or null
  anchorId: string | null; // scroll anchor id inside that step, or null
}

/**
 * Maps a diff key (top-level snapshot key or `columnConfigs.<field>`) to a
 * human-readable setting name plus the step and scroll anchor where the setting
 * is edited. Anchors mirror the ids used by the review step's deep-links.
 */
interface SettingMeta {
  label: string;
  step: WizardStepId;
  anchorId: string | null;
}

export const SETTING_META: Readonly<Record<string, SettingMeta>> = {
  // Upload
  rawFileName: { label: 'File', step: 'upload', anchorId: null },
  datasetName: { label: 'Dataset name', step: 'upload', anchorId: null },
  // Column selection
  'columnConfigs.enabled': { label: 'Column selection', step: 'columns', anchorId: 'wizard-anchor-columns' },
  // Data configuration (per-column features + cleaning)
  'columnConfigs.encodingMethod': { label: 'Encoding', step: 'features', anchorId: 'wizard-anchor-features' },
  'columnConfigs.scalingMethod': { label: 'Scaling', step: 'features', anchorId: 'wizard-anchor-features' },
  'columnConfigs.targetType': { label: 'Data type', step: 'features', anchorId: 'wizard-anchor-features' },
  'columnConfigs.missingValueStrategy': {
    label: 'Missing values',
    step: 'features',
    anchorId: 'wizard-anchor-features',
  },
  'columnConfigs.missingValueFillValue': {
    label: 'Missing values',
    step: 'features',
    anchorId: 'wizard-anchor-features',
  },
  'columnConfigs.outlierMethod': { label: 'Outlier handling', step: 'features', anchorId: 'wizard-anchor-features' },
  'columnConfigs.outlierStrategy': { label: 'Outlier handling', step: 'features', anchorId: 'wizard-anchor-features' },
  cleaningConfig: { label: 'Data cleaning', step: 'features', anchorId: 'wizard-anchor-cleaning' },
  // Projection (columns + methods)
  'columnConfigs.includeInProjection': {
    label: 'Projection columns',
    step: 'projection',
    anchorId: 'wizard-anchor-projection-columns',
  },
  projectionConfig: { label: 'Projection settings', step: 'projection', anchorId: 'wizard-anchor-methods' },
  // Glyphs & Color
  'columnConfigs.isColorFeature': { label: 'Color attribute', step: 'appearance', anchorId: 'wizard-anchor-color' },
  isColorFeature: { label: 'Color attribute', step: 'appearance', anchorId: 'wizard-anchor-color' },
  colorScaleId: { label: 'Color scale', step: 'appearance', anchorId: 'wizard-anchor-color' },
  colorScaleMode: { label: 'Color mode', step: 'appearance', anchorId: 'wizard-anchor-color' },
  glyphFeatures: { label: 'Glyph features', step: 'appearance', anchorId: 'wizard-anchor-glyph' },
  tooltipFeatures: { label: 'Tooltip features', step: 'appearance', anchorId: 'wizard-anchor-glyph' },
};

/** Column-config fields compared by the diff, roughly in wizard order. */
const DIFFED_COLUMN_FIELDS: readonly (keyof ColumnConfig)[] = [
  'enabled',
  'isColorFeature',
  'targetType',
  'encodingMethod',
  'scalingMethod',
  'includeInProjection',
  'missingValueStrategy',
  'missingValueFillValue',
  'outlierMethod',
  'outlierStrategy',
];

/**
 * Build the hint/deep-link descriptor for an undo/redo by diffing the state
 * before against the snapshot being installed and looking up the changed key in
 * SETTING_META. Falls back to the raw action label when nothing maps cleanly.
 */
export function describeDiff(actionLabel: string, before: HistorySnapshot, after: HistorySnapshot): UndoRedoInfo {
  const key = diffSnapshots(before, after);
  const meta = key ? SETTING_META[key] : undefined;
  return {
    actionLabel,
    settingLabel: meta?.label ?? actionLabel,
    step: meta?.step ?? null,
    anchorId: meta?.anchorId ?? null,
  };
}

/**
 * Return the diff key for the first differing field between two snapshots, or
 * null if they are equal. Keys are either a top-level snapshot key or, for
 * column configs, `columnConfigs.<field>`. Order roughly follows the wizard steps.
 */
export function diffSnapshots(a: HistorySnapshot, b: HistorySnapshot): string | null {
  if (a.rawFileName !== b.rawFileName) return 'rawFileName';
  if (a.datasetName !== b.datasetName) return 'datasetName';

  const columnKey = diffColumnConfigs(a.columnConfigs, b.columnConfigs);
  if (columnKey) return columnKey;

  if (JSON.stringify(a.cleaningConfig) !== JSON.stringify(b.cleaningConfig)) return 'cleaningConfig';
  if (JSON.stringify(a.projectionConfig) !== JSON.stringify(b.projectionConfig)) return 'projectionConfig';
  if (!arraysEqual(a.glyphFeatures, b.glyphFeatures)) return 'glyphFeatures';
  if (!arraysEqual(a.tooltipFeatures, b.tooltipFeatures)) return 'tooltipFeatures';
  if (a.colorScaleMode !== b.colorScaleMode) return 'colorScaleMode';
  if (a.colorScaleId !== b.colorScaleId) return 'colorScaleId';
  return null;
}

/** Per-field diff over the column-config maps; returns `columnConfigs.<field>`. */
function diffColumnConfigs(a: Map<string, ColumnConfig>, b: Map<string, ColumnConfig>): string | null {
  const names = new Set([...a.keys(), ...b.keys()]);
  for (const name of names) {
    const ca = a.get(name);
    const cb = b.get(name);
    if (!ca || !cb) return 'columnConfigs.enabled'; // column added/removed ~ selection change
    const changed = DIFFED_COLUMN_FIELDS.find(field => ca[field] !== cb[field]);
    if (changed) return `columnConfigs.${changed}`;
  }
  return null;
}

function arraysEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}
