[![Angular Version][angular-shield]][angular-url]

# GlyphSpace

_Attention: this is a developer preview! The project is not yet in beta stage or completely usable and tested._

Glyphspace is a complete rewrite of the [Glyphboard application](https://github.com/visualengineers/glyphboard), which combines dimensionality reduction with a seamless integration of glyph-based visualizations that are able to show the most relevant dimensions in a data set at one glance.

See the running demo on Github pages: [https://visual-engineers.org/glyphspace/](https://visual-engineers.org/glyphspace/).

## Usage

... coming soon. 

## Data Import

### Dynamic Import

Inside of the running application, you can upload suitable CSV files into the filesystem of Micropython running as a web assembly behind the scenes (see below for CSV file structure). You can also upload ZIP folders with thumbnails for your data. The filename must be the same as your CSV file and the contained files should be named according to the IDs of the data rows.

### Preprocessed Data

You can either process CSV files via the command line using:

```bash
python tools/process.py <your_csv_file>
```

Which creates the necessary data files inside the `src/assets/data` folder of the project and recreates the file `src/defauult-dataset.ts` which the application picks up after starting. You can also store thumbnails in the folder `src/assets/data/thumbnails/<your_data_name>`, which are in JPG format and have the ID of your data items as filename. 

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

## Angular Development Instructions

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.13.

### Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

### Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

### Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

### Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

### Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

### Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[angular-shield]: https://img.shields.io/badge/dynamic/json?color=brightgreen&label=angular&query=%24.dependencies[%27%40angular%2Fcore%27]&url=https%3A%2F%2Fraw.githubusercontent.com%2Fvisualengineers%2Fglyphspace%2Frefs%2Fheads%2Fmain%2Fpackage.json&style=for-the-badge
[angular-url]: https://angular.io/