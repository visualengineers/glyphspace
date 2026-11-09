# Processing config

_For contributors who change a wizard option or the Python pipeline behind it._

**Status:** Implemented · **Related:** [Worker protocol](worker-protocol.md), [Dataset format](dataset-format.md), [ADR 0006](../decisions/0006-feature-and-metadata-column-roles.md)

## Scope

The configuration object the wizard sends with `processWithConfig`, what the Python pipeline does with each field, the order of operations, and the result it returns.

- Built by `buildProcessingConfig` in `src/app/preprocessing-wizard/services/processing-config.ts` (type `ProcessingRequestConfig`).
- Consumed by `process_with_config` in `src/assets/preprocessing_processor_config.py`.
- Option values are the string enums in `src/app/preprocessing-wizard/models/data-type.enum.ts`. The Python tests (`tools/tests/test_preprocessing_config.py`) read these values from the TypeScript enums, so a value renamed on one side fails the tests.

## Request

| Field | Type | Meaning |
|---|---|---|
| `datasetName` | string | Name of the dataset. |
| `timestamp` | string | Time of the dataset item: the upload day as `yyyymmdd` (UTC). The result is keyed `<datasetName>.<timestamp>`. |
| `columns` | column config[] | One entry per column of the CSV, see below. |
| `cleaning` | `{ removeDuplicates: boolean }` | Drop duplicate rows. |
| `projections` | `ProjectionConfig` | Projection switches and parameters. Not used by Python (see [Projections](#projections)). |
| `glyphFeatures` | string[] | Encoded feature names for the glyph rays. Used when there are 3–12; otherwise the first 5 features. |
| `tooltipFeatures` | string[] \| null | Encoded feature names for the tooltip; `null` lists every feature. |
| `colorScaleMode` | `'continuous'` \| `'categorical'` | Written to `schema.colorRange` (`true` for continuous). |
| `colorScaleId` | number | Written to `schema.colorScaleId`. |

### Column config

| Field | Values | Meaning |
|---|---|---|
| `name` | string | Column name in the CSV. |
| `enabled` | boolean | Selected in Step 2. Deselected columns are dropped. |
| `role` | `feature`, `metadata` | A missing role means `feature` (configs from before metadata). Anything else is an error. |
| `dataType` | `numeric`, `categorical`, `text`, `date`, `boolean`, `id`, `coordinate`, `unknown` | Detected type; decides date and boolean handling and becomes `schema.types`. |
| `encoding` | `none`, `onehot`, `label`, `normalize`, `standardize` | See [Encoding](#encoding). |
| `scaling` | `none`, `minmax`, `standard`, `robust` | See [Scaling](#scaling). |
| `includeInProjection` | boolean | Whether the column's features feed the projections. If no feature is included, all are used. |
| `isColorFeature` | boolean | The first column with `true` becomes `schema.color`; without one, feature `"1"`. |
| `missingValueStrategy` | `keep`, `remove_rows`, `fill_mean`, `fill_median`, `fill_mode`, `fill_value` | See [Cleaning](#cleaning). |
| `missingValueFillValue` | string | The value for `fill_value`. |
| `outlierMethod` | `iqr_1.5`, `iqr_2.0`, `iqr_3.0`, `zscore_2`, `zscore_3`, `zscore_4` | How outliers are detected. |
| `outlierStrategy` | `keep`, `remove`, `cap` | What happens to them. |

Python still accepts three legacy values that the wizard no longer sends: the missing-value strategies `drop` (the default when a column has no strategy; rows are dropped only together with `cleaning.removeMissing`) and `fill_zero`, and the scaling `normalize` (same as `minmax`).

## Order of operations

1. **Read** the CSV. If there is no column named `ID`, ids are generated from the row index; the ID column is moved to the front.
2. **Fill** missing values per feature column.
3. **Cap** outliers (strategy `cap`). Outliers are always detected on the original values, with `find_outliers` in `src/assets/preprocessing_processor.py`, the same function that produces Step 3's count.
4. **Drop rows:** missing values of `remove_rows` columns and outliers of `remove` columns.
5. **Drop duplicates** (`cleaning.removeDuplicates`), comparing the CSV's own columns on their original values and keeping the first row.
6. **Encode** each feature column.
7. **Scale** each feature column. Missing values left by `keep` are ignored by the scaling and set to 0 afterwards.
8. **Export** the scaled matrix of the projection columns to `processed_features.csv` in the Pyodide file system.
9. **Build** the dataset.

If no rows are left after step 5, processing stops with an error (class K2).

Metadata columns skip steps 2–4, 6 and 7, including any cleaning settings left over from when they were features. They reach the dataset only as original values. The duplicate check (step 5) still compares them, like every column of the CSV, so two rows that differ only in a metadata column are both kept.

## Cleaning

| Strategy | Effect |
|---|---|
| `keep` | Nothing is filled. Text gets a `missing` category when encoded; numbers, dates and booleans become 0 after scaling. |
| `remove_rows` | Rows with a missing value in this column are dropped (step 4). |
| `fill_mean`, `fill_median` | Numeric columns only; other columns are left unchanged. |
| `fill_mode` | The most frequent value (0 if there is none). |
| `fill_value` | `missingValueFillValue`, converted to the column's type: a number for numeric columns, `true`/`false`/`1`/`0` for boolean columns. A value that doesn't convert is an error: class K8 for numeric columns; for boolean columns the message matches no class and the wizard shows its generic issue. |

Outlier detection:

- `iqr_<k>`: outside [Q1 − k·IQR, Q3 + k·IQR];
- `zscore_<k>`: |x − mean| / sd > k, with the sample standard deviation.

Missing and non-numeric values are never outliers, and boolean columns have none. `cap` clips outliers to the detection bounds; it is an error when outliers are found in a column that isn't numeric (a mixed column), while a pure text column has no outliers and passes.

## Encoding

Checked in this order:

| Condition | Result |
|---|---|
| `dataType` is `date` | Seconds since the epoch, whatever the encoding; unparseable dates are missing. |
| `dataType` is `boolean`, or the column is boolean | 0.0 = false, 1.0 = true. Categories are the column's own labels for the two codes. |
| `encoding` is `onehot`, or `none` on a non-numeric column | One 0/1 feature per distinct value, named `<column>_<value>`; missing values are the value `missing`. More than 500 distinct values (`MAX_ONEHOT_UNIQUE`) is an error (class K7), raised before any encoding starts. |
| `encoding` is `label` | One feature with codes 0, 1, … of the sorted distinct values (missing as `missing`); the categories are stored in the meta. |
| `encoding` is `normalize` | Min-max to [0, 1]. |
| `encoding` is `standardize` | z-score with the sample standard deviation. |
| otherwise | The numeric value. |

A constant column becomes 0 under `normalize` and `standardize`.

## Scaling

Applied per feature after encoding. A one-hot feature `<column>_<value>` uses the scaling of `<column>`.

| Scaling | Effect |
|---|---|
| `none` | Unchanged. |
| `minmax` | scikit-learn `MinMaxScaler`. |
| `standard` | scikit-learn `StandardScaler`. |
| `robust` | scikit-learn `RobustScaler`. |

A feature without any value is set to 0 before fitting.

## Projections

Python computes no projections. It writes the scaled features of the projection columns to `processed_features.csv` (`ID` first) and returns an empty `positions` object. The main thread then reads that file (`getProcessedFeatures`), runs FastMap and the enabled background methods with DruidJS, and adds each result to the dataset (`storeProjectionPositions`). See [ADR 0003](../decisions/0003-druidjs-projections-in-web-workers.md) and [Processing pipeline](../development/processing-pipeline.md).

`ProjectionConfig` (`src/app/preprocessing-wizard/models/column-config.ts`) holds one `enable<Method>` switch per background method and the parameters `isomapNeighbors`, `lleNeighbors`, `ltsaNeighbors` (0 = DruidJS default), `tsnePerplexity`, `tsneIterations`, `umapNeighbors` and `umapMinDist`. Methods in `HIDDEN_PROJECTION_METHODS` never run, whatever their switch says.

## Result

`process_with_config` writes JSON to the output file the worker names:

```json
{
  "datasets": {
    "<datasetName>.<timestamp>": {
      "name": "<datasetName>",
      "features": [ ... ],
      "schema": { ... },
      "meta": { ... },
      "positions": {}
    }
  },
  "selectedDataset": "<datasetName>.<timestamp>"
}
```

`features`, `schema` and `meta` follow the [dataset format](dataset-format.md). Glyph feature values are the scaled features min-max mapped to [0, 1]; the meta statistics are taken on the scaled values. Every error is re-raised as `Failed to process data: <message>`, and the wizard classifies the message (`src/app/preprocessing-wizard/shared/constants/wizard-error-classes.ts`).

Progress is reported through `set_progress_callback` as `(step, progress, message)` with progress from 5 to 100.

## Compatibility

- A config from an older wizard state must still process: a column without `role` is a feature, and unknown projection settings are dropped when the state is restored (see [Wizard storage](wizard-storage.md)).
- An unknown scaling or role is an error, not ignored. So is an unknown missing-value strategy on a column that has missing values, and an unknown outlier strategy on an enabled feature column; elsewhere these values are never looked at.
