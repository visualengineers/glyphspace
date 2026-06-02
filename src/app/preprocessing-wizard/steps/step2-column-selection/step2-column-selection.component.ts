import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PreprocessingService } from '../../services/preprocessing.service';
import { MiniHistogramComponent } from '../../../shared/components/mini-histogram/mini-histogram.component';
import { ColumnStatistics, HistogramData } from '../../models/column-statistics';
import { ColumnConfig } from '../../models/column-config';
import { getDataTypeColor, getDataTypeBgColor } from '../../models/data-type.enum';
import { HelpTooltipComponent } from '../../shared/help-tooltip/help-tooltip.component';
import { HELP_TEXT } from '../../shared/constants/help-text';
import { STEP_INFO } from '../../shared/constants/step-info';
import { DataTypeBadgeComponent } from '../../shared/data-type-badge/data-type-badge.component';

@Component({
  selector: 'app-step2-column-selection',
  standalone: true,
  imports: [CommonModule, FormsModule, MiniHistogramComponent, HelpTooltipComponent, DataTypeBadgeComponent],
  templateUrl: './step2-column-selection.component.html',
  styleUrl: './step2-column-selection.component.scss',
})
export class Step2ColumnSelectionComponent implements OnInit {
  @Output() continue = new EventEmitter<void>();

  columns: ColumnStatistics[] = [];
  columnConfigs = new Map<string, ColumnConfig>();
  searchTerm = '';
  columnHistogramCache = new Map<string, HistogramData>();

  // Expose help text and step info to template
  readonly HELP_TEXT = HELP_TEXT;
  readonly stepInfo = STEP_INFO[1]; // Step 2 (index 1)

  constructor(private preprocessingService: PreprocessingService) {}

  ngOnInit(): void {
    const state = this.preprocessingService.currentState;
    if (state.dataProfile) {
      this.columns = state.dataProfile.columns;
      // Cache histogram data for columns that don't have it
      this.columns.forEach(column => {
        if (!column.histogram && column.topValues && column.topValues.length > 0) {
          this.columnHistogramCache.set(column.name, this.getHistogramFromTopValues(column));
        }
      });
    }
    this.columnConfigs = state.columnConfigs;
  }

  get filteredColumns(): ColumnStatistics[] {
    if (!this.searchTerm) {
      return this.columns;
    }
    const term = this.searchTerm.toLowerCase();
    return this.columns.filter(
      col => col.name.toLowerCase().includes(term) || col.dataType.toLowerCase().includes(term)
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

  goBack(): void {
    this.preprocessingService.previousStep();
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
    return column.topValues.slice(0, 10).map(item => `${this.truncateText(item.value, 20)}: ${item.count}`);
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  getDataTypeColor = getDataTypeColor;
  getDataTypeBgColor = getDataTypeBgColor;

  /**
   * Get histogram data for a column (either from column.histogram or cached)
   */
  getColumnHistogramData(column: ColumnStatistics): HistogramData | null {
    if (column.histogram) {
      return column.histogram;
    }
    return this.columnHistogramCache.get(column.name) || null;
  }

  /**
   * Convert topValues to histogram format for categorical data
   */
  getHistogramFromTopValues(column: ColumnStatistics): HistogramData {
    if (!column.topValues || column.topValues.length === 0) {
      return {
        bins: [],
        counts: [],
        binEdges: [],
        labels: [],
      };
    }

    const counts = column.topValues.map(item => item.count);
    const labels = column.topValues.map(item => item.value);
    const bins = counts.map((_, index) => index);
    const binEdges = bins.map(b => b);

    return {
      bins,
      counts,
      binEdges,
      labels,
    };
  }
}
