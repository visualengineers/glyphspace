import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { GlyphObject } from '../glyph/glyph-object';
import { ConfigService } from './config.service';
import { GlyphMeta } from '../shared/interfaces/glyph-meta';
import { GlyphSchema } from '../shared/interfaces/glyph-schema';
import { DatasetCollection, DatasetCollectionEntry } from '../shared/interfaces/dataset-collection';
import { DataProcessorService } from './data-processor';
import { GlyphFeature } from '../shared/interfaces/glyph-feature';
import { GlyphPosition } from '../shared/interfaces/glyph-position';
import { HttpClient } from '@angular/common/http';
import { DEFAULT_DATASETCOLLECTION } from '../../default-dataset';
import { DatasetStorageService, StoredDataset } from './dataset-storage.service';
import { ToastService } from './toast.service';
import { FilterService } from './filter.service';
import { DatasetCollectionService } from './dataset-collection.service';
import { DatasetCacheService } from './dataset-cache.service';
import { SchemaConfigSyncService } from './schema-config-sync.service';

@Injectable({
  providedIn: 'root',
})
export class DataLoaderService {
  /** Observable for dataset collection changes (delegates to DatasetCollectionService) */
  dataSetCollectionSubject$!: DatasetCollectionService['dataSetCollectionSubject$'];

  constructor(
    private http: HttpClient,
    private config: ConfigService,
    private dataProcessor: DataProcessorService,
    private datasetStorage: DatasetStorageService,
    private toast: ToastService,
    private filterService: FilterService,
    private collectionSvc: DatasetCollectionService,
    private cacheSvc: DatasetCacheService,
    private schemaSyncSvc: SchemaConfigSyncService
  ) {
    this.dataSetCollectionSubject$ = this.collectionSvc.dataSetCollectionSubject$;
    this.loadDatasets(DEFAULT_DATASETCOLLECTION);
    this.loadSavedDatasets();
  }

  // === Data loading ===

  private loadDatasets(datasets: DatasetCollection) {
    datasets.forEach(ds => {
      ds.items.forEach(item => {
        const basePath = 'assets/data/';
        const algos = item.algorithms;
        const datasetId = ds.dataset;
        const time = item.time;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- HTTP responses are typed at consumption via result keys
        const requests: Record<string, Observable<any>> = {
          schema: this.http.get<GlyphSchema>(basePath + algos.schema),
          meta: this.http.get<GlyphMeta>(basePath + algos.meta),
          feature: this.http.get<GlyphFeature[]>(basePath + algos.feature),
        };

        const positionKeys = Object.keys(algos.position);
        positionKeys.forEach(posKey => {
          requests[posKey] = this.http.get<GlyphPosition[]>(basePath + algos.position[posKey]);
        });

        forkJoin(requests).subscribe({
          next: result => {
            const schema = result['schema'];
            const meta = result['meta'];
            const feature = result['feature'];

            const positions = new Map<string, GlyphPosition[]>();
            positionKeys.forEach(posKey => {
              positions.set(posKey, result[posKey]);
            });

            const items = this.cacheSvc.buildDataSet(datasetId, time, schema, meta, feature, positions);

            if (!this.filterService.totalItems) {
              this.filterService.totalItems = items;
              this.filterService.filteredItems = items;
              this.schemaSyncSvc.applySchemaToConfig(schema);
              this.config.updateConfiguration();
              this.config.loadData(datasetId);
            }
          },
          error: err => {
            console.error(`[DataLoader] Failed to load dataset "${datasetId}":`, err);
            this.toast.error(`Failed to load dataset "${datasetId}"`);
          },
        });
      });
    });
  }

  private async loadSavedDatasets(): Promise<void> {
    try {
      const savedDatasets = await this.datasetStorage.getAllDatasets();

      for (const saved of savedDatasets) {
        const positionsMap = new Map<string, GlyphPosition[]>();
        for (const [algo, posArr] of Object.entries(saved.positions)) {
          positionsMap.set(algo, posArr);
        }

        this.cacheSvc.buildDataSet(saved.name, saved.timestamp, saved.schema, saved.meta, saved.features, positionsMap);

        const positionMapping: Record<string, string> = {};
        for (const algo of Object.keys(saved.positions)) {
          positionMapping[algo] = `memory://${saved.name}/${saved.timestamp}/${algo}`;
        }

        const entry: DatasetCollectionEntry = {
          dataset: saved.name,
          source: 'indexeddb',
          items: [
            {
              time: saved.timestamp,
              algorithms: {
                schema: `memory://${saved.name}/${saved.timestamp}/schema`,
                meta: `memory://${saved.name}/${saved.timestamp}/meta`,
                feature: `memory://${saved.name}/${saved.timestamp}/features`,
                position: positionMapping,
              },
            },
          ],
        };

        this.collectionSvc.setDatasetCollection([entry]);
      }
    } catch (error) {
      console.warn('[DataLoader] Failed to load saved datasets from IndexedDB:', error);
    }
  }

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
    }
  }

  public async deleteDataset(datasetName: string): Promise<boolean> {
    const entry = this.collectionSvc.getCollectionEntry(datasetName);

    if (!entry || entry.source === 'local') {
      return false;
    }

    await this.datasetStorage.deleteDataset(datasetName);
    this.cacheSvc.deleteDataset(datasetName);
    this.collectionSvc.removeDataset(datasetName);

    const collection = this.collectionSvc.getCollection();
    if (this.config.loadedData === datasetName && collection.length > 0) {
      this.config.loadData(collection[0].dataset);
    }

    return true;
  }

  // === Data access (facade) ===

  getGlyphDataSync(): Map<string, GlyphObject> | undefined {
    return this.cacheSvc.getGlyphMap(this.config.loadedData);
  }

  public async getGlyphData(): Promise<GlyphObject[] | undefined>;
  public async getGlyphData(name?: string): Promise<GlyphObject[] | undefined>;
  public async getGlyphData(name?: string, timestamp?: string): Promise<GlyphObject[] | undefined>;
  public async getGlyphData(
    name?: string,
    timestamp?: string,
    _algorithm?: string
  ): Promise<GlyphObject[] | undefined> {
    const resolved = this.resolveDatasetParams(name, timestamp || undefined);
    if (!resolved) return undefined;

    const collection = this.collectionSvc.getCollectionEntry(resolved.name);

    let data = this.cacheSvc.getGlyphMap(resolved.name);
    if (!data) {
      await this.loadDataSet(resolved.name, resolved.timestamp);
      data = this.cacheSvc.getGlyphMap(resolved.name);
    }
    if (data) {
      this.filterService.totalItems = data.size;
      this.filterService.setActiveGlyphData(data);
    }
    this.filterService.filteredItems = this.filterService.totalItems;
    if (collection) this.config.dataSource = collection.source;
    return data ? Array.from(data.values()) : undefined;
  }

  public async getMetaData(): Promise<GlyphMeta | undefined>;
  public async getMetaData(name?: string, timestamp?: string): Promise<GlyphMeta | undefined> {
    const resolved = this.resolveDatasetParams(name, timestamp);
    if (!resolved) return undefined;

    let meta = this.cacheSvc.getMetaMap(resolved.name);
    if (!meta) {
      await this.loadDataSet(resolved.name, resolved.timestamp);
      meta = this.cacheSvc.getMetaMap(resolved.name);
    }
    return meta?.get(resolved.timestamp);
  }

  public async getSchema(): Promise<GlyphSchema | undefined>;
  public async getSchema(name?: string, timestamp?: string): Promise<GlyphSchema | undefined> {
    const resolved = this.resolveDatasetParams(name, timestamp);
    if (!resolved) return undefined;

    let schema = this.cacheSvc.getSchemaMap(resolved.name);
    if (!schema) {
      await this.loadDataSet(resolved.name, resolved.timestamp);
      schema = this.cacheSvc.getSchemaMap(resolved.name);
    }
    const schemaResult = schema?.get(resolved.timestamp);
    if (schemaResult) {
      this.schemaSyncSvc.applySchemaToConfig(schemaResult);
      const glyphMap = this.cacheSvc.getGlyphMap(resolved.name);
      if (glyphMap) this.schemaSyncSvc.calculateFeatureMaxValues(glyphMap);
    }

    return schemaResult;
  }

  // Collection access (facade delegates)
  getTimestamps(name: string): string[] {
    return this.collectionSvc.getTimestamps(name);
  }

  getPositions(name: string): string[];
  getPositions(name: string, time?: string): string[] {
    return this.collectionSvc.getPositions(name, time);
  }

  getContexts(name: string): string[];
  getContexts(name: string, _time?: string): string[] {
    return this.collectionSvc.getContexts(name, _time);
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dataset is an opaque structure from Python/WASM processing
  public loadProcessedDataset(dataset: any, datasetName: string, timestamp: string): void {
    this.filterService.clearFilters();

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

    this.schemaSyncSvc.applySchemaToConfig(schema);
    const metaMap = this.cacheSvc.getMetaMap(datasetName);
    const metaEntry = metaMap?.get(timestamp);
    if (metaEntry) this.schemaSyncSvc.extractFeatureMaxValuesFromMeta(metaEntry);

    this.config.updateConfiguration();
    this.config.loadData(datasetName);

    const glyphMap = this.cacheSvc.getGlyphMap(datasetName);
    if (glyphMap) {
      this.filterService.totalItems = glyphMap.size;
      this.filterService.filteredItems = this.filterService.totalItems;
      this.filterService.setActiveGlyphData(glyphMap);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dataset is an opaque structure from Python/WASM processing
  public addProcessedDatasetToCollection(datasetName: string, timestamp: string, dataset: any): void {
    const positionMapping: Record<string, string> = {};
    if (dataset.projections && Array.isArray(dataset.projections)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- projection entries from Python processing
      dataset.projections.forEach((proj: any) => {
        positionMapping[proj.name] = `memory://${datasetName}/${timestamp}/${proj.name}`;
      });
    } else if (dataset.positions) {
      Object.keys(dataset.positions).forEach(key => {
        positionMapping[key] = `memory://${datasetName}/${timestamp}/${key}`;
      });
    }

    const newEntry: DatasetCollectionEntry = {
      dataset: datasetName,
      source: 'wasm',
      items: [
        {
          time: timestamp,
          algorithms: {
            schema: `memory://${datasetName}/${timestamp}/schema`,
            meta: `memory://${datasetName}/${timestamp}/meta`,
            feature: `memory://${datasetName}/${timestamp}/features`,
            position: positionMapping,
          },
        },
      ],
    };

    this.collectionSvc.setDatasetCollection([newEntry]);
  }

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

    const entry = this.collectionSvc.getCollectionEntry(datasetName);
    if (entry) {
      const item = entry.items.find(it => it.time === timestamp);
      if (item && !item.algorithms.position[algorithm]) {
        item.algorithms.position[algorithm] = `memory://${datasetName}/${timestamp}/${algorithm}`;
        this.collectionSvc.notifyChange();
      }
    }

    this.config.updateConfiguration();

    return matchCount > 0;
  }

  // === Internal helpers ===

  async loadDataSet(name: string, timestamp: string) {
    this.filterService.clearFilters();

    const dataset = this.collectionSvc.getCollectionEntry(name);
    const item = dataset?.items.find(item => item.time === timestamp);
    if (item && dataset?.source === 'wasm') {
      const schema = (await this.dataProcessor.fetchJson(item.algorithms.schema)) as GlyphSchema;
      const meta = (await this.dataProcessor.fetchJson(item.algorithms.meta)) as GlyphMeta;
      const features = (await this.dataProcessor.fetchJson(item.algorithms.feature)) as GlyphFeature[];
      const positions = new Map<string, GlyphPosition[]>();
      for (const [key, value] of Object.entries(item.algorithms.position)) {
        const position = (await this.dataProcessor.fetchJson(value)) as GlyphPosition[];
        positions.set(key, position);
      }

      this.schemaSyncSvc.applySchemaToConfig(schema);
      this.config.updateConfiguration();

      const totalItems = this.cacheSvc.buildDataSet(name, timestamp, schema, meta, features, positions);
      this.filterService.totalItems = totalItems;
      this.filterService.filteredItems = totalItems;
    } else if (item && dataset?.source === 'indexeddb') {
      const saved = await this.datasetStorage.getDataset(name);
      if (saved) {
        const positionsMap = new Map<string, GlyphPosition[]>();
        for (const [algo, posArr] of Object.entries(saved.positions)) {
          positionsMap.set(algo, posArr);
        }
        this.schemaSyncSvc.applySchemaToConfig(saved.schema);
        this.config.updateConfiguration();
        const totalItems = this.cacheSvc.buildDataSet(
          name,
          saved.timestamp,
          saved.schema,
          saved.meta,
          saved.features,
          positionsMap
        );
        this.filterService.totalItems = totalItems;
        this.filterService.filteredItems = totalItems;
        const metaMap = this.cacheSvc.getMetaMap(name);
        const metaEntry = metaMap?.get(saved.timestamp);
        if (metaEntry) this.schemaSyncSvc.extractFeatureMaxValuesFromMeta(metaEntry);
      }
    }
  }

  private resolveDatasetParams(name?: string, timestamp?: string): { name: string; timestamp: string } | undefined {
    if (name === undefined) name = this.config.loadedData;
    if (timestamp === undefined) {
      timestamp = this.collectionSvc.getCollectionEntry(name)?.items.at(0)?.time;
    }
    if (name === undefined || timestamp === undefined) return undefined;
    return { name, timestamp };
  }
}
