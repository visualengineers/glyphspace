import { Injectable, signal } from '@angular/core';

export type Politeness = 'polite' | 'assertive';

/**
 * Screen-reader announcements for the wizard. The shell renders both signals
 * into always-present live regions; any step injects this service and calls
 * announce() instead of creating its own (unreliable) conditional live region.
 */
@Injectable({ providedIn: 'root' })
export class WizardAnnouncer {
  readonly polite = signal('');
  readonly assertive = signal('');

  announce(message: string, politeness: Politeness = 'polite'): void {
    const region = politeness === 'assertive' ? this.assertive : this.polite;
    // Clear first so repeating the same message is announced again.
    region.set('');
    queueMicrotask(() => region.set(message));
  }
}
