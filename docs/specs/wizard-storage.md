# Wizard storage

_For contributors who add, rename or remove a field of the wizard state._

**Status:** Implemented · **Related:** [ADR 0008](../decisions/0008-wizard-state-in-localstorage-datasets-in-indexeddb.md), [ADR 0005](../decisions/0005-wizard-steps-referenced-by-id.md), [Dataset format](dataset-format.md#stored-datasets-indexeddb)

## Scope

The part of the wizard state that survives a page reload: what is saved, when, in which format, and how older saves are migrated. The code is `src/app/preprocessing-wizard/services/wizard-storage.ts`; `PreprocessingService` calls it. Processed datasets are stored separately in IndexedDB (see [Dataset format](dataset-format.md#stored-datasets-indexeddb)).

## Storage

- `localStorage` key `glyphspace_preprocessing_state` (`STORAGE_KEY`), one JSON value.
- Saved by the `PreprocessingService` methods that change the state (`saveStateToStorage`); cleared by `resetState` (Start over, and after the dataset has been handed to the dashboard).
- Restored once, when `PreprocessingService` is created.
- A failure to save or restore (quota, malformed JSON) is logged and otherwise ignored. The wizard then starts from the initial state.

## Format (version 3)

```ts
interface SerializedState {
  version: 3;
  currentStep: number;              // index into WIZARD_STEPS
  dataProfile: DataProfile | null;  // profile of the uploaded CSV, incl. 10 preview rows
  rawFileName: string | null;       // name of the CSV in the Pyodide worker's file system
  columnConfigs: [string, ColumnConfig][];  // Map entries: column name → config
  cleaningConfig: CleaningConfig;
  projectionConfig: ProjectionConfig;
  datasetName: string;
  timestamp: string;
  glyphFeatures: string[];
  tooltipFeatures: string[];
  colorScaleMode: 'continuous' | 'categorical';
  colorScaleId: number;
}
```

Not saved: the undo/redo history, the processing result (`processedDataset`, `cleaningResult`) and UI state (`isProcessing`, progress, `error`).

The uploaded file itself is not saved either. It lives in the Pyodide worker's file system, which a reload empties. A restored state therefore names a file the new worker doesn't have, and requests that read it (outlier counts, processing) fail until the file is uploaded again.

## Restoring and migrating

`deserializeState` accepts any version. A payload without `version` is version 1.

| Field | Rule |
|---|---|
| `currentStep` | Version 1 had five steps (upload, columns, features, projection, review); its index is mapped through the step id (`V1_STEPS`), so the old review step 4 becomes 5. From version 2 on, the index is kept if it is a valid step. Anything else becomes 0. |
| `columnConfigs` | A column without a valid `role` (saved before version 3) becomes a feature, which every column was then. |
| `projectionConfig` | Built from `DEFAULT_PROJECTION_CONFIG`: a saved value is taken only for a current setting and only if it has the default's type. Settings that no longer exist, such as TriMap's former `trimapWeightAdj`, are dropped. |
| `cleaningConfig` | Saved values over `DEFAULT_CLEANING_CONFIG`. |
| `colorScaleMode` | `categorical` if saved as such, otherwise `continuous`. |
| `colorScaleId` | The saved integer, otherwise 0. |
| other fields | The saved value, or empty (`null`, `''`, `[]`). |

Malformed JSON throws; the caller logs it and keeps the initial state.

## Version history

| Version | Change |
|---|---|
| 1 | Five steps; no `version` field. |
| 2 | Six steps: visualization split into projection and appearance, so review moved from index 4 to 5. |
| 3 | Column configs have a `role` (feature or metadata). |

## Changing the format

1. Make the change backwards compatible if you can: a new field needs a default in `deserializeState` for saves that don't have it.
2. If old saves need translating, raise `STORAGE_VERSION`, add the rule to `deserializeState`, and add a row to the version history above.
3. Add a case to `wizard-storage.spec.ts` that restores a save of the previous version.
