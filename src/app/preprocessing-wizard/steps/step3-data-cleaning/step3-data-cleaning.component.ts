import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PreprocessingService } from '../../services/preprocessing.service';
import { ColumnStatistics } from '../../models/column-statistics';
import { ColumnConfig, CleaningConfig } from '../../models/column-config';
import { MissingValueStrategy, OutlierStrategy, OutlierMethod } from '../../models/data-type.enum';

interface ColumnCleaningState {
  column: ColumnStatistics;
  config: ColumnConfig;
  missingStrategy: MissingValueStrategy;
  outlierMethod: OutlierMethod;
  outlierStrategy: OutlierStrategy;
  outlierCount?: number;
  outlierIndices?: number[];
}

@Component({
  selector: 'app-step3-data-cleaning',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './step3-data-cleaning.component.html',
  styleUrl: './step3-data-cleaning.component.scss'
})
export class Step3DataCleaningComponent implements OnInit {
  @Output() continue = new EventEmitter<void>();

  activeTab: 'missing' | 'outliers' | 'duplicates' = 'missing';

  columnsWithMissing: ColumnCleaningState[] = [];
  numericColumns: ColumnCleaningState[] = [];
  duplicateCount: number = 0;
  duplicatePercentage: number = 0;
  sampleDuplicates: any[] = [];
  totalRows: number = 0;

  cleaningConfig: CleaningConfig;

  // Enum references for template
  MissingValueStrategy = MissingValueStrategy;
  OutlierStrategy = OutlierStrategy;
  OutlierMethod = OutlierMethod;

  isProcessing = false;
  error: string | null = null;

  constructor(private preprocessingService: PreprocessingService) {
    this.cleaningConfig = this.preprocessingService.currentState.cleaningConfig;
  }

  ngOnInit(): void {
    this.loadData();
    this.loadDuplicates();
  }

  private loadData(): void {
    const state = this.preprocessingService.currentState;

    if (!state.dataProfile) {
      this.error = 'No data profile available. Please go back to Step 1.';
      return;
    }

    this.totalRows = state.dataProfile.totalRows;

    // Get enabled columns only
    const enabledColumns = state.dataProfile.columns.filter(col =>
      state.columnConfigs.get(col.name)?.enabled
    );

    // Columns with missing values
    this.columnsWithMissing = enabledColumns
      .filter(col => col.missingCount > 0)
      .map(col => ({
        column: col,
        config: state.columnConfigs.get(col.name)!,
        missingStrategy: state.columnConfigs.get(col.name)?.missingValueStrategy || MissingValueStrategy.Keep,
        outlierMethod: OutlierMethod.IQR_1_5,
        outlierStrategy: OutlierStrategy.Keep
      }));

    // Numeric columns for outlier detection
    this.numericColumns = enabledColumns
      .filter(col => col.dataType === 'numeric')
      .map(col => ({
        column: col,
        config: state.columnConfigs.get(col.name)!,
        missingStrategy: state.columnConfigs.get(col.name)?.missingValueStrategy || MissingValueStrategy.Keep,
        outlierMethod: state.columnConfigs.get(col.name)?.outlierMethod || OutlierMethod.IQR_1_5,
        outlierStrategy: state.columnConfigs.get(col.name)?.outlierStrategy || OutlierStrategy.Keep
      }));

    // Load outlier counts for numeric columns
    this.loadOutlierCounts();
  }

  private async loadOutlierCounts(): Promise<void> {
    const state = this.preprocessingService.currentState;
    if (!state.rawFileName) return;

    for (const colState of this.numericColumns) {
      try {
        const result = await this.preprocessingService.detectOutliers(
          colState.column.name,
          colState.outlierMethod
        );
        colState.outlierCount = result.outlierCount;
        colState.outlierIndices = result.outlierIndices;
      } catch (err) {
        console.error(`Failed to detect outliers for ${colState.column.name}:`, err);
      }
    }
  }

  setActiveTab(tab: 'missing' | 'outliers' | 'duplicates'): void {
    this.activeTab = tab;
  }

  onMissingStrategyChange(columnName: string, strategy: MissingValueStrategy): void {
    this.preprocessingService.updateColumnConfig(columnName, {
      missingValueStrategy: strategy
    });

    // Update local state
    const colState = this.columnsWithMissing.find(c => c.column.name === columnName);
    if (colState) {
      colState.missingStrategy = strategy;
    }
  }

  onOutlierMethodChange(columnName: string, method: OutlierMethod): void {
    const colState = this.numericColumns.find(c => c.column.name === columnName);
    if (colState) {
      colState.outlierMethod = method;
      // Reload outlier count
      this.reloadOutlierCount(colState);
    }
  }

  onOutlierStrategyChange(columnName: string, strategy: OutlierStrategy): void {
    this.preprocessingService.updateColumnConfig(columnName, {
      outlierStrategy: strategy
    });

    const colState = this.numericColumns.find(c => c.column.name === columnName);
    if (colState) {
      colState.outlierStrategy = strategy;
    }
  }

  private async reloadOutlierCount(colState: ColumnCleaningState): Promise<void> {
    try {
      const result = await this.preprocessingService.detectOutliers(
        colState.column.name,
        colState.outlierMethod
      );
      colState.outlierCount = result.outlierCount;
      colState.outlierIndices = result.outlierIndices;
    } catch (err) {
      console.error(`Failed to reload outliers for ${colState.column.name}:`, err);
    }
  }

  getImpactMessage(colState: ColumnCleaningState): string {
    const strategy = colState.missingStrategy;
    const count = colState.column.missingCount;

    if (strategy === MissingValueStrategy.Keep) {
      return 'No changes will be made';
    } else if (strategy === MissingValueStrategy.RemoveRows) {
      return `Will remove ${count} rows (${((count / this.totalRows) * 100).toFixed(1)}% of data)`;
    } else if (strategy === MissingValueStrategy.FillMean || strategy === MissingValueStrategy.FillMedian) {
      return `Will fill ${count} missing values with ${strategy === MissingValueStrategy.FillMean ? 'mean' : 'median'}`;
    } else if (strategy === MissingValueStrategy.FillMode) {
      return `Will fill ${count} missing values with most common value`;
    } else if (strategy === MissingValueStrategy.FillValue) {
      return `Will fill ${count} missing values with specified value`;
    }
    return '';
  }

  getOutlierImpactMessage(colState: ColumnCleaningState): string {
    const count = colState.outlierCount || 0;
    const strategy = colState.outlierStrategy;

    if (strategy === OutlierStrategy.Keep || count === 0) {
      return 'No changes will be made';
    } else if (strategy === OutlierStrategy.Remove) {
      return `Will remove ${count} rows (${((count / this.totalRows) * 100).toFixed(1)}% of data)`;
    } else if (strategy === OutlierStrategy.Cap) {
      return `Will cap ${count} values to boundary limits`;
    }
    return '';
  }

  getOutlierMethodLabel(method: OutlierMethod): string {
    switch (method) {
      case OutlierMethod.IQR_1_5: return 'IQR (1.5x) - Moderate';
      case OutlierMethod.IQR_2_0: return 'IQR (2.0x) - Relaxed';
      case OutlierMethod.IQR_3_0: return 'IQR (3.0x) - Very Relaxed';
      case OutlierMethod.ZScore_2: return 'Z-Score (2σ) - Strict';
      case OutlierMethod.ZScore_3: return 'Z-Score (3σ) - Moderate';
      case OutlierMethod.ZScore_4: return 'Z-Score (4σ) - Relaxed';
      default: return method;
    }
  }

  private async loadDuplicates(): Promise<void> {
    try {
      const result = await this.preprocessingService.detectDuplicates();
      this.duplicateCount = result.duplicateCount;
      this.duplicatePercentage = result.percentage;
      this.sampleDuplicates = result.sampleDuplicates;
    } catch (err) {
      console.error('Failed to detect duplicates:', err);
    }
  }

  toggleRemoveDuplicates(remove: boolean): void {
    this.preprocessingService.updateCleaningConfig({ removeDuplicates: remove });
    this.cleaningConfig = this.preprocessingService.currentState.cleaningConfig;
  }

  get columnNames(): string[] {
    const state = this.preprocessingService.currentState;
    if (!state.dataProfile) return [];
    return state.dataProfile.columns.map(c => c.name);
  }

  get hasCleaningActions(): boolean {
    // Check if any cleaning actions are configured
    const hasMissingActions = this.columnsWithMissing.some(c =>
      c.missingStrategy !== MissingValueStrategy.Keep
    );

    const hasOutlierActions = this.numericColumns.some(c =>
      c.outlierStrategy !== OutlierStrategy.Keep && (c.outlierCount || 0) > 0
    );

    const hasDuplicateAction = this.cleaningConfig.removeDuplicates && this.duplicateCount > 0;

    return hasMissingActions || hasOutlierActions || hasDuplicateAction;
  }

  onContinue(): void {
    this.continue.emit();
  }
}
