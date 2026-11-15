import { TestBed } from '@angular/core/testing';
import { DATASET_DB_NAME, DatasetStorageService, StoredDataset } from './dataset-storage.service';
import { GlyphSchema } from '../shared/interfaces/glyph-schema';

function stored(name: string, projections: string[] = ['fastmap']): StoredDataset {
  return {
    name,
    timestamp: '20261114',
    savedAt: 1,
    schema: { color: '1', glyph: ['1'], label: { '1': 'a' } } as unknown as GlyphSchema,
    meta: { features: {} },
    features: [],
    positions: Object.fromEntries(projections.map(p => [p, [{ id: '1', position: { x: 0, y: 0 } }]])),
  };
}

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Resolves once the database is deleted, rejects when an open connection blocks it. */
function deleteDatabase(name: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase(name);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('blocked'));
  });
}

describe('DatasetStorageService', () => {
  let dbName: string;
  let service: DatasetStorageService;

  beforeEach(() => {
    dbName = `glyphspace-datasets-spec-${crypto.randomUUID()}`;
    TestBed.configureTestingModule({ providers: [{ provide: DATASET_DB_NAME, useValue: dbName }] });
    service = TestBed.inject(DatasetStorageService);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(async () => {
    await deleteDatabase(dbName).catch(() => undefined);
  });

  it('saves, lists, reads and deletes datasets with their image archive', async () => {
    await service.saveDataset(stored('wine', ['fastmap', 'pca']));
    await service.saveDataset(stored('cars'));
    await service.saveThumbnailArchive('wine', new Blob(['zip']));

    expect(await service.getDatasetSummaries()).toEqual([
      { name: 'cars', timestamp: '20261114', projections: ['fastmap'] },
      { name: 'wine', timestamp: '20261114', projections: ['fastmap', 'pca'] },
    ]);
    expect((await service.getDataset('wine'))?.name).toBe('wine');

    await service.deleteDataset('wine');

    expect(await service.getDataset('wine')).toBeUndefined();
    expect(await service.getThumbnailArchive('wine')).toBeUndefined();
    expect((await service.getDatasetSummaries()).map(s => s.name)).toEqual(['cars']);
  });

  // Regression: the promise was returned from inside try without await, so a
  // failed write skipped the catch and reached callers that didn't expect it,
  // and a write that IndexedDB refused could not be told apart from a success.
  it('rejects a write that IndexedDB refuses', async () => {
    const unstorable = { ...stored('bad'), schema: { compute: () => 1 } } as unknown as StoredDataset;

    await expect(service.saveDataset(unstorable)).rejects.toThrow();
    expect(await service.getDataset('bad')).toBeUndefined();
  });

  // Regression: without onabort, a transaction that the browser aborted (Chrome
  // reports a full quota that way) never settled, so the save hung silently.
  it('settles a transaction that is aborted', async () => {
    const internals = service as unknown as {
      transaction(stores: string, mode: IDBTransactionMode, work: (tx: IDBTransaction) => void): Promise<unknown>;
    };

    await expect(internals.transaction('datasets', 'readwrite', tx => tx.abort())).rejects.toMatchObject({
      name: 'AbortError',
    });
  });

  // Regression: the connection ignored versionchange, so another tab could not
  // upgrade or delete the database while this one was open.
  it('lets another tab delete the database and opens it again on the next request', async () => {
    await service.saveDataset(stored('wine'));

    await deleteDatabase(dbName);

    expect(await service.getDataset('wine')).toBeUndefined();
    await service.saveDataset(stored('cars'));
    expect((await service.getDataset('cars'))?.name).toBe('cars');
  });

  // Regression: a tab of an older version that keeps the database open blocked
  // the upgrade, and every request waited for it forever.
  it('fails instead of waiting when an older version is open in another tab', async () => {
    const older = await request(indexedDB.open(dbName, 1));

    await expect(service.saveDataset(stored('wine'))).rejects.toThrow(/another tab/);
    expect(await service.getDatasetSummaries()).toEqual([]);

    older.close();
    await vi.waitFor(async () => {
      await service.saveDataset(stored('wine'));
    });
    expect((await service.getDataset('wine'))?.name).toBe('wine');
  });
});
