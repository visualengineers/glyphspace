# CSV input

_For anyone preparing a CSV file for GlyphSpace, and for contributors who change how input is read._

**Status:** Implemented · **Related:** [Dataset format](dataset-format.md), [Processing config](processing-config.md), [Preparing data](../user-guide/preparing-data.md)

## Scope

What an input CSV must and may contain. There are two readers, and they don't treat every column the same way:

- **the wizard** (in the browser): `src/assets/preprocessing_processor.py` profiles the file, `src/assets/preprocessing_processor_config.py` processes it;
- **the CLI** (`tools/process.py`, with `tools/dataset_common.py`): writes a bundled dataset into `src/assets/data/`.

## File

| Rule | Wizard | CLI |
|---|---|---|
| Format | CSV read with pandas `read_csv` defaults: comma separator, header in the first row, UTF-8 | same |
| File name | must end in `.csv` | any; the dataset is named after the file's stem |
| Size | at most 50 MB (`MAX_FILE_BYTES`, Step 1) | no limit |

The CLI also writes `<stem>_with_id.csv` next to the input: the file with the ID column it used.

## ID column

Every row is one item, named by its id.

| | Wizard | CLI |
|---|---|---|
| Recognised column | named exactly `ID` | named `id` in any case, surrounding spaces ignored; renamed to `ID` |
| Position | moved to the front | moved to the front |
| No such column | ids `"0"`, `"1"`, … from the row index | same |

Ids must be unique. The dashboard keys items by id: for a repeated id it keeps the features of the first row, and the positions of the repeated rows overwrite each other.

Note that the wizard only uses a column named exactly `ID`. A column named `id` or `Id` is detected as data type ID, starts as a metadata column, and the items get row-index ids.

Thumbnails are found by id: `<id>.jpg` (see [Preparing data](../user-guide/preparing-data.md)).

## Column types

### Wizard

The wizard detects a type per column (`detect_data_type`) and uses it to choose defaults (`DATA_TYPE_CONFIG` in `src/app/preprocessing-wizard/models/data-type.enum.ts`). The first rule that matches wins:

| # | Rule | Type |
|---|---|---|
| 1 | name is `id` (any case) | `id` |
| 2 | name is `latitude`, `longitude`, `lat`, `lon`, `lng` or `long` (any case) | `coordinate` |
| 3 | numeric, with at most two distinct values, all of them 0/1 | `boolean` |
| 4 | numeric | `numeric` |
| 5 | text, and more than half of the first 100 non-missing values parse as dates | `date` |
| 6 | a single distinct value | `categorical` |
| 7 | average length above 50 characters | `text` |
| 8 | fewer than 50 % of the values are distinct | `categorical` |
| 9 | otherwise | `text` |

Defaults per column (`createDefaultColumnConfig` in `src/app/preprocessing-wizard/services/column-defaults.ts`):

- Text and ID columns start as **metadata**: kept as original values for the tooltip and the search, not encoded. So do categorical columns with more than 20 non-missing values of which at least 90 % are distinct. Everything else starts as a **feature**. The user can change the role in Step 2.
- Columns with more than 50 % missing values, and columns with a single distinct value, start deselected.

Coordinate columns are ordinary numeric features in the wizard; it does not create a geographic projection.

### CLI

Every column except `ID` becomes a feature column:

| Column | Encoding |
|---|---|
| numeric | the number |
| not numeric, and the name contains `date` or `time` (any case) | seconds since the epoch; values that don't parse become missing |
| other text with a single distinct value | one-hot (one 0/1 column) |
| other text | label encoding of the sorted distinct values |

A column counts as `categorical` in the schema when it is text or has at most 20 distinct values (`ENUMERATE_THRESHOLD`), otherwise `numeric`. Missing text becomes a category of its own, labelled "missing". Missing numbers and dates are 0 after normalisation.

If one-hot encoding would give two feature columns the same name, the CLI stops and asks you to rename the columns.

## Columns with special meaning (CLI only)

| Columns | Result |
|---|---|
| `<prefix>-x` and `<prefix>-y` (any case) | A pre-computed projection named `<prefix>`. Rows without both numbers are left out of it. These columns are not used as input for the PCA, UMAP and t-SNE projections. |
| longitude `longitude`, `lon` or `längengrad` and latitude `latitude`, `lat` or `breitengrad` (any case) | A projection named `epsg` with x = longitude, y = latitude. Missing or invalid coordinates get random values within the data range ± 1. |
| `thumb` | Not used as input for the projections. |

The wizard treats all of these as ordinary columns.

## Limits in the wizard

| Limit | Value | Error class |
|---|---|---|
| Distinct values of a one-hot encoded column | 500 (`MAX_ONEHOT_UNIQUE`) | K7 |
| Glyph features | 3–12 | K5 |
| Time per worker request (profiling, processing) | 60 s (`DataProcessorService.sendRequestUntil`) | K6 |
| Neighbour parameters of IsoMap, LLE, LTSA, UMAP | below the number of rows | K4 |

The error classes are explained in [Troubleshooting](../user-guide/troubleshooting.md).

## Example

```csv
ID,name,alcohol,quality,umap-x,umap-y,latitude,longitude
1,Lorem ipsum,9.4,5,231.2,12.1,52.513028,13.4105551
2,Text of a data point,9.8,6,72.1,102.2,52.5120,13.40811
```

The CLI turns latitude/longitude into the projection `epsg` and `umap-x`/`umap-y` into the projection `umap`. Its own UMAP run writes a file of the same name first, so the pre-computed coordinates replace it. The wizard makes `name` a metadata column and `latitude`/`longitude` numeric features.
