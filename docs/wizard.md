# Preprocessing wizard — developer notes

The wizard turns an uploaded CSV into a dataset for the dashboard. It runs entirely in the browser: Python (pandas, scikit-learn) in a Pyodide web worker, dimensionality reductions (DruidJS) in further workers. All paths below are relative to `src/app/` unless they start with `src/` or `tools/`.

## Steps

The ordered step list is `WIZARD_STEPS` in `preprocessing-wizard/shared/constants/step-info.ts`. Code refers to steps by id, never by number; helpers `stepIndex`, `stepIdAt`, `stepNumber`, `stepLabel` convert.

| # | id | Title |
|---|----|-------|
| 1 | `upload` | Upload Data |
| 2 | `columns` | Select Columns |
| 3 | `features` | Configure Data & Features |
| 4 | `projection` | Projection |
| 5 | `appearance` | Glyphs & Color |
| 6 | `review` | Review & Process |

Steps 1–5 implement `WizardStep` (`shared/wizard-step.ts`) so the shell renders one navigation bar. Glyph and colour settings (step 5) only set the dashboard's initial view; the dashboard's Encoding panel can change them later.

## Shell (`preprocessing-wizard/preprocessing-wizard.component.ts`)

- **Dialog:** the root is `role="dialog"` / `aria-modal="true"`, labelled by the h1 `#wizard-dialog-title`. Focus moves to it on open, Tab is wrapped inside (`shared/dialog-focus.ts`), Escape closes the wizard unless a popup or the Start-over `<dialog>` is open, and focus returns to the opener in the menubar. The wizard chunk is lazy-loaded with `@defer` from `menubar/menubar.component.html`.
- **Step changes:** focus moves to the "Step N of 6" heading and the change is announced.
- **Announcements:** `shared/wizard-announcer.service.ts` (`WizardAnnouncer.announce(message, 'polite' | 'assertive')`). The shell renders the two always-present live regions; steps never create their own.
- **Deep links:** `PreprocessingService.goToStepWithScroll(id, anchorId)` (history hint "Show change", Review edit buttons, issue-card "Fix in step N"). The shell takes the anchor with `consumeScrollTarget()`, then scrolls to and focuses it after render. Anchors are `wizard-anchor-*` ids in the step templates.
- **Stepper:** `shared/progress-stepper/` — `<ol>` of buttons with `aria-current="step"`; completed steps show a summary from `shared/step-summaries.ts`.
- **Title bar:** Undo, Redo (Ctrl+Z, Ctrl+Shift+Z / Ctrl+Y; ignored in text fields and while processing), Start over (native `<dialog>` confirmation), Close.
- **Step 2 → 3 transition:** Web Animations API, skipped under `prefers-reduced-motion`, cancelled on destroy.

## State and persistence

`preprocessing-wizard/services/preprocessing.service.ts` owns `PreprocessingState` (`models/preprocessing-state.ts`). State is saved to localStorage by `services/wizard-storage.ts` with a format version (currently 2); older saves are migrated by step id (the old 5-step layout's review step 4 becomes 5), and projection settings that no longer exist (e.g. `trimapWeightAdj`) are dropped. Column defaults and the "smart defaults" live in `services/column-defaults.ts`; the config sent to Python is built in `services/processing-config.ts`.

## Undo / redo

- Every user action pushes exactly one snapshot (`pushHistory(label)`, capped at 50). Bulk actions use `updateColumnConfigs(changes, label)`; derived metadata such as outlier counts uses `updateColumnMetadata` and never creates an entry.
- `services/history-diff.ts` diffs snapshots and maps the changed field to a label, step id and anchor (`SETTING_META`) for the undo hint.
- Toast "Undo" buttons call `undoIfLatest(id)`, so they only revert their own action.
- While processing, undo/redo are no-ops (`holdProcessing()` / `whileProcessing(task)` keep `isProcessing` up until the whole primary run, FastMap included, finishes).
- The worker keeps uploaded CSVs for reprocessing; the service calls `DataProcessorService.pruneFiles(keep)` with every file name still referenced by the state or the undo/redo stacks.

## Errors

`preprocessing-wizard/shared/constants/wizard-error-classes.ts` maps raw worker errors to classes with a cause, a fix and a target step:

| Class | Meaning | Fix in |
|---|---|---|
| K1 | Text values reached the numeric feature matrix | features |
| K2 | Cleaning removed every row | features |
| K3 | A column is constant or almost empty | columns |
| K4 | A neighbour parameter is ≥ the number of rows | projection |
| K5 | Glyph feature count outside 3–12 | appearance |
| K6 | Time or memory limit | projection |
| K7 | A text column has too many distinct values to one-hot encode | columns |
| K8 | A fill value doesn't fit its numeric column | features |

Unmatched errors fall back to a generic blocking issue. `detectPreflightIssues` warns before processing (K3, K4, K6). Failed background projections become dismissable warnings (`classifyBackgroundFailure`).

## Processing pipeline

- **Worker:** `workers/pyodide.worker.ts` loads Pyodide from the jsDelivr CDN (`PYODIDE_VERSION`), installs pandas and scikit-learn, and writes the Python modules from `src/assets/` into its file system on demand. Requests carry a `requestId` and are handled one at a time.
- **No Python built from data:** `workers/pyodide-calls.ts` only turns fixed module/function names into code; all arguments (file names, column names from the CSV header, the config) are passed as data in a throwaway namespace.
- **File names:** `workers/pyodide-files.ts` rejects path separators, `.`/`..`, and importable suffixes (`.py`, `.pyc`, `.so`), and tracks the files the worker wrote for `pruneFiles`.
- **Order of operations** (header of `src/assets/preprocessing_processor_config.py`): fill missing values → cap outliers (detected on the original values) → drop rows (`remove_rows` columns, outlier `remove`) → drop duplicates → encode (one-hot, label, normalize, standardize, dates, booleans) → scale. Outlier detection is shared with Step 3's count (`find_outliers` in `src/assets/preprocessing_processor.py`).
- **Projections:** DruidJS (0.9: WASM kernels with a JS fallback; its worker pool is Node-only, so browsers get no nested workers) runs in `workers/projection.worker.ts` via `workers/druid-runner.ts`; only the primary FastMap runs on the main thread, loading DruidJS on first use. `services/projection.service.ts` runs each background method in its own worker and offers `cancel(method)`, `retry(method)`, `terminateAllWorkers()` and `detachAll()`. The primary Pyodide run can't be cancelled: terminating that worker would drop the loaded runtime and the uploaded file.
- **Hidden methods:** methods in `HIDDEN_PROJECTION_METHODS` (`preprocessing-wizard/steps/step4-projection-settings/projection-methods.ts`) are not offered in Step 4 and never run, summarised or warned about, even if a saved config enables them. LLE is hidden until druidjs fixes it (see ROADMAP); TriMap has no parameters and runs with DruidJS's defaults.
- **Local CSV import:** the CLI `tools/process.py` (with `tools/dataset_common.py`) writes the bundled datasets in `src/assets/data/`. It is not part of the app build; in the browser, CSV files are only imported through this wizard pipeline.

## UI helpers

- **Popups:** help tooltips and method previews go through `shared/popup-coordinator.ts` — one popup at a time, opens on hover/focus/click, closes on Escape or outside click, 180 ms hover grace. Method previews (`shared/projection-preview/`) draw synthetic data with a framework-free engine in `engine/`.
- **Consequence hints (Step 3):** `steps/step3-configure-data-features/consequence-preview.ts` turns the column profile into text such as "12.4 – 98.1 → 0.00 – 1.00" or "Drops 132 of 5,000 rows".
- **Styles:** tokens in `src/styles/_variables.scss`, wizard mixins in `preprocessing-wizard/shared/_wizard-shared.scss`.

## Tests

- Specs sit next to the code (`*.spec.ts`) and run with Vitest in headless Chromium (Angular `@angular/build:unit-test`, Playwright provider): `npm test` watches, `npm run test:ci` runs once. One file: `npx ng test --include=<path>`.
- Shared test helpers: `preprocessing-wizard/testing/preprocessing-test-helpers.ts` (`createTestPreprocessingService()`, `createToastServiceSpy()`) and `src/testing/create-spy-obj.ts`. `src/test-setup.ts` restores `vi.spyOn` spies after every test.
- Python pipeline: `python -B -m pytest -p no:cacheprovider tools/tests/test_preprocessing_config.py` (each test runs with default pandas and with pandas-3 behaviour enabled; the wizard's option values are read from the TypeScript enums).
- Sample data for manual testing: "Try with sample data" in Step 1 (`src/assets/samples/wine-quality-red.csv`, regenerated by `tools/make-sample-csv.py`).
