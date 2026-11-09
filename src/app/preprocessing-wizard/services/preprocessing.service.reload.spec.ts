import type { Mock } from 'vitest';
import { PreprocessingService } from './preprocessing.service';
import { DataProfile } from '../models/column-statistics';
import { ColumnConfig } from '../models/column-config';
import { createMemoryFileStore, createTestPreprocessingService } from '../testing/preprocessing-test-helpers';
import { stepIndex } from '../shared/constants/step-info';

/**
 * Issue #92, item 2: the wizard settings survive a page reload in localStorage,
 * but the uploaded file lived only in the worker. The file is now kept in a file
 * store and put back into the worker when the wizard state is restored.
 */
describe('PreprocessingService – page reload', () => {
  let files: Map<string, Blob>;
  let profileData: Mock;

  const profileOf = (columns: string[]): DataProfile =>
    ({
      totalRows: 2,
      totalColumns: columns.length,
      fileSize: 10,
      fileName: 'wine.csv',
      columns: columns.map(name => ({ name, dataType: 'numeric', uniqueCount: 2, missingPercentage: 0 })),
      qualityScore: 100,
      duplicateCount: 0,
      previewRows: [],
    }) as unknown as DataProfile;

  const csv = (text = 'a,b\n1,2\n') => new File([text], 'wine.csv', { type: 'text/csv' });

  /** A service as after a page reload: a fresh instance on the same storage. */
  const reload = (): PreprocessingService =>
    createTestPreprocessingService({ profileData, pruneFiles: async () => undefined }, createMemoryFileStore(files));

  async function settle(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve));
  }

  beforeEach(() => {
    localStorage.clear();
    files = new Map();
    profileData = vi.fn().mockImplementation(async () => profileOf(['a', 'b']));
  });

  afterEach(() => localStorage.clear());

  it('keeps an uploaded file in the file store', async () => {
    const service = reload();

    await service.loadCSV(csv());
    await settle();

    expect(await files.get('wine.csv')?.text()).toBe('a,b\n1,2\n');
  });

  it('puts the stored file back into the worker after a reload', async () => {
    const before = reload();
    await before.loadCSV(csv());
    await settle();
    profileData.mockClear();

    const after = reload();
    await vi.waitFor(() => expect(after.currentState.isProcessing).toBe(false));

    expect(profileData).toHaveBeenCalledTimes(1);
    const [name, buffer] = profileData.mock.calls[0] as [string, ArrayBuffer];
    expect(name).toBe('wine.csv');
    expect(new TextDecoder().decode(buffer)).toBe('a,b\n1,2\n');
    expect(after.currentState.uploadMissing).toBe(false);
    expect(after.currentState.isProcessing).toBe(false);
  });

  // Found end to end: Step 3 asked for outlier counts before the restore had put
  // the file back, and the worker failed with FileNotFoundError.
  it('lets requests on the file wait until the file is restored', async () => {
    const before = reload();
    await before.loadCSV(csv());
    await settle();
    profileData.mockClear();
    let finishRestore = (): void => undefined;
    profileData.mockImplementation(
      () => new Promise(resolve => (finishRestore = () => resolve(profileOf(['a', 'b']))))
    );
    const detectOutliers = vi.fn().mockResolvedValue({ outlier_count: 0, outlier_indices: [] });

    const after = createTestPreprocessingService(
      { profileData, detectOutliers, pruneFiles: async () => undefined },
      createMemoryFileStore(files)
    );
    const outliers = after.detectOutliers('a', 'iqr_1.5' as never);
    await vi.waitFor(() => expect(profileData).toHaveBeenCalled());

    expect(detectOutliers).not.toHaveBeenCalled();
    finishRestore();
    await outliers;
    expect(detectOutliers).toHaveBeenCalledWith('wine.csv', 'a', 'iqr_1.5');
  });

  describe('when the file is gone', () => {
    let service: PreprocessingService;

    beforeEach(async () => {
      const before = reload();
      await before.loadCSV(csv());
      before.updateColumnConfig('a', { enabled: false } as Partial<ColumnConfig>);
      before.goToStep('features');
      await settle();
      files.clear();

      service = reload();
      await vi.waitFor(() => expect(service.currentState.isProcessing).toBe(false));
    });

    it('asks for it in the upload step', () => {
      expect(service.currentState.uploadMissing).toBe(true);
      expect(service.currentState.currentStep).toBe(stepIndex('upload'));
    });

    it('keeps the settings when the same file is uploaded again', async () => {
      await service.loadCSV(csv());

      expect(service.currentState.uploadMissing).toBe(false);
      expect(service.currentState.columnConfigs.get('a')?.enabled).toBe(false);
    });

    it('starts over when a file with other columns is uploaded', async () => {
      profileData.mockImplementation(async () => profileOf(['x']));

      await service.loadCSV(csv('x\n1\n'));

      expect(service.currentState.uploadMissing).toBe(false);
      expect(Array.from(service.currentState.columnConfigs.keys())).toEqual(['x']);
    });

    it('does not process without the file', async () => {
      await expect(service.processData()).rejects.toThrow(/upload it again/);
    });
  });

  // Issue #92, item 1: the ZIP of item images for the Image glyph type.
  describe('item image archive', () => {
    const zip = () => new File(['PK'], 'images.zip', { type: 'application/zip' });

    it('keeps the chosen archive across a reload', async () => {
      const before = reload();
      await before.loadCSV(csv());
      await before.setThumbnailArchive(zip());
      await settle();

      const after = reload();
      await vi.waitFor(() => expect(after.currentState.isProcessing).toBe(false));

      expect(after.currentState.thumbnailArchiveName).toBe('images.zip');
      expect(await (await after.thumbnailArchive())?.text()).toBe('PK');
    });

    it('drops the archive when it is removed', async () => {
      const service = reload();
      await service.loadCSV(csv());
      await service.setThumbnailArchive(zip());

      await service.setThumbnailArchive(null);
      await settle();

      expect(service.currentState.thumbnailArchiveName).toBeNull();
      expect(await service.thumbnailArchive()).toBeUndefined();
      expect(files.has('images.zip')).toBe(false);
    });
  });
});
