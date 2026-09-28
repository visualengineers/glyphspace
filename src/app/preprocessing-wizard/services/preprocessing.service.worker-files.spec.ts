import type { Mock } from 'vitest';
import { PreprocessingService } from './preprocessing.service';
import { DataProfile } from '../models/column-statistics';
import { createTestPreprocessingService } from '../testing/preprocessing-test-helpers';

/**
 * Worker FS cleanup: the Pyodide worker keeps every uploaded file until told
 * which ones are still needed. The service keeps the files referenced by the
 * current state and by every undo/redo snapshot, and prunes the rest after a
 * load, when history entries are dropped, and on reset.
 */
describe('PreprocessingService – pruning unused worker files', () => {
  let prune: Mock;
  let profileData: Mock;
  let service: PreprocessingService;

  const profile: DataProfile = {
    totalRows: 1,
    totalColumns: 0,
    fileSize: 10,
    fileName: 'x.csv',
    columns: [],
    qualityScore: 100,
    duplicateCount: 0,
    previewRows: [],
  };

  const csv = (name: string): File => new File(['a\n1\n'], name, { type: 'text/csv' });
  const lastKeep = (): string[] => [...(prune.mock.lastCall?.[0] as string[])].sort();

  beforeEach(() => {
    localStorage.clear();
    prune = vi.fn().mockResolvedValue(undefined);
    profileData = vi.fn().mockImplementation(async () => profile);
    service = createTestPreprocessingService({ pruneFiles: prune, profileData });
  });

  afterEach(() => localStorage.clear());

  it('prunes after a file is loaded, keeping the new file', async () => {
    await service.loadCSV(csv('a.csv'));

    expect(prune).toHaveBeenCalledTimes(1);
    expect(lastKeep()).toEqual(['a.csv']);
  });

  it('keeps a replaced file while the undo history still references it', async () => {
    await service.loadCSV(csv('a.csv'));
    await service.loadCSV(csv('b.csv'));

    expect(lastKeep()).toEqual(['a.csv', 'b.csv']);
  });

  it('removes an upload that failed to load', async () => {
    await service.loadCSV(csv('a.csv'));
    profileData.mockRejectedValue(new Error('not a CSV'));

    await expect(service.loadCSV(csv('broken.csv'))).rejects.toThrow();

    expect(lastKeep()).toEqual(['a.csv']);
  });

  it('never prunes an upload that is still being profiled', async () => {
    let finish: (value: DataProfile) => void = () => undefined;
    profileData.mockReturnValue(new Promise<DataProfile>(resolve => (finish = resolve)));
    const loading = service.loadCSV(csv('big.csv'));

    service.resetState();
    expect(lastKeep()).toEqual(['big.csv']);

    finish(profile);
    await loading;
    expect(lastKeep()).toEqual(['big.csv']);
  });

  it('prunes a file that only the redo stack referenced once a new action clears it', async () => {
    await service.loadCSV(csv('a.csv'));
    await service.loadCSV(csv('b.csv'));
    service.undo(); // back to a.csv; b.csv now lives only on the redo stack
    const callsBefore = prune.mock.calls.length;

    service.pushHistory('Column settings changed');

    expect(prune.mock.calls.length).toBe(callsBefore + 1);
    expect(lastKeep()).toEqual(['a.csv']);
  });

  it('prunes when MAX_HISTORY evicts the last reference to a file, and not before', async () => {
    await service.loadCSV(csv('a.csv')); // undo: [<no file>]
    await service.loadCSV(csv('b.csv')); // undo: [<no file>, a.csv]
    const callsBefore = prune.mock.calls.length;

    for (let i = 0; i < 49; i++) {
      service.pushHistory(`Action ${i}`); // evicts only the file-less first entry
    }
    expect(prune.mock.calls.length).toBe(callsBefore);

    service.pushHistory('One more'); // evicts the entry that held a.csv
    expect(prune.mock.calls.length).toBe(callsBefore + 1);
    expect(lastKeep()).toEqual(['b.csv']);
  });

  it('prunes every file on reset', async () => {
    await service.loadCSV(csv('a.csv'));
    await service.loadCSV(csv('b.csv'));

    service.resetState();

    expect(lastKeep()).toEqual([]);
  });

  it('logs a failed prune without failing the action', async () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    prune.mockRejectedValue(new Error('worker timed out'));

    await expect(service.loadCSV(csv('a.csv'))).resolves.not.toThrow();
    await Promise.resolve();

    expect(logged).toHaveBeenCalledWith(
      expect.stringContaining('Failed to prune'),
      { keep: ['a.csv'] },
      expect.any(Error)
    );
  });

  it('logs instead of throwing when the worker cannot be asked at all', () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const unreachable = createTestPreprocessingService(); // no DataProcessorService members at all

    expect(() => unreachable.resetState()).not.toThrow();
    expect(logged).toHaveBeenCalled();
  });
});
