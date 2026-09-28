import { Injectable, NgZone, inject } from '@angular/core';

/**
 * Shared behaviour of the wizard's hover/focus popups (help tooltips and
 * projection previews): one-open-at-a-time coordination, the trigger
 * interaction model and viewport-aware positioning.
 */

/** Grace period so the pointer can travel from the trigger into the popup. */
export const POPUP_HIDE_DELAY_MS = 180;

export type PopupPlacement = 'top' | 'bottom' | 'left' | 'right';

/** Style that parks a popup off-screen until it has been measured. */
export const PARKED_POPUP_STYLE: Readonly<Record<string, string>> = { top: '-9999px', left: '-9999px' };

/** Minimum gap between a popup and the viewport edges. */
const VIEWPORT_PADDING_PX = 10;

interface Box {
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
}

interface Size {
  width: number;
  height: number;
}

/** Places a popup next to its anchor, then clamps it into the viewport. */
export function computePopupPosition(
  anchor: Box,
  popup: Size,
  placement: PopupPlacement,
  offset: number,
  viewport: Size
): { top: number; left: number } {
  const centerX = anchor.left + anchor.width / 2 - popup.width / 2;
  const centerY = anchor.top + anchor.height / 2 - popup.height / 2;
  const placed = {
    top: { top: anchor.top - popup.height - offset, left: centerX },
    bottom: { top: anchor.bottom + offset, left: centerX },
    left: { top: centerY, left: anchor.left - popup.width - offset },
    right: { top: centerY, left: anchor.right + offset },
  }[placement];
  const pad = VIEWPORT_PADDING_PX;
  return {
    top: Math.max(pad, Math.min(placed.top, viewport.height - popup.height - pad)),
    left: Math.max(pad, Math.min(placed.left, viewport.width - popup.width - pad)),
  };
}

/** Measures trigger and popup and returns the popup's fixed-position style. */
export function placePopup(
  trigger: Element,
  popup: Element,
  placement: PopupPlacement,
  offset: number
): Record<string, string> {
  // clientWidth/Height exclude scrollbars, so clamping never hides an edge.
  const root = document.documentElement;
  const viewport = { width: root.clientWidth, height: root.clientHeight };
  const pos = computePopupPosition(
    trigger.getBoundingClientRect(),
    popup.getBoundingClientRect(),
    placement,
    offset,
    viewport
  );
  return { top: `${pos.top}px`, left: `${pos.left}px` };
}

/** A popup that the coordinator can close when another one opens. */
export interface CoordinatedPopup {
  close(): void;
}

/** Callbacks a popup component provides to its {@link PopupTrigger}. */
export interface PopupTriggerHost {
  /** Whether an event target lies inside the component (trigger or popup). */
  contains(target: EventTarget | null): boolean;
  /** Called right after the popup opened: render, position, start work. */
  opened(): void;
  /** Called right after the popup closed: stop work, refresh the view. */
  closed(): void;
  /** Re-positions the open popup after the viewport scrolled or resized. */
  reposition(): void;
}

/** Ensures that at most one wizard popup is open at a time. */
@Injectable({ providedIn: 'root' })
export class PopupCoordinator {
  private readonly zone = inject(NgZone);
  private active: CoordinatedPopup | null = null;

  /** Marks `popup` as the open one and closes the previously open popup. */
  activate(popup: CoordinatedPopup): void {
    const previous = this.active;
    this.active = popup;
    if (previous && previous !== popup) previous.close();
  }

  /** Forgets `popup` if it is the open one. */
  release(popup: CoordinatedPopup): void {
    if (this.active === popup) this.active = null;
  }

  /** Creates the interaction controller for one popup component. */
  createTrigger(host: PopupTriggerHost, hideDelayMs = POPUP_HIDE_DELAY_MS): PopupTrigger {
    return new PopupTrigger(this, this.zone, host, hideDelayMs);
  }
}

/**
 * Interaction model of a hover/focus popup (WCAG 1.4.13, 2.1.1):
 * - pointer hover and keyboard focus open it transiently; it hides after a
 *   short grace period once neither pointer nor focus is on it (hoverable),
 * - a click (mouse, touch, or Enter/Space on the native button) pins it open;
 *   clicking again closes it,
 * - Escape anywhere and a click outside the component close it (dismissible),
 * - opening it closes any other open popup (via {@link PopupCoordinator}).
 * Document and viewport listeners are attached only while the popup is open.
 */
export class PopupTrigger implements CoordinatedPopup {
  private openState = false;
  private pinned = false;
  private pointerInside = false;
  private focused = false;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly coordinator: PopupCoordinator,
    private readonly zone: NgZone,
    private readonly host: PopupTriggerHost,
    private readonly hideDelayMs: number
  ) {}

  get isOpen(): boolean {
    return this.openState;
  }

  // ---------- template event handlers ----------

  onTriggerEnter(): void {
    this.pointerInside = true;
    this.open();
  }

  onPopupEnter(): void {
    this.pointerInside = true;
    this.cancelHide();
  }

  onPointerLeave(): void {
    this.pointerInside = false;
    this.hideIfIdle();
  }

  onFocus(): void {
    this.focused = true;
    this.open();
  }

  onBlur(): void {
    this.focused = false;
    this.pinned = false;
    this.hideIfIdle();
  }

  onClick(): void {
    if (this.openState && this.pinned) {
      this.close();
      return;
    }
    this.pinned = true;
    this.open();
  }

  // ---------- state ----------

  open(): void {
    this.cancelHide();
    if (this.openState) return;
    this.openState = true;
    this.coordinator.activate(this);
    this.addGlobalListeners();
    this.host.opened();
  }

  close(): void {
    this.cancelHide();
    this.pinned = false;
    if (!this.openState) return;
    this.openState = false;
    this.removeGlobalListeners();
    this.coordinator.release(this);
    this.host.closed();
  }

  /** Tears everything down without calling back into a destroyed host. */
  destroy(): void {
    this.cancelHide();
    this.removeGlobalListeners();
    this.coordinator.release(this);
    this.openState = false;
  }

  private hideIfIdle(): void {
    if (!this.openState || this.pinned || this.pointerInside || this.focused) return;
    this.cancelHide();
    this.hideTimer = setTimeout(() => {
      this.hideTimer = null;
      this.close();
    }, this.hideDelayMs);
  }

  private cancelHide(): void {
    if (this.hideTimer !== null) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }

  // ---------- global listeners (only while open) ----------

  private readonly onDocumentClick = (event: MouseEvent): void => {
    if (!this.host.contains(event.target)) this.close();
  };

  private readonly onDocumentKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') this.close();
  };

  private readonly onViewportChange = (): void => this.host.reposition();

  private addGlobalListeners(): void {
    // Capture phase: parents that stop propagation must not block dismissal.
    document.addEventListener('click', this.onDocumentClick, true);
    document.addEventListener('keydown', this.onDocumentKeydown, true);
    // Scroll / resize fire often; keep them out of Angular change detection.
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onViewportChange, { capture: true, passive: true });
      window.addEventListener('resize', this.onViewportChange, { passive: true });
    });
  }

  private removeGlobalListeners(): void {
    document.removeEventListener('click', this.onDocumentClick, true);
    document.removeEventListener('keydown', this.onDocumentKeydown, true);
    window.removeEventListener('scroll', this.onViewportChange, true);
    window.removeEventListener('resize', this.onViewportChange);
  }
}
