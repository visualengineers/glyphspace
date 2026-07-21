import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastAction {
  label: string;
  handler: () => void;
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  action?: ToastAction; // optional inline action button (e.g. "Rückgängig")
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toastsSubject.asObservable();
  private nextId = 0;

  show(message: string, type: Toast['type'] = 'info', duration = 5000, action?: ToastAction): void {
    const toast: Toast = {
      id: this.nextId++,
      message,
      type,
      duration,
      action,
    };

    const currentToasts = this.toastsSubject.getValue();
    this.toastsSubject.next([...currentToasts, toast]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.remove(toast.id);
      }, duration);
    }
  }

  /**
   * Confirmation toast for a reversible action, with an inline "Rückgängig" button.
   * Defaults to a 6s window before auto-dismiss.
   */
  showUndo(message: string, undoHandler: () => void, duration = 6000): void {
    this.show(message, 'info', duration, { label: 'Rückgängig', handler: undoHandler });
  }

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  remove(id: number): void {
    const currentToasts = this.toastsSubject.getValue();
    this.toastsSubject.next(currentToasts.filter(toast => toast.id !== id));
  }

  clear(): void {
    this.toastsSubject.next([]);
  }
}
