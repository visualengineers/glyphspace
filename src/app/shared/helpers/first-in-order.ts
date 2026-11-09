/**
 * Picks the first of several parallel jobs, in a fixed order, that succeeds.
 * Jobs finish in any order; the action of a job runs as soon as it succeeded
 * and every job before it has failed, so the choice does not depend on timing.
 * At most one action runs.
 */
export class FirstInOrder {
  private pending: string[];
  private results = new Map<string, (() => void) | null>();
  private done = false;

  constructor(order: readonly string[]) {
    this.pending = [...order];
  }

  succeeded(key: string, action: () => void): void {
    this.results.set(key, action);
    this.settle();
  }

  failed(key: string): void {
    this.results.set(key, null);
    this.settle();
  }

  private settle(): void {
    while (!this.done && this.pending.length > 0 && this.results.has(this.pending[0])) {
      const action = this.results.get(this.pending.shift() as string);
      if (action) {
        this.done = true;
        action();
      }
    }
  }
}
