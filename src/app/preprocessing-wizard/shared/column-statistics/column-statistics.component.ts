import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColumnStatistics } from '../../models/column-statistics';
import { DataType } from '../../models/data-type.enum';

@Component({
  selector: 'app-column-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './column-statistics.component.html',
  styleUrl: './column-statistics.component.scss'
})
export class ColumnStatisticsComponent {
  @Input() statistics!: ColumnStatistics;
  @Input() compact: boolean = false;

  get dataTypeBadgeClass(): string {
    switch (this.statistics.dataType) {
      case DataType.Numeric: return 'badge-numeric';
      case DataType.Categorical: return 'badge-categorical';
      case DataType.Text: return 'badge-text';
      case DataType.Date: return 'badge-date';
      case DataType.Boolean: return 'badge-boolean';
      case DataType.ID: return 'badge-id';
      default: return 'badge-unknown';
    }
  }

  get dataTypeLabel(): string {
    return this.statistics.dataType.charAt(0).toUpperCase() +
           this.statistics.dataType.slice(1);
  }

  get completenessPercentage(): number {
    const total = this.statistics.count + this.statistics.missingCount;
    if (total === 0) return 0;
    return (this.statistics.count / total) * 100;
  }

  get hasIssues(): boolean {
    return this.statistics.missingPercentage > 50 ||
           this.statistics.uniqueCount === 1;
  }

  get issueDescription(): string {
    if (this.statistics.missingPercentage > 50) {
      return `High missing values (${this.statistics.missingPercentage.toFixed(1)}%)`;
    }
    if (this.statistics.uniqueCount === 1) {
      return 'All values are identical';
    }
    return '';
  }
}
