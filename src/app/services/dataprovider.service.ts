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

@Injectable({
    providedIn: 'root',
})
export class DataProviderService {
    private filters: ItemFilter[] = [];
    private glyphCache: Map<string, Map<string, GlyphObject[]>> = new Map();
    private metaCache: Map<string, Map<string, GlyphMeta>> = new Map();
    private schemaCache: Map<string, Map<string, GlyphSchema>> = new Map();

    private dataSetCollectionSubject = new BehaviorSubject<DatasetCollection>(DEFAULT_DATASETCOLLECTION);
    dataSetCollectionSubject$ = this.dataSetCollectionSubject.asObservable();

    totalItems = 0;
    filteredItems = 0;

    constructor(private http: HttpClient, private config: ConfigService, private dataProcessor: DataProcessorService) {
        // TODO: Defer loading like WASM data sets
        this.loadDatasets(DEFAULT_DATASETCOLLECTION);
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
                            this.config.colorRange = schema.colorRange;
                        }
                        this.config.loadData(datasetId);
                    }

                    // Optionally store other datasets for switching later...
                });
            });
        });
    }

    clearFilters() {
        this.filters.splice(0, this.filters.splice.length);
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
        glyphData.forEach(data => {
            count = 0;
            data.forEach((item: GlyphObject) => {
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
            })
        });
        this.filteredItems = count;
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
                // Merge items, avoiding duplicates by `time`
                const existingTimes = new Set(existing.items.map(item => item.time));
                const newItems = incoming.items.filter(item => !existingTimes.has(item.time));
                existing.items.push(...newItems);
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
            this.config.colorRange = schema.colorRange;
        }
        this.config.loadData(datasetName);

        // Update filtered items
        const glyphs = this.glyphCache.get(datasetName)?.get(timestamp);
        if (glyphs) {
            this.totalItems = glyphs.length;
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

    private buildDataSet(name: string, timestamp: string, schema: GlyphSchema, meta: GlyphMeta, features: GlyphFeature[], positions: Map<string, GlyphPosition[]>): number {
        console.log(`[DataProvider] Building dataset: ${name}, timestamp: ${timestamp}`);
        console.log(`[DataProvider] Features count: ${features.length}`);
        console.log(`[DataProvider] Position algorithms:`, Array.from(positions.keys()));

        if (!this.schemaCache.has(name)) this.schemaCache.set(name, new Map());
        this.schemaCache.get(name)?.set(timestamp, schema);

        if (!this.metaCache.has(name)) this.metaCache.set(name, new Map());
        this.metaCache.get(name)?.set(timestamp, meta);

        // 1. Step: Build GlyphObjects from features
        const glyphs: GlyphObject[] = features.map(feature => {
            const glyph = new GlyphObject(feature.id, this.config, this.dataProcessor);
            glyph.features = feature.features;
            glyph.values = feature.values;
            glyph.defaultcontext = feature.defaultcontext ? parseInt(feature.defaultcontext) : 1;
            glyph.positions = {}; // Initialize position storage
            return glyph;
        });

        // 2. Step: Build lookup map (optimized for large datasets)
        console.log(`[DataProvider] Building glyph lookup map for ${glyphs.length} glyphs...`);
        const mapStartTime = performance.now();

        const glyphMap = new Map<string, GlyphObject>();

        // Optimized: single pass with minimal conversions
        for (const g of glyphs) {
            const id = g.id;
            glyphMap.set(id, g);

            // Only add alternate keys if ID type suggests it's needed
            if (typeof id === 'number') {
                glyphMap.set(String(id), g);
            } else if (typeof id === 'string') {
                const asNumber = parseFloat(id);
                if (!isNaN(asNumber)) {
                    glyphMap.set(String(asNumber), g);
                }
            }
        }

        console.log(`[DataProvider] Map built in ${(performance.now() - mapStartTime).toFixed(0)}ms`);

        // 3. Step: Add positions (optimized for large datasets)

        let positionsAssigned = 0;
        let positionsFailed = 0;
        const startTime = performance.now();

        for (const [key, value] of positions) {
            console.log(`[DataProvider] Processing position algorithm: ${key}, entries: ${value.length}`);

            // Batch process positions for performance
            const batchSize = 10000;
            for (let i = 0; i < value.length; i += batchSize) {
                const batch = value.slice(i, Math.min(i + batchSize, value.length));

                for (const posEntry of batch) {
                    // Try multiple lookup strategies for ID matching
                    let glyph = glyphMap.get(posEntry.id);

                    if (!glyph) {
                        // Try normalized string version
                        glyph = glyphMap.get(String(posEntry.id));
                    }

                    if (!glyph && typeof posEntry.id === 'number') {
                        // Try as float string for numeric IDs
                        glyph = glyphMap.get(String(posEntry.id));
                    }

                    if (glyph) {
                        if (!glyph.positions[timestamp]) {
                            glyph.positions[timestamp] = {};
                        }
                        // Direct assignment without spread (faster)
                        glyph.positions[timestamp][key] = posEntry.position;
                        positionsAssigned++;
                    } else {
                        // Debug: log missing position assignments (only first few)
                        if (positionsFailed < 5) {
                            console.warn(`Position for ID ${posEntry.id} (${typeof posEntry.id}) not found in glyphs`);
                        }
                        positionsFailed++;
                    }
                }

                // Log progress for large datasets
                if (value.length > 50000 && (i + batchSize) % 50000 === 0) {
                    console.log(`[DataProvider] Progress: ${i + batchSize}/${value.length} positions processed`);
                }
            }
        };

        const elapsed = performance.now() - startTime;
        console.log(`[DataProvider] Positions assigned: ${positionsAssigned}, failed: ${positionsFailed} (${elapsed.toFixed(0)}ms)`);
        if (positionsAssigned > 0) {
            const sampleGlyph = glyphs[0];
            console.log(`[DataProvider] Sample glyph positions:`, sampleGlyph.positions);
        }

        if (!this.glyphCache.has(name)) this.glyphCache.set(name, new Map());
        this.glyphCache.get(name)?.set(timestamp, glyphs);

        return glyphs.length;
    }

    async loadDataSet(name: string, timestamp: string) {
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
                this.config.colorRange = schema.colorRange;
            }

            this.totalItems = this.buildDataSet(name, timestamp, schema, meta, features, positions);
            this.filteredItems = this.totalItems;
        }
    }

    public async getGlyphData(): Promise<GlyphObject[] | undefined>
    public async getGlyphData(name?: string): Promise<GlyphObject[] | undefined>
    public async getGlyphData(name?: string, timestamp?: string): Promise<GlyphObject[] | undefined> {
        if (name == undefined) name = this.config.loadedData;
        console.log(`[DataProvider] getGlyphData called for: ${name}, timestamp: ${timestamp}`);

        const collection = this.dataSetCollectionSubject.getValue().find(collection => collection.dataset == name);
        if (timestamp == undefined) {
            timestamp = collection?.items.at(0)?.time;
        }
        if (name == undefined || timestamp == undefined) {
            console.warn(`[DataProvider] getGlyphData returning undefined: name=${name}, timestamp=${timestamp}`);
            return undefined;
        }

        let data = this.glyphCache.get(name);
        console.log(`[DataProvider] Cache lookup for '${name}':`, data ? 'HIT' : 'MISS');

        if (!data) {
            console.log(`[DataProvider] Loading dataset from source...`);
            await this.loadDataSet(name, timestamp);
            data = this.glyphCache.get(name);
        }

        const glyphData = data?.get(timestamp);
        console.log(`[DataProvider] Glyph data for timestamp '${timestamp}':`, glyphData ? `${glyphData.length} glyphs` : 'undefined');

        if (glyphData) this.totalItems = glyphData?.length;
        this.filteredItems = this.totalItems;
        if (collection) this.config.dataSource = collection.source
        return glyphData;
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
                this.config.colorRange = schemaResult.colorRange;
            }
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

}