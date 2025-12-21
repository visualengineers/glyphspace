import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PreprocessingService } from '../../services/preprocessing.service';
import { SparklineChartComponent } from '../../shared/sparkline-chart/sparkline-chart.component';
import { BoxPlotComponent } from '../../shared/box-plot/box-plot.component';
import { ColumnStatistics } from '../../models/column-statistics';
import { ColumnConfig } from '../../models/column-config';
import { DataType } from '../../models/data-type.enum';

@Component({
  selector: 'app-step2-column-selection',
  standalone: true,
  imports: [CommonModule, FormsModule, SparklineChartComponent, BoxPlotComponent],
  templateUrl: './step2-column-selection.component.html',
  styleUrl: './step2-column-selection.component.scss'
})
export class Step2ColumnSelectionComponent implements OnInit {
  @Output() continue = new EventEmitter<void>();

  columns: ColumnStatistics[] = [];
  columnConfigs: Map<string, ColumnConfig> = new Map();
  searchTerm: string = '';

  constructor(private preprocessingService: PreprocessingService) {}

  ngOnInit(): void {
    const state = this.preprocessingService.currentState;
    if (state.dataProfile) {
      this.columns = state.dataProfile.columns;
    }
    this.columnConfigs = state.columnConfigs;
  }

  get filteredColumns(): ColumnStatistics[] {
    if (!this.searchTerm) {
      return this.columns;
    }
    const term = this.searchTerm.toLowerCase();
    return this.columns.filter(col =>
      col.name.toLowerCase().includes(term) ||
      col.dataType.toLowerCase().includes(term)
    );
  }

  get enabledCount(): number {
    return Array.from(this.columnConfigs.values()).filter(c => c.enabled).length;
  }

  get disabledCount(): number {
    return this.columnConfigs.size - this.enabledCount;
  }

  isColumnEnabled(columnName: string): boolean {
    return this.columnConfigs.get(columnName)?.enabled ?? false;
  }

  toggleColumn(columnName: string): void {
    this.preprocessingService.toggleColumnEnabled(columnName);
    this.columnConfigs = this.preprocessingService.currentState.columnConfigs;
  }

  toggleAllColumns(): void {
    if (this.enabledCount === this.columns.length) {
      this.deselectAll();
    } else {
      this.selectAll();
    }
  }

  selectAll(): void {
    this.preprocessingService.selectAllColumns();
    this.columnConfigs = this.preprocessingService.currentState.columnConfigs;
  }

  deselectAll(): void {
    this.preprocessingService.deselectAllColumns();
    this.columnConfigs = this.preprocessingService.currentState.columnConfigs;
  }

  onContinue(): void {
    if (this.enabledCount > 0) {
      this.continue.emit();
    }
  }

  getColumnConfig(columnName: string): ColumnConfig | undefined {
    return this.columnConfigs.get(columnName);
  }

  /**
   * Check if column has quality issues
   */
  hasIssues(column: ColumnStatistics): boolean {
    return column.missingPercentage > 50 || column.uniqueCount === 1;
  }

  /**
   * Get unique value percentage
   */
  getUniquePercent(column: ColumnStatistics): string {
    if (column.count === 0) return '0';
    return ((column.uniqueCount / column.count) * 100).toFixed(1);
  }

  /**
   * Get top values counts for sparkline
   */
  getTopValuesCounts(column: ColumnStatistics): number[] {
    if (!column.topValues) return [];
    return column.topValues.slice(0, 10).map(item => item.count);
  }

  /**
   * Get top values labels for sparkline tooltips
   */
  getTopValuesLabels(column: ColumnStatistics): string[] {
    if (!column.topValues) return [];
    return column.topValues.slice(0, 10).map(item =>
      `${this.truncateText(item.value, 20)}: ${item.count}`
    );
  }

  /**
   * Get data type label
   */
  getDataTypeLabel(dataType: DataType): string {
    switch (dataType) {
      case DataType.Numeric: return 'Numeric';
      case DataType.Categorical: return 'Categorical';
      case DataType.Text: return 'Text';
      case DataType.Date: return 'Date';
      case DataType.Boolean: return 'Boolean';
      case DataType.ID: return 'ID';
      default: return 'Unknown';
    }
  }

  /**
   * Get data type badge CSS class
   */
  getDataTypeBadgeClass(dataType: DataType): string {
    switch (dataType) {
      case DataType.Numeric: return 'badge-numeric';
      case DataType.Categorical: return 'badge-categorical';
      case DataType.Text: return 'badge-text';
      case DataType.Date: return 'badge-date';
      case DataType.Boolean: return 'badge-boolean';
      case DataType.ID: return 'badge-id';
      default: return 'badge-unknown';
    }
  }

  /**
   * Format number with appropriate precision
   */
  formatNumber(value: number | undefined): string {
    if (value === undefined || value === null) return '—';
    if (Math.abs(value) >= 1000) {
      return value.toLocaleString('en-US', { maximumFractionDigits: 1 });
    }
    return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }

  /**
   * Truncate text to max length
   */
  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  /**
   * Format date string for display
   */
  formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }
}
