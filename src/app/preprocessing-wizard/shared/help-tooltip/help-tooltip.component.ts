import { Component, Input, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help-tooltip.component.html',
  styleUrl: './help-tooltip.component.scss'
})
export class HelpTooltipComponent {
  @Input() helpText: string = '';
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'top';

  isVisible = false;

  constructor(private elementRef: ElementRef) {}

  showTooltip(): void {
    this.isVisible = true;
  }

  hideTooltip(): void {
    this.isVisible = false;
  }

  toggleTooltip(): void {
    this.isVisible = !this.isVisible;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Close tooltip when clicking outside
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isVisible = false;
    }
  }

  @HostListener('keydown.escape')
  onEscapeKey(): void {
    this.isVisible = false;
  }
}
