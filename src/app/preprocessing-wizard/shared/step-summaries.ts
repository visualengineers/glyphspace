import { PreprocessingState } from '../models/preprocessing-state';
import { ColumnConfig, ProjectionConfig } from '../models/column-config';
import { PROJECTION_METHODS } from '../steps/step4-projection-settings/projection-methods';
import { WizardStepId } from './constants/step-info';

/** One-line summary of what was chosen in each step ('' when there is nothing to summarize yet). */
export type StepSummaries = Readonly<Record<WizardStepId, string>>;

/** Background methods listed by name before the rest is folded into "+N". */
const LISTED_METHODS = 2;

/** "1 row" / "1,599 rows" (English thousands separators). */
function countOf(count: number, noun: string): string {
  return `${count.toLocaleString('en-US')} ${noun}${count === 1 ? '' : 's'}`;
}

/** Joins the non-empty parts with " · ". */
function joinParts(parts: readonly string[]): string {
  return parts.filter(part => part !== '').join(' · ');
}

function uploadSummary(state: PreprocessingState): string {
  const profile = state.dataProfile;
  if (!profile) return '';
  // Tolerate partial profiles (e.g. restored from an older saved session).
  const fileName = profile.fileName || state.rawFileName || '';
  const rows = typeof profile.totalRows === 'number' ? countOf(profile.totalRows, 'row') : '';
  return joinParts([fileName, rows]);
}

function columnsSummary(configs: readonly ColumnConfig[], enabled: readonly ColumnConfig[]): string {
  return configs.length > 0 ? `${enabled.length} of ${countOf(configs.length, 'column')}` : '';
}

function featuresSummary(enabled: readonly ColumnConfig[]): string {
  return enabled.length > 0 ? `${countOf(enabled.length, 'column')} configured` : '';
}

/** "PCA, UMAP +2 · 11 columns"; FastMap always runs, so no background method reads "FastMap only". */
function projectionSummary(config: ProjectionConfig, enabled: readonly ColumnConfig[]): string {
  const names = PROJECTION_METHODS.filter(method => config[method.key]).map(method => method.name);
  const listed = names.slice(0, LISTED_METHODS).join(', ');
  const more = names.length > LISTED_METHODS ? ` +${names.length - LISTED_METHODS}` : '';
  const methods = names.length > 0 ? `${listed}${more}` : 'FastMap only';
  const projected = enabled.filter(column => column.includeInProjection).length;
  return `${methods} · ${countOf(projected, 'column')}`;
}

function appearanceSummary(state: PreprocessingState, enabled: readonly ColumnConfig[]): string {
  const glyphs = state.glyphFeatures.length > 0 ? countOf(state.glyphFeatures.length, 'glyph feature') : '';
  const colorColumn = enabled.find(config => config.isColorFeature)?.name;
  const color = colorColumn ? `color: ${colorColumn}` : '';
  return joinParts([glyphs, color]);
}

/**
 * Live one-line summaries shown under completed steps in the sidebar stepper,
 * e.g. upload "wine.csv · 1,599 rows" or columns "11 of 12 columns". Pure: the
 * result depends only on the given state.
 */
export function stepSummaries(state: PreprocessingState): StepSummaries {
  const configs = Array.from(state.columnConfigs.values());
  const enabled = configs.filter(config => config.enabled);
  return {
    upload: uploadSummary(state),
    columns: columnsSummary(configs, enabled),
    features: featuresSummary(enabled),
    projection: enabled.length > 0 ? projectionSummary(state.projectionConfig, enabled) : '',
    appearance: appearanceSummary(state, enabled),
    review: state.processedDataset ? 'Processed' : '',
  };
}
