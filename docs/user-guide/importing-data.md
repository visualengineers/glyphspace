# Importing data

_For people bringing their own CSV file into GlyphSpace._

Click **Upload** in the menu bar to open the **Data Preprocessing Wizard**. It turns a CSV file into a dataset for the dashboard in six steps. Everything runs in your browser, and the file never leaves your machine. The wizard's Python runtime (Pyodide with pandas and scikit-learn) is downloaded from the jsDelivr CDN in the background when GlyphSpace starts, so you need an internet connection.

For what the CSV should look like, see [Preparing data](preparing-data.md).

## Moving through the wizard

- The list on the left shows the six steps. Completed steps show a short summary. Click a step to go back, or to jump forward to a step you have already reached.
- **Back** and the **Continue to …** button at the bottom move one step. If the continue button is disabled, a message next to it says what is missing.
- Help icons next to headings and settings explain each option.
- **Close** (or **Esc**) closes the wizard. Your progress stays (see [What is saved](#what-is-saved)).

### Undo and redo

Every change you make in the wizard can be undone.

| Action | Button (title bar) | Keyboard |
|---|---|---|
| Undo | **Undo** | **Ctrl+Z** (**Cmd+Z** on a Mac) |
| Redo | **Redo** | **Ctrl+Shift+Z** or **Ctrl+Y** (**Cmd** on a Mac) |

The shortcuts don't act while you type in a text field or while processing runs. After an undo or redo, a note at the bottom names the setting that changed; **Show change** takes you to it.

**Start over** in the title bar clears the uploaded file and all settings after you confirm.

## Step 1: Upload Data

Drag a CSV file onto the upload area, or click **Browse Files**. Files can be up to 50 MB. To try the wizard without a file of your own, click **Try with sample data** (Wine Quality, red).

Once the file is loaded, the step shows **Data Loaded Successfully** with the file name, size, number of rows and columns, a **Data Quality** score, the number of duplicate rows (if any) and a preview of the first 10 rows. **Upload Different File** replaces the file.

## Step 2: Select Columns

The table lists every column with its missing values, detected **Data Type**, **Use as** role, count, number of unique values and a small distribution chart.

- Tick the columns you want to keep. **Shift-click** selects a range. The checkbox in the header toggles all visible columns.
- Search by name or type (press **/** to jump to the search field), or filter by type.
- Mostly empty columns (more than 50 % missing) and constant columns (a single value) are **Auto-deselected**. Hover over the badge for the reason, and tick the column again if you need it.

You need at least one feature column to continue.

### Feature or metadata

**Use as** decides what a column becomes:

| Role | In the dashboard |
|---|---|
| **Feature** | Encoded and scaled. Can feed the projection, the glyphs, the colour and the histogram filters. |
| **Metadata** | Kept as its original text. Shown in the tooltip, found by the text search and included in the CSV export, but never encoded or projected. |

Text and ID columns start as metadata. So do text, categorical and ID columns whose values are almost all different (90 % or more unique, in columns with more than 20 values), such as names, titles or free text. Encoding those would create one feature per distinct value. Making a column metadata also removes it from the glyph and colour settings.

## Step 3: Configure Data & Features

Pick a column in **DATASET COLUMNS** on the left; its settings appear on the right. Search the list (press **/**), filter it by type, or tick **Issues** to show only columns with missing values or outliers. Only feature columns are listed.

| Setting | Options | Available for |
|---|---|---|
| **Encoding** | **None**, **Label** (integer codes), **One-Hot** (one column per value), **Normalize** (to 0–1), **Standardize** (z-score); which ones depends on the type | Numeric, categorical, text, boolean |
| **Scaling** | **None**, **Standard** (z-score), **Min-Max** (0–1), **Robust** (IQR-based) | Numeric, date and coordinate columns |
| **Missing Values** | **Keep**, **Remove Rows**, **Fill Mean**, **Fill Median** (numbers), **Fill Mode** (categories), **Fill Value** (enter a value) | Columns with missing values |
| **Outliers** | **Detection Method** (IQR 1.5×/2.0×/3.0× or Z-Score 2σ/3σ/4σ) and what to do: **Keep**, **Remove** (delete the rows) or **Cap** (limit to the bounds) | Numeric and coordinate columns |

Each column starts with smart defaults that depend on its type, for example Min-Max scaling for numbers. A short hint below a setting shows its effect on your data, such as the new value range or how many rows a rule removes. **Reset** restores the default of one setting; **Reset to defaults** restores the whole column.

## Step 4: Projection

**Projection Columns** (left): choose which feature columns feed the dimensionality reduction. Text and ID columns are excluded by default. Expand a column to see its encoding, scaling and missing-value settings from Step 3.

**Projection Methods** (right): **FastMap** always runs and gives you the first layout. Tick any further methods to compute them in the background:

| Method | Speed | Suited to | On by default |
|---|---|---|---|
| PCA | Very Fast | any size | Yes |
| TriMap | Fast | up to 100K rows | |
| MDS | Medium | up to 5K rows | |
| IsoMap | Medium | up to 5K rows | Yes |
| LTSA | Medium | up to 20K rows | |
| TopoMap | Medium | up to 8K rows | |
| UMAP | Slow | up to 100K rows | |
| Sammon | Slow | up to 5K rows | |
| t-SNE | Very Slow | up to 15K rows | |

Hover over a method for an animated preview of how it arranges data. Methods with parameters have a **Configure parameters** button: IsoMap and LTSA take a neighbour count (0 = automatic), UMAP takes **Number of Neighbors** and **Minimum Distance**, and t-SNE takes **Perplexity** and **Iterations**. **Reset** restores a method's defaults. For datasets with more than 10,000 rows, a warning icon marks the methods that may be slow.

You need at least one projection column to continue.

## Step 5: Glyphs & Color

These settings define the dashboard's initial view. You can change them later in the sidebar's **Encoding** panel ([Encoding and filters](encoding-and-filters.md)).

- **Color attribute** and **Color scale:** the feature that colours the items, and its colours.
- **Glyph Features:** the 3 to 12 features a glyph shows, in order. Click a feature under **Available features** to add it, or drag it. Reorder with **Move up** / **Move down** (or by dragging), and remove with **Remove feature**. The bar next to each feature shows its variance.
- **Smart Suggestions** picks the five features with the most variation.
- **Glyph Preview** shows how a glyph will look.

## Step 6: Review & Process

The summary cards show the columns, projection and glyph settings, each with an edit button that takes you to the right step. A table lists the selected columns: features with their type, encoding, scaling and whether they are in the projection, and metadata columns marked "Metadata — tooltip and search only". Deselected columns are left out.

If something is likely to fail (for example a neighbour count that isn't below the number of rows), a **Heads up** box lists it. You can start anyway or fix it first.

Click **Start Processing**. The wizard cleans and encodes the data, then computes FastMap. When **Your visualization is ready** appears:

- **Open in Glyphspace** loads the dataset into the dashboard and saves it in your browser.
- **Reprocess** runs the projections again with the current settings.
- **Process Another Dataset** starts over with a new file.

If processing fails, the step explains the cause and how to fix it, with a button that takes you to the step concerned. Your file and settings are kept. See [Troubleshooting](troubleshooting.md).

### Background projections

The methods you ticked in Step 4 run in the background, each on its own, while you can already explore the FastMap layout. Under **Background Projections**, each one shows its progress and can be cancelled (**Cancel**) or, after a failure or a cancel, run again (**Retry**). **Stop all background projections** cancels the rest.

They keep running after you click **Open in Glyphspace**. Each finished projection appears in the canvas settings under **DIMENSIONALITY REDUCTION** (see [Dashboard](dashboard.md#canvas-settings)), and a notification says it is ready. If one fails, a notification says so, and the other projections are not affected.

## What is saved

| What | Where | Kept until |
|---|---|---|
| Wizard settings and the current step | Your browser's local storage | You click **Start over**, open the dataset with **Open in Glyphspace**, or clear the site data |
| The uploaded CSV file | The page's memory | You reload or close the page |
| Datasets opened with **Open in Glyphspace** | Your browser's IndexedDB | You delete the dataset (**Delete this dataset** in the menu bar) or clear the site data |

Imported datasets appear in the **Data** menu marked **(uploaded)**, also after a reload. They are stored only in the browser you used.

Thumbnail images can't be added through the wizard, so the **Thumbnails** glyph type shows grey placeholders for imported datasets. Bundled datasets can include images; see [Preparing data](preparing-data.md#thumbnails).
