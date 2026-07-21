import { PreprocessingService } from './preprocessing.service';
import { DataProcessorService } from '../../services/data-processor';
import { DataLoaderService } from '../../services/data-loader.service';

/**
 * A3 — state-level error-handling tests for PreprocessingService.
 * `toErrorMessage` must keep string rejections (the worker often rejects with a
 * plain string, which the old `instanceof Error` check discarded), and
 * `clearError` must clear the lingering error flag so a stale "Processing
 * failed" no longer survives closing/reopening the wizard.
 *
 * The service is constructed directly with lightweight stubs to avoid pulling
 * the heavy data-processor / pyodide runtime into the unit test.
 */
describe('PreprocessingService — error handling (A3)', () => {
  let service: PreprocessingService;

  beforeEach(() => {
    localStorage.removeItem('glyphspace_preprocessing_state');
    const dataProcessor = {} as unknown as DataProcessorService;
    const dataLoader = { getDataSetNames: () => [] } as unknown as DataLoaderService;
    service = new PreprocessingService(dataProcessor, dataLoader);
  });

  describe('toErrorMessage', () => {
    // Private helper — accessed via bracket notation for the unit test.
    const call = (err: unknown, fallback: string): string =>
      (service as unknown as { toErrorMessage(e: unknown, f: string): string }).toErrorMessage(err, fallback);

    it('returns the message of an Error instance', () => {
      expect(call(new Error('worker exploded'), 'fallback')).toBe('worker exploded');
    });

    it('keeps a non-empty string rejection instead of discarding it', () => {
      expect(call('could not convert string to float', 'fallback')).toBe('could not convert string to float');
    });

    it('falls back for an empty / whitespace-only string', () => {
      expect(call('   ', 'Processing failed')).toBe('Processing failed');
      expect(call('', 'Processing failed')).toBe('Processing failed');
    });

    it('falls back for non-string, non-Error values', () => {
      expect(call({ some: 'object' }, 'Processing failed')).toBe('Processing failed');
      expect(call(null, 'Processing failed')).toBe('Processing failed');
      expect(call(undefined, 'Processing failed')).toBe('Processing failed');
    });
  });

  describe('clearError', () => {
    // Seed an error into the singleton state via the private updateState.
    const setError = (msg: string | null): void =>
      (service as unknown as { updateState(u: { error: string | null }): void }).updateState({ error: msg });

    it('clears a lingering processing error from the state', () => {
      setError('Processing failed');
      expect(service.currentState.error).toBe('Processing failed');

      service.clearError();
      expect(service.currentState.error).toBeNull();
    });

    it('is a no-op when there is no error', () => {
      let emissions = 0;
      service.state$.subscribe(() => emissions++);
      const before = emissions; // includes the initial replay emission

      service.clearError();
      expect(service.currentState.error).toBeNull();
      // No error present → no extra state emission.
      expect(emissions).toBe(before);
    });
  });
});
