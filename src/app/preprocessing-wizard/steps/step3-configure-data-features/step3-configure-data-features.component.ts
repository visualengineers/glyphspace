import { Component, OnInit, forwardRef, ViewChild, ElementRef, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PreprocessingService } from '../../services/preprocessing.service';
import { WizardStep, WIZARD_STEP } from '../../shared/wizard-step';
import { ColumnConfig, CleaningConfig } from '../../models/column-config';
import { ColumnStatistics } from '../../models/column-statistics';
import {
  DataType,
  EncodingMethod,
  ScalingMethod,
  MissingValueStrategy,
  OutlierStrategy,
  OutlierMethod,
  DATA_TYPE_CONFIG,
  getDataTypeLabel,
} from '../../models/data-type.enum';
import { HelpTooltipComponent } from '../../shared/help-tooltip/help-tooltip.component';
import { HELP_TEXT } from '../../shared/constants/help-text';
import { getStepInfo } from '../../shared/constants/step-info';
import { DataPreviewTableComponent } from '../../shared/data-preview-table/data-preview-table.component';
import { WizardAnnouncer } from '../../shared/wizard-announcer.service';
import { ToastService } from '../../../services/toast.service';
import { ConsequenceHintComponent } from './consequence-hint.component';
import { describeEncoding, describeMissingValues, describeOutliers, describeScaling } from './consequence-preview';

interface ColumnConfigState {
  column: ColumnStatistics;
  config: ColumnConfig;
  outlierCount?: number;
  outlierIndices?: number[];
  isLoadingOutliers?: boolean;
}

interface BulkApplyResult {
  sourceName: string;
  typeLabel: string;
  columnNames: string[];
  settingsSummary: string;
}

/** Column names listed in the bulk-apply announcement before it says "and N more". */
const ANNOUNCED_COLUMN_LIMIT = 5;

/** Screen-reader confirmation of a bulk apply, e.g. "Settings of alpha applied to 2 Numeric columns: beta, gamma". */
function bulkApplyAnnouncement(result: BulkApplyResult): string {
  const { sourceName, typeLabel, columnNames } = result;
  const listed = columnNames.slice(0, ANNOUNCED_COLUMN_LIMIT).join(', ');
  const rest = columnNames.length - ANNOUNCED_COLUMN_LIMIT;
  const more = rest > 0 ? ` and ${rest} more` : '';
  const noun = columnNames.length === 1 ? 'column' : 'columns';
  return `Settings of ${sourceName} applied to ${columnNames.length} ${typeLabel} ${noun}: ${listed}${more}`;
}

@Component({
  selector: 'app-step3-configure-data-features',
  standalone: true,
  imports: [FormsModule, HelpTooltipComponent, DataPreviewTableComponent, ConsequenceHintComponent],
  templateUrl: './step3-configure-data-features.component.html',
  styleUrls: ['./step3-configure-data-features.component.scss', './step3-accessibility.scss'],
  providers: [{ provide: WIZARD_STEP, useExisting: forwardRef(() => Step3ConfigureDataFeaturesComponent) }],
})
export class Step3ConfigureDataFeaturesComponent implements OnInit, WizardStep {
  readonly primaryLabel = 'Continue to Projection';
  readonly disabledHint = '';

  @ViewChild('railSearchInput') railSearchInput?: ElementRef<HTMLInputElement>;

  columns: ColumnConfigState[] = [];
  filteredColumns: ColumnConfigState[] = [];

  // Selection state for list+detail panel
  selectedColumnName: string | null = null;

  // Bulk-apply (A9) UI state: progressive-disclosure list + post-apply confirmation.
  showBulkTargets = false;
  bulkApplyResult: BulkApplyResult | null = null;

  // Duplicate handling
  duplicateCount = 0;
  duplicatePercentage = 0;
  sampleDuplicates: Record<string, unknown>[] = [];
  showDuplicateSamples = false;
  totalRows = 0;

  cleaningConfig: CleaningConfig;

  // Filters
  filterText = '';
  filterType: DataType | 'all' = 'all';
  showIssuesOnly = false;

  // Enum references for template
  DataType = DataType;
  EncodingMethod = EncodingMethod;
  ScalingMethod = ScalingMethod;
  MissingValueStrategy = MissingValueStrategy;
  OutlierStrategy = OutlierStrategy;
  OutlierMethod = OutlierMethod;

  // Dropdown options
  encodingMethods = [
    { value: EncodingMethod.None, label: 'None', description: 'Keep original' },
    { value: EncodingMethod.Label, label: 'Label', description: 'Integer encoding' },
    { value: EncodingMethod.OneHot, label: 'One-Hot', description: 'Binary columns' },
    { value: EncodingMethod.Normalize, label: 'Normalize', description: 'Scale [0,1]' },
    { value: EncodingMethod.Standardize, label: 'Standardize', description: 'Z-score' },
  ];

  scalingMethods = [
    { value: ScalingMethod.None, label: 'None', description: 'No scaling' },
    { value: ScalingMethod.Standard, label: 'Standard', description: 'Z-score' },
    { value: ScalingMethod.MinMax, label: 'Min-Max', description: '[0,1]' },
    { value: ScalingMethod.Robust, label: 'Robust', description: 'IQR-based' },
  ];

  missingValueStrategies = [
    { value: MissingValueStrategy.Keep, label: 'Keep', description: 'No change' },
    { value: MissingValueStrategy.RemoveRows, label: 'Remove Rows', description: 'Delete rows' },
    { value: MissingValueStrategy.FillMean, label: 'Fill Mean', description: 'Average value', numericOnly: true },
    { value: MissingValueStrategy.FillMedian, label: 'Fill Median', description: 'Middle value', numericOnly: true },
    { value: MissingValueStrategy.FillMode, label: 'Fill Mode', description: 'Most common', categoricalOnly: true },
    { value: MissingValueStrategy.FillValue, label: 'Fill Value', description: 'Custom value' },
  ];

  outlierMethods = [
    { value: OutlierMethod.IQR_1_5, label: 'IQR (1.5x)', description: 'Moderate' },
    { value: OutlierMethod.IQR_2_0, label: 'IQR (2.0x)', description: 'Relaxed' },
    { value: OutlierMethod.IQR_3_0, label: 'IQR (3.0x)', description: 'Very Relaxed' },
    { value: OutlierMethod.ZScore_2, label: 'Z-Score (2σ)', description: 'Strict' },
    { value: OutlierMethod.ZScore_3, label: 'Z-Score (3σ)', description: 'Moderate' },
    { value: OutlierMethod.ZScore_4, label: 'Z-Score (4σ)', description: 'Relaxed' },
  ];

  outlierStrategies = [
    { value: OutlierStrategy.Keep, label: 'Keep', description: 'No change' },
    { value: OutlierStrategy.Remove, label: 'Remove', description: 'Delete rows' },
    { value: OutlierStrategy.Cap, label: 'Cap', description: 'Limit to bounds' },
  ];

  error: string | null = null;

  get selectedColumn(): ColumnConfigState | null {
    return this.columns.find(c => c.column.name === this.selectedColumnName) || null;
  }

  readonly HELP_TEXT = HELP_TEXT;
  readonly stepInfo = getStepInfo('features');

  constructor(
    public preprocessingService: PreprocessingService,
    private toastService: ToastService,
    private announcer: WizardAnnouncer
  ) {
    // Local copy: the template's ngModel writes into it, which must never mutate
    // the service state in place (that would bypass and corrupt the undo history).
    this.cleaningConfig = { ...this.preprocessingService.currentState.cleaningConfig };
  }

  ngOnInit(): void {
    this.loadData();
    this.detectDuplicates();
  }

  private loadData(): void {
    const state = this.preprocessingService.currentState;

    if (!state.dataProfile) {
      this.error = 'No data profile available. Please go back to Step 1.';
      return;
    }

    this.totalRows = state.dataProfile.totalRows;

    // Get enabled columns with their configurations
    this.columns = state.dataProfile.columns
      .filter(col => state.columnConfigs.get(col.name)?.enabled)
      .map(col => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- guaranteed by the .filter() which checks columnConfigs.get(col.name)?.enabled
        const config = state.columnConfigs.get(col.name)!;
        return {
          // Clone the config so each row owns an independent object. Sharing the
          // service-map reference here let a single-column edit appear to leak into
          // other rows; every change is still written back via updateColumnConfig.
          column: col,
          config: { ...config },
          outlierCount: config.outlierCount,
          isLoadingOutliers: false,
        };
      });

    // Load outlier counts for numeric columns
    this.loadOutlierCounts();

    // Apply initial filter
    this.applyFilters();

    // Auto-select first column
    if (this.filteredColumns.length > 0) {
      this.selectedColumnName = this.filteredColumns[0].column.name;
    }
  }

  private async loadOutlierCounts(): Promise<void> {
    const outlierColumns = this.columns.filter(c => DATA_TYPE_CONFIG[c.column.dataType]?.hasOutliers);

    for (const colState of outlierColumns) {
      if (colState.outlierCount === undefined) {
        await this.detectOutliersForColumn(colState);
      }
    }
  }

  private async detectOutliersForColumn(colState: ColumnConfigState): Promise<void> {
    colState.isLoadingOutliers = true;

    try {
      const result = await this.preprocessingService.detectOutliers(
        colState.column.name,
        colState.config.outlierMethod
      );
      colState.outlierCount = result.outlierCount;
      colState.outlierIndices = result.outlierIndices;

      // Derived from the data, not a user action: store it without an undo entry,
      // otherwise merely opening this step would fill the history (and clear redo).
      this.preprocessingService.updateColumnMetadata(colState.column.name, {
        outlierCount: result.outlierCount,
      });
    } catch (err) {
      console.error(`Failed to detect outliers for ${colState.column.name}:`, err);
    } finally {
      colState.isLoadingOutliers = false;
    }
  }

  private async detectDuplicates(): Promise<void> {
    try {
      const result = await this.preprocessingService.detectDuplicates();
      this.duplicateCount = result.duplicateCount;
      this.duplicatePercentage = result.percentage;
      this.sampleDuplicates = result.sampleDuplicates.slice(0, 5); // Show max 5 samples
    } catch (err) {
      console.error('Failed to detect duplicates:', err);
    }
  }

  // ============================================================================
  // Filtering
  // ============================================================================

  applyFilters(): void {
    this.filteredColumns = this.columns.filter(colState => {
      // Text filter
      if (this.filterText) {
        const searchLower = this.filterText.toLowerCase();
        if (!colState.column.name.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Type filter
      if (this.filterType !== 'all' && colState.column.dataType !== this.filterType) {
        return false;
      }

      // Issues filter
      if (this.showIssuesOnly) {
        const hasMissing = colState.column.missingCount > 0;
        const hasOutliers = (colState.outlierCount || 0) > 0;
        if (!hasMissing && !hasOutliers) {
          return false;
        }
      }

      return true;
    });

    // A14: Keep the columns in the SAME order as Step 2 (the state's file order,
    // i.e. `dataProfile.columns`). Previously this list was sorted issues-first +
    // alphabetically, which put each column at a different vertical slot than in
    // Step 2 and made the Step 2 -> 3 Flip morph look like rows exploding/crossing.
    // `this.columns` is already built in file order, and the filter above
    // preserves it, so no sort is applied here.

    // Re-select if current selection is filtered out
    if (this.selectedColumnName && !this.filteredColumns.find(c => c.column.name === this.selectedColumnName)) {
      this.selectedColumnName = this.filteredColumns.length > 0 ? this.filteredColumns[0].column.name : null;
    }
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  /** Clear the search text and return focus to the field (the clear button disappears). */
  clearSearch(): void {
    this.filterText = '';
    this.applyFilters();
    this.railSearchInput?.nativeElement.focus();
  }

  clearFilters(): void {
    // A4: the search/type/issues filters are transient view state of this step (not
    // part of the preprocessing state or the undo history), so clearing them gets a
    // plain confirmation only; there is no wizard configuration to undo.
    const hadActiveFilter = !!this.filterText || this.filterType !== 'all' || this.showIssuesOnly;

    this.filterText = '';
    this.filterType = 'all';
    this.showIssuesOnly = false;
    this.applyFilters();

    if (hadActiveFilter) {
      this.toastService.info('Filters cleared');
    }
  }

  // ============================================================================
  // Configuration Changes
  // ============================================================================

  onEncodingChange(columnName: string, method: EncodingMethod): void {
    this.preprocessingService.updateColumnConfig(columnName, { encodingMethod: method });
    // Mirror into local state so the deviation check (and its inline reset) update.
    const colState = this.columns.find(c => c.column.name === columnName);
    if (colState) {
      colState.config.encodingMethod = method;
    }
  }

  onScalingChange(columnName: string, method: ScalingMethod): void {
    this.preprocessingService.updateColumnConfig(columnName, { scalingMethod: method });
    const colState = this.columns.find(c => c.column.name === columnName);
    if (colState) {
      colState.config.scalingMethod = method;
    }
  }

  onMissingStrategyChange(columnName: string, strategy: MissingValueStrategy): void {
    this.preprocessingService.updateColumnConfig(columnName, {
      missingValueStrategy: strategy,
    });
    // Update local state to trigger template re-render
    const colState = this.columns.find(c => c.column.name === columnName);
    if (colState) {
      colState.config.missingValueStrategy = strategy;
    }
  }

  onMissingValueFillChange(columnName: string, fillValue: string): void {
    this.preprocessingService.updateColumnConfig(columnName, {
      missingValueFillValue: fillValue,
    });
    const colState = this.columns.find(c => c.column.name === columnName);
    if (colState) {
      colState.config.missingValueFillValue = fillValue;
    }
  }

  async onOutlierMethodChange(columnName: string, method: OutlierMethod): Promise<void> {
    this.preprocessingService.updateColumnConfig(columnName, {
      outlierMethod: method,
    });

    const colState = this.columns.find(c => c.column.name === columnName);
    if (colState) {
      colState.config.outlierMethod = method;
      await this.detectOutliersForColumn(colState);
    }
  }

  onOutlierStrategyChange(columnName: string, strategy: OutlierStrategy): void {
    this.preprocessingService.updateColumnConfig(columnName, {
      outlierStrategy: strategy,
    });
    const colState = this.columns.find(c => c.column.name === columnName);
    if (colState) {
      colState.config.outlierStrategy = strategy;
    }
  }

  toggleRemoveDuplicates(): void {
    // Derive the new value from the service (source of truth), not from the local
    // copy: the checkbox's ngModel may already have written the new value into it.
    // Previously `cleaningConfig` WAS the service's state object, so the in-place
    // flip landed in the undo snapshot too and made undo a silent no-op.
    const removeDuplicates = !this.preprocessingService.currentState.cleaningConfig.removeDuplicates;
    this.preprocessingService.updateCleaningConfig({ removeDuplicates });
    this.cleaningConfig = { ...this.preprocessingService.currentState.cleaningConfig };
  }

  // ============================================================================
  // Selection
  // ============================================================================

  selectColumn(name: string): void {
    this.selectedColumnName = name;
    // Collapse per-column bulk UI when switching columns.
    this.showBulkTargets = false;
    this.bulkApplyResult = null;
  }

  // ============================================================================
  // A2 – Smart defaults: deviation detection + reversible reset
  // ============================================================================

  /** Smart-default values for a column, derived from its data type. */
  private getDefaults(colState: ColumnConfigState): Partial<ColumnConfig> {
    return this.preprocessingService.getColumnDefaults(colState.column.name) ?? {};
  }

  isEncodingModified(colState: ColumnConfigState): boolean {
    return colState.config.encodingMethod !== this.getDefaults(colState).encodingMethod;
  }

  isScalingModified(colState: ColumnConfigState): boolean {
    return colState.config.scalingMethod !== this.getDefaults(colState).scalingMethod;
  }

  isMissingModified(colState: ColumnConfigState): boolean {
    const def = this.getDefaults(colState);
    return (
      colState.config.missingValueStrategy !== def.missingValueStrategy ||
      (colState.config.missingValueStrategy === MissingValueStrategy.FillValue &&
        !!colState.config.missingValueFillValue)
    );
  }

  isOutlierMethodModified(colState: ColumnConfigState): boolean {
    return colState.config.outlierMethod !== this.getDefaults(colState).outlierMethod;
  }

  isOutlierStrategyModified(colState: ColumnConfigState): boolean {
    return colState.config.outlierStrategy !== this.getDefaults(colState).outlierStrategy;
  }

  isOutlierModified(colState: ColumnConfigState): boolean {
    return this.isOutlierMethodModified(colState) || this.isOutlierStrategyModified(colState);
  }

  /** True when any setting of the column deviates from its smart default. */
  isColumnModified(colState: ColumnConfigState): boolean {
    return (
      this.isEncodingModified(colState) ||
      this.isScalingModified(colState) ||
      this.isMissingModified(colState) ||
      this.isOutlierModified(colState)
    );
  }

  /** Write one user change to the service (exactly one undo entry) and mirror it locally. */
  private applyColumnChange(colState: ColumnConfigState, updates: Partial<ColumnConfig>): void {
    colState.config = { ...colState.config, ...updates };
    this.preprocessingService.updateColumnConfig(colState.column.name, updates);
  }

  resetEncoding(colState: ColumnConfigState): void {
    const encodingMethod = this.getDefaults(colState).encodingMethod;
    if (encodingMethod === undefined) return;
    this.applyColumnChange(colState, { encodingMethod });
  }

  resetScaling(colState: ColumnConfigState): void {
    const scalingMethod = this.getDefaults(colState).scalingMethod;
    if (scalingMethod === undefined) return;
    this.applyColumnChange(colState, { scalingMethod });
  }

  resetMissing(colState: ColumnConfigState): void {
    const missingValueStrategy = this.getDefaults(colState).missingValueStrategy;
    if (missingValueStrategy === undefined) return;
    this.applyColumnChange(colState, { missingValueStrategy, missingValueFillValue: undefined });
  }

  async resetOutlierMethod(colState: ColumnConfigState): Promise<void> {
    const outlierMethod = this.getDefaults(colState).outlierMethod;
    if (outlierMethod === undefined) return;
    this.applyColumnChange(colState, { outlierMethod });
    await this.detectOutliersForColumn(colState);
  }

  resetOutlierStrategy(colState: ColumnConfigState): void {
    const outlierStrategy = this.getDefaults(colState).outlierStrategy;
    if (outlierStrategy === undefined) return;
    this.applyColumnChange(colState, { outlierStrategy });
  }

  /** Reset outlier method and strategy together as one undo entry. */
  async resetOutliers(colState: ColumnConfigState): Promise<void> {
    const { outlierMethod, outlierStrategy } = this.getDefaults(colState);
    if (outlierMethod === undefined || outlierStrategy === undefined) return;
    this.applyColumnChange(colState, { outlierMethod, outlierStrategy });
    await this.detectOutliersForColumn(colState);
  }

  /**
   * Reset every Step 3 setting of the column back to its smart default as ONE undo
   * entry, so a single undo restores all of them. The Step 4 projection flag is
   * deliberately left alone.
   */
  resetColumnToDefault(colState: ColumnConfigState): void {
    const defaults = this.preprocessingService.getColumnDefaults(colState.column.name);
    if (!defaults) return;
    this.applyColumnChange(colState, {
      encodingMethod: defaults.encodingMethod,
      scalingMethod: defaults.scalingMethod,
      missingValueStrategy: defaults.missingValueStrategy,
      missingValueFillValue: undefined,
      outlierMethod: defaults.outlierMethod,
      outlierStrategy: defaults.outlierStrategy,
    });
    if (this.shouldShowOutliers(colState)) {
      void this.detectOutliersForColumn(colState);
    }
  }

  // ============================================================================
  // A9 – Bulk apply settings to all columns of the same type
  // ============================================================================

  /** Other enabled columns that share the selected column's data type. */
  getSameTypeColumns(colState: ColumnConfigState): ColumnConfigState[] {
    return this.columns.filter(
      c => c.column.dataType === colState.column.dataType && c.column.name !== colState.column.name
    );
  }

  /** Toggle the progressive-disclosure list of columns a bulk apply would touch. */
  toggleBulkTargets(): void {
    this.showBulkTargets = !this.showBulkTargets;
  }

  /** Human-readable summary of the settings a bulk apply copies over. */
  getBulkSettingsSummary(source: ColumnConfigState): string {
    const parts: string[] = [];
    const enc = this.encodingMethods.find(m => m.value === source.config.encodingMethod);
    if (enc) parts.push(`Encoding: ${enc.label}`);
    if (this.shouldShowScaling(source)) {
      const sc = this.scalingMethods.find(m => m.value === source.config.scalingMethod);
      if (sc) parts.push(`Scaling: ${sc.label}`);
    }
    const miss = this.missingValueStrategies.find(m => m.value === source.config.missingValueStrategy);
    if (miss) parts.push(`Missing: ${miss.label}`);
    if (this.shouldShowOutliers(source)) {
      const om = this.outlierMethods.find(m => m.value === source.config.outlierMethod);
      const os = this.outlierStrategies.find(m => m.value === source.config.outlierStrategy);
      if (om && os) parts.push(`Outliers: ${om.label} / ${os.label}`);
    }
    return parts.join(' · ');
  }

  /**
   * Copies the selected column's settings onto every other column of the same type.
   * Runs ONLY from an explicit button click — never as a side effect of editing a
   * single column. Missing-value handling is copied too, but on columns without any
   * missing values it simply has no effect.
   */
  applyToSameType(source: ColumnConfigState): void {
    const targets = this.getSameTypeColumns(source);
    if (targets.length === 0) return;

    const updates: Partial<ColumnConfig> = {
      encodingMethod: source.config.encodingMethod,
      scalingMethod: source.config.scalingMethod,
      missingValueStrategy: source.config.missingValueStrategy,
      missingValueFillValue: source.config.missingValueFillValue,
      outlierMethod: source.config.outlierMethod,
      outlierStrategy: source.config.outlierStrategy,
    };

    // One undo entry for the whole bulk apply, so a single undo reverts every target.
    const count = targets.length;
    this.preprocessingService.updateColumnConfigs(
      targets.map(target => ({ columnName: target.column.name, updates })),
      `Settings applied to ${count} ${count === 1 ? 'column' : 'columns'}`
    );
    for (const target of targets) {
      target.config = { ...target.config, ...updates };
      if (this.shouldShowOutliers(target)) {
        void this.detectOutliersForColumn(target);
      }
    }

    // Confirmation summary shown after the apply completes.
    this.bulkApplyResult = {
      sourceName: source.column.name,
      typeLabel: this.getTypeLabel(source.column.dataType),
      columnNames: targets.map(t => t.column.name),
      settingsSummary: this.getBulkSettingsSummary(source),
    };
    this.showBulkTargets = false;
    // The summary box is rendered conditionally, so a role="status" on it would
    // not be announced reliably; the shell's persistent live region is.
    this.announcer.announce(bulkApplyAnnouncement(this.bulkApplyResult));
  }

  dismissBulkResult(): void {
    this.bulkApplyResult = null;
  }

  /**
   * Focus the column search field when the user presses "/" (unless already
   * typing). Listens on this step's host only, not the document, so the
   * single-key shortcut is active only while focus is inside the step
   * (WCAG 2.1.4) and never steals "/" from other parts of the page.
   */
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target instanceof HTMLElement ? event.target : null;
    const tag = target?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) {
      return;
    }
    event.preventDefault();
    this.railSearchInput?.nativeElement.focus();
  }

  // ============================================================================
  // "Show the consequence": what the current setting does to this column
  // ============================================================================

  encodingConsequence(colState: ColumnConfigState): string | null {
    return describeEncoding(colState.column, colState.config.encodingMethod);
  }

  scalingConsequence(colState: ColumnConfigState): string | null {
    return describeScaling(colState.column, colState.config.scalingMethod);
  }

  missingConsequence(colState: ColumnConfigState): string | null {
    const { missingValueStrategy, missingValueFillValue } = colState.config;
    return describeMissingValues(colState.column, missingValueStrategy, this.totalRows, missingValueFillValue);
  }

  outlierConsequence(colState: ColumnConfigState): string | null {
    // While re-detecting, the stored count belongs to the previous method.
    const count = colState.isLoadingOutliers ? undefined : colState.outlierCount;
    return describeOutliers(colState.config.outlierStrategy, count, this.totalRows);
  }

  getConfigSummary(colState: ColumnConfigState): string {
    const parts: string[] = [];
    if (colState.config.encodingMethod !== EncodingMethod.None) {
      const method = this.encodingMethods.find(m => m.value === colState.config.encodingMethod);
      if (method) parts.push(method.label);
    }
    if (colState.config.scalingMethod !== ScalingMethod.None) {
      const method = this.scalingMethods.find(m => m.value === colState.config.scalingMethod);
      if (method) parts.push(method.label);
    }
    return parts.length > 0 ? parts.join(', ') : 'Default';
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  getAvailableEncodingMethods(colState: ColumnConfigState) {
    const capabilities = DATA_TYPE_CONFIG[colState.column.dataType];
    if (!capabilities || capabilities.encodingMethods.length === 0) return [];
    return this.encodingMethods.filter(m => capabilities.encodingMethods.includes(m.value));
  }

  getAvailableMissingStrategies(colState: ColumnConfigState) {
    const capabilities = DATA_TYPE_CONFIG[colState.column.dataType];

    return this.missingValueStrategies.filter(strategy => {
      if (strategy.numericOnly && !capabilities?.missingValueFlags.numericLike) return false;
      if (strategy.categoricalOnly && !capabilities?.missingValueFlags.categorical) return false;
      return true;
    });
  }

  shouldShowEncoding(colState: ColumnConfigState): boolean {
    return this.getAvailableEncodingMethods(colState).length > 1;
  }

  shouldShowScaling(colState: ColumnConfigState): boolean {
    return DATA_TYPE_CONFIG[colState.column.dataType]?.hasScaling ?? false;
  }

  shouldShowOutliers(colState: ColumnConfigState): boolean {
    return DATA_TYPE_CONFIG[colState.column.dataType]?.hasOutliers ?? false;
  }

  hasMissingValues(colState: ColumnConfigState): boolean {
    return colState.column.missingCount > 0;
  }

  hasOutliers(colState: ColumnConfigState): boolean {
    return (colState.outlierCount || 0) > 0;
  }

  hasIssues(colState: ColumnConfigState): boolean {
    return this.hasMissingValues(colState) || this.hasOutliers(colState);
  }

  // Colorless uppercase type label shown in the master rail and detail card.
  getTypeLabel = getDataTypeLabel;

  // Missing-value warning badge turns red when the missing share reaches 20%.
  isHighMissing(colState: ColumnConfigState): boolean {
    return colState.column.missingPercentage >= 20;
  }

  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  /** "Jan 1, 2024 — Dec 31, 2024" for a date column with a known range, otherwise null. */
  dateRangeLabel(colState: ColumnConfigState): string | null {
    const { dataType, min, max } = colState.column;
    if (dataType !== DataType.Date || typeof min !== 'number' || typeof max !== 'number') return null;
    return `${this.formatDate(min)} — ${this.formatDate(max)}`;
  }

  /** The missing-value select is described by the missing count and, if any, the consequence. */
  missingDescribedBy(colState: ColumnConfigState): string {
    return this.missingConsequence(colState) ? 'step3-missing-count step3-missing-consequence' : 'step3-missing-count';
  }

  getIssueDescription(colState: ColumnConfigState): string {
    const issues: string[] = [];
    if (this.hasMissingValues(colState)) {
      issues.push(`${colState.column.missingCount} missing`);
    }
    if (this.hasOutliers(colState)) {
      issues.push(`${colState.outlierCount} outliers`);
    }
    return issues.join(', ');
  }

  get columnNames(): string[] {
    const state = this.preprocessingService.currentState;
    if (!state.dataProfile) return [];
    return state.dataProfile.columns.map(c => c.name);
  }

  canProceed(): boolean {
    // Data configuration always has valid defaults; column selection for the
    // projection happens in the Projection step.
    return true;
  }

  proceed(): void {
    if (this.canProceed()) {
      this.preprocessingService.nextStep();
    }
  }
}
