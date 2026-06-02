import { Component, Input } from '@angular/core';
@Component({
  selector: 'app-data-preview-table',
  standalone: true,
  imports: [],
  templateUrl: './data-preview-table.component.html',
  styleUrl: './data-preview-table.component.scss',
})
export class DataPreviewTableComponent {
  @Input() data: Record<string, unknown>[] = [];
  @Input() columns: string[] = [];
  @Input() highlightColumns = new Set<string>();
  @Input() maxRows = 10;

  get displayData(): Record<string, unknown>[] {
    return this.data.slice(0, this.maxRows);
  }

  get displayColumns(): string[] {
    if (this.columns.length > 0) {
      return this.columns;
    }
    if (this.data.length > 0) {
      return Object.keys(this.data[0]);
    }
    return [];
  }

  isColumnHighlighted(column: string): boolean {
    return this.highlightColumns.has(column);
  }

  getCellValue(row: Record<string, unknown>, column: string): string {
    const value = row[column];
    if (value === null || value === undefined) {
      return '-';
    }
    if (typeof value === 'number') {
      return value.toFixed(3);
    }
    return String(value);
  }
}
