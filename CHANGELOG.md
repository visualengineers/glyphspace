# Changelog

All notable changes to GlyphSpace. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); how to add entries is in [docs/development/documentation.md](docs/development/documentation.md#changelog).

GlyphSpace has no version numbers yet, so releases are named by the date they reached `main`. The entries before November 2026 were reconstructed from the git history.

## [Unreleased]

### Added

- Documentation in `docs/`: a user guide, specifications of the data formats and worker protocols, architecture decision records, and development guides. This changelog.

### Changed

- The wizard redesign ticket list moved from `ROADMAP.md` to [docs/specs/wizard-redesign.md](docs/specs/wizard-redesign.md).

## 2026-11-09: Wizard redesign

The preprocessing wizard was reworked along requirements A1–A15 ([spec](docs/specs/wizard-redesign.md)) (#72–#75, #77–#86, #88, merged with #76).

### Added

- Six steps: Upload, Select Columns, Configure Data & Features, Projection, Glyphs & Color, Review & Process. Projection and the glyph and colour settings used to share one step.
- Undo and redo for every change, with Ctrl+Z / Ctrl+Shift+Z, and **Start over**.
- Explanations for terms and options, including animated previews of the projection methods.
- Smart defaults: mostly empty and constant columns start deselected, near-unique text columns start as metadata, a fitting colour feature is suggested.
- Columns can be used as **metadata**: shown in the tooltip, found by the search and exported, but not encoded or projected (#71).
- Errors appear where they happen, in plain language, with a link to the step that fixes them (classes K1–K8). Problems that can be predicted are shown before processing starts.
- Background projections can be cancelled and restarted one by one, or all at once.
- The review step links each setting back to the step where it is changed.
- **Try with sample data** in Step 1 (Wine Quality, red).
- Keyboard and screen-reader support: the wizard is a modal dialog with focus handling and announcements.

### Changed

- Two-column layout that uses the window's height; one table and list design for all steps; animated transitions between steps.
- Angular 21.2, DruidJS 0.9. LLE is hidden because DruidJS 0.9 computes it wrongly. TriMap runs with DruidJS's defaults; its **Weight Adjustment** setting is gone.
- Unit tests run with Vitest in Chromium; CI runs on Node 24.

### Fixed

- The cleaning and encoding options now take effect as shown. Missing values no longer distort the scaling, and tooltips show "missing" instead of 0. Boolean labels are no longer swapped.
- Reprocessing after a change works without uploading the file again.
- Undo and redo restore the right state.

### Security

- Column names and file names from an uploaded CSV can no longer inject Python code into the worker.
- Tooltips no longer render HTML from the data.
- The site ships the licence texts of the bundled DruidJS (LGPL-3.0) and a list of all third-party licences.

## 2026-06-06: Sidebar, filters and saved datasets

(#59, #70)

### Added

- Datasets processed in the wizard are saved in the browser and are still there after a reload; they can be deleted from the menubar.
- A selection filter, and filter chips next to the item count.
- A screenshot button in the menubar.

### Changed

- The sidebar was reworked: a status bar as header, the glyph preview at the top of **Encoding**, one pane open at a time.
- Slimmer canvas headers; canvases close with an "X" icon.
- Angular 21. ESLint and Prettier for the code base, and the first unit tests.

### Fixed

- Categorical filters (#70).
- Histogram tooltips and the filter display in the sidebar.
- The magic lens no longer hides glyphs under the cursor.

## 2026-01-24: Preprocessing wizard

(#24, #34, #42, #43, #45, #47)

### Added

- The preprocessing wizard: upload a CSV, choose and configure its columns, pick projection methods, and process it in the browser (#24).
- Projections computed with DruidJS. FastMap is computed first so the dashboard opens quickly; the other methods follow in the background (#47).
- Category filters (#40) and category values in the histograms (#38).
- Information in the canvas settings controls (#29).

### Changed

- Colour scales updated; the colour works with categorical data (#34).
- Faster rendering of large datasets (spatial grid, cached geometry) (#42).
- The magic lens shows enlarged glyphs and reacts faster (#45).
- Uploads are limited to 50 MB.

### Fixed

- The colour scale picker in a second canvas (#43).
- Glyphs vanishing on zoom, and the browser zooming on scroll over the magic lens.

## 2025-12-26: Restyling and magic lens

(#25, #27)

### Added

- A menubar with position, colour and glyph menus, **Fit all**, and navigation and settings controls per canvas.
- Histograms of the data distribution, which also change the glyph features; a glyph legend; text search.
- The magic lens shows glyphs instead of dots (#25, closes #1).

### Changed

- The canvas grid was restyled, and the menubar adapts to the window width.
- The dashboard stretches to the window height (#23).

### Fixed

- Data of different timestamps was cached and loaded wrongly.

## 2025-11-20: Nutrients dataset

(#21)

### Added

- The `nutrients` dataset is bundled.

### Changed

- The CLI (`tools/process.py`) follows the changes to the Python processing and recognises date columns better (#19).

## 2025-07-21: More robust processing

(#20)

### Added

- The MIT licence.

### Changed

- The Python processing handles ID columns, label encoding and number conversion more robustly. The meta data is computed on the normalised, encoded features.
- The text search matches substrings.

## 2025-07-10: First version

GlyphSpace, a rewrite of [Glyphboard](https://github.com/visualengineers/glyphboard):

- glyph canvases that position items by a dimensionality reduction and draw them as glyphs, with touch control;
- animated transitions between projections (#4);
- download of a canvas as PNG (#9);
- thumbnails for the bundled dataset;
- CSV import through Python running in the browser (Pyodide);
- the CLI `tools/process.py` for bundled datasets;
- deployment to GitHub Pages.
