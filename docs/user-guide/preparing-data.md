# Preparing data

_For people getting a CSV file ready for GlyphSpace, or bundling a dataset with the app._

There are two ways to get data into GlyphSpace:

| Way | For | Result |
|---|---|---|
| **The import wizard** in the app | Anyone, any time | A dataset stored in your browser. See [Importing data](importing-data.md). |
| **The command-line tool** `tools/process.py` | Maintainers of a GlyphSpace build | A dataset bundled with the app, available to every visitor |

Both start from a CSV file. The exact rules for the input are in the [CSV input spec](../specs/csv-input.md); the files the tool writes are described in the [dataset format spec](../specs/dataset-format.md).

## Getting the CSV ready

- **One row per item, one column per attribute.** The first row holds the column names; values are separated by commas.
- **An ID column** named `ID` identifies each row. It is optional: without one, rows are numbered from 0. The tooltip shows the ID, and item images are matched by it. Upper or lower case doesn't matter (`id` and `Id` work too), in the wizard and in the command-line tool alike.
- **Numbers as plain numbers.** Columns that contain only numbers become numeric features.
- **Categories as text.** Columns with a few repeating text values become categorical features.
- **Free text is fine.** In the wizard, names, titles and descriptions become metadata: shown in the tooltip and found by the search, but not part of the projection.
- **Missing values are fine.** Leave the cell empty. The wizard lets you keep, fill or drop them per column.
- **Size:** the wizard takes files up to 50 MB. For large files, drop columns you don't need or filter rows before importing.

### Coordinates

Some columns are recognised by their name:

| Columns | Wizard | Command-line tool |
|---|---|---|
| `latitude` / `longitude` (also `lat`, `lon`, …) | Detected as **Coordinate** columns and treated as numeric features | Also written as a geographic position (`epsg`) |
| `<name>-x` / `<name>-y` pairs, e.g. `pca-x`, `pca-y` | Not used as positions; the wizard computes its own projections | Each pair becomes a projection called `<name>` |

So if you already have 2D coordinates from another tool, bundle the dataset with the command-line tool to see them as a projection.

## Bundling a dataset with the command-line tool

The tool writes the dataset files into `src/assets/data/` and registers them in `src/default-dataset.ts`, which the app reads at start-up.

### Prerequisites

Python 3.10 or newer with `pandas`, `numpy`, `scikit-learn` and `umap-learn`. See [Development setup](../development/setup.md).

### Add a dataset

Run the tool from the repository root:

```bash
python tools/process.py path/to/mydata.csv
```

It then:

1. Writes `mydata_with_id.csv` next to the input file: the CSV with its ID column moved to the front (or added).
2. Writes the dataset files to `src/assets/data/`, named `mydata.<DDMMYYYY>.<type>.json`, with today's date: schema, features, statistics (`meta`) and positions for PCA, UMAP and t-SNE, plus a position file for coordinates and for each `-x`/`-y` pair, if present.
3. Regenerates `src/default-dataset.ts` from all dataset files in `src/assets/data/`.

The dataset appears in the **Data** menu as `mydata` (the file name without `.csv`) the next time the app is built or the dev server reloads. The tool label-encodes text columns and shows the first five features in the glyph; you can change the glyph features and the colour in the sidebar ([Encoding and filters](encoding-and-filters.md)).

### Remove a dataset

Delete its files from `src/assets/data/`, then run the tool without arguments to regenerate `src/default-dataset.ts`:

```bash
python tools/process.py
```

It prints its usage line and then rebuilds the dataset list. Do the same after adding dataset files to the folder by hand.

### Thumbnails

For the **Image** glyph type, put one JPG image per item into `src/assets/thumbnails/<dataset name>/`, named after the item's ID, e.g. `src/assets/thumbnails/mydata/42.jpg`. The bundled `wineqr` dataset is an example. Then run `python tools/process.py` without arguments, so the dataset list notes that the dataset has images; until then the **Image** button stays off for it. Items without an image show a grey placeholder. For a dataset imported with the wizard, add the images as a ZIP file in Step 1 instead (see [Importing data](importing-data.md#step-1-upload-data)).
