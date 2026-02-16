import { Component, Input, HostListener, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help-tooltip.component.html',
  styleUrl: './help-tooltip.component.scss',
})
export class HelpTooltipComponent {
  @Input() helpText = '';
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'top';
  @ViewChild('tooltipContent') tooltipContent!: ElementRef;

  isVisible = false;
  tooltipStyle: Record<string, string> = {};

  constructor(
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef
  ) {}

  showTooltip(): void {
    this.isVisible = true;
    this.updateTooltipPosition();
  }

  hideTooltip(): void {
    this.isVisible = false;
  }

  toggleTooltip(): void {
    this.isVisible = !this.isVisible;
    if (this.isVisible) {
      this.updateTooltipPosition();
    }
  }

  private updateTooltipPosition(): void {
    // Use setTimeout to ensure the tooltip is rendered before calculating position
    setTimeout(() => {
      const button = this.elementRef.nativeElement.querySelector('.help-icon');
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const tooltipEl = this.elementRef.nativeElement.querySelector('.tooltip-content');
      if (!tooltipEl) return;

      // Get tooltip dimensions
      const tooltipRect = tooltipEl.getBoundingClientRect();
      const offset = 8;

      let top = 0;
      let left = 0;

      switch (this.position) {
        case 'top':
          top = rect.top - tooltipRect.height - offset;
          left = rect.left + rect.width / 2 - tooltipRect.width / 2;
          break;
        case 'bottom':
          top = rect.bottom + offset;
          left = rect.left + rect.width / 2 - tooltipRect.width / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - tooltipRect.height / 2;
          left = rect.left - tooltipRect.width - offset;
          break;
        case 'right':
          top = rect.top + rect.height / 2 - tooltipRect.height / 2;
          left = rect.right + offset;
          break;
      }

      // Keep tooltip within viewport
      const padding = 10;
      if (left < padding) left = padding;
      if (left + tooltipRect.width > window.innerWidth - padding) {
        left = window.innerWidth - tooltipRect.width - padding;
      }
      if (top < padding) top = padding;
      if (top + tooltipRect.height > window.innerHeight - padding) {
        top = window.innerHeight - tooltipRect.height - padding;
      }

      this.tooltipStyle = {
        top: `${top}px`,
        left: `${left}px`,
      };
      this.cdr.detectChanges();
    }, 0);
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
