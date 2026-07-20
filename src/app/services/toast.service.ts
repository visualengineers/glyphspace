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
  // Optional category. Toasts sharing a tag never stack: showing a new one with a
  // given tag removes any currently visible toast that carries the same tag, so
  // e.g. rapid undo/redo actions replace one another instead of piling up.
  tag?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toastsSubject.asObservable();
  private nextId = 0;

  show(message: string, type: Toast['type'] = 'info', duration = 5000, action?: ToastAction, tag?: string): void {
    const toast: Toast = {
      id: this.nextId++,
      message,
      type,
      duration,
      action,
      tag,
    };

    // Same-tag toasts do not stack: drop any currently visible one first so only
    // the latest is shown (single-slot behaviour for undo/redo feedback).
    const currentToasts = tag
      ? this.toastsSubject.getValue().filter(t => t.tag !== tag)
      : this.toastsSubject.getValue();
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

  // Tag reserved for undo/redo feedback toasts so they replace one another instead
  // of stacking when several actions are reverted in quick succession.
  static readonly UNDO_REDO_TAG = 'undo-redo';

  /**
   * A4: dezenter Toast nach Undo/Redo. Nennt die konkret geänderte Einstellung und
   * bietet optional eine "Änderung anzeigen"-Aktion, die zum betroffenen Feld springt.
   * Ersetzt einen ggf. noch sichtbaren Undo/Redo-Toast (Single-Slot via Tag).
   */
  showUndoRedo(message: string, action?: ToastAction, duration = 5000): void {
    this.show(message, 'info', duration, action, ToastService.UNDO_REDO_TAG);
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
