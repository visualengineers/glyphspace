import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataType, getDataTypeBadgeClass, getDataTypeLabel } from '../../models/data-type.enum';

@Component({
  selector: 'app-data-type-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="data-type-badge" [ngClass]="getDataTypeBadgeClass(dataType)">{{
    getDataTypeLabel(dataType)
  }}</span>`,
  styleUrl: './data-type-badge.component.scss',
})
export class DataTypeBadgeComponent {
  @Input() dataType!: DataType;

  getDataTypeBadgeClass = getDataTypeBadgeClass;
  getDataTypeLabel = getDataTypeLabel;
}
