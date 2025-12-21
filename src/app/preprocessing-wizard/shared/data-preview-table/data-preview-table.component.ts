import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-data-preview-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-preview-table.component.html',
  styleUrl: './data-preview-table.component.scss'
})
export class DataPreviewTableComponent {
  @Input() data: any[] = [];
  @Input() columns: string[] = [];
  @Input() highlightColumns: Set<string> = new Set();
  @Input() maxRows: number = 10;

  get displayData(): any[] {
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

  getCellValue(row: any, column: string): string {
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
