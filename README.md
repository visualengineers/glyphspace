[![Angular Version][angular-shield]][angular-url]

# GlyphSpace

_Attention: this is a developer preview! The project is not yet in beta stage or completely usable and tested._

Glyphspace is a complete rewrite of the [Glyphboard application](https://github.com/visualengineers/glyphboard), which combines dimensionality reduction with a seamless integration of glyph-based visualizations that are able to show the most relevant dimensions in a data set at one glance. The original Glyphboard documentation can be found on [Github pages](https://visualengineers.github.io/glyphboard-doc).

See the running demo on Github pages: [https://visual-engineers.org/glyphspace/](https://visual-engineers.org/glyphspace/).

![GlyphSpace showing the wine quality dataset: on the left a canvas with all 1,599 wines as coloured points in a UMAP projection, on the right a second canvas zoomed in so that each wine is a flower glyph of five features, and on the right edge the sidebar with the glyph legend, the number of matching items and the Filters tab with a histogram per feature.](docs/images/dashboard.png)

## Your own data

- **In the browser:** the preprocessing wizard turns a CSV file into a dataset in six steps, entirely in your browser. Step 1 offers a Wine Quality (red) sample to try it (P. Cortez et al., UCI Machine Learning Repository, CC BY 4.0). See [Importing data](docs/user-guide/importing-data.md).
- **Bundled with the app:** `python tools/process.py <your_csv_file>` writes a dataset into `src/assets/data/`. See [Preparing data](docs/user-guide/preparing-data.md).

The CSV conventions (ID column, pre-computed coordinates, latitude/longitude) are specified in [CSV input](docs/specs/csv-input.md), the resulting files in [Dataset format](docs/specs/dataset-format.md).

## Development

```bash
npm ci                            # install dependencies (Node 26, see .nvmrc)
npx playwright install chromium   # once per machine: the browser for the unit tests
npm start                         # dev server at http://localhost:4200/
npm test                          # unit tests (watch mode); npm run test:ci runs them once
npm run lint                      # ESLint
npm run build                     # production build into dist/
```

Every push to `main` is deployed to GitHub Pages ([Deployment](docs/development/deployment.md)).

## Documentation

All documentation is in [docs/](docs/README.md):

- [User guide](docs/README.md#using-glyphspace): the dashboard, encoding and filters, importing and preparing data, troubleshooting.
- [Development](docs/README.md#working-on-glyphspace): setup, architecture, dashboard, wizard, processing pipeline, testing, conventions, deployment.
- [Specifications](docs/specs/README.md) of the data formats and protocols, and the [decision log](docs/decisions/README.md) with the reasons behind the architecture.
- [Changelog](CHANGELOG.md).

## Licence

GlyphSpace is licensed under the MIT License (see [LICENSE](LICENSE)). It bundles [DruidJS](https://github.com/saehm/DruidJS) for the dimensionality reductions, which is licensed under the LGPL-3.0-or-later. The deployed site ships the LGPL and GPL texts and a notice in `licenses/` (source: `src/licenses/`), plus `3rdpartylicenses.txt` listing all bundled packages.

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[angular-shield]: https://img.shields.io/badge/dynamic/json?color=brightgreen&label=angular&query=%24.dependencies[%27%40angular%2Fcore%27]&url=https%3A%2F%2Fraw.githubusercontent.com%2Fvisualengineers%2Fglyphspace%2Frefs%2Fheads%2Fmain%2Fpackage.json&style=for-the-badge
[angular-url]: https://angular.io/
