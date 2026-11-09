# Changelog

All notable changes to GlyphSpace. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); how to add entries is in [docs/development/documentation.md](docs/development/documentation.md#changelog).

GlyphSpace has no version numbers yet, so releases are named by the date they reached `main`. The entries before November 2026 were reconstructed from the git history.

## [Unreleased]

### Added

- Documentation in `docs/`: a user guide, specifications of the data formats and worker protocols, architecture decision records, and development guides. This changelog.
- Item images for imported datasets: Step 1 of the wizard takes an optional ZIP file with one picture per item, named after the item's ID (JPG, PNG or WebP). The **Image** glyph type shows them, and the dataset keeps them in the browser (#92).
- A **Size** slider in the sidebar's **Encoding** tab sets dots and glyphs together: a typical glyph of the dataset reaches about as far as the dot it replaces, so items keep their size when zooming from dots to glyphs (#90).

### Changed

- The wizard redesign ticket list moved from `ROADMAP.md` to [docs/specs/wizard-redesign.md](docs/specs/wizard-redesign.md).
- Node 26 (`.nvmrc`; `package.json` requires 26 or newer), Angular 22.2, TypeScript 6.0, Vitest 5.1, three.js 0.187, lint-staged 17, Playwright 1.65 and the latest minor versions of the other packages. After pulling, install Node 26 and run `npx playwright install chromium` once. Existing components keep their change detection; new components use OnPush, Angular 22's default ([ADR 0011](docs/decisions/0011-existing-components-keep-eager-change-detection.md)). The HTTP client uses Angular's default `fetch` backend.
- The wizard runs on Pyodide 314.0.7: Python 3.14, pandas 3.0, scikit-learn 1.8, numpy 2.4. The download stays about the same (about 40 MB). One-hot and label encoding of numeric columns no longer fill text into a number column, which pandas 4 will reject.
- The sidebar was redesigned (#90). On top, the glyph legend shows the glyph with numbered axes; axes are added with **+ Add axis** and removed from their label, between 3 and 8 per glyph. Below it, **FILTERS** lists every active filter, search terms included, next to the number of matching items. The **Filters** tab marks the glyph's features on their cards and adds or removes them there; the **Encoding** tab holds glyph type, colour and appearance. The whole sidebar can be hidden.
- Glyph axes follow the order of the glyph features: axis 1 points up, the others follow clockwise, and an added feature becomes the last axis. Canvases, legend and the wizard's Step 5 preview draw them the same way (#90).
- New categorical palettes: Glasbey, Tableau 10 and Colorblind, none with grey, which marks filtered-out items. Categories take the colours in order, in the glyphs and the histograms alike. The new palettes have new ids; datasets and wizard settings saved with Observable10 or Tableau20 open with Glasbey or Tableau 10 (#89).
- The flower glyph has Glyphboard's petal shape. The axes behind a glyph are lighter and thinner, and the contour ring lies behind the data (#91).
- Dot and glyph sizes no longer depend on the screen's pixel ratio or the canvas size (#90).
- When zooming in beyond the dots, glyphs grow more slowly than the distances between them, so overlapping glyphs separate; at the highest zoom they are smaller than before ([ADR 0012](docs/decisions/0012-glyphs-grow-slower-than-the-zoom.md)).
- The magic lens shows the items nearest the cursor in their arrangement on the canvas, as large as they fit without overlapping. Before, it scattered them at random and they piled up along its border. When more items are under the cursor than the lens shows, the ring around the cursor shrinks to the area it shows. The lens is 300 px wide (was 250).
- Zooming from dots to glyphs no longer stalls the page as long: a flower glyph is drawn as one shape and one outline instead of one per petal, and the flower outline only at the highest zoom level, where it is visible.
- The **Thumbnails** glyph type is now called **Image** (#90).
- The glyph type buttons show a small star, flower or picture next to their name. **Image** is off for a dataset without item images, and such a dataset opens with **Star** instead of grey placeholders. `tools/process.py` marks bundled datasets that have images in `src/assets/thumbnails/` (`images: true` in `src/default-dataset.ts`).

### Removed

- The whisker glyph, also from the wizard's Step 5 preview (#90).
- The sidebar's icon strip and its **Style** panel; glyph type and options are in the **Encoding** tab (#90).

### Fixed

- Filtered-out glyphs stay grey at the highest zoom level (#50).
- A click shows and pins the tooltip of the clicked item; before, a quick click could pin the tooltip of the item hovered before. Clicking the item again, or empty space, closes it (#51).
- After a page reload the wizard puts the uploaded file back, so outlier counts and processing work without uploading it again. If the file is gone, Step 1 asks for it and keeps the settings for a file with the same columns (#92).
- A column named `id` in any case (such as `Id`) gives the item IDs in the wizard too, as in the command-line tool. Before, only `ID` did, and the items got row numbers as IDs (#92).
- The dashboard starts with the first bundled dataset in the list, not with whichever finished downloading first (#92).
- Reprocessing a dataset, or importing another file under the same name, replaces its items; before, old values could stay (#92).
- Processing no longer fails when an ID contains a comma (#92).
- **Clear all** no longer brings old search terms back on the next search (#92).
- **Avoid collision** works with the new glyph size: it keeps apart what is drawn (dots, petals or stars, or whole circles with a background or axes) instead of full glyph circles, so the projection keeps its shape, and it adjusts when the zoom level changes.
- A fill value that is neither true nor false for a true/false column is reported as K8 (#92).
- Step 1's file requirements no longer promise that `-x`/`-y` and latitude/longitude columns become positions; only the command-line tool uses them (#92).
- The help on background projections points to the canvas's position settings (**Pos**) instead of controls that don't exist (#92).
- Histograms in the hidden sidebar tab no longer cause invalid SVG errors in the console.

### Security

- All `npm audit` findings are fixed (2 critical, 7 high, 39 moderate), partly through `overrides` for minimatch and glob.

## 2026-11-09: Wizard redesign

The preprocessing wizard was reworked along requirements A1–A15 ([spec](docs/specs/wizard-redesign.md)) (#72–#75, #77–#86, #88, merged with #76).

### Added

- Six steps: Upload, Select Columns, Configure Data & Features, Projection, Glyphs & Color, Review & Process. Projection and the glyph and colour settings used to share one step.
- Undo and redo for every change, with Ctrl+Z / Ctrl+Shift+Z, and **Start over**.
- Explanations for terms and options, including animated previews of the projection methods.
- Smart defaults: mostly empty and constant columns start deselected, near-unique text columns start as metadata, a fitting colour feature is suggested.
- Columns can be used as **metadata**: shown in the tooltip, found by the search and exported, but not encoded or projected (#71).
- Errors appear where they happen, in plain language, with a link to the step that fixes them (classes K1–K8). Problems that can be predicted are shown before processing starts.
- Background projections can be cancelled one by one or all at once, and restarted one by one.
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
- Projections computed with DruidJS (#24). FastMap is computed first so the dashboard opens quickly; the other methods follow in the background (#47).
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
- The magic lens shows glyphs instead of dots (#27).

### Changed

- The canvas grid was restyled, and the menubar adapts to the window width.
- The dashboard stretches to the window height (#23).

### Fixed

- The magic lens was slow; it has a new render logic (#25, closes #1).
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

- Animated transitions between projections (#4).
- Download of a canvas as PNG (#9).
- The MIT licence.

### Changed

- The Python processing handles ID columns, label encoding and number conversion more robustly. The meta data is computed on the normalised, encoded features.
- The text search matches substrings.

## 2025-07-10: First version

GlyphSpace, a rewrite of [Glyphboard](https://github.com/visualengineers/glyphboard):

- glyph canvases that position items by a dimensionality reduction and draw them as glyphs, with touch control;
- thumbnails for the bundled dataset;
- CSV import through Python running in the browser (Pyodide);
- the CLI `tools/process.py` for bundled datasets;
- deployment to GitHub Pages.
