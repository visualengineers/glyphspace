import { type Mocked, vi } from 'vitest';

/**
 * Vitest counterpart of `jasmine.createSpyObj`: an object whose listed methods are
 * named `vi.fn()` mocks, plus optional plain properties. Like with Jasmine, only the
 * listed members exist at runtime; the type claims the full interface so the object
 * can stand in for the real one.
 */
export function createSpyObj<T extends object>(
  baseName: string,
  methodNames: readonly (keyof T & string)[],
  properties: Partial<T> = {}
): Mocked<T> {
  const spyObj: Record<string, unknown> = { ...properties };
  for (const name of methodNames) {
    spyObj[name] = vi.fn().mockName(`${baseName}.${name}`);
  }
  return spyObj as Mocked<T>;
}
