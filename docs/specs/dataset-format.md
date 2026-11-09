# Dataset format

_For anyone who writes dataset files by hand or with a script, and for contributors who change how datasets are produced or read._

**Status:** Implemented · **Related:** [CSV input](csv-input.md), [Processing config](processing-config.md), [ADR 0006](../decisions/0006-feature-and-metadata-column-roles.md), [ADR 0008](../decisions/0008-wizard-state-in-localstorage-datasets-in-indexeddb.md)

## Scope

A dataset is what the dashboard displays: one item (glyph) per data row, its feature values, statistics per feature, and one or more 2-D positions per item. This spec covers:

- the four kinds of JSON content of a dataset (schema, features, meta, positions),
- the dataset collection that lists the available datasets,
- how datasets are stored in the browser.

The TypeScript declarations are in `src/app/shared/interfaces/` (`glyph-schema.ts`, `glyph-feature.ts`, `glyph-meta.ts`, `glyph-position.ts`, `dataset-collection.ts`). Two producers write datasets: the CLI (`tools/process.py` with `tools/dataset_common.py`) and the wizard's Python pipeline (`src/assets/preprocessing_processor_config.py`, `build_dataset_collection`). Where they differ, this spec says so.

## Identifiers

- **Feature ids** are the strings `"1"`, `"2"`, … in the order of the encoded feature columns. The same id refers to the same feature in the schema, in every item's `features` and `values`, and in the meta.
- **Metadata ids** are a separate sequence `"1"`, `"2"`, … over the metadata columns, used only by `schema.metadata` and each item's `metadata`.
- **Item ids** come from the `ID` column of the input. They are strings; numeric ids in a file are accepted and converted with `String(id)` when the dataset is loaded (`DatasetCacheService.buildDataSet`). Positions are matched to items by this string.
- **Context ids** select a set of feature values per item. Both producers write a single context `"1"`.

## Files of a bundled dataset

Bundled datasets live in `src/assets/data/` and are fetched over HTTP. Their file names follow

```
<name>.<ddmmyyyy>.<kind>[.<projection>].json
```

for example `wineqr.15012026.position.umap.json`. `<kind>` is `schema`, `feature`, `meta` or `position`; position files add the projection name. The CLI's `collect_datasets` groups files by this pattern (`DATASET_FILE_PATTERN` in `tools/dataset_common.py`) into the [dataset collection](#dataset-collection).

### schema

An object describing the features and the initial view.

| Field | Type | Required | Meaning |
|---|---|---|---|
| `label` | `{ featureId: string }` | yes | Display name of each feature. A one-hot encoded column becomes one feature per value, named `<column>_<value>`. |
| `types` | `{ featureId: string }` | yes | Data type of each feature: `numeric` or `categorical` from the CLI; the wizard also writes `text`, `date`, `boolean`, `id`, `coordinate` or `unknown` (the column's type before encoding). |
| `glyph` | `featureId[]` | yes | Features drawn as glyph rays, in order. The CLI takes the first 5; the wizard takes the user's 3–8 choices (`MIN_GLYPH_FEATURES`/`MAX_GLYPH_FEATURES` in `src/assets/preprocessing_processor_config.py`) and falls back to the first 5. |
| `color` | `featureId` | yes | Feature that colours the items initially. |
| `tooltip` | `featureId[]` | yes | Features listed in the tooltip. Both producers list every feature. |
| `variantcontext` | `{ contextId: { id, description } }` | yes | The contexts; always `{"1": …}`. |
| `metadata` | `{ metadataId: string }` | no | Name of each metadata column (wizard only). Metadata is shown in the tooltip, searched by the text filter and exported, never encoded. |
| `colorScaleId` | `number` | no | Initial colour scale, an `id` of `COLOR_SCALES` in `src/app/shared/interfaces/color-scale.ts` (wizard only). The ids 4 and 5 of the removed Observable10 and Tableau20 are read as 6 (Glasbey) and 7 (Tableau 10). |
| `colorRange` | `boolean` | no | Used only when `colorScaleId` is absent: `true` selects scale 0 (continuous), `false` the first categorical scale, 6 (Glasbey) (`SchemaConfigSyncService.applySchemaToConfig`). |

### feature

An array with one object per item.

| Field | Type | Required | Meaning |
|---|---|---|---|
| `id` | `string` (number accepted) | yes | Item id. |
| `defaultcontext` | `string` | yes | Context shown by default; `"1"`. A missing value is read as context 1. |
| `features` | `{ contextId: { featureId: number } }` | yes | Feature values in [0, 1], used for glyphs, colour and filters. Missing values: see below. |
| `values` | `{ featureId: string }` | yes | The original value behind each feature, as text, for the tooltip. `""` means missing and is shown as "missing". For a one-hot feature the CLI writes `"1"` or `"0"`; the wizard writes the original value of the source column. |
| `metadata` | `{ metadataId: string }` | no | Original value of each metadata column; `""` when missing. Present only when the schema has `metadata`. |

How values reach [0, 1]:

- **CLI:** every encoded column is min-max normalised. Values with a magnitude below 0.001 are written as 0; a constant column is all 0. Missing values are 0.
- **Wizard:** the scaled features (see [Processing config](processing-config.md)) are min-max mapped to [0, 1]; a constant column is all 0. A missing value is 0 in the scaled space, so it ends up wherever 0 lies in the column's range: at 0 after min-max scaling, but at the mean with standard scaling and at the median with robust scaling. For an unscaled column it is where 0 falls in the column's range (1 if every value is negative).

### meta

An object `{ "features": { featureId: FeatureStats } }` with statistics per feature, used by the sidebar's histograms and the filters.

| Field | Type | Required | Meaning |
|---|---|---|---|
| `histogram` | `{ bin: number }` | yes | Bins `"0"`, `"1"`, …. The CLI writes 20 bins of density for every feature. The wizard writes 20 bins for numeric features and one bin per category, with the share of items, for categorical, boolean and text features; rows with a missing value are not counted. |
| `categories` | `string[]` | no | Wizard: category label per code, so `categories[code]` names the value encoded as `code`. CLI: the sorted distinct values of a low-cardinality column. Empty or absent for numeric and one-hot features; the dashboard treats a missing list as empty. Its length is the feature's number of categories, by which the categorical colour palettes colour the feature (`ConfigService.featureCategoryCounts`, `featureColor`). |
| `min`, `max`, `median`, `variance`, `deviation` | `number` | yes | Statistics of the encoded feature: the CLI computes them on the normalised values, the wizard on the scaled values before the [0, 1] mapping. Variance and deviation are population values. |
| `originalMin`, `originalMax` | `number` | no | Range in the original units, for readable labels (wizard only). Dates are in seconds since the epoch. |
| `type` | `string` | no | Same as `schema.types` (wizard only). `FeatureStats` declares it required, but bundled CLI files don't contain it and the dashboard doesn't depend on it. |

### position

An array of `{ "id": string, "position": { "x": number, "y": number } }`, one file per projection. Coordinates may use any range; the dashboard scales them to the canvas. An item without an entry has no position in that projection.

Projection names:

- **CLI:** `pca`, `umap`, `tsne`; `epsg` from longitude/latitude columns (missing coordinates get random values within the data range ± 1); `<prefix>` for each `<prefix>-x` / `<prefix>-y` column pair (rows without both coordinates are left out).
- **Wizard:** `fastmap`, plus each background method that finished (`pca`, `isomap`, `mds`, `ltsa`, `tsne`, `umap`, `trimap`, `topomap`, `sammon`; see `src/app/shared/types/projection.types.ts`).

## Dataset collection

The `DatasetCollection` (`dataset-collection.ts`) lists the datasets the menubar offers:

```ts
type DatasetCollection = {
  dataset: string;              // dataset name
  source: string;               // 'local' | 'wasm' | 'indexeddb'
  items: {
    time: string;               // ddmmyyyy (CLI) or yyyymmdd (wizard), see below
    algorithms: {
      schema: string;
      meta: string;
      feature: string;
      position: Record<string, string>;  // projection name → file
    };
  }[];
  images?: boolean;             // bundled only: item images in assets/thumbnails/<dataset>/
}[];
```

| `source` | Where the data comes from | File entries |
|---|---|---|
| `local` | Bundled files in `src/assets/data/`, listed in `src/default-dataset.ts` (generated by `tools/process.py`) | File names relative to `assets/data/` |
| `wasm` | Processed by the wizard in this browser session | `memory://` identifiers |
| `indexeddb` | Processed by the wizard earlier and saved in the browser | `memory://` identifiers |

The `time` of an item is the day the data was produced: `ddmmyyyy` for bundled CLI datasets (`tools/dataset_common.py`), `yyyymmdd` (UTC) for wizard datasets (`PreprocessingService`).

`memory://` entries are `memory://<name>/<time>/schema`, `…/meta`, `…/features` and, for positions, `…/<projection>`. They name content that is already in `DatasetCacheService` (or in IndexedDB) and tell the menubar which projections exist; in practice they are never fetched, because the cache always holds these datasets. Only `wasm` and `indexeddb` datasets can be deleted from the app (`DataLoaderService.deleteDataset`).

## Stored datasets (IndexedDB)

When the wizard hands a dataset to the dashboard, it is saved so it survives a reload (`DatasetStorageService`):

- database `glyphspace-datasets`, version 2, object store `datasets`, key path `name`;
- one record per dataset name; saving a dataset with the same name replaces it.

Version 2 added the object store `thumbnails`: the ZIP archive of a dataset's item images (a `Blob`), keyed by the dataset name. If the user chose a ZIP in the wizard's Step 1, Step 6 saves it there right after FastMap (`ThumbnailService.attachArchive` → `DatasetStorageService.saveThumbnailArchive`), so before the dataset record, which is saved when the wizard hands the dataset to the dashboard. Deleting the dataset deletes its archive in the same transaction. The archive is stored as uploaded and unpacked in the Pyodide worker when the dashboard first needs an image of the dataset; see [CSV input](csv-input.md#id-column) for how files are matched to items.

```ts
interface StoredDataset {
  name: string;
  timestamp: string;       // the item's time: yyyymmdd (UTC) for wizard datasets
  savedAt: number;         // Date.now()
  schema: GlyphSchema;
  meta: GlyphMeta;
  features: GlyphFeature[];
  positions: Record<string, GlyphPosition[]>;  // projection name → positions
}
```

A background projection that finishes after the dataset reached the dashboard is added to the loaded dataset and the record is saved again.

## Compatibility

The format has no version field, so changes must stay backwards compatible:

- New fields are optional, and readers work without them. `schema.metadata`, item `metadata`, `colorScaleId`, `colorRange`, `originalMin` / `originalMax` and meta `type` were added this way; bundled datasets and datasets saved before them still load.
- Readers ignore fields they don't know.
- A change that old datasets can't satisfy needs an [ADR](../decisions/README.md) and a migration for stored datasets.

### Changes since Glyphboard

The format descends from the [Glyphboard backend](https://github.com/visualengineers/glyphboard-backend). Differences:

- `variant-context` in the schema is `variantcontext`, and `default-context` in the features is `defaultcontext`.
- Item ids are strings.
- The fields marked "wizard only" above were added with the GlyphSpace wizard.
