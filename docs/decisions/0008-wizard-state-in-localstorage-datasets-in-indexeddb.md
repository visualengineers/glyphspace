# 0008. Keep wizard state in localStorage and processed datasets in IndexedDB

**Status:** Accepted (recorded retroactively on 2026-11-09) · **Date:** 2025-12-21 (wizard state, commit 5535687); 2026-06-02 (datasets, #59) · **Related:** [Wizard storage](../specs/wizard-storage.md), [Dataset format](../specs/dataset-format.md#stored-datasets-indexeddb)

## Context

The app has no backend ([ADR 0002](0002-preprocess-in-the-browser-with-pyodide.md)), so anything that should survive a reload has to be stored in the browser. Two things need to survive:

- the wizard's settings while the user works through the steps: a profile of the CSV with ten preview rows and one small config per column;
- the processed datasets, which hold a feature map, original values and positions for every row, and can be large.

The reasons for the two storage choices were not written down; the context above is what the code shows. localStorage is synchronous and simple but small (a few megabytes per origin in common browsers); IndexedDB is asynchronous and holds much more.

## Decision

- The wizard state is saved as one versioned JSON value in localStorage (`glyphspace_preprocessing_state`), after each change and cleared on reset.
- A processed dataset is saved in IndexedDB (database `glyphspace-datasets`, store `datasets`, one record per dataset name) when the wizard hands it to the dashboard, and again when a background projection adds positions to it. On start the app loads every stored dataset into the collection as source `indexeddb`.

## Alternatives considered

None are recorded.

## Consequences

- Settings and datasets are per browser and per origin; nothing is shared between devices.
- The uploaded CSV is in neither store. After a reload the wizard restores its settings, but processing needs the file uploaded again.
- Saving a dataset under an existing name replaces the stored one.
- The wizard state format is versioned and migrated ([Wizard storage](../specs/wizard-storage.md)); the stored datasets are not, so their format must stay backwards compatible ([Dataset format](../specs/dataset-format.md#compatibility)).
- Failures to save are logged and otherwise ignored, so a full or blocked storage means that nothing persists, without a message to the user.

## Notes

- **2026-11-09:** The consequence that the uploaded CSV is in neither store was addressed in #92. The wizard now keeps the uploaded CSV, and an optional ZIP of item images, in a third store, the IndexedDB database `glyphspace-wizard-files`, and writes the CSV back into the worker after a reload. A processed dataset's item images are kept in a new object store `thumbnails` of `glyphspace-datasets`. See [Wizard storage](../specs/wizard-storage.md#uploaded-files) and [Dataset format](../specs/dataset-format.md#stored-datasets-indexeddb).
- **2026-11-15:** Stored datasets are no longer all built into memory at startup: the app lists them (name, time, projections) and reads a dataset when it is first opened. The consequence that save failures are only logged no longer holds for datasets: a dataset that can't be saved (a full storage, an aborted transaction) shows a warning, a failed deletion keeps the dataset and shows an error, and a tab of an older version that blocks the database upgrade makes requests fail instead of waiting. A failed save of an image archive is still only logged; the images then last for the session.
