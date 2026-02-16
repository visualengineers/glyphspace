import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PreprocessingService } from '../../services/preprocessing.service';
import { ColumnConfig, CleaningConfig } from '../../models/column-config';
import { ColumnStatistics } from '../../models/column-statistics';
import {
  DataType,
  EncodingMethod,
  ScalingMethod,
  MissingValueStrategy,
  OutlierStrategy,
  OutlierMethod
} from '../../models/data-type.enum';
import { HelpTooltipComponent } from '../../shared/help-tooltip/help-tooltip.component';
import { HELP_TEXT } from '../../shared/constants/help-text';
import { STEP_INFO } from '../../shared/constants/step-info';
import { DataTypeBadgeComponent } from '../../../shared/components/data-type-badge/data-type-badge.component';

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
  imports: [CommonModule, FormsModule, HelpTooltipComponent, DataTypeBadgeComponent],
  templateUrl: './step3-configure-data-features.component.html',
  styleUrl: './step3-configure-data-features.component.scss'
})
export class Step3ConfigureDataFeaturesComponent implements OnInit {
  columns: ColumnConfigState[] = [];
  filteredColumns: ColumnConfigState[] = [];

  // Selection state for list+detail panel
  selectedColumnName: string | null = null;

  // UI state
  showInfoBox: boolean = true;

  // Duplicate handling
  duplicateCount: number = 0;
  duplicatePercentage: number = 0;
  sampleDuplicates: any[] = [];
  showDuplicateSamples: boolean = false;
  totalRows: number = 0;

  cleaningConfig: CleaningConfig;

  // Filters
  filterText: string = '';
  filterType: DataType | 'all' = 'all';
  showIssuesOnly: boolean = false;

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
    { value: EncodingMethod.Standardize, label: 'Standardize', description: 'Z-score' }
  ];

  scalingMethods = [
    { value: ScalingMethod.None, label: 'None', description: 'No scaling' },
    { value: ScalingMethod.Standard, label: 'Standard', description: 'Z-score' },
    { value: ScalingMethod.MinMax, label: 'Min-Max', description: '[0,1]' },
    { value: ScalingMethod.Robust, label: 'Robust', description: 'IQR-based' }
  ];

  missingValueStrategies = [
    { value: MissingValueStrategy.Keep, label: 'Keep', description: 'No change' },
    { value: MissingValueStrategy.RemoveRows, label: 'Remove Rows', description: 'Delete rows' },
    { value: MissingValueStrategy.FillMean, label: 'Fill Mean', description: 'Average value', numericOnly: true },
    { value: MissingValueStrategy.FillMedian, label: 'Fill Median', description: 'Middle value', numericOnly: true },
    { value: MissingValueStrategy.FillMode, label: 'Fill Mode', description: 'Most common', categoricalOnly: true },
    { value: MissingValueStrategy.FillValue, label: 'Fill Value', description: 'Custom value' }
  ];

  outlierMethods = [
    { value: OutlierMethod.IQR_1_5, label: 'IQR (1.5x)', description: 'Moderate' },
    { value: OutlierMethod.IQR_2_0, label: 'IQR (2.0x)', description: 'Relaxed' },
    { value: OutlierMethod.IQR_3_0, label: 'IQR (3.0x)', description: 'Very Relaxed' },
    { value: OutlierMethod.ZScore_2, label: 'Z-Score (2σ)', description: 'Strict' },
    { value: OutlierMethod.ZScore_3, label: 'Z-Score (3σ)', description: 'Moderate' },
    { value: OutlierMethod.ZScore_4, label: 'Z-Score (4σ)', description: 'Relaxed' }
  ];

  outlierStrategies = [
    { value: OutlierStrategy.Keep, label: 'Keep', description: 'No change' },
    { value: OutlierStrategy.Remove, label: 'Remove', description: 'Delete rows' },
    { value: OutlierStrategy.Cap, label: 'Cap', description: 'Limit to bounds' }
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
        const config = state.columnConfigs.get(col.name)!;
        return {
          column: col,
          config: config,
          outlierCount: config.outlierCount,
          isLoadingOutliers: false
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
    const numericColumns = this.columns.filter(c => c.column.dataType === DataType.Numeric);

    for (const colState of numericColumns) {
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
        outlierCount: result.outlierCount
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
      missingValueStrategy: strategy
    });
    // Update local state to trigger template re-render
    const colState = this.columns.find(c => c.column.name === columnName);
    if (colState) {
      colState.config.missingValueStrategy = strategy;
    }
  }

  onMissingValueFillChange(columnName: string, fillValue: string): void {
    this.preprocessingService.updateColumnConfig(columnName, {
      missingValueFillValue: fillValue
    });
  }

  async onOutlierMethodChange(columnName: string, method: OutlierMethod): Promise<void> {
    this.preprocessingService.updateColumnConfig(columnName, {
      outlierMethod: method
    });

    const colState = this.columns.find(c => c.column.name === columnName);
    if (colState) {
      await this.detectOutliersForColumn(colState);
    }
  }

  onOutlierStrategyChange(columnName: string, strategy: OutlierStrategy): void {
    this.preprocessingService.updateColumnConfig(columnName, {
      outlierStrategy: strategy
    });
  }

  toggleProjection(columnName: string): void {
    const colState = this.columns.find(c => c.column.name === columnName);
    if (colState) {
      const newValue = !colState.config.includeInProjection;
      // Update service
      this.preprocessingService.updateColumnConfig(columnName, {
        includeInProjection: newValue
      });
      // Update local state to trigger template re-render
      colState.config.includeInProjection = newValue;
    }
  }

  toggleRemoveDuplicates(): void {
    this.cleaningConfig.removeDuplicates = !this.cleaningConfig.removeDuplicates;
    this.preprocessingService.updateCleaningConfig({
      removeDuplicates: this.cleaningConfig.removeDuplicates
    });
  }

  // ============================================================================
  // Selection
  // ============================================================================

  selectColumn(name: string): void {
    this.selectedColumnName = name;
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
    const dataType = colState.column.dataType;

    switch (dataType) {
      case DataType.Numeric:
        return this.encodingMethods.filter(m =>
          [EncodingMethod.None, EncodingMethod.Normalize, EncodingMethod.Standardize].includes(m.value)
        );
      case DataType.Categorical:
        return this.encodingMethods.filter(m =>
          [EncodingMethod.Label, EncodingMethod.OneHot].includes(m.value)
        );
      case DataType.Text:
        return this.encodingMethods.filter(m =>
          [EncodingMethod.None, EncodingMethod.Label, EncodingMethod.OneHot].includes(m.value)
        );
      case DataType.Date:
        return this.encodingMethods.filter(m =>
          [EncodingMethod.None, EncodingMethod.Normalize].includes(m.value)
        );
      default:
        return this.encodingMethods.filter(m =>
          [EncodingMethod.None, EncodingMethod.Label].includes(m.value)
        );
    }
  }

  getAvailableMissingStrategies(colState: ColumnConfigState) {
    const dataType = colState.column.dataType;

    return this.missingValueStrategies.filter(strategy => {
      if (strategy.numericOnly && dataType !== DataType.Numeric) return false;
      if (strategy.categoricalOnly && dataType !== DataType.Categorical) return false;
      return true;
    });
  }

  shouldShowScaling(colState: ColumnConfigState): boolean {
    return colState.column.dataType === DataType.Numeric || colState.column.dataType === DataType.Date;
  }

  shouldShowOutliers(colState: ColumnConfigState): boolean {
    return colState.column.dataType === DataType.Numeric;
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

  getProjectionCount(): number {
    return this.columns.filter(c => c.config.includeInProjection).length;
  }

  canContinue(): boolean {
    // At least one column must be included in projection
    return this.getProjectionCount() > 0;
  }

  onContinue(): void {
    if (this.canContinue()) {
      this.preprocessingService.nextStep();
    }
  }

  goBack(): void {
    this.preprocessingService.previousStep();
  }
}
