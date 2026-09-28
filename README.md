[![Angular Version][angular-shield]][angular-url]

# GlyphSpace

_Attention: this is a developer preview! The project is not yet in beta stage or completely usable and tested._

Glyphspace is a complete rewrite of the [Glyphboard application](https://github.com/visualengineers/glyphboard), which combines dimensionality reduction with a seamless integration of glyph-based visualizations that are able to show the most relevant dimensions in a data set at one glance. The original Glyphboard documentation can be found on [Github pages](https://visualengineers.github.io/glyphboard-doc). 

See the running demo on Github pages: [https://visual-engineers.org/glyphspace/](https://visual-engineers.org/glyphspace/).

## Using the Wizard

The preprocessing wizard guides you through six steps to prepare your data for visualization:

1. **Upload Data** — Load your CSV file.
2. **Select Columns** — Choose columns to keep; ID and low-value fields can be deselected.
3. **Configure Data & Features** — Set encoding, scaling, missing-value and outlier handling per column.
4. **Projection** — Select columns for dimensionality reduction and pick projection methods (PCA, UMAP, t-SNE).
5. **Glyphs & Color** — Choose glyph features and color encoding for the dashboard's initial view (both changeable later).
6. **Review & Process** — Review your configuration and process the data.

**Undo/Redo:** Use the buttons in the wizard's title bar or Ctrl+Z / Ctrl+Shift+Z (Cmd on Mac) to step back and forth through your changes.

**Try with sample data:** Step 1 offers a Wine Quality (red) dataset as a starter (P. Cortez et al., UCI Machine Learning Repository, CC BY 4.0).

Developer notes on the wizard's architecture are in [docs/wizard.md](docs/wizard.md).

## Data Import

### Dynamic Import

Inside of the running application, you can upload suitable CSV files into the filesystem of Pyodide (Python compiled to WebAssembly, loaded from the jsDelivr CDN; the version is set in `src/app/workers/pyodide.worker.ts`; see below for CSV file structure). You can also upload ZIP folders with thumbnails for your data. The filename must be the same as your CSV file and the contained files should be named according to the IDs of the data rows.

### Preprocessed Data

You can either process CSV files via the command line using:

```bash
python tools/process.py <your_csv_file>
```

Which creates the necessary data files inside the `src/assets/data` folder of the project and recreates the file `src/default-dataset.ts` which the application picks up after starting. You can also store thumbnails in the folder `src/assets/data/thumbnails/<your_data_name>`, which are in JPG format and have the ID of your data items as filename. 

All columns except IDs and positional information are converted with a label encoder if they are strings and then normalized for processing of the meta data (including a histogram, min, max, etc.) as well as a PCA, UMAP, and tSNE multidimensional reduction. 

Your CSV file must follow a few conventions. The first column should be named "ID" and can contain numerical or alphanumerical IDs for your data rows. You can add pre-computed 2D coordinates or multiple of them with corresponding `<yourprojection>-x` and `<yourprojection>-y` columns. The processing will also try to pick up latitude and longitude columns to create a position file for the geographical positions (if applicable).

Example:

| ID  | text                 | somefeature | ...   | umap-x    | umap-y   | latitude  | longitude  |
|-----|----------------------|-------------|-------|-----------|----------|-----------|------------|
| 1   | Lorem ipsum          | 2.998383    |       | 231.2     | 12.1     | 52.513028 | 13.4105551 |
| 2   | Text of a data point | -0.12332    |       | 72.1      | 102.2    | 52.5120   | 13.40811   |
| 3   | Another text data    | 12.2333     |       | -45.9     | 200.75   | 52.5120   | 13.40811   |
| .   | .                    | .           |       | .         | .        | .         | .          |
| .   | .                    | .           |       | .         | .        | .         | .          |
| .   | .                    | .           |       | .         | .        | .         | .          |

If you add your own data to the assets folder or delete existing datasets, you should run `python tools/process.py` without further parameter to recreate the `default-dataset.ts` file. 

### Individual Data Preparation

You can also create the datasets yourself following the (slightly updated) specification of the data format, found in the older [Glyphboard Backend Project](https://github.com/visualengineers/glyphboard-backend).

Notable changes: 

- in schema.json, `variant-context` is renamed to `variantcontext` for better type safety
- in feature.json `default-context` is renamed to `defaultcontext` for the same reasons
- IDs are treated as strings

## Development

**Node version:** v24 (see `.nvmrc`)

### Setup

```bash
npm ci          # Install dependencies (prefer ci over install for reproducible builds)
npx playwright install chromium  # Once per machine: browser for the unit tests
npm start       # Start local dev server at http://localhost:4200/
npm test        # Run unit tests (Vitest in headless Chromium, watch mode)
npm run test:ci # Run unit tests once (CI mode)
npm run lint    # Run ESLint
npm run build   # Build for production (output in dist/)
```

### Python tools

The project includes Python preprocessing tools that run locally via `tools/process.py` (CLI; the dataset file generation lives in `tools/dataset_common.py`, the in-browser import is the wizard's pipeline in `src/assets/preprocessing_processor*.py`):

```bash
python tools/process.py <your_csv_file>     # Process a CSV and generate src/default-dataset.ts
python tools/process.py                     # Rebuild default dataset list
python -B -m pytest -p no:cacheprovider tools/tests  # Run Python tests
```

Other tools:
- `tools/make-sample-csv.py` — Generate sample data

### Deployment

The app is deployed to GitHub Pages on every push to `main`. See `.github/workflows/deploy.yaml` for the workflow (runs tests, lints, builds on PRs; publishes on merge to main).

## Licence

GlyphSpace is licensed under the MIT License (see [LICENSE](LICENSE)). It bundles [DruidJS](https://github.com/saehm/DruidJS) for the dimensionality reductions, which is licensed under the LGPL-3.0-or-later. The deployed site ships the LGPL and GPL texts and a notice in `licenses/` (source: `src/licenses/`), plus `3rdpartylicenses.txt` listing all bundled packages.

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[angular-shield]: https://img.shields.io/badge/dynamic/json?color=brightgreen&label=angular&query=%24.dependencies[%27%40angular%2Fcore%27]&url=https%3A%2F%2Fraw.githubusercontent.com%2Fvisualengineers%2Fglyphspace%2Frefs%2Fheads%2Fmain%2Fpackage.json&style=for-the-badge
[angular-url]: https://angular.io/
