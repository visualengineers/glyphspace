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
  action?: ToastAction; // optional inline action button (e.g. "Undo")
}

/** Shown when a toast's "Undo" can no longer revert the action it refers to. */
export const UNDO_UNAVAILABLE_MESSAGE = "Can't undo — other changes were made since.";

/** Default auto-dismiss delay of a plain toast. */
export const DEFAULT_TOAST_MS = 5000;

/**
 * Minimum lifetime of a toast that offers an action (WCAG 2.2.1): the user
 * needs time to notice, read and reach the button before it disappears.
 */
export const MIN_ACTION_TOAST_MS = 10000;

/** Auto-dismiss bookkeeping of one toast; `handle` is null while paused. */
interface DismissTimer {
  handle: ReturnType<typeof setTimeout> | null;
  remaining: number;
  startedAt: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toastsSubject.asObservable();
  private nextId = 0;
  private timers = new Map<number, DismissTimer>();

  show(message: string, type: Toast['type'] = 'info', duration = DEFAULT_TOAST_MS, action?: ToastAction): void {
    const lifetime = action && duration > 0 ? Math.max(duration, MIN_ACTION_TOAST_MS) : duration;
    const toast: Toast = {
      id: this.nextId++,
      message,
      type,
      duration: lifetime,
      action,
    };

    const currentToasts = this.toastsSubject.getValue();
    this.toastsSubject.next([...currentToasts, toast]);

    if (lifetime > 0) {
      this.startTimer(toast.id, lifetime);
    }
  }

  /**
   * Confirmation toast for a reversible action, with an inline "Undo" button.
   * `undoHandler` must revert exactly the action the toast refers to and return
   * false when that is no longer possible (e.g. other changes were made since);
   * the user then gets an explanatory info toast instead of a silent no-op.
   * Stays at least MIN_ACTION_TOAST_MS before auto-dismiss.
   */
  showUndo(message: string, undoHandler: () => boolean, duration = MIN_ACTION_TOAST_MS): void {
    this.show(message, 'info', duration, {
      label: 'Undo',
      handler: () => {
        if (!undoHandler()) {
          this.info(UNDO_UNAVAILABLE_MESSAGE);
        }
      },
    });
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

  /** Stops a toast's auto-dismiss countdown (pointer or focus is on it). */
  pause(id: number): void {
    const timer = this.timers.get(id);
    if (!timer || timer.handle === null) return;
    clearTimeout(timer.handle);
    const elapsed = Date.now() - timer.startedAt;
    this.timers.set(id, { handle: null, remaining: Math.max(0, timer.remaining - elapsed), startedAt: 0 });
  }

  /** Continues a paused countdown with the time that was left. */
  resume(id: number): void {
    const timer = this.timers.get(id);
    if (!timer || timer.handle !== null) return;
    this.startTimer(id, timer.remaining);
  }

  remove(id: number): void {
    this.stopTimer(id);
    const currentToasts = this.toastsSubject.getValue();
    this.toastsSubject.next(currentToasts.filter(toast => toast.id !== id));
  }

  clear(): void {
    [...this.timers.keys()].forEach(id => this.stopTimer(id));
    this.toastsSubject.next([]);
  }

  private startTimer(id: number, delay: number): void {
    const handle = setTimeout(() => this.remove(id), delay);
    this.timers.set(id, { handle, remaining: delay, startedAt: Date.now() });
  }

  private stopTimer(id: number): void {
    const handle = this.timers.get(id)?.handle;
    if (handle !== undefined && handle !== null) {
      clearTimeout(handle);
    }
    this.timers.delete(id);
  }
}
