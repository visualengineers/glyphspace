import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { GlyphObject } from '../glyph/glyph-object';
import { ConfigService } from './config.service';
import { GlyphMeta } from '../shared/interfaces/glyph-meta';
import { GlyphSchema } from '../shared/interfaces/glyph-schema';
import { DatasetCollection, DatasetCollectionEntry, DatasetItem } from '../shared/interfaces/dataset-collection';
import { GlyphFeature } from '../shared/interfaces/glyph-feature';
import { GlyphPosition } from '../shared/interfaces/glyph-position';
import { DatasetStorageService, StoredDataset } from './dataset-storage.service';
import { ToastService } from './toast.service';
import { FilterService } from './filter.service';
import { DatasetCollectionService } from './dataset-collection.service';
import { DatasetCacheService } from './dataset-cache.service';
import { SchemaConfigSyncService } from './schema-config-sync.service';
import { ThumbnailService } from './thumbnail.service';

/** How a request to open a dataset ended. */
export type OpenResult = 'opened' | 'superseded' | 'unavailable';

const BUNDLED_DATA_PATH = 'assets/data/';

/**
 * Loads datasets into `DatasetCacheService` and makes one of them the active
 * dataset (`openDataset`).
 *
 * Bundled datasets are downloaded at startup, all in parallel; the first in
 * collection order that loads is opened, unless the user or the wizard opened
 * another one meanwhile. Datasets saved in IndexedDB are listed at startup and
 * read when first opened. Every getter waits for a dataset that is still loading.
 */
@Injectable({
  providedIn: 'root',
})
export class DataLoaderService {
  /** Observable for dataset collection changes (delegates to DatasetCollectionService) */
  dataSetCollectionSubject$!: DatasetCollectionService['dataSetCollectionSubject$'];

  /** Loads still running, by dataset name; each resolves to whether the dataset is now in the cache. */
  private loads = new Map<string, Promise<boolean>>();
  /** Bumped by every request to open a dataset, so an older request that finishes later is dropped. */
  private openGeneration = 0;

  constructor(
    private http: HttpClient,
    private config: ConfigService,
    private datasetStorage: DatasetStorageService,
    private toast: ToastService,
    private filterService: FilterService,
    private collectionSvc: DatasetCollectionService,
    private cacheSvc: DatasetCacheService,
    private schemaSyncSvc: SchemaConfigSyncService,
    private thumbnails: ThumbnailService
  ) {
    this.dataSetCollectionSubject$ = this.collectionSvc.dataSetCollectionSubject$;
    void this.openStartDataset();
    void this.registerSavedDatasets();
  }

  // === Opening a dataset ===

  /**
   * Make a dataset the active one, once it is loaded: reset the filters, apply
   * its schema to the configuration, then emit `loadData`. A later request wins
   * over an earlier one that is still loading.
   */
  async openDataset(name: string): Promise<OpenResult> {
    const generation = ++this.openGeneration;
    const loaded = await this.ensureLoaded(name);
    if (generation !== this.openGeneration) return 'superseded';
    if (!loaded || !this.cacheSvc.getGlyphMap(name)) return 'unavailable';
    this.activate(name);
    return 'opened';
  }

  /** The one path that switches the active dataset; `name` must be in the cache. */
  private activate(name: string): void {
    this.openGeneration++; // also supersedes a request that is still loading
    const glyphMap = this.cacheSvc.getGlyphMap(name);
    const timestamp = this.firstTimestamp(name);
    const schema = timestamp ? this.cacheSvc.getSchemaMap(name)?.get(timestamp) : undefined;
    const meta = timestamp ? this.cacheSvc.getMetaMap(name)?.get(timestamp) : undefined;

    this.filterService.clearFilters();
    if (schema) this.schemaSyncSvc.applySchemaToConfig(schema, meta);
    if (glyphMap) this.schemaSyncSvc.calculateFeatureMaxValues(glyphMap);
    this.filterService.setActiveGlyphData(glyphMap);
    this.config.loadData(name);
  }

  private async openStartDataset(): Promise<void> {
    const bundled = this.collectionSvc.getCollection().filter(entry => entry.source === 'local');
    // Start every download now; then take the first in collection order that loads.
    const loads = bundled.map(entry => this.ensureLoaded(entry.dataset));
    for (const [index, entry] of bundled.entries()) {
      if (await loads[index]) {
        if (this.openGeneration === 0) this.activate(entry.dataset);
        return;
      }
    }
  }

  // === Loading into the cache ===

  /** Resolves to whether the dataset is in the cache, loading it first if needed. */
  private ensureLoaded(name: string): Promise<boolean> {
    const pending = this.loads.get(name);
    if (pending) return pending;
    if (this.cacheSvc.getGlyphMap(name)) return Promise.resolve(true);

    const entry = this.collectionSvc.getCollectionEntry(name);
    let load: Promise<boolean>;
    if (entry?.source === 'local') load = this.loadBundled(entry);
    else if (entry?.source === 'indexeddb') load = this.loadStored(name);
    else return Promise.resolve(false); // wizard datasets of this session are always in the cache

    this.loads.set(name, load);
    // A failed load is forgotten, so the next request tries again.
    void load.then(() => {
      if (this.loads.get(name) === load) this.loads.delete(name);
    });
    return load;
  }

  private async loadBundled(entry: DatasetCollectionEntry): Promise<boolean> {
    const results = await Promise.all(entry.items.map(item => this.loadBundledItem(entry.dataset, item)));
    return results.some(Boolean);
  }

  private async loadBundledItem(name: string, item: DatasetItem): Promise<boolean> {
    const files = item.algorithms;
    const projections = Object.keys(files.position);
    const get = <T>(file: string) => firstValueFrom(this.http.get<T>(BUNDLED_DATA_PATH + file));
    try {
      const [schema, meta, features, positionLists] = await Promise.all([
        get<GlyphSchema>(files.schema),
        get<GlyphMeta>(files.meta),
        get<GlyphFeature[]>(files.feature),
        Promise.all(projections.map(projection => get<GlyphPosition[]>(files.position[projection]))),
      ]);
      const positions = new Map(projections.map((projection, i) => [projection, positionLists[i]]));
      this.cacheSvc.buildDataSet(name, item.time, schema, meta, features, positions);
      return true;
    } catch (err) {
      console.error(`[DataLoader] Failed to load dataset "${name}":`, err);
      this.toast.error(`Failed to load dataset "${name}"`);
      return false;
    }
  }

  private async loadStored(name: string): Promise<boolean> {
    const saved = await this.datasetStorage.getDataset(name);
    // Deleted while it was being read.
    if (!this.collectionSvc.getCollectionEntry(name)) return false;
    if (!saved) {
      this.toast.error(`Failed to load dataset "${name}"`);
      return false;
    }
    this.buildStored(saved);
    return true;
  }

  private buildStored(saved: StoredDataset): void {
    const positions = new Map(Object.entries(saved.positions));
    this.cacheSvc.buildDataSet(saved.name, saved.timestamp, saved.schema, saved.meta, saved.features, positions);
  }

  /** List the datasets saved in IndexedDB; their data is read when they are opened. */
  private async registerSavedDatasets(): Promise<void> {
    const summaries = await this.datasetStorage.getDatasetSummaries();
    const entries = summaries
      .filter(summary => !this.collectionSvc.getCollectionEntry(summary.name))
      .map(summary => memoryEntry(summary.name, summary.timestamp, summary.projections, 'indexeddb'));
    if (entries.length > 0) this.collectionSvc.setDatasetCollection(entries);
  }

  // === Saving and deleting ===

  public async saveDatasetToStorage(datasetName: string, timestamp: string): Promise<void> {
    try {
      const schema = this.cacheSvc.getSchemaMap(datasetName)?.get(timestamp);
      const meta = this.cacheSvc.getMetaMap(datasetName)?.get(timestamp);
      if (!schema || !meta) {
        console.warn('[DataLoader] Cannot save to IndexedDB - missing schema or meta for:', datasetName);
        return;
      }

      const glyphMap = this.cacheSvc.getGlyphMap(datasetName);
      if (!glyphMap) return;

      const features: GlyphFeature[] = [];
      const positions: Record<string, GlyphPosition[]> = {};

      glyphMap.forEach(glyph => {
        features.push({
          id: glyph.id,
          defaultcontext: String(glyph.defaultcontext),
          features: glyph.features,
          values: glyph.values ?? {},
          ...(glyph.metadata ? { metadata: glyph.metadata } : {}),
        });

        if (glyph.positions[timestamp]) {
          for (const [algo, pos] of Object.entries(glyph.positions[timestamp])) {
            if (!positions[algo]) positions[algo] = [];
            positions[algo].push({
              id: glyph.id,
              position: pos as { x: number; y: number },
            });
          }
        }
      });

      const stored: StoredDataset = {
        name: datasetName,
        timestamp,
        savedAt: Date.now(),
        schema,
        meta,
        features,
        positions,
      };

      await this.datasetStorage.saveDataset(stored);

      const entry = this.collectionSvc.getCollectionEntry(datasetName);
      if (entry) {
        entry.source = 'indexeddb';
        this.collectionSvc.notifyChange();
      }
    } catch (error) {
      console.warn('[DataLoader] Failed to save dataset to IndexedDB:', error);
      this.toast.warning(
        `"${datasetName}" could not be saved in the browser, so it will be gone after a reload. ` +
          'The browser may be out of storage space.'
      );
    }
  }

  /**
   * Use the item images in a ZIP archive for a dataset (Image glyph type), also
   * in later sessions. Returns the number of item images found.
   */
  public async attachThumbnails(datasetName: string, archive: Blob): Promise<number> {
    const count = await this.thumbnails.attachArchive(datasetName, archive);
    // Glyphs drawn meanwhile still show placeholders.
    if (this.config.loadedData === datasetName) this.config.updateConfiguration();
    return count;
  }

  /**
   * Delete an imported dataset. Rejects, and keeps the dataset, when IndexedDB
   * fails. When the dataset was the active one, the first dataset of the
   * collection that can be opened becomes active, with the filters reset.
   */
  public async deleteDataset(datasetName: string): Promise<boolean> {
    const entry = this.collectionSvc.getCollectionEntry(datasetName);

    if (!entry || entry.source === 'local') {
      return false;
    }

    await this.datasetStorage.deleteDataset(datasetName);
    this.thumbnails.forget(datasetName);
    this.cacheSvc.deleteDataset(datasetName);
    this.loads.delete(datasetName);
    this.collectionSvc.removeDataset(datasetName);

    if (this.config.loadedData === datasetName) {
      let result: OpenResult = 'unavailable';
      for (const candidate of this.collectionSvc.getCollection()) {
        result = await this.openDataset(candidate.dataset);
        if (result !== 'unavailable') break;
      }
      if (result === 'unavailable') {
        this.filterService.clearFilters();
        this.filterService.setActiveGlyphData(undefined);
      }
    }

    return true;
  }

  // === Data access (facade) ===

  getGlyphDataSync(): Map<string, GlyphObject> | undefined {
    return this.cacheSvc.getGlyphMap(this.config.loadedData);
  }

  /** The items of a dataset (default: the active one), once it is loaded. */
  public async getGlyphData(name?: string, _timestamp?: string): Promise<GlyphObject[] | undefined> {
    const dataset = name ?? this.config.loadedData;
    if (!dataset) return undefined;
    await this.ensureLoaded(dataset);
    const data = this.cacheSvc.getGlyphMap(dataset);
    return data ? Array.from(data.values()) : undefined;
  }

  /** The meta of a dataset (default: the active one) at a time (default: its first), once it is loaded. */
  public async getMetaData(name?: string, timestamp?: string): Promise<GlyphMeta | undefined> {
    const dataset = name ?? this.config.loadedData;
    if (!dataset) return undefined;
    await this.ensureLoaded(dataset);
    const time = timestamp ?? this.firstTimestamp(dataset);
    return time ? this.cacheSvc.getMetaMap(dataset)?.get(time) : undefined;
  }

  /** The schema of a dataset (default: the active one) at a time (default: its first), once it is loaded. */
  public async getSchema(name?: string, timestamp?: string): Promise<GlyphSchema | undefined> {
    const dataset = name ?? this.config.loadedData;
    if (!dataset) return undefined;
    await this.ensureLoaded(dataset);
    const time = timestamp ?? this.firstTimestamp(dataset);
    return time ? this.cacheSvc.getSchemaMap(dataset)?.get(time) : undefined;
  }

  // Collection access (facade delegates)
  getTimestamps(name: string): string[] {
    return this.collectionSvc.getTimestamps(name);
  }

  getPositions(name: string): string[];
  getPositions(name: string, time?: string): string[] {
    return this.collectionSvc.getPositions(name, time);
  }

  getDataSetNames(): string[] {
    return this.collectionSvc.getDataSetNames();
  }

  getGlyphMap(name: string): Map<string, GlyphObject> | undefined {
    return this.cacheSvc.getGlyphMap(name);
  }

  getSchemaMap(name: string): Map<string, GlyphSchema> | undefined {
    return this.cacheSvc.getSchemaMap(name);
  }

  setDatasetCollection(newCollection: DatasetCollection): void {
    this.collectionSvc.setDatasetCollection(newCollection);
  }

  // === Processed dataset loading ===

  /** Build a dataset from the wizard into the cache and make it the active one. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dataset is an opaque structure from Python/WASM processing
  public loadProcessedDataset(dataset: any, datasetName: string, timestamp: string): void {
    const schema: GlyphSchema = dataset.schema;
    const meta: GlyphMeta = dataset.meta;
    const features: GlyphFeature[] = dataset.features;

    const positions = new Map<string, GlyphPosition[]>();
    if (dataset.projections && Array.isArray(dataset.projections)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- projection entries from Python processing have dynamic shape
      dataset.projections.forEach((proj: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- projection data items from Python processing
        const posArray: GlyphPosition[] = proj.data.map((item: any) => ({
          id: item.id,
          position: { x: item.x, y: item.y },
        }));
        positions.set(proj.name, posArray);
      });
    } else if (dataset.positions) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- positions from Python processing have dynamic shape
      Object.entries(dataset.positions).forEach(([name, data]: [string, any]) => {
        positions.set(name, data);
      });
    }

    this.cacheSvc.buildDataSet(datasetName, timestamp, schema, meta, features, positions);
    this.activate(datasetName);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dataset is an opaque structure from Python/WASM processing
  public addProcessedDatasetToCollection(datasetName: string, timestamp: string, dataset: any): void {
    let projections: string[] = [];
    if (dataset.projections && Array.isArray(dataset.projections)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- projection entries from Python processing
      projections = dataset.projections.map((proj: any) => proj.name);
    } else if (dataset.positions) {
      projections = Object.keys(dataset.positions);
    }

    this.collectionSvc.setDatasetCollection([memoryEntry(datasetName, timestamp, projections, 'wasm')]);
  }

  /**
   * Add a projection that finished in the background to a dataset in the cache.
   * A new projection only extends the collection, whose subscribers offer it;
   * new positions of a projection that is already listed redraw the glyphs.
   */
  public addPositionsToLoadedDataset(
    datasetName: string,
    timestamp: string,
    algorithm: string,
    positions: { id: string | number; position: { x: number; y: number } }[]
  ): boolean {
    const glyphMap = this.cacheSvc.getGlyphMap(datasetName);
    if (!glyphMap) {
      console.warn(`[DataLoader] Cannot add positions - dataset ${datasetName} not in cache`);
      return false;
    }

    let matchCount = 0;

    for (const posEntry of positions) {
      const idStr = String(posEntry.id);
      const glyph = glyphMap.get(idStr);
      if (!glyph) continue;

      if (!glyph.positions[timestamp]) {
        glyph.positions[timestamp] = {};
      }

      glyph.positions[timestamp][algorithm] = { ...posEntry.position };
      matchCount++;
    }

    const item = this.collectionSvc.getCollectionEntry(datasetName)?.items.find(it => it.time === timestamp);
    if (item && !item.algorithms.position[algorithm]) {
      item.algorithms.position[algorithm] = `memory://${datasetName}/${timestamp}/${algorithm}`;
      this.collectionSvc.notifyChange();
    } else if (this.config.loadedData === datasetName) {
      this.config.updateConfiguration();
    }

    return matchCount > 0;
  }

  // === Internal helpers ===

  private firstTimestamp(name: string): string | undefined {
    return this.collectionSvc.getCollectionEntry(name)?.items.at(0)?.time;
  }
}

/** Collection entry of a wizard dataset; its data is in the cache (or IndexedDB), named by memory:// references. */
function memoryEntry(
  name: string,
  time: string,
  projections: string[],
  source: 'wasm' | 'indexeddb'
): DatasetCollectionEntry {
  const base = `memory://${name}/${time}`;
  return {
    dataset: name,
    source,
    items: [
      {
        time,
        algorithms: {
          schema: `${base}/schema`,
          meta: `${base}/meta`,
          feature: `${base}/features`,
          position: Object.fromEntries(projections.map(projection => [projection, `${base}/${projection}`])),
        },
      },
    ],
  };
}
