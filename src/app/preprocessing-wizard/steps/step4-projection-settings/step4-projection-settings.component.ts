import { Component, OnInit, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PreprocessingService } from '../../services/preprocessing.service';
import { WizardStep, WIZARD_STEP } from '../../shared/wizard-step';
import { ColumnConfig, ProjectionConfig } from '../../models/column-config';
import { ColumnStatistics } from '../../models/column-statistics';
import { DEFAULT_PROJECTION_CONFIG } from '../../models/preprocessing-state';
import {
  DataType,
  MissingValueStrategy,
  getEncodingLabel as encodingLabelFn,
  getScalingLabel as scalingLabelFn,
} from '../../models/data-type.enum';
import { HelpTooltipComponent } from '../../shared/help-tooltip/help-tooltip.component';
import { ProjectionPreviewComponent } from '../../shared/projection-preview/projection-preview.component';
import { HELP_TEXT } from '../../shared/constants/help-text';
import { getStepInfo } from '../../shared/constants/step-info';
import { DataTypeBadgeComponent } from '../../shared/data-type-badge/data-type-badge.component';
import {
  NEIGHBOR_PARAM_KEYS,
  PROJECTION_METHODS,
  PROJECTION_PREVIEW_KEYS,
  ProjectionMethodUI,
  ProjectionParam,
  ProjectionParamKey,
} from './projection-methods';

/** A dataset column paired with its live configuration, used for projection column selection. */
interface ProjectionColumnState {
  column: ColumnStatistics;
  config: ColumnConfig;
}

/** FastMap is not a toggle: it always runs as the primary projection. */
const ALWAYS_ON_METHOD_COUNT = 1;

const MISSING_LABELS: Readonly<Record<MissingValueStrategy, string>> = {
  [MissingValueStrategy.Keep]: 'Keep',
  [MissingValueStrategy.RemoveRows]: 'Remove rows',
  [MissingValueStrategy.FillMean]: 'Fill mean',
  [MissingValueStrategy.FillMedian]: 'Fill median',
  [MissingValueStrategy.FillMode]: 'Fill mode',
  [MissingValueStrategy.FillValue]: 'Fill value',
};

/**
 * Step 4 – Projection: which columns feed the dimensionality reduction and which
 * background methods (with their parameters) run next to the always-on FastMap.
 */
@Component({
  selector: 'app-step4-projection-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, HelpTooltipComponent, ProjectionPreviewComponent, DataTypeBadgeComponent],
  templateUrl: './step4-projection-settings.component.html',
  styleUrl: './step4-projection-settings.component.scss',
  providers: [{ provide: WIZARD_STEP, useExisting: forwardRef(() => Step4ProjectionSettingsComponent) }],
})
export class Step4ProjectionSettingsComponent implements OnInit, WizardStep {
  readonly primaryLabel = `Continue to ${getStepInfo('appearance').title}`;

  // Projection column selection (which features feed the dimensionality reduction)
  projectionColumns: ProjectionColumnState[] = [];

  // Search + type filter for the projection column list.
  projectionColumnSearch = '';
  projectionColumnTypeFilter: DataType | 'all' = 'all';
  // Names of columns whose per-column details (encoding/scaling/missing) are expanded.
  private expandedProjectionDetails = new Set<string>();

  // Label helpers for the per-column details toggle.
  readonly getEncodingLabel = encodingLabelFn;
  readonly getScalingLabel = scalingLabelFn;
  readonly DataType = DataType;

  // Projection parameter visibility
  private expandedMethodParams = new Set<string>();

  // Local copy of the stored config (loaded in ngOnInit); sliders preview here
  // before a change is committed.
  projectionConfig: ProjectionConfig = { ...DEFAULT_PROJECTION_CONFIG };

  readonly TSNE_WARNING_THRESHOLD = 5000;
  readonly LARGE_DATASET_THRESHOLD = 10000;

  readonly projectionMethods = PROJECTION_METHODS;
  readonly HELP_TEXT = HELP_TEXT;

  constructor(public preprocessingService: PreprocessingService) {}

  /** Names what is missing when Continue is disabled. */
  get disabledHint(): string {
    if (this.getProjectionCount() === 0) {
      return 'Include at least one column in the projection to continue.';
    }
    if (this.enabledMethodCount() === 0) {
      return 'Enable at least one projection method to continue.';
    }
    return '';
  }

  ngOnInit(): void {
    const state = this.preprocessingService.currentState;
    this.projectionConfig = { ...state.projectionConfig };
    this.projectionColumns = (state.dataProfile?.columns ?? []).flatMap(column => {
      const config = state.columnConfigs.get(column.name);
      return config?.enabled ? [{ column, config }] : [];
    });
  }

  // ============================================================================
  // Projection Column Selection
  // ============================================================================

  toggleColumnProjection(columnName: string): void {
    const entry = this.projectionColumns.find(c => c.column.name === columnName);
    if (!entry) return;
    this.preprocessingService.updateColumnConfig(columnName, {
      includeInProjection: !entry.config.includeInProjection,
    });
    this.syncProjectionColumns();
  }

  /** Include/exclude every projection column as ONE undo entry. */
  setAllProjectionColumns(included: boolean): void {
    const changed = this.projectionColumns.filter(entry => entry.config.includeInProjection !== included);
    this.preprocessingService.updateColumnConfigs(
      changed.map(entry => ({ columnName: entry.column.name, updates: { includeInProjection: included } })),
      included ? 'All projection columns selected' : 'All projection columns deselected'
    );
    this.syncProjectionColumns();
  }

  /** Re-read the column configs from the service after a write (never edit them in place). */
  private syncProjectionColumns(): void {
    const configs = this.preprocessingService.currentState.columnConfigs;
    this.projectionColumns = this.projectionColumns.map(entry => ({
      ...entry,
      config: configs.get(entry.column.name) ?? entry.config,
    }));
  }

  isColumnInProjection(columnName: string): boolean {
    return this.projectionColumns.find(c => c.column.name === columnName)?.config.includeInProjection ?? false;
  }

  /** Projection columns filtered by the search box and the type filter. */
  get filteredProjectionColumns(): ProjectionColumnState[] {
    const term = this.projectionColumnSearch.trim().toLowerCase();
    return this.projectionColumns.filter(entry => {
      if (term && !entry.column.name.toLowerCase().includes(term)) return false;
      return this.projectionColumnTypeFilter === 'all' || entry.column.dataType === this.projectionColumnTypeFilter;
    });
  }

  hasProjectionColumnFilter(): boolean {
    return this.projectionColumnSearch.trim() !== '' || this.projectionColumnTypeFilter !== 'all';
  }

  clearProjectionColumnFilters(): void {
    this.projectionColumnSearch = '';
    this.projectionColumnTypeFilter = 'all';
  }

  /** Toggle the per-column details panel (encoding/scaling/missing) for progressive disclosure. */
  toggleProjectionDetails(columnName: string, event?: Event): void {
    event?.stopPropagation();
    event?.preventDefault();
    this.expandedProjectionDetails = toggled(this.expandedProjectionDetails, columnName);
  }

  isProjectionDetailsExpanded(columnName: string): boolean {
    return this.expandedProjectionDetails.has(columnName);
  }

  /** Human-readable label for the configured missing-value strategy. */
  getMissingLabel(strategy: MissingValueStrategy): string {
    return MISSING_LABELS[strategy] ?? 'Keep';
  }

  getProjectionCount(): number {
    return this.projectionColumns.filter(c => c.config.includeInProjection).length;
  }

  /** True when every column is included (master checkbox checked). */
  allColumnsInProjection(): boolean {
    return this.projectionColumns.length > 0 && this.getProjectionCount() === this.projectionColumns.length;
  }

  /** True when only some columns are included (master checkbox indeterminate). */
  someColumnsInProjection(): boolean {
    const count = this.getProjectionCount();
    return count > 0 && count < this.projectionColumns.length;
  }

  /** Master checkbox: select all unless everything is already selected, in which case clear. */
  onToggleAllProjection(): void {
    this.setAllProjectionColumns(!this.allColumnsInProjection());
  }

  // ============================================================================
  // Projection Methods
  // ============================================================================

  /** Preview key for a method's animated explainer tooltip. */
  getPreviewKey(method: ProjectionMethodUI): string {
    return PROJECTION_PREVIEW_KEYS[method.key];
  }

  /** CSS modifier for the speed badge, e.g. "badge-very-fast". */
  badgeClass(method: ProjectionMethodUI): string {
    return `badge-${(method.badge ?? '').toLowerCase().split(' ').join('-')}`;
  }

  isMethodDisabled(method: ProjectionMethodUI): boolean {
    return method.disabled ?? false;
  }

  shouldShowLargeDatasetWarning(method: ProjectionMethodUI): boolean {
    return method.largeDatasetWarning === true && this.getDatasetRowCount() > this.LARGE_DATASET_THRESHOLD;
  }

  toggleProjectionMethod(method: ProjectionMethodUI): void {
    if (this.isMethodDisabled(method)) return;
    const enabled = !this.projectionConfig[method.key];
    const next: ProjectionConfig = { ...this.projectionConfig, [method.key]: enabled };
    this.commitProjectionConfig(next, `${method.name} ${enabled ? 'enabled' : 'disabled'}`);
  }

  /** FastMap (always on) plus every enabled background method. */
  enabledMethodCount(): number {
    const background = this.projectionMethods.filter(method => this.projectionConfig[method.key]).length;
    return ALWAYS_ON_METHOD_COUNT + background;
  }

  /**
   * A3 / C-S4-05: field-near validation for neighbour parameters (error class K4).
   * A neighbour count at or above the row count makes IsoMap / LLE / LTSA / UMAP
   * fail during processing; we flag it right at the parameter instead of only
   * surfacing a cryptic error later in the review step. Returns null when valid.
   * (0 means "auto" for IsoMap/LLE/LTSA and is always valid.)
   */
  neighborParamError(param: ProjectionParam): string | null {
    if (!NEIGHBOR_PARAM_KEYS.includes(param.configKey)) return null;

    const value = this.projectionConfig[param.configKey];
    const rows = this.getDatasetRowCount();
    if (value > 0 && rows > 0 && value >= rows) {
      return `Only ${rows} rows available — set neighbours below ${rows}, or this method will fail during processing.`;
    }
    return null;
  }

  /**
   * Live parameter edit (every slider tick / keystroke): updates the local preview
   * only. Nothing is recorded until the change is committed via onParamChange.
   */
  onParamInput(configKey: ProjectionParamKey, value: number, min: number, max: number): void {
    this.projectionConfig = withParam(this.projectionConfig, configKey, clamp(value, min, max));
  }

  /** Completed parameter edit (slider released / number committed): one undo entry. */
  onParamChange(configKey: ProjectionParamKey, value: number, min: number, max: number): void {
    this.commitProjectionConfig(withParam(this.projectionConfig, configKey, clamp(value, min, max)));
  }

  /** Reads the numeric value of a parameter input event. */
  inputValue(event: Event): number {
    return event.target instanceof HTMLInputElement ? Number(event.target.value) : NaN;
  }

  /**
   * Adopt `next` locally and write it through the service (undo entry, state$
   * emission, localStorage). A commit that changes nothing records nothing.
   */
  private commitProjectionConfig(next: ProjectionConfig, label?: string): void {
    this.projectionConfig = next;
    const stored = this.preprocessingService.currentState.projectionConfig;
    const keys = Object.keys(next) as (keyof ProjectionConfig)[];
    if (keys.every(key => stored[key] === next[key])) return;
    this.preprocessingService.updateProjectionConfig(next, label);
  }

  getDatasetRowCount(): number {
    return this.preprocessingService.currentState.dataProfile?.totalRows || 0;
  }

  shouldShowTSNEWarning(): boolean {
    return this.projectionConfig.enableTSNE && this.getDatasetRowCount() > this.TSNE_WARNING_THRESHOLD;
  }

  getTSNETimeEstimate(): string {
    const rowCount = this.getDatasetRowCount();
    if (rowCount > 20000) return 'Very large dataset - t-SNE may take 15-30 minutes';
    if (rowCount > 10000) return 'Large dataset - t-SNE may take 5-15 minutes';
    if (rowCount > 5000) return 'Medium-large dataset - t-SNE may take 2-5 minutes';
    if (rowCount > 2000) return 'Medium dataset - t-SNE may take 1-2 minutes';
    return 'Small dataset - t-SNE should complete in under 1 minute';
  }

  // ============================================================================
  // Accessibility wiring and parameter thumbnails
  // ============================================================================

  /** Id of a method's enable checkbox; badge/size/warning/description ids derive from it. */
  methodCheckboxId(method: ProjectionMethodUI): string {
    return `step4-method-${method.key}`;
  }

  /** Id of a method's (collapsible) parameter panel, referenced by aria-controls. */
  paramsPanelId(method: ProjectionMethodUI): string {
    return `step4-params-${method.key}`;
  }

  /** Speed badge, size hint, large-data warning and description of a method, as rendered. */
  methodDescribedBy(method: ProjectionMethodUI): string {
    const base = this.methodCheckboxId(method);
    return [
      method.badge ? `${base}-badge` : null,
      method.sizeHint ? `${base}-size` : null,
      this.shouldShowLargeDatasetWarning(method) ? `${base}-warning` : null,
      `${base}-desc`,
    ]
      .filter((id): id is string => id !== null)
      .join(' ');
  }

  /** e.g. "Perplexity for t-SNE": several methods have a "Neighbors" slider. */
  paramAriaLabel(param: ProjectionParam, method: ProjectionMethodUI): string {
    return `${param.label} for ${method.name}`;
  }

  toggleMethodParams(methodKey: string): void {
    this.expandedMethodParams = toggled(this.expandedMethodParams, methodKey);
  }

  isMethodParamsExpanded(methodKey: string): boolean {
    return this.expandedMethodParams.has(methodKey);
  }

  methodHasParams(method: ProjectionMethodUI): boolean {
    return (method.params?.length ?? 0) > 0;
  }

  /** Resets all parameters of a method back to their default values (one undo entry). */
  resetMethodParams(method: ProjectionMethodUI): void {
    if (!method.params) return;
    const next = method.params.reduce(
      (config, param) => withParam(config, param.configKey, param.default),
      this.projectionConfig
    );
    this.commitProjectionConfig(next, `${method.name} parameters reset`);
  }

  /** True when at least one parameter of the method differs from its default. */
  methodParamsChanged(method: ProjectionMethodUI): boolean {
    return (method.params ?? []).some(param => this.projectionConfig[param.configKey] !== param.default);
  }

  // ============================================================================
  // Navigation
  // ============================================================================

  canProceed(): boolean {
    return this.getProjectionCount() > 0 && this.enabledMethodCount() > 0;
  }

  proceed(): void {
    if (this.canProceed()) {
      this.preprocessingService.nextStep();
    }
  }
}

function withParam(config: ProjectionConfig, key: ProjectionParamKey, value: number): ProjectionConfig {
  return { ...config, [key]: value };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** A copy of `set` with `key` added or removed. */
function toggled(set: ReadonlySet<string>, key: string): Set<string> {
  const next = new Set(set);
  if (next.has(key)) {
    next.delete(key);
  } else {
    next.add(key);
  }
  return next;
}
