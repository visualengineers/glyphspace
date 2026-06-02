import * as THREE from 'three';
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { getGlyphFromObject } from '../../shared/helpers/glyph-helper';
import { ConfigService } from '../../services/config.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

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
  tooltipText: SafeHtml = '';
  tooltipX = 0;
  tooltipY = 0;

  constructor(
    private config: ConfigService,
    private sanitizer: DomSanitizer
  ) {}

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

  showTooltip(x: number, y: number, text: string): void {
    // Don't show tooltip if a modal (like preprocessing wizard) is open
    if (this.config.modalOpen) {
      return;
    }
    this.tooltipText = this.sanitizer.bypassSecurityTrustHtml(text);
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

  getObjectInfo(object: THREE.Object3D): string {
    const glyph = getGlyphFromObject(object);
    const labels = this.config.featureLabels;

    if (glyph !== null) {
      const rows = Object.entries(glyph.values || {})
        .map(([key, value]) => {
          const label = labels?.[key] ?? key;
          return `
          <tr>
            <td style="width: 40%; padding: 0; vertical-align: top; font-weight: bold; padding-right: 0.75em; word-break: break-word; overflow-wrap: break-word; white-space: normal;">
              ${label}
            </td>
            <td style="width: 60%; padding: 0; vertical-align: top; white-space: normal; word-break: break-word; overflow-wrap: break-word; white-space: normal;">
              ${value}
            </td>
          </tr>`;
        })
        .join('');

      return `
      <div style="max-width: 300px; font-family: sans-serif; font-size: 13px;">
        <b>Item: ${glyph.id}</b>
        <table style="
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          margin-top: 0.4em;
        ">
          ${rows}
        </table>
      </div>
    `;
    }

    return 'Unnamed object';
  }
}
