# Wizard storage

_For contributors who add, rename or remove a field of the wizard state._

**Status:** Implemented · **Related:** [ADR 0008](../decisions/0008-wizard-state-in-localstorage-datasets-in-indexeddb.md), [ADR 0005](../decisions/0005-wizard-steps-referenced-by-id.md), [Dataset format](dataset-format.md#stored-datasets-indexeddb)

## Scope

The part of the wizard state that survives a page reload: what is saved, when, in which format, and how older saves are migrated. The code is `src/app/preprocessing-wizard/services/wizard-storage.ts`; `PreprocessingService` calls it. The uploaded files are kept in IndexedDB ([Uploaded files](#uploaded-files)). Processed datasets are stored separately in IndexedDB (see [Dataset format](dataset-format.md#stored-datasets-indexeddb)).

## Storage

- `localStorage` key `glyphspace_preprocessing_state` (`STORAGE_KEY`), one JSON value.
- Saved by the `PreprocessingService` methods that change the state, and on every step change (`saveStateToStorage`), so a reload returns to the step shown last; cleared by `resetState` (Start over, and after the dataset has been handed to the dashboard).
- Restored once, when `PreprocessingService` is created. Glyph, tooltip and colour references that the restored columns no longer produce are dropped then, as after any change of the columns.
- A failure to save (quota) is logged and removes the saved value, so a reload starts from the initial state instead of an older session, maybe of another file. A failure to restore (malformed JSON) is logged; the wizard starts from the initial state.

## Format (version 4)

```ts
interface SerializedState {
  version: 4;
  currentStep: number;              // index into WIZARD_STEPS
  furthestStep: number;             // furthest step index opened for this file (stepper reachability)
  dataProfile: DataProfile | null;  // profile of the uploaded CSV, incl. 10 preview rows
  rawFileName: string | null;       // name of the CSV as the user chose it
  uploadKey: string | null;         // name of the CSV in the worker's file system and the file store
  thumbnailArchiveName: string | null;  // name of the item image ZIP in the file store, if one was chosen
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

Not saved: the undo/redo history, the processing result (`processedDataset`, `cleaningResult`) and the processing run itself (`ProcessingRunService`), UI state (`isProcessing`, `error`) and `uploadMissing`.

## Uploaded files

The uploaded CSV and the item image ZIP are not part of the JSON value. `WizardFileStore` (`src/app/preprocessing-wizard/services/wizard-file-store.ts`) keeps them in IndexedDB:

- database `glyphspace-wizard-files`, version 1, object store `files`; the key is the upload key of the CSV (`uploadKey`) or the name of the ZIP (`thumbnailArchiveName`), the value the file as a `Blob`. The upload key is the file name, unless an upload that the state, the undo history or a running upload still names is stored under it: then it gets ` (2)`, ` (3)`, … before the extension (`PreprocessingService.uploadKeyFor`). So a corrected file uploaded under the same name never overwrites the one an undo goes back to;
- saved when a CSV is loaded (`loadCSV`) or a ZIP is chosen (`setThumbnailArchive`);
- pruned together with the worker's files: every stored file that the state, the undo/redo history or a running upload no longer names is deleted (`WizardFileStore.prune`), for example after `resetState` or when the ZIP is removed;
- best effort: when IndexedDB is unavailable, nothing is stored and a reload finds nothing.

A reload empties the worker's file system. When the restored state names a CSV, `PreprocessingService.restoreUploadedFile` loads it from the store and writes it back into the worker with `profileData`. Requests that read the file (outlier and duplicate counts, processing) wait for that (`loadedUploadKey`). If the file is not stored or can't be written back, the state gets `uploadMissing: true` and the wizard goes to the upload step, which asks for the file and keeps its continue button disabled; the review step does not offer Start Processing. A file uploaded then with exactly the same column names keeps the restored settings, without an undo entry; any other file replaces them like a new upload. An undo or redo back to a snapshot of the lost upload sets `uploadMissing` again (the service remembers which upload keys a reload could not restore).

A processing run reads the ZIP from the store when it starts (`PreprocessingService.thumbnailArchive`); "Open in Glyphspace" keeps it with the processed dataset, which has its own copy ([Dataset format](dataset-format.md#stored-datasets-indexeddb)).

## Restoring and migrating

`deserializeState` accepts any version. A payload without `version` is version 1.

| Field | Rule |
|---|---|
| `currentStep` | Version 1 had five steps (upload, columns, features, projection, review); its index is mapped through the step id (`V1_STEPS`), so the old review step 4 becomes 5. From version 2 on, the index is kept if it is a valid step. Anything else becomes 0. |
| `furthestStep` | A valid step index, never below `currentStep`. Saves before version 4 get `currentStep`. |
| `uploadKey` | The saved string. Saves before version 4 stored the upload under its file name, so they get `rawFileName`. |
| `columnConfigs` | A column without a valid `role` (saved before version 3) becomes a feature, which every column was then. |
| `projectionConfig` | Built from `DEFAULT_PROJECTION_CONFIG`: a saved value is taken only for a current setting and only if it has the default's type. Settings that no longer exist, such as TriMap's former `trimapWeightAdj`, are dropped. |
| `cleaningConfig` | Saved values over `DEFAULT_CLEANING_CONFIG`. |
| `colorScaleMode` | `categorical` if saved as such, otherwise `continuous`. |
| `colorScaleId` | The saved integer, otherwise 0. A retired scale id is restored as its replacement (4 → 6, 5 → 7; `resolveColorScaleId`). |
| `thumbnailArchiveName` | The saved string, otherwise `null`. |
| other fields | The saved value, or empty (`null`, `''`, `[]`). |

Malformed JSON throws; the caller logs it and keeps the initial state.

## Version history

| Version | Change |
|---|---|
| 1 | Five steps; no `version` field. |
| 2 | Six steps: visualization split into projection and appearance, so review moved from index 4 to 5. |
| 3 | Column configs have a `role` (feature or metadata). Later, without a new version: `thumbnailArchiveName`, restored as `null` from saves without it. |
| 4 | `uploadKey`, the name the upload is stored under, which can differ from `rawFileName`; `furthestStep`. |

## Changing the format

1. Make the change backwards compatible if you can: a new field needs a default in `deserializeState` for saves that don't have it.
2. If old saves need translating, raise `STORAGE_VERSION`, add the rule to `deserializeState`, and add a row to the version history above.
3. Add a case to `wizard-storage.spec.ts` that restores a save of the previous version.
