import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toast, ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toasts$ | async; track toast.id) {
        <div
          class="toast toast-{{ toast.type }}"
          role="alert"
          tabindex="0"
          (click)="remove(toast.id)"
          (keydown.enter)="remove(toast.id)"
        >
          <span class="toast-icon">
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
          <span class="toast-message">{{ toast.message }}</span>
          @if (toast.action) {
            <button class="toast-action" (click)="runAction(toast, $event)" type="button">
              {{ toast.action.label }}
            </button>
          }
          <button class="toast-close" (click)="remove(toast.id)" type="button">×</button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
      }

      .toast {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        color: white;
        cursor: pointer;
        animation: slideIn 0.3s ease-out;
        font-size: 14px;
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

      .toast-success {
        background-color: #10b981;
      }

      .toast-error {
        background-color: #ef4444;
      }

      .toast-warning {
        background-color: #f59e0b;
      }

      .toast-info {
        background-color: #3b82f6;
      }

      .toast-icon {
        font-size: 18px;
        font-weight: bold;
        flex-shrink: 0;
      }

      .toast-message {
        flex: 1;
        line-height: 1.4;
      }

      .toast-action {
        background: rgba(255, 255, 255, 0.22);
        border: 1px solid rgba(255, 255, 255, 0.6);
        color: white;
        font-size: 13px;
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
        background: rgba(255, 255, 255, 0.35);
      }

      .toast-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
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
    `,
  ],
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}

  get toasts$() {
    return this.toastService.toasts$;
  }

  remove(id: number): void {
    this.toastService.remove(id);
  }

  runAction(toast: Toast, event: Event): void {
    // Prevent the container's click-to-dismiss from firing before the handler.
    event.stopPropagation();
    toast.action?.handler();
    this.remove(toast.id);
  }
}
