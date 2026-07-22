import { Component, OnInit, AfterViewInit, forwardRef, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PreprocessingService } from '../../services/preprocessing.service';
import { MiniHistogramComponent } from '../../../shared/components/mini-histogram/mini-histogram.component';
import { ColumnStatistics, HistogramData } from '../../models/column-statistics';
import { ColumnConfig } from '../../models/column-config';
import { DataType, getDataTypeColor, getDataTypeBgColor } from '../../models/data-type.enum';
import { HelpTooltipComponent } from '../../shared/help-tooltip/help-tooltip.component';
import { HELP_TEXT } from '../../shared/constants/help-text';
import { STEP_INFO } from '../../shared/constants/step-info';
import { DataTypeBadgeComponent } from '../../shared/data-type-badge/data-type-badge.component';
import { WizardStep, WIZARD_STEP } from '../../shared/wizard-step';

@Component({
  selector: 'app-step2-column-selection',
  standalone: true,
  imports: [CommonModule, FormsModule, MiniHistogramComponent, HelpTooltipComponent, DataTypeBadgeComponent],
  templateUrl: './step2-column-selection.component.html',
  styleUrl: './step2-column-selection.component.scss',
  providers: [{ provide: WIZARD_STEP, useExisting: forwardRef(() => Step2ColumnSelectionComponent) }],
})
export class Step2ColumnSelectionComponent implements OnInit, AfterViewInit, WizardStep {
  readonly primaryLabel = 'Continue to Configure Data & Features';
  readonly disabledHint = 'Please select at least one column to continue';

  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  columns: ColumnStatistics[] = [];
  columnConfigs = new Map<string, ColumnConfig>();
  searchTerm = '';
  // A14: Type filter, mirroring Step 3's master-rail type filter so both steps
  // share the same header controls (enables the minimal Flip morph).
  filterType: DataType | 'all' = 'all';
  columnHistogramCache = new Map<string, HistogramData>();

  // Enum reference for the template's type-filter <select>.
  DataType = DataType;

  // Anchor index (into the currently filtered list) for shift-click range select.
  private lastCheckedIndex: number | null = null;
  // Whether Shift was held during the click that precedes the next (change).
  private pendingShift = false;

  // Distribution bars use the single cyan accent (A15) instead of per-type colors.
  // These mirror $active-color (#00bcd4) / $status-info (#00838f); the mini-histogram
  // renders to a d3 canvas so the color must be passed as a string here.
  readonly distributionColor = '#00bcd4';
  readonly distributionHoverColor = '#00838f';

  // Expose help text and step info to template
  readonly HELP_TEXT = HELP_TEXT;
  readonly stepInfo = STEP_INFO[1]; // Step 2 (index 1)

  constructor(private preprocessingService: PreprocessingService) {}

  // A6: scroll the requested setting into view when arriving via a review deep-link.
  // The delay lets the shell's scroll-to-top run first so it does not override this.
  ngAfterViewInit(): void {
    const target = this.preprocessingService.consumeScrollTarget();
    if (target) {
      setTimeout(() => {
        document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    }
  }

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
    const term = this.searchTerm.trim().toLowerCase();
    return this.columns.filter(col => {
      // Type filter (A14): restrict to a single data type when selected.
      if (this.filterType !== 'all' && col.dataType !== this.filterType) {
        return false;
      }
      // Text filter: match by column name or data type.
      if (term && !col.name.toLowerCase().includes(term) && !col.dataType.toLowerCase().includes(term)) {
        return false;
      }
      return true;
    });
  }

  get hasActiveFilter(): boolean {
    return !!this.searchTerm || this.filterType !== 'all';
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

  /**
   * Records whether Shift was held for the click that is about to trigger a
   * (change). It does NOT toggle anything and does NOT preventDefault — the native
   * checkbox performs the real toggle, so single selection works and is rendered
   * correctly via [checked]. The flag is consumed by onCheckboxChange().
   */
  onCheckboxClick(event: MouseEvent): void {
    this.pendingShift = event.shiftKey;
  }

  /**
   * Native change handler. The clicked row has already been toggled by the browser;
   * `newState` is its resulting checked value. We commit that single toggle, and if
   * Shift was held with a valid anchor, we extend the SAME state across the whole
   * inclusive range [min(anchor,current) .. max(anchor,current)] on the filtered list.
   */
  onCheckboxChange(index: number, columnName: string, event: Event): void {
    const newState = (event.target as HTMLInputElement).checked;

    if (this.pendingShift && this.lastCheckedIndex !== null && this.lastCheckedIndex !== index) {
      const lo = Math.min(this.lastCheckedIndex, index);
      const hi = Math.max(this.lastCheckedIndex, index);
      const names = this.filteredColumns.slice(lo, hi + 1).map(col => col.name);
      this.preprocessingService.setColumnsEnabled(names, newState);
    } else {
      this.preprocessingService.setColumnsEnabled([columnName], newState);
    }

    this.columnConfigs = this.preprocessingService.currentState.columnConfigs;
    this.lastCheckedIndex = index;
    this.pendingShift = false;
  }

  // ── Select-all operates on the currently filtered/visible set (A9) ──────────
  get filteredEnabledCount(): number {
    return this.filteredColumns.filter(col => this.isColumnEnabled(col.name)).length;
  }

  get allFilteredSelected(): boolean {
    return this.filteredColumns.length > 0 && this.filteredEnabledCount === this.filteredColumns.length;
  }

  get someFilteredSelected(): boolean {
    return this.filteredEnabledCount > 0 && this.filteredEnabledCount < this.filteredColumns.length;
  }

  toggleAllColumns(): void {
    const names = this.filteredColumns.map(col => col.name);
    this.preprocessingService.setColumnsEnabled(names, !this.allFilteredSelected);
    this.columnConfigs = this.preprocessingService.currentState.columnConfigs;
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
    this.searchInput?.nativeElement.focus();
  }

  canProceed(): boolean {
    return this.enabledCount > 0;
  }

  proceed(): void {
    if (this.canProceed()) {
      this.preprocessingService.nextStep();
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
