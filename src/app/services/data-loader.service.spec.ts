import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DataLoaderService } from './data-loader.service';
import { DatasetStorageService, StoredDataset, StoredDatasetSummary } from './dataset-storage.service';
import { ThumbnailService } from './thumbnail.service';
import { ConfigService } from './config.service';
import { FilterService } from './filter.service';
import { ToastService } from './toast.service';
import { DatasetCollectionService } from './dataset-collection.service';
import { IdFilter } from '../shared/filter/id-filter';
import { DEFAULT_DATASETCOLLECTION } from '../../default-dataset';

/** The two bundled datasets, in collection order (the first opens on start). */
const [FIRST, SECOND] = DEFAULT_DATASETCOLLECTION.map(entry => entry.dataset);

function schema() {
  return { color: '1', glyph: ['1'], label: { '1': 'a' }, types: { '1': 'numeric' } };
}

function features(ids: string[]) {
  return ids.map(id => ({ id, defaultcontext: '1', features: { '1': { '1': 0.5 } }, values: { '1': '0.5' } }));
}

/** A wizard dataset as DataLoaderService.loadProcessedDataset gets it. */
function processed(ids: string[]) {
  return {
    schema: schema(),
    meta: { features: {} },
    features: features(ids),
    positions: { fastmap: ids.map(id => ({ id, position: { x: 0, y: 0 } })) },
  };
}

function storedDataset(name: string, ids: string[]): StoredDataset {
  return { name, timestamp: '20261101', savedAt: 1, ...processed(ids) } as unknown as StoredDataset;
}

describe('DataLoaderService', () => {
  let http: HttpTestingController;
  let storage: {
    getDatasetSummaries: ReturnType<typeof vi.fn<() => Promise<StoredDatasetSummary[]>>>;
    getDataset: ReturnType<typeof vi.fn<(name: string) => Promise<StoredDataset | undefined>>>;
    saveDataset: ReturnType<typeof vi.fn<(dataset: StoredDataset) => Promise<void>>>;
    deleteDataset: ReturnType<typeof vi.fn<(name: string) => Promise<void>>>;
  };
  let thumbnails: { forget: ReturnType<typeof vi.fn> };
  let config: ConfigService;
  let filters: FilterService;
  let toast: ToastService;

  /** Answer the downloads of a bundled dataset; its items are `ids`. */
  function serve(name: string, ids = ['a', 'b', 'c']): void {
    for (const req of http.match(r => r.url.startsWith(`assets/data/${name}.`))) {
      const url = req.request.url;
      if (url.endsWith('.schema.json')) req.flush(schema());
      else if (url.endsWith('.meta.json')) req.flush({ features: {} });
      else if (url.endsWith('.feature.json')) req.flush(features(ids));
      else req.flush(ids.map(id => ({ id, position: { x: 0, y: 0 } })));
    }
  }

  function failDownload(name: string): void {
    for (const req of http.match(r => r.url.startsWith(`assets/data/${name}.`))) {
      req.flush('missing', { status: 404, statusText: 'Not Found' });
    }
  }

  function createLoader(): DataLoaderService {
    return TestBed.inject(DataLoaderService);
  }

  beforeEach(() => {
    storage = {
      getDatasetSummaries: vi.fn(async () => []),
      getDataset: vi.fn(async () => undefined),
      saveDataset: vi.fn(async () => undefined),
      deleteDataset: vi.fn(async () => undefined),
    };
    thumbnails = { forget: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DatasetStorageService, useValue: storage },
        { provide: ThumbnailService, useValue: thumbnails },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    config = TestBed.inject(ConfigService);
    filters = TestBed.inject(FilterService);
    toast = TestBed.inject(ToastService);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  it('opens the first bundled dataset in collection order, whatever download finishes first', async () => {
    createLoader();

    serve(SECOND);
    await Promise.resolve();
    expect(config.loadedData).toBe('');

    serve(FIRST);
    await vi.waitFor(() => expect(config.loadedData).toBe(FIRST));
    expect(filters.totalItems).toBe(3);
  });

  it('opens the next dataset when the first one fails to download', async () => {
    createLoader();

    failDownload(FIRST);
    serve(SECOND);

    await vi.waitFor(() => expect(config.loadedData).toBe(SECOND));
  });

  // Regression: choosing a bundled dataset that was still downloading cleared
  // the canvases and left them empty, because nothing emitted again when the
  // download finished.
  it('waits for a dataset that is still downloading and then opens it', async () => {
    const loader = createLoader();
    serve(FIRST);
    await vi.waitFor(() => expect(config.loadedData).toBe(FIRST));

    const opening = loader.openDataset(SECOND);
    await Promise.resolve();
    expect(config.loadedData).toBe(FIRST);

    serve(SECOND, ['x', 'y']);

    expect(await opening).toBe('opened');
    expect(config.loadedData).toBe(SECOND);
    expect((await loader.getGlyphData())?.map(glyph => glyph.id)).toEqual(['x', 'y']);
    expect(filters.totalItems).toBe(2);
  });

  // Regression: the start dataset replaced a dataset the user had chosen while
  // the start dataset was still downloading.
  it('keeps a dataset chosen before the start dataset has loaded', async () => {
    const loader = createLoader();
    serve(SECOND);
    expect(await loader.openDataset(SECOND)).toBe('opened');

    serve(FIRST);
    await new Promise(resolve => setTimeout(resolve));

    expect(config.loadedData).toBe(SECOND);
  });

  it('lets a later choice win over an earlier one that is still loading', async () => {
    const loader = createLoader();
    serve(FIRST);
    await vi.waitFor(() => expect(config.loadedData).toBe(FIRST));

    const earlier = loader.openDataset(SECOND);
    expect(await loader.openDataset(FIRST)).toBe('opened');
    serve(SECOND);

    expect(await earlier).toBe('superseded');
    expect(config.loadedData).toBe(FIRST);
  });

  it('reports a dataset that cannot be loaded', async () => {
    const loader = createLoader();
    serve(FIRST);
    await vi.waitFor(() => expect(config.loadedData).toBe(FIRST));
    const error = vi.spyOn(toast, 'error');

    const opening = loader.openDataset(SECOND);
    failDownload(SECOND);

    expect(await opening).toBe('unavailable');
    expect(config.loadedData).toBe(FIRST);
    expect(error).toHaveBeenCalled();
  });

  // Regression: every getGlyphData call (e.g. from a newly added canvas) set the
  // filtered count back to the total while the filters stayed active.
  it('reads the items without touching the filter counts', async () => {
    const loader = createLoader();
    serve(FIRST);
    await vi.waitFor(() => expect(config.loadedData).toBe(FIRST));
    filters.ensureFilter(new IdFilter(['a']));
    filters.refreshFilters();

    await loader.getGlyphData();

    expect(filters.filteredItems).toBe(1);
  });

  describe('imported datasets', () => {
    async function openUpload(loader: DataLoaderService): Promise<void> {
      serve(FIRST);
      await vi.waitFor(() => expect(config.loadedData).toBe(FIRST));
      const dataset = processed(['u1', 'u2']);
      loader.addProcessedDatasetToCollection('upload', '20261114', dataset);
      loader.loadProcessedDataset(dataset, 'upload', '20261114');
    }

    // Regression: deleting the active dataset switched to the first dataset but
    // kept every filter, which then applied to the new dataset's items.
    it('deleting the active dataset opens the first dataset with the filters reset', async () => {
      const loader = createLoader();
      await openUpload(loader);
      const selection = new IdFilter(['u1']);
      filters.ensureFilter(selection);
      filters.refreshFilters();

      expect(await loader.deleteDataset('upload')).toBe(true);

      expect(config.loadedData).toBe(FIRST);
      expect(filters.getFilters()).toEqual([]);
      expect(selection.empty()).toBe(true);
      expect(filters.filteredItems).toBe(3);
      expect(storage.deleteDataset).toHaveBeenCalledWith('upload');
      expect(thumbnails.forget).toHaveBeenCalledWith('upload');
      expect(loader.getDataSetNames()).not.toContain('upload');
    });

    it('keeps a dataset whose deletion fails, and reports the failure', async () => {
      const loader = createLoader();
      await openUpload(loader);
      storage.deleteDataset.mockRejectedValue(new DOMException('quota', 'QuotaExceededError'));

      await expect(loader.deleteDataset('upload')).rejects.toThrow();

      expect(loader.getDataSetNames()).toContain('upload');
      expect(loader.getGlyphMap('upload')?.size).toBe(2);
      expect(config.loadedData).toBe('upload');
    });

    it('warns when a dataset cannot be saved in the browser', async () => {
      const loader = createLoader();
      await openUpload(loader);
      storage.saveDataset.mockRejectedValue(new DOMException('quota', 'QuotaExceededError'));
      const warning = vi.spyOn(toast, 'warning');

      await loader.saveDatasetToStorage('upload', '20261114');

      expect(warning).toHaveBeenCalled();
      expect(TestBed.inject(DatasetCollectionService).getCollectionEntry('upload')?.source).toBe('wasm');
    });

    it('marks a saved dataset as stored', async () => {
      const loader = createLoader();
      await openUpload(loader);

      await loader.saveDatasetToStorage('upload', '20261114');

      expect(storage.saveDataset).toHaveBeenCalled();
      expect(TestBed.inject(DatasetCollectionService).getCollectionEntry('upload')?.source).toBe('indexeddb');
    });

    // A projection finishing in the background only extends the list of
    // projections; rebuilding every glyph for it was wasted work.
    it('adds a background projection without redrawing the glyphs', async () => {
      const loader = createLoader();
      await openUpload(loader);
      const update = vi.spyOn(config, 'updateConfiguration');

      loader.addPositionsToLoadedDataset('upload', '20261114', 'pca', [{ id: 'u1', position: { x: 1, y: 2 } }]);

      expect(loader.getPositions('upload')).toEqual(['fastmap', 'pca']);
      expect(loader.getGlyphMap('upload')?.get('u1')?.positions['20261114']['pca']).toEqual({ x: 1, y: 2 });
      expect(update).not.toHaveBeenCalled();
    });

    // ADR 0008: saved datasets are listed at startup and built when first opened.
    it('lists saved datasets at startup and reads one when it is opened', async () => {
      storage.getDatasetSummaries.mockResolvedValue([
        { name: 'saved', timestamp: '20261101', projections: ['fastmap'] },
      ]);
      storage.getDataset.mockResolvedValue(storedDataset('saved', ['s1']));
      const loader = createLoader();
      serve(FIRST);

      await vi.waitFor(() => expect(loader.getDataSetNames()).toContain('saved'));
      expect(loader.getGlyphMap('saved')).toBeUndefined();

      expect(await loader.openDataset('saved')).toBe('opened');
      expect(storage.getDataset).toHaveBeenCalledWith('saved');
      expect(config.loadedData).toBe('saved');
      expect(loader.getPositions('saved')).toEqual(['fastmap']);
    });
  });
});
