import * as THREE from 'three';
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { getGlyphFromObject } from '../../shared/helpers/glyph-helper';
import { ConfigService } from '../../services/config.service';
import { Subscription } from 'rxjs';

/** One tooltip line; `value` is null when the original data had no value. */
export interface TooltipRow {
  key: string;
  label: string;
  value: string | null;
}

export interface TooltipInfo {
  id: string;
  rows: TooltipRow[];
}

// '' is what the processors write for a missing value; 'nan' is what older CLI output contains.
const MISSING_VALUES = new Set(['', 'nan']);

export function buildTooltipRows(
  values: Record<string, string>,
  labels: Record<string, string> | undefined
): TooltipRow[] {
  return Object.entries(values).map(([key, value]) => ({
    key,
    label: labels?.[key] ?? key,
    value: MISSING_VALUES.has(value.trim().toLowerCase()) ? null : value,
  }));
}

@Component({
  selector: 'app-tooltip',
  imports: [],
  templateUrl: './tooltip.component.html',
  styleUrl: './tooltip.component.scss',
})
export class TooltipComponent implements OnInit, OnDestroy {
  @Input() container!: HTMLElement;
  @ViewChild('tooltip') tooltipRef!: ElementRef<HTMLDivElement>;

  private hoverTimeout: ReturnType<typeof setTimeout> | undefined;
  private subscription = new Subscription();
  tooltipVisible = false;
  tooltipFixed = false;
  // Rendered by the template, so CSV content (ids, labels, values) is always escaped.
  tooltipInfo: TooltipInfo | null = null;
  tooltipX = 0;
  tooltipY = 0;

  constructor(private config: ConfigService) {}

  ngOnInit(): void {
    // Subscribe to modal state changes to hide fixed tooltips when modal opens
    this.subscription.add(
      this.config.modalOpenSubject$.subscribe(isOpen => {
        if (isOpen && (this.tooltipVisible || this.tooltipFixed)) {
          this.forceHideTooltip();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  showTooltip(x: number, y: number, info: TooltipInfo | null): void {
    // Don't show tooltip if a modal (like preprocessing wizard) is open
    if (this.config.modalOpen) {
      return;
    }
    this.tooltipInfo = info;
    this.tooltipX = x + 10; // slight offset from cursor
    this.tooltipY = y + 10;
    this.tooltipVisible = true;
    requestAnimationFrame(() => {
      this.repositionTooltip(x, y);
    });
  }

  repositionTooltip(cursorX: number, cursorY: number) {
    const tooltipElement = this.tooltipRef.nativeElement;

    const tooltipRect = tooltipElement.getBoundingClientRect();
    const canvasRect = this.container.getBoundingClientRect();

    let x = cursorX + 10;
    let y = cursorY + 10;

    const rightEdge = canvasRect.right - tooltipRect.width;
    const leftEdge = canvasRect.left;

    // Horizontal clamping (within canvas)
    if (x > rightEdge) x = rightEdge;
    if (x < leftEdge) x = leftEdge;

    // Flip if the entire viewport has space above
    const spaceAboveViewport = cursorY; // distance from cursor to top of viewport
    if (spaceAboveViewport > tooltipRect.height + 10) {
      const spaceBelowViewport = window.innerHeight - cursorY;
      if (spaceBelowViewport < tooltipRect.height + 10) {
        y = cursorY - tooltipRect.height - 10; // flip above
      }
    }

    // Optional clamp to viewport if needed:
    const maxY = window.innerHeight - tooltipRect.height;
    if (y < 0) y = 0;
    if (y > maxY) y = maxY;

    this.tooltipX = x;
    this.tooltipY = y;
  }

  hideTooltip(): void {
    this.tooltipVisible = false;
  }

  /**
   * Force hide the tooltip, including clearing fixed state.
   * Used when a modal opens to ensure tooltip doesn't appear above it.
   */
  forceHideTooltip(): void {
    clearTimeout(this.hoverTimeout);
    this.tooltipVisible = false;
    this.tooltipFixed = false;
    if (this.tooltipRef?.nativeElement) {
      this.tooltipRef.nativeElement.classList.remove('fixed');
    }
  }

  scheduleHoverPopup(x: number, y: number, object: THREE.Object3D): void {
    // Don't schedule tooltip if a modal is open
    if (this.config.modalOpen) {
      return;
    }
    this.hoverTimeout = setTimeout(() => {
      const info = this.getObjectInfo(object);
      this.showTooltip(x, y, info);
    }, 750); // Delay in ms
  }

  cancelHoverPopup(): void {
    clearTimeout(this.hoverTimeout);
    this.hideTooltip();
  }

  toggleFixation(doToggle = true) {
    this.tooltipFixed = !this.tooltipFixed && doToggle;
    if (this.tooltipFixed) {
      this.tooltipRef.nativeElement.classList.add('fixed');
    } else {
      this.tooltipRef.nativeElement.classList.remove('fixed');
    }
  }

  isFixed(): boolean {
    return this.tooltipFixed;
  }

  getObjectInfo(object: THREE.Object3D): TooltipInfo | null {
    const glyph = getGlyphFromObject(object);
    if (glyph === null) {
      return null;
    }
    return { id: glyph.id, rows: buildTooltipRows(glyph.values ?? {}, this.config.featureLabels) };
  }
}
