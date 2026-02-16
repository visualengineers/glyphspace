import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColumnStatistics } from '../../models/column-statistics';
import { DataTypeBadgeComponent } from '../../../shared/components/data-type-badge/data-type-badge.component';

@Component({
  selector: 'app-column-statistics',
  standalone: true,
  imports: [CommonModule, DataTypeBadgeComponent],
  templateUrl: './column-statistics.component.html',
  styleUrl: './column-statistics.component.scss'
})
export class ColumnStatisticsComponent {
  @Input() statistics!: ColumnStatistics;
  @Input() compact: boolean = false;

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
