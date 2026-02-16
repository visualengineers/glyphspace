import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { ColorScale, getContinuousGradient, getCategoricalColors } from '../../interfaces/color-scale';

@Component({
  selector: 'app-color-scale-selector',
  standalone: true,
  imports: [],
  templateUrl: './color-scale-selector.component.html',
  styleUrl: './color-scale-selector.component.scss',
})
export class ColorScaleSelectorComponent {
  @Input() groupedColorScales: { group: string; scales: ColorScale[] }[] = [];
  @Input() selectedScale!: ColorScale;
  @Output() scaleSelected = new EventEmitter<number>();

  dropdownOpen = false;
  getContinuousGradient = getContinuousGradient;
  getCategoricalColors = getCategoricalColors;

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectScale(id: number): void {
    this.scaleSelected.emit(id);
    this.dropdownOpen = false;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.dropdownOpen = false;
  }
}
