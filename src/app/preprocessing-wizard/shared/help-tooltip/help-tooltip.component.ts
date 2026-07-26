import { Component, Input, HostListener, ElementRef, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help-tooltip.component.html',
  styleUrl: './help-tooltip.component.scss',
})
export class HelpTooltipComponent implements OnDestroy {
  @Input() helpText = '';
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'top';
  @ViewChild('tooltipContent') tooltipContent!: ElementRef;

  isVisible = false;
  tooltipStyle: Record<string, string> = {};

  // Grace period before hiding, so the pointer can travel from the icon into
  // the tooltip (e.g. to read the content or watch a preview animation) without
  // it disappearing. Cancelled as soon as the pointer enters the tooltip.
  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private static readonly HIDE_DELAY_MS = 180;

  constructor(
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef
  ) {}

  showTooltip(): void {
    this.cancelScheduledHide();
    // Park off-screen until positioned, so it never briefly overflows the
    // viewport (which would flash a horizontal scrollbar) on first show.
    if (!this.tooltipStyle['left']) {
      this.tooltipStyle = { top: '-9999px', left: '-9999px' };
    }
    this.isVisible = true;
    this.updateTooltipPosition();
  }

  hideTooltip(): void {
    this.isVisible = false;
  }

  /** Hide after a short grace period unless the pointer re-enters in time. */
  scheduleHide(): void {
    this.cancelScheduledHide();
    this.hideTimer = setTimeout(() => {
      this.isVisible = false;
      this.hideTimer = null;
      this.cdr.detectChanges();
    }, HelpTooltipComponent.HIDE_DELAY_MS);
  }

  cancelScheduledHide(): void {
    if (this.hideTimer !== null) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }

  toggleTooltip(): void {
    this.cancelScheduledHide();
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

      // Keep tooltip within viewport. Use clientWidth/Height (excludes the
      // scrollbars) so clamping never leaves the tooltip poking past the edge.
      const padding = 10;
      const viewW = document.documentElement.clientWidth;
      const viewH = document.documentElement.clientHeight;
      if (left + tooltipRect.width > viewW - padding) {
        left = viewW - tooltipRect.width - padding;
      }
      if (left < padding) left = padding;
      if (top + tooltipRect.height > viewH - padding) {
        top = viewH - tooltipRect.height - padding;
      }
      if (top < padding) top = padding;

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

  ngOnDestroy(): void {
    this.cancelScheduledHide();
  }
}
