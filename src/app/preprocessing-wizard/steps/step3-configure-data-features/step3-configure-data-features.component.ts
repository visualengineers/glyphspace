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
import { STEP_INFO } from '../../shared/constants/step-info';
import { DataPreviewTableComponent } from '../../shared/data-preview-table/data-preview-table.component';

interface ColumnConfigState {
  column: ColumnStatistics;
  config: ColumnConfig;
  outlierCount?: number;
  outlierIndices?: number[];
  isLoadingOutliers?: boolean;
}

@Component({
  selector: 'app-step3-configure-data-features',
  standalone: true,
  imports: [FormsModule, HelpTooltipComponent, DataPreviewTableComponent],
  templateUrl: './step3-configure-data-features.component.html',
  styleUrl: './step3-configure-data-features.component.scss',
  providers: [{ provide: WIZARD_STEP, useExisting: forwardRef(() => Step3ConfigureDataFeaturesComponent) }],
})
export class Step3ConfigureDataFeaturesComponent implements OnInit, WizardStep {
  readonly primaryLabel = 'Continue to Visualization Settings';
  readonly disabledHint = '';

  @ViewChild('railSearchInput') railSearchInput?: ElementRef<HTMLInputElement>;

  columns: ColumnConfigState[] = [];
  filteredColumns: ColumnConfigState[] = [];

  // Selection state for list+detail panel
  selectedColumnName: string | null = null;

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
  readonly stepInfo = STEP_INFO[2]; // Step 3 (index 2)

  constructor(public preprocessingService: PreprocessingService) {
    this.cleaningConfig = this.preprocessingService.currentState.cleaningConfig;
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
          column: col,
          config: config,
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

      // Update config
      this.preprocessingService.updateColumnConfig(colState.column.name, {
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

    // Sort: columns with issues first, then alphabetical
    this.filteredColumns.sort((a, b) => {
      const aIssues = (a.column.missingCount > 0 ? 1 : 0) + ((a.outlierCount || 0) > 0 ? 1 : 0);
      const bIssues = (b.column.missingCount > 0 ? 1 : 0) + ((b.outlierCount || 0) > 0 ? 1 : 0);
      if (aIssues !== bIssues) return bIssues - aIssues;
      return a.column.name.localeCompare(b.column.name);
    });

    // Re-select if current selection is filtered out
    if (this.selectedColumnName && !this.filteredColumns.find(c => c.column.name === this.selectedColumnName)) {
      this.selectedColumnName = this.filteredColumns.length > 0 ? this.filteredColumns[0].column.name : null;
    }
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.filterText = '';
    this.filterType = 'all';
    this.showIssuesOnly = false;
    this.applyFilters();
  }

  // ============================================================================
  // Configuration Changes
  // ============================================================================

  onEncodingChange(columnName: string, method: EncodingMethod): void {
    this.preprocessingService.updateColumnConfig(columnName, { encodingMethod: method });
  }

  onScalingChange(columnName: string, method: ScalingMethod): void {
    this.preprocessingService.updateColumnConfig(columnName, { scalingMethod: method });
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
  }

  async onOutlierMethodChange(columnName: string, method: OutlierMethod): Promise<void> {
    this.preprocessingService.updateColumnConfig(columnName, {
      outlierMethod: method,
    });

    const colState = this.columns.find(c => c.column.name === columnName);
    if (colState) {
      await this.detectOutliersForColumn(colState);
    }
  }

  onOutlierStrategyChange(columnName: string, strategy: OutlierStrategy): void {
    this.preprocessingService.updateColumnConfig(columnName, {
      outlierStrategy: strategy,
    });
  }

  toggleRemoveDuplicates(): void {
    this.cleaningConfig.removeDuplicates = !this.cleaningConfig.removeDuplicates;
    this.preprocessingService.updateCleaningConfig({
      removeDuplicates: this.cleaningConfig.removeDuplicates,
    });
  }

  // ============================================================================
  // Selection
  // ============================================================================

  selectColumn(name: string): void {
    this.selectedColumnName = name;
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

  isOutlierModified(colState: ColumnConfigState): boolean {
    const def = this.getDefaults(colState);
    return (
      colState.config.outlierMethod !== def.outlierMethod ||
      colState.config.outlierStrategy !== def.outlierStrategy
    );
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

  resetEncoding(colState: ColumnConfigState): void {
    const method = this.getDefaults(colState).encodingMethod;
    if (method === undefined) return;
    colState.config.encodingMethod = method;
    this.preprocessingService.updateColumnConfig(colState.column.name, { encodingMethod: method });
  }

  resetScaling(colState: ColumnConfigState): void {
    const method = this.getDefaults(colState).scalingMethod;
    if (method === undefined) return;
    colState.config.scalingMethod = method;
    this.preprocessingService.updateColumnConfig(colState.column.name, { scalingMethod: method });
  }

  resetMissing(colState: ColumnConfigState): void {
    const strategy = this.getDefaults(colState).missingValueStrategy;
    if (strategy === undefined) return;
    colState.config.missingValueStrategy = strategy;
    colState.config.missingValueFillValue = undefined;
    this.preprocessingService.updateColumnConfig(colState.column.name, {
      missingValueStrategy: strategy,
      missingValueFillValue: undefined,
    });
  }

  async resetOutliers(colState: ColumnConfigState): Promise<void> {
    const def = this.getDefaults(colState);
    if (def.outlierMethod === undefined || def.outlierStrategy === undefined) return;
    colState.config.outlierMethod = def.outlierMethod;
    colState.config.outlierStrategy = def.outlierStrategy;
    this.preprocessingService.updateColumnConfig(colState.column.name, {
      outlierMethod: def.outlierMethod,
      outlierStrategy: def.outlierStrategy,
    });
    await this.detectOutliersForColumn(colState);
  }

  /** Reset every setting of the selected column back to its smart default. */
  resetColumnToDefault(colState: ColumnConfigState): void {
    this.resetEncoding(colState);
    this.resetScaling(colState);
    this.resetMissing(colState);
    void this.resetOutliers(colState);
  }

  // ============================================================================
  // A9 – Bulk apply settings to all columns of the same type
  // ============================================================================

  getSameTypeColumns(colState: ColumnConfigState): ColumnConfigState[] {
    return this.columns.filter(
      c => c.column.dataType === colState.column.dataType && c.column.name !== colState.column.name
    );
  }

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

    for (const target of targets) {
      Object.assign(target.config, updates);
      this.preprocessingService.updateColumnConfig(target.column.name, updates);
      if (this.shouldShowOutliers(target)) {
        void this.detectOutliersForColumn(target);
      }
    }
  }

  /** Focus the column search field when the user presses "/" (unless already typing). */
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key !== '/') return;
    const target = event.target as HTMLElement | null;
    const tag = target?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) {
      return;
    }
    event.preventDefault();
    this.railSearchInput?.nativeElement.focus();
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
    // projection now happens in Step 4 (Visualization Settings).
    return true;
  }

  proceed(): void {
    if (this.canProceed()) {
      this.preprocessingService.nextStep();
    }
  }
}
