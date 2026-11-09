import { ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PARKED_POPUP_STYLE, PopupCoordinator, PopupPlacement, PopupTrigger, placePopup } from '../popup-coordinator';

let nextTooltipId = 0;

/** Gap between the help icon and the tooltip. */
const TOOLTIP_OFFSET_PX = 8;

/**
 * Help icon with a tooltip that opens on hover, keyboard focus or click and is
 * dismissible with Escape (see {@link PopupTrigger}). The tooltip content is
 * always in the DOM (hidden while closed) so the icon can reference it via
 * `aria-describedby`.
 */
@Component({
  selector: 'app-help-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help-tooltip.component.html',
  styleUrl: './help-tooltip.component.scss',
})
export class HelpTooltipComponent implements OnDestroy {
  /** Tooltip body; may contain simple HTML (sanitized by Angular). */
  @Input() helpText = '';
  /**
   * Short plain-text subject of the help, used for the icon's accessible
   * name ("Help: <topic>"). Without it the name is "More information".
   */
  @Input() topic = '';
  @Input() position: PopupPlacement = 'top';

  @ViewChild('trigger', { static: true }) triggerRef?: ElementRef<HTMLButtonElement>;
  @ViewChild('tooltip', { static: true }) tooltipRef?: ElementRef<HTMLElement>;

  readonly tooltipId = `help-tooltip-${nextTooltipId++}`;
  readonly popup: PopupTrigger;
  tooltipStyle: Record<string, string> = { ...PARKED_POPUP_STYLE };

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private cdr: ChangeDetectorRef,
    coordinator: PopupCoordinator
  ) {
    this.popup = coordinator.createTrigger({
      contains: target => target instanceof Node && this.elementRef.nativeElement.contains(target),
      opened: () => this.updateTooltipPosition(),
      closed: () => this.cdr.markForCheck(),
      reposition: () => this.updateTooltipPosition(),
    });
  }

  get isVisible(): boolean {
    return this.popup.isOpen;
  }

  get ariaLabel(): string {
    const topic = this.topic.trim();
    return topic ? `Help: ${topic}` : 'More information';
  }

  ngOnDestroy(): void {
    this.popup.destroy();
  }

  private updateTooltipPosition(): void {
    const trigger = this.triggerRef?.nativeElement;
    const tooltip = this.tooltipRef?.nativeElement;
    if (!trigger || !tooltip) return;
    this.tooltipStyle = placePopup(trigger, tooltip, this.position, TOOLTIP_OFFSET_PX);
    this.cdr.detectChanges();
  }
}
