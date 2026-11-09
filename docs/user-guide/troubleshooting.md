# Troubleshooting

_For people whose import fails or whose dashboard doesn't behave as expected._

## When processing fails

If processing in Step 6 fails, the wizard shows **We couldn't finish your visualization — but this is fixable.** Your file and settings are kept. The card below it names the cause, explains why it happened and what to do:

- **Fix in step N** takes you to the setting concerned.
- **Technical details** shows the original error message.
- **Try again** restarts processing; **Back to settings** returns to the previous step.

Each problem has a code (K1–K8):

| Code | What you see | Why | What to do |
|---|---|---|---|
| K1 | A projection column still contains text values | Text or categorical values without a matching encoding reached the projection, which needs numbers. | Set an encoding for that column in Step 3, or remove it from the projection in Step 4. |
| K2 | No rows were left after cleaning | The missing-value, outlier or duplicate rules removed every row. | Loosen the cleaning rules in Step 3. |
| K3 | A column has no usable values | A selected column is constant or almost entirely empty. | Deselect it in Step 2. |
| K4 | A projection parameter is out of range | A neighbour count (IsoMap, LTSA or UMAP) is larger than the number of rows. | Lower the parameter or turn the method off in Step 4. |
| K5 | The number of glyph features is out of range | A glyph needs 3 to 12 features. | Adjust the glyph features in Step 5. |
| K6 | Processing hit a time or resource limit | The dataset is too large for the time limit or the memory available in the browser. | Use fewer columns in Step 2, or fewer methods in Step 4. |
| K7 | A column has too many distinct values to encode | A text column has nearly as many different values as rows (an ID, title, name or free text). Encoding it would create thousands of columns. | Set it to **Metadata** in Step 2, or set its encoding to **Label** in Step 3. |
| K8 | A fill value does not match its column | The fill value for missing entries is not a number, but the column is numeric. | Enter a number, or pick another missing-value strategy in Step 3. |

If the cause can't be identified, the card reads **We couldn't finish processing your data**. Start processing again; if it keeps failing, set text-heavy columns to **Metadata** and deselect mostly empty columns in Step 2, then turn off the more demanding methods (t-SNE, UMAP, Sammon) in Step 4.

### Warnings before processing

Step 6 checks your settings before you start. A **Heads up** box lists likely problems with the same codes: constant or mostly empty columns still in the projection (K3), neighbour counts larger than the number of rows (K4), and slow methods (t-SNE, Sammon, UMAP) on a large dataset (K6). You can start anyway or fix them first.

### A background projection fails

If one of the additional projections fails, a notification reads **METHOD could not be computed**, and a warning card in Step 6 explains why. The dataset still works with FastMap and every projection that succeeded. Use **Retry** next to the method under **Background Projections** to run it again.

## Upload and wizard problems

| Problem | Solution |
|---|---|
| **Please upload a CSV file.** | The file name must end in `.csv`. |
| **File size exceeds 50MB limit** | Drop columns or rows before importing. See [Preparing data](preparing-data.md). |
| **The sample data could not be loaded.** | Try again, or upload your own CSV file. |
| Importing doesn't work offline | The wizard downloads its Python runtime (Pyodide) from the jsDelivr CDN. Check your internet connection and that `cdn.jsdelivr.net` isn't blocked. |
| **Please select at least one column to continue** (Step 2) | Tick at least one column. |
| **Use at least one column as a feature to continue — metadata alone cannot be projected** (Step 2) | Set at least one column's **Use as** to **Feature**. |
| **Include at least one column in the projection to continue.** (Step 4) | Tick at least one column under **Projection Columns**. |
| **Select 3–12 glyph features to continue.** (Step 5) | Add or remove glyph features. **Smart Suggestions** picks a valid set. |
| Processing or the outlier counts fail after the page was reloaded | The wizard restores its settings after a reload, but not the uploaded file: it is kept only while the page is open. Upload the file again in Step 1. This resets the column settings. |
| **Ctrl+Z** doesn't undo | The shortcuts don't act while the cursor is in a text field or while processing runs. Use the **Undo** button in the title bar. |

## Dashboard problems

| Problem | Solution |
|---|---|
| A notification reads **Failed to load dataset "name"** | A bundled dataset's files couldn't be loaded. If you added or removed dataset files, regenerate the dataset list with `python tools/process.py` (see [Preparing data](preparing-data.md#remove-a-dataset)). |
| An imported dataset is missing from the **Data** menu | Imported datasets live in the browser they were imported in. Clearing the site data, a private window or another browser starts empty. Import the CSV again. |
| Scrolling doesn't zoom | Zooming is paused while a tooltip is pinned or the magic lens is on. Click the item again to release the tooltip, or press **L** to close the lens. |
| No tooltip appears | Tooltips show in **Navigation Mode** (press **N**). Hold the mouse still over an item for a moment. |
| Keyboard shortcuts don't work | Keep the mouse over the canvas, and click outside any text field first. |
| **Thumbnails** shows grey squares | The dataset has no images. Thumbnails exist only for bundled datasets that provide them (see [Preparing data](preparing-data.md#thumbnails)). |
| **Export** downloads fewer rows than expected | It exports only the items that pass the current filters and selection. Clear them with **Clear all** in the sidebar header. |
| **Add** (canvas) is disabled | There can be at most four canvases. Remove one first. |
