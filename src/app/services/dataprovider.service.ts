import { Injectable } from "@angular/core";
import { BehaviorSubject, forkJoin, Observable } from "rxjs";
import { GlyphObject } from "../glyph/glyph-object";
import { ConfigService } from "./config.service";
import { GlyphMeta } from "../shared/interfaces/glyph-meta";
import { GlyphSchema } from "../shared/interfaces/glyph-schema";
import { FilterMode } from "../shared/enum/filter-mode";
import { ItemFilter } from "../shared/filter/item-filter";
import { IdFilter } from "../shared/filter/id-filter";
import { DatasetCollection, DatasetCollectionEntry } from "../shared/interfaces/dataset-collection";
import { DataProcessorService } from "./data-processor";
import { GlyphFeature } from "../shared/interfaces/glyph-feature";
import { GlyphPosition } from "../shared/interfaces/glyph-position";
import { HttpClient } from "@angular/common/http";
import { DEFAULT_DATASETCOLLECTION } from "../../default-dataset";
import { DatasetStorageService, StoredDataset } from "./dataset-storage.service";

@Injectable({
    providedIn: 'root',
})
export class DataProviderService {
    private filters: ItemFilter[] = [];
    private glyphCache: Map<string, Map<string, GlyphObject>> = new Map();
    private metaCache: Map<string, Map<string, GlyphMeta>> = new Map();
    private schemaCache: Map<string, Map<string, GlyphSchema>> = new Map();

    private dataSetCollectionSubject = new BehaviorSubject<DatasetCollection>(DEFAULT_DATASETCOLLECTION);
    dataSetCollectionSubject$ = this.dataSetCollectionSubject.asObservable();

    totalItems = 0;
    filteredItems = 0;

    constructor(private http: HttpClient, private config: ConfigService, private dataProcessor: DataProcessorService, private datasetStorage: DatasetStorageService) {
        // TODO: Defer loading like WASM data sets
        this.loadDatasets(DEFAULT_DATASETCOLLECTION);
        this.loadSavedDatasets();
    }

    private loadDatasets(datasets: DatasetCollection) {
        datasets.forEach(ds => {
            ds.items.forEach(item => {
                const basePath = 'assets/data/';
                const algos = item.algorithms;
                const datasetId = ds.dataset;
                const time = item.time;

                // Build individual HTTP requests
                const requests: { [key: string]: Observable<any> } = {
                    schema: this.http.get<any>(basePath + algos.schema),
                    meta: this.http.get<any>(basePath + algos.meta),
                    feature: this.http.get<any>(basePath + algos.feature),
                };

                // Add position files dynamically
                const positionKeys = Object.keys(algos.position);
                positionKeys.forEach(posKey => {
                    requests[posKey] = this.http.get<GlyphPosition[]>(basePath + algos.position[posKey]);
                });

                forkJoin(requests).subscribe(result => {
                    // Extract standard data
                    const schema = result['schema'];
                    const meta = result['meta'];
                    const feature = result['feature'];

                    // Collect positions
                    const positions = new Map<string, GlyphPosition[]>();
                    positionKeys.forEach(posKey => {
                        positions.set(posKey, result[posKey]);
                    });

                    const items = this.buildDataSet(datasetId, time, schema, meta, feature, positions);

                    // Set initial view for the first dataset loaded (or use condition to choose)
                    if (!this.totalItems) {
                        this.totalItems = items;
                        this.filteredItems = items;
                        this.config.colorFeature = schema.color;
                        this.config.replaceActiveFeatures(schema.glyph);
                        this.config.featureLabels = schema.label;
                        // Apply color scale mode if specified in schema
                        if (schema.colorRange !== undefined) {
                            // Convert boolean to color scale ID: true -> 0 (continuous), false -> 4 (categorical)
                            this.config.colorRange = schema.colorRange ? 0 : 4;
                        }
                        // Notify subscribers (like histogram) that config has changed
                        this.config.updateConfiguration();
                        this.config.loadData(datasetId);
                    }

                    // Optionally store other datasets for switching later...
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

                this.buildDataSet(saved.name, saved.timestamp, saved.schema, saved.meta, saved.features, positionsMap);

                const positionMapping: { [key: string]: string } = {};
                for (const algo of Object.keys(saved.positions)) {
                    positionMapping[algo] = `memory://${saved.name}/${saved.timestamp}/${algo}`;
                }

                const entry: DatasetCollectionEntry = {
                    dataset: saved.name,
                    source: 'indexeddb',
                    items: [{
                        time: saved.timestamp,
                        algorithms: {
                            schema: `memory://${saved.name}/${saved.timestamp}/schema`,
                            meta: `memory://${saved.name}/${saved.timestamp}/meta`,
                            feature: `memory://${saved.name}/${saved.timestamp}/features`,
                            position: positionMapping
                        }
                    }]
                };

                this.setDatasetCollection([entry]);
            }
        } catch (error) {
            console.warn('[DataProvider] Failed to load saved datasets from IndexedDB:', error);
        }
    }

    public async saveDatasetToStorage(datasetName: string, timestamp: string): Promise<void> {
        try {
            const schema = this.schemaCache.get(datasetName)?.get(timestamp);
            const meta = this.metaCache.get(datasetName)?.get(timestamp);
            if (!schema || !meta) {
                console.warn('[DataProvider] Cannot save to IndexedDB - missing schema or meta for:', datasetName);
                return;
            }

            const glyphMap = this.glyphCache.get(datasetName);
            if (!glyphMap) return;

            const features: GlyphFeature[] = [];
            const positions: { [algo: string]: GlyphPosition[] } = {};

            glyphMap.forEach((glyph) => {
                features.push({
                    id: glyph.id,
                    defaultcontext: String(glyph.defaultcontext),
                    features: glyph.features,
                    values: glyph.values ?? {}
                });

                if (glyph.positions[timestamp]) {
                    for (const [algo, pos] of Object.entries(glyph.positions[timestamp])) {
                        if (!positions[algo]) positions[algo] = [];
                        positions[algo].push({
                            id: glyph.id,
                            position: pos as { x: number; y: number }
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
                positions
            };

            await this.datasetStorage.saveDataset(stored);

            // Update source to 'indexeddb' in collection
            const collection = this.dataSetCollectionSubject.getValue();
            const entry = collection.find(c => c.dataset === datasetName);
            if (entry) {
                entry.source = 'indexeddb';
                this.dataSetCollectionSubject.next([...collection]);
            }

            console.log(`[DataProvider] Dataset "${datasetName}" saved to IndexedDB`);
        } catch (error) {
            console.warn('[DataProvider] Failed to save dataset to IndexedDB:', error);
        }
    }

    public async deleteDataset(datasetName: string): Promise<boolean> {
        const collection = this.dataSetCollectionSubject.getValue();
        const entry = collection.find(c => c.dataset === datasetName);

        if (!entry || entry.source === 'local') {
            return false;
        }

        await this.datasetStorage.deleteDataset(datasetName);

        this.glyphCache.delete(datasetName);
        this.schemaCache.delete(datasetName);
        this.metaCache.delete(datasetName);

        const updated = collection.filter(c => c.dataset !== datasetName);
        this.dataSetCollectionSubject.next(updated);

        if (this.config.loadedData === datasetName && updated.length > 0) {
            this.config.loadData(updated[0].dataset);
        }

        return true;
    }

    clearFilters() {
        this.filters.splice(0, this.filters.length);
        this.refreshFilters();
    }

    getFilters(): ItemFilter[] {
        return this.filters;
    }

    clearIdFilters() {
        this.filters.forEach(filter => {
            if (filter instanceof IdFilter) {
                filter.clear();
            }
        });
    }

    public refreshFilters() {
        const glyphData = this.glyphCache.get(this.config.loadedData);
        if (glyphData == null) return;

        let count = 0;
        const allFiltersEmpty = this.getFilters().length == 0 || this.getFilters().every(filter => filter.empty());
        const orFiltering = this.getFilters().filter(filter => filter.filterMode == FilterMode.Or).every(filter => filter.empty());
        glyphData.forEach((item: GlyphObject) => {
            let andFilter = true;
            let orFilter = orFiltering;
            this.getFilters().forEach(filter => {
                if (filter.empty()) {
                    return;
                }

                if (filter.filterMode == FilterMode.Or) {
                    orFilter = orFilter || filter.inFilter(item);
                } else if (filter.filterMode == FilterMode.And) {
                    andFilter = andFilter && filter.inFilter(item);
                }
            });

            item.passive = allFiltersEmpty ? false : !(andFilter && orFilter);
            if (!item.passive) count++;
        });
        this.filteredItems = count;
    }

    /**
     * Get all dataset names currently in the collection
     */
    getDataSetNames(): string[] {
        const collection = this.dataSetCollectionSubject.getValue() ?? [];
        return collection.map(entry => entry.dataset);
    }

    setDatasetCollection(newCollection: DatasetCollection) {
        const currentCollection = this.dataSetCollectionSubject.getValue() ?? [];

        // Convert to a Map for easier merging by dataset name
        const datasetMap = new Map<string, DatasetCollectionEntry>();

        // Start with current collection
        for (const entry of currentCollection) {
            datasetMap.set(entry.dataset, { ...entry, items: [...entry.items] });
        }

        // Merge new collection
        for (const incoming of newCollection) {
            const existing = datasetMap.get(incoming.dataset);

            if (existing) {
                // Merge items - update existing timestamps or add new ones
                for (const incomingItem of incoming.items) {
                    const existingItem = existing.items.find(item => item.time === incomingItem.time);

                    if (existingItem) {
                        // Update existing item's algorithms (merge position algorithms)
                        existingItem.algorithms.position = {
                            ...existingItem.algorithms.position,
                            ...incomingItem.algorithms.position
                        };
                    } else {
                        // Add new timestamp item
                        existing.items.push(incomingItem);
                    }
                }
            } else {
                // New dataset, add whole entry
                datasetMap.set(incoming.dataset, { ...incoming, items: [...incoming.items] });
            }
        }

        // Convert back to array and emit
        this.dataSetCollectionSubject.next(Array.from(datasetMap.values()));
    }

    /**
     * Load a processed dataset from the preprocessing wizard
     */
    public loadProcessedDataset(dataset: any, datasetName: string, timestamp: string): void {
        // Clear any existing filters from previous dataset
        this.clearFilters();

        // Extract schema, meta, and features from the processed dataset
        const schema: GlyphSchema = dataset.schema;
        const meta: GlyphMeta = dataset.meta;
        const features: GlyphFeature[] = dataset.features;

        // Convert projections to positions format
        const positions = new Map<string, GlyphPosition[]>();
        if (dataset.projections && Array.isArray(dataset.projections)) {
            dataset.projections.forEach((proj: any) => {
                const posArray: GlyphPosition[] = proj.data.map((item: any) => ({
                    id: item.id,
                    position: { x: item.x, y: item.y }
                }));
                positions.set(proj.name, posArray);
            });
        } else if (dataset.positions) {
            // Support direct positions object from Python worker
            Object.entries(dataset.positions).forEach(([name, data]: [string, any]) => {
                positions.set(name, data);
            });
        }

        // Build and cache the dataset
        this.buildDataSet(datasetName, timestamp, schema, meta, features, positions);

        // Set as active dataset
        this.config.colorFeature = schema.color;
        this.config.replaceActiveFeatures(schema.glyph);
        this.config.featureLabels = schema.label;
        // Apply color scale mode if specified in schema
        if (schema.colorRange !== undefined) {
            // Convert boolean to color scale ID: true -> 0 (continuous), false -> 4 (categorical)
            this.config.colorRange = schema.colorRange ? 0 : 4;
        }
        // CRITICAL: Store feature types from schema (needed for categorical color normalization)
        if (schema.types) {
            this.config.featureTypes = schema.types;
        }
        // CRITICAL: Extract max values from metadata (needed for categorical color scaling)
        this.extractFeatureMaxValuesFromMeta(datasetName, timestamp);

        // Notify subscribers (like histogram) that config has changed
        this.config.updateConfiguration();

        this.config.loadData(datasetName);

        // Update filtered items
        const glyphMap = this.glyphCache.get(datasetName);
        if (glyphMap) {
            this.totalItems = glyphMap.size;
            this.filteredItems = this.totalItems;
        }
    }

    /**
     * Add a processed dataset to the DatasetCollection so it appears in the selector
     */
    public addProcessedDatasetToCollection(datasetName: string, timestamp: string, dataset: any): void {
        // Build position mapping from projections
        const positionMapping: { [key: string]: string } = {};
        if (dataset.projections && Array.isArray(dataset.projections)) {
            dataset.projections.forEach((proj: any) => {
                // For processed datasets, positions are already in memory (no file paths)
                positionMapping[proj.name] = `memory://${datasetName}/${timestamp}/${proj.name}`;
            });
        } else if (dataset.positions) {
            // Support direct positions object
            Object.keys(dataset.positions).forEach(key => {
                positionMapping[key] = `memory://${datasetName}/${timestamp}/${key}`;
            });
        }

        // Create a new DatasetCollectionEntry for the processed dataset
        const newEntry: DatasetCollectionEntry = {
            dataset: datasetName,
            source: 'wasm',  // Mark as wasm-processed dataset
            items: [{
                time: timestamp,
                algorithms: {
                    schema: `memory://${datasetName}/${timestamp}/schema`,
                    meta: `memory://${datasetName}/${timestamp}/meta`,
                    feature: `memory://${datasetName}/${timestamp}/features`,
                    position: positionMapping
                }
            }]
        };

        // Add to collection using existing merge logic
        this.setDatasetCollection([newEntry]);
    }

    /**
     * Add projection positions to an already-loaded dataset
     * Used when background projections complete after wizard is closed
     */
    public addPositionsToLoadedDataset(
        datasetName: string,
        timestamp: string,
        algorithm: string,
        positions: Array<{id: string | number; position: {x: number; y: number}}>
    ): boolean {
        const glyphMap = this.glyphCache.get(datasetName);
        if (!glyphMap) {
            console.warn(`[DataProvider] Cannot add positions - dataset ${datasetName} not in cache`);
            return false;
        }

        console.log(`[DataProvider] Adding ${positions.length} positions for algorithm: ${algorithm} to loaded dataset`);
        let matchCount = 0;

        for (const posEntry of positions) {
            const idStr = String(posEntry.id);
            const glyph = glyphMap.get(idStr);
            if (!glyph) continue;

            // Ensure timestamp bucket exists
            if (!glyph.positions[timestamp]) {
                glyph.positions[timestamp] = {};
            }

            glyph.positions[timestamp][algorithm] = { ...posEntry.position };
            matchCount++;
        }

        console.log(`[DataProvider] Matched ${matchCount}/${positions.length} positions for ${algorithm}`);

        // Update the collection to include this algorithm in the position list
        // This ensures getPositions() returns the new algorithm
        const collections = this.dataSetCollectionSubject.getValue();
        const collection = collections.find(c => c.dataset === datasetName);
        if (collection) {
            const item = collection.items.find(it => it.time === timestamp);
            if (item && !item.algorithms.position[algorithm]) {
                item.algorithms.position[algorithm] = `memory://${datasetName}/${timestamp}/${algorithm}`;
                // Notify subscribers about the updated collection
                this.dataSetCollectionSubject.next([...collections]);
            }
        }

        // Notify config that positions changed so UI can update
        this.config.updateConfiguration();

        return matchCount > 0;
    }

    private buildDataSet(
        name: string,
        timestamp: string,
        schema: GlyphSchema,
        meta: GlyphMeta,
        features: GlyphFeature[],
        positions: Map<string, GlyphPosition[]>
    ): number {

        // --- Schema & Meta (still timestamp-based) ---
        if (!this.schemaCache.has(name)) this.schemaCache.set(name, new Map());
        this.schemaCache.get(name)!.set(timestamp, schema);

        if (!this.metaCache.has(name)) this.metaCache.set(name, new Map());
        this.metaCache.get(name)!.set(timestamp, meta);

        // --- Glyph cache: dataset → glyphId → GlyphObject ---
        if (!this.glyphCache.has(name)) {
            this.glyphCache.set(name, new Map());
        }

        const glyphMap = this.glyphCache.get(name)!;

        // --- Create or update glyphs ---
        for (const feature of features) {
            // Always normalize ID to string for consistent lookups
            const idStr = String(feature.id);

            let glyph = glyphMap.get(idStr);

            // Create glyph only once
            if (!glyph) {
                glyph = new GlyphObject(idStr, this.config, this.dataProcessor);
                glyph.features = feature.features;
                glyph.values = feature.values;
                glyph.defaultcontext = feature.defaultcontext
                    ? parseInt(feature.defaultcontext)
                    : 1;
                glyph.positions = {};

                glyphMap.set(idStr, glyph);
            }

            // Ensure timestamp bucket exists
            if (!glyph.positions[timestamp]) {
                glyph.positions[timestamp] = {};
            }
        }

        // --- Add positions for this timestamp ---
        for (const [algorithm, entries] of positions) {
            console.log(`[DataProvider] Adding ${entries.length} positions for algorithm: ${algorithm}`);
            let matchCount = 0;
            for (const posEntry of entries) {
                // Always normalize position ID to string for consistent lookups
                const idStr = String(posEntry.id);
                const glyph = glyphMap.get(idStr);
                if (!glyph) {
                    if (matchCount === 0) {
                        console.warn(`[DataProvider] No glyph found for ID: ${idStr}`);
                        console.log(`[DataProvider] Available glyph IDs sample:`, Array.from(glyphMap.keys()).slice(0, 5));
                    }
                    continue;
                }

                glyph.positions[timestamp][algorithm] = {
                    ...posEntry.position
                };
                matchCount++;
            }
            console.log(`[DataProvider] Matched ${matchCount}/${entries.length} positions for ${algorithm}`);
        }

        return glyphMap.size;
    }


    async loadDataSet(name: string, timestamp: string) {
        console.log("load data set " + name + " " + timestamp);
        // Clear any existing filters from previous dataset
        this.clearFilters();

        const dataset = this.dataSetCollectionSubject.getValue().find(data => data.dataset == name);
        const item = dataset?.items.find(item => item.time == timestamp);
        if (item && dataset?.source == "wasm") {
            const schema = await this.dataProcessor.fetchJson(item.algorithms.schema) as GlyphSchema;
            const meta = await this.dataProcessor.fetchJson(item.algorithms.meta) as GlyphMeta;
            const features = await this.dataProcessor.fetchJson(item.algorithms.feature) as GlyphFeature[];
            const positions: Map<string, GlyphPosition[]> = new Map();
            for (const [key, value] of Object.entries(item.algorithms.position)) {
                const position = await this.dataProcessor.fetchJson(value) as GlyphPosition[];
                positions.set(key, position);
            }

            this.config.colorFeature = schema.color;
            this.config.replaceActiveFeatures(schema.glyph);
            this.config.featureLabels = schema.label;
            // Apply color scale mode if specified in schema
            if (schema.colorRange !== undefined) {
                // Convert boolean to color scale ID: true -> 0 (continuous), false -> 4 (categorical)
                this.config.colorRange = schema.colorRange ? 0 : 4;
            }
            // Notify subscribers (like histogram) that config has changed
            this.config.updateConfiguration();

            this.totalItems = this.buildDataSet(name, timestamp, schema, meta, features, positions);
            this.filteredItems = this.totalItems;
        } else if (item && dataset?.source === 'indexeddb') {
            const saved = await this.datasetStorage.getDataset(name);
            if (saved) {
                const positionsMap = new Map<string, GlyphPosition[]>();
                for (const [algo, posArr] of Object.entries(saved.positions)) {
                    positionsMap.set(algo, posArr);
                }
                this.config.colorFeature = saved.schema.color;
                this.config.replaceActiveFeatures(saved.schema.glyph);
                this.config.featureLabels = saved.schema.label;
                if (saved.schema.colorRange !== undefined) {
                    this.config.colorRange = saved.schema.colorRange ? 0 : 4;
                }
                if (saved.schema.types) {
                    this.config.featureTypes = saved.schema.types;
                }
                this.config.updateConfiguration();
                this.totalItems = this.buildDataSet(name, saved.timestamp, saved.schema, saved.meta, saved.features, positionsMap);
                this.filteredItems = this.totalItems;
                this.extractFeatureMaxValuesFromMeta(name, saved.timestamp);
            }
        }
    }

    public async getGlyphData(): Promise<GlyphObject[] | undefined>
    public async getGlyphData(name?: string): Promise<GlyphObject[] | undefined>
    public async getGlyphData(name?: string, timestamp?: string): Promise<GlyphObject[] | undefined>
    public async getGlyphData(name?: string, timestamp?: string, algorithm?: string): Promise<GlyphObject[] | undefined> {
        if (name == undefined) name = this.config.loadedData;
        console.log(`[DataProvider] getGlyphData called for: ${name}, timestamp: ${timestamp}`);

        const collection = this.dataSetCollectionSubject.getValue().find(collection => collection.dataset == name);
        if (timestamp == undefined || timestamp == '') {
            timestamp = collection?.items.at(0)?.time;
        }
        if (name == undefined || timestamp == undefined) return undefined;

        let data = this.glyphCache.get(name);
        console.log(`[DataProvider] Cache lookup for '${name}':`, data ? 'HIT' : 'MISS');

        if (!data) {
            console.log(`[DataProvider] Loading dataset from source...`);
            await this.loadDataSet(name, timestamp);
            data = this.glyphCache.get(name);
        }
        if (data) this.totalItems = data.size;
        this.filteredItems = this.totalItems;
        if (collection) this.config.dataSource = collection.source
        return data ? Array.from(data.values()) : undefined;
    }

    public async getMetaData(): Promise<GlyphMeta | undefined>
    public async getMetaData(name?: string, timestamp?: string): Promise<GlyphMeta | undefined> {
        if (name == undefined) name = this.config.loadedData;
        if (timestamp == undefined) {
            const collection = this.dataSetCollectionSubject.getValue().find(collection => collection.dataset == name);
            timestamp = collection?.items.at(0)?.time;
        }
        if (name == undefined || timestamp == undefined) return undefined;

        let meta = this.metaCache.get(name);
        if (!meta) {
            await this.loadDataSet(name, timestamp);
            meta = this.metaCache.get(name);
        }
        return meta?.get(timestamp);
    }

    public async getSchema(): Promise<GlyphSchema | undefined>
    public async getSchema(name?: string, timestamp?: string): Promise<GlyphSchema | undefined> {
        if (name == undefined) name = this.config.loadedData;
        if (timestamp == undefined) {
            const collection = this.dataSetCollectionSubject.getValue().find(collection => collection.dataset == name);
            timestamp = collection?.items.at(0)?.time;
        }
        if (name == undefined || timestamp == undefined) return undefined;

        let schema = this.schemaCache.get(name);
        if (!schema) {
            await this.loadDataSet(name, timestamp);
            schema = this.schemaCache.get(name);
        }
        const schemaResult = schema?.get(timestamp);
        if (schemaResult) {
            this.config.colorFeature = schemaResult.color;
            this.config.replaceActiveFeatures(schemaResult.glyph);
            this.config.featureLabels = schemaResult.label;
            // Apply color scale mode if specified in schema
            if (schemaResult.colorRange !== undefined) {
                // Convert boolean to color scale ID: true -> 0 (continuous), false -> 4 (categorical)
                this.config.colorRange = schemaResult.colorRange ? 0 : 4;
            }
            // Store feature types from schema
            if (schemaResult.types) {
                this.config.featureTypes = schemaResult.types;
            }
            // Calculate max values for categorical features
            this.calculateFeatureMaxValues(name);
        }

        return schemaResult;
    }

    getTimestamps(name: string): string[] {
        const result: string[] = [];
        const collection = this.dataSetCollectionSubject.getValue().find(collection => collection.dataset == name);
        if (collection) {
            collection.items.forEach(it => {
                result.push(it.time);
            });
        }
        return result;
    }

    getPositions(name: string): string[]
    getPositions(name: string, time?: string): string[] {
        const result: string[] = [];
        const collection = this.dataSetCollectionSubject.getValue().find(collection => collection.dataset == name);
        if (collection) {
            const item = time ? collection.items.find(it => it.time == time) : collection.items.at(0);

            if (item) {
                result.push(...Object.keys(item.algorithms.position));
            }
        }
        return result;
    }

    getContexts(name: string): string[]
    getContexts(name: string, time?: string): string[] {
        const result: string[] = [];
        const collection = this.dataSetCollectionSubject.getValue().find(collection => collection.dataset == name);

        // TODO: Get from schema ...

        return result;
    }

    /**
     * Calculate max values for categorical features by scanning all glyphs
     * This is needed to normalize categorical values to [0,1] range for color scales
     */
    private calculateFeatureMaxValues(name: string): void {
        const glyphMap = this.glyphCache.get(name);
        if (!glyphMap) return;

        const featureTypes = this.config.featureTypes;
        const maxValues: Record<string, number> = {};

        // Find max value for each categorical feature by scanning all glyphs
        glyphMap.forEach((glyph: GlyphObject) => {
            const features = glyph.features["1"];
            if (features) {
                Object.keys(featureTypes).forEach(featureId => {
                    if (featureTypes[featureId] === 'categorical') {
                        const value = features[featureId];
                        if (value !== undefined) {
                            maxValues[featureId] = Math.max(maxValues[featureId] || 0, value);
                        }
                    }
                });
            }
        });

        this.config.featureMaxValues = maxValues;
    }

    /**
     * Extract max values from metadata for all features
     * This is more efficient than scanning all glyphs when metadata is available
     */
    private extractFeatureMaxValuesFromMeta(datasetName: string, timestamp: string): void {
        const metaMap = this.metaCache.get(datasetName);
        if (!metaMap) return;

        const meta = metaMap.get(timestamp);
        if (!meta || !meta.features) return;

        const maxValues: Record<string, number> = {};

        // Extract max values from metadata for all features
        Object.entries(meta.features).forEach(([featureId, stats]) => {
            if (stats.max !== undefined) {
                maxValues[featureId] = stats.max;
            }
        });

        this.config.featureMaxValues = maxValues;
    }

    private escapeCSV(value: any): string {
        const str = String(value ?? '');
        return `"${str.replace(/"/g, '""')}"`;
    }

    private downloadBlob(blob: Blob, fileName: string): void {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = fileName;
        a.click();

        URL.revokeObjectURL(url);
    }

    public exportFilteredGlyphsAsCSV(
        datasetKey: string
    ): void {
        const glyphMap = this.glyphCache.get(datasetKey);
        const schemaMap = this.schemaCache.get(datasetKey);

        if (!glyphMap || !schemaMap) {
            console.warn('Missing glyph or schema cache for dataset:', datasetKey);
            return;
        }

        // --------------------------------------------------
        // 1. Collect feature keys + labels from schema.label
        // --------------------------------------------------
        const featureKeyToLabel = new Map<string, string>();

        schemaMap.forEach((schema: GlyphSchema) => {
            Object.entries(schema.label).forEach(([featureKey, label]) => {
                featureKeyToLabel.set(featureKey, label);
            });
        });

        const orderedFeatureKeys = Array.from(featureKeyToLabel.keys());
        const orderedLabels = orderedFeatureKeys.map(
            key => featureKeyToLabel.get(key)!
        );

        if (orderedFeatureKeys.length === 0) {
            console.warn('No features found in schema labels');
            return;
        }

        // --------------------------------------------------
        // 2. Collect active glyphs
        // --------------------------------------------------
        const activeGlyphs = Array.from(glyphMap.values())
            .filter(glyph => !glyph.passive);

        if (activeGlyphs.length === 0) {
            console.warn('No active glyphs to export');
            return;
        }

        // --------------------------------------------------
        // 3. CSV header (labels!)
        // --------------------------------------------------
        const headers = ['id', ...orderedLabels];
        const rows: string[] = [];
        rows.push(headers.join(','));

        // --------------------------------------------------
        // 4. CSV rows
        // --------------------------------------------------
        activeGlyphs.forEach(glyph => {
            const rawValues = glyph.values || {};

            const row = [
                this.escapeCSV(glyph.id),
                ...orderedFeatureKeys.map(key =>
                    this.escapeCSV(rawValues[key] ?? '')
                )
            ];

            rows.push(row.join(','));
        });

        // --------------------------------------------------
        // 5. Download
        // --------------------------------------------------
        const csvContent = '\ufeff' + rows.join('\n');
        const blob = new Blob([csvContent], {
            type: 'text/csv;charset=utf-8;'
        });

        const timestamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15);
        const fileName = `glyphspace-export-${timestamp}-${datasetKey}-${activeGlyphs.length}.csv`;
        this.downloadBlob(blob, fileName);
    }
}