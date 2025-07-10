// src/app/core/logger.service.ts
import { Injectable, isDevMode } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  /** Info / debug output */
  log(...args: unknown[]): void {
    if (isDevMode()) {
      console.log('[LOG]', ...args);
    }
  }

  /** Warnings */
  warn(...args: unknown[]): void {
    if (isDevMode()) {
      console.warn('[WARN]', ...args);
    }
  }

  /** Errors (often you still want these in prod—adjust as you see fit) */
  error(...args: unknown[]): void {
    console.error('[ERROR]', ...args);
  }
}
