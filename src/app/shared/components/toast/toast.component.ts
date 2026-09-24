import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, map } from 'rxjs';
import { Toast, ToastService } from '../../../services/toast.service';

/** Whether pointer and/or keyboard focus currently rest on a toast. */
interface ToastHold {
  hover: boolean;
  focus: boolean;
}

/** One always-present live region and the toasts it announces. */
interface ToastRegion {
  politeness: 'assertive' | 'polite';
  toasts$: Observable<Toast[]>;
}

const ASSERTIVE_TYPES: ReadonlySet<Toast['type']> = new Set<Toast['type']>(['warning', 'error']);

/** Screen-reader prefix for toasts whose urgency is otherwise only shown by colour/icon. */
const TYPE_PREFIX: Readonly<Partial<Record<Toast['type'], string>>> = {
  warning: 'Warning: ',
  error: 'Error: ',
};

/**
 * Global toast stack. Toasts are rendered into two always-present live regions
 * (polite for info/success, assertive for warning/error) so screen readers
 * announce them without the toasts themselves being focusable. Pointer hover
 * or keyboard focus on a toast pauses its auto-dismiss countdown.
 */
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (region of regions; track region.politeness) {
        <div class="toast-region" [attr.aria-live]="region.politeness" aria-relevant="additions">
          @for (toast of region.toasts$ | async; track toast.id) {
            <div
              class="toast toast-{{ toast.type }}"
              (mouseenter)="setHold(toast.id, 'hover', true)"
              (mouseleave)="setHold(toast.id, 'hover', false)"
              (focusin)="setHold(toast.id, 'focus', true)"
              (focusout)="onFocusOut(toast.id, $event)"
            >
              <span class="toast-icon" aria-hidden="true">
                @switch (toast.type) {
                  @case ('success') {
                    ✓
                  }
                  @case ('error') {
                    ✕
                  }
                  @case ('warning') {
                    ⚠
                  }
                  @case ('info') {
                    ℹ
                  }
                }
              </span>
              <span class="toast-message"
                ><span class="visually-hidden">{{ typePrefix(toast) }}</span
                >{{ toast.message }}</span
              >
              @if (toast.action) {
                <button class="toast-action" (click)="runAction(toast)" type="button">
                  {{ toast.action.label }}
                </button>
              }
              <button class="toast-close" (click)="remove(toast.id)" type="button" aria-label="Dismiss notification">
                <span aria-hidden="true">×</span>
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      @use '../../../../styles/variables' as v;
      @use '../../../../styles/mixins' as m;

      .toast-container {
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: v.$z-toast;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: min(400px, calc(100vw - 40px));
      }

      .toast-region {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .toast {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        color: white;
        animation: slideIn 0.3s ease-out;
        font-size: v.$font-size-md;
        font-weight: 500;
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .toast {
          animation: none;
        }

        .toast-action {
          transition: none;
        }
      }

      /* White text on every toast colour reaches >= 5.0:1. */
      .toast-success {
        background-color: v.$toast-success-bg;
      }

      .toast-error {
        background-color: v.$toast-error-bg;
      }

      .toast-warning {
        background-color: v.$toast-warning-bg;
      }

      .toast-info {
        background-color: v.$toast-info-bg;
      }

      .toast-icon {
        font-size: v.$icon-size-md;
        font-weight: bold;
        flex-shrink: 0;
      }

      .toast-message {
        flex: 1;
        line-height: 1.4;
      }

      .visually-hidden {
        @include m.visually-hidden;
      }

      /* Darkening (not lightening) the toast colour keeps white text >= 7:1. */
      .toast-action {
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.7);
        color: white;
        font-size: v.$font-size-base;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        cursor: pointer;
        padding: 5px 12px;
        border-radius: 5px;
        flex-shrink: 0;
        transition: background-color 0.15s ease;
      }

      .toast-action:hover {
        background: rgba(0, 0, 0, 0.32);
      }

      .toast-close {
        background: none;
        border: none;
        color: white;
        font-size: v.$icon-size-xl;
        line-height: 1;
        cursor: pointer;
        padding: 0;
        opacity: 0.8;
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .toast-close:hover {
        opacity: 1;
      }

      /* Double ring (white + accent) stays visible on every toast colour. */
      .toast-action:focus-visible,
      .toast-close:focus-visible {
        @include m.focus-ring;
        box-shadow: 0 0 0 2px #fff;
        opacity: 1;
      }
    `,
  ],
})
export class ToastComponent {
  /** Assertive first, so warnings/errors stack above info/success toasts. */
  readonly regions: readonly ToastRegion[];

  private holds: Readonly<Record<number, ToastHold>> = {};

  constructor(private toastService: ToastService) {
    const byUrgency = (assertive: boolean): Observable<Toast[]> =>
      toastService.toasts$.pipe(map(toasts => toasts.filter(t => ASSERTIVE_TYPES.has(t.type) === assertive)));
    this.regions = [
      { politeness: 'assertive', toasts$: byUrgency(true) },
      { politeness: 'polite', toasts$: byUrgency(false) },
    ];
  }

  typePrefix(toast: Toast): string {
    return TYPE_PREFIX[toast.type] ?? '';
  }

  remove(id: number): void {
    this.holds = Object.fromEntries(Object.entries(this.holds).filter(([key]) => Number(key) !== id));
    this.toastService.remove(id);
  }

  runAction(toast: Toast): void {
    toast.action?.handler();
    this.remove(toast.id);
  }

  /** Pauses the countdown while pointer or focus rests on the toast, resumes once both left. */
  setHold(id: number, kind: keyof ToastHold, active: boolean): void {
    const current = this.holds[id] ?? { hover: false, focus: false };
    const next: ToastHold = { ...current, [kind]: active };
    this.holds = { ...this.holds, [id]: next };
    if (next.hover || next.focus) {
      this.toastService.pause(id);
    } else {
      this.toastService.resume(id);
    }
  }

  /** Focus moving between the buttons of the same toast keeps it paused. */
  onFocusOut(id: number, event: FocusEvent): void {
    const toastEl = event.currentTarget;
    const next = event.relatedTarget;
    if (toastEl instanceof Node && next instanceof Node && toastEl.contains(next)) {
      return;
    }
    this.setHold(id, 'focus', false);
  }
}
