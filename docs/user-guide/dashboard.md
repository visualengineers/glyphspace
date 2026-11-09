# Dashboard

_For people exploring a dataset in GlyphSpace._

The dashboard is the grid of canvases in the middle of the screen. Each canvas shows the same items in a projection of its own. Filters, selection and the colour mapping apply to every canvas at once. For the sidebar, see [Encoding and filters](encoding-and-filters.md).

## Choosing a dataset

Pick a dataset in the **Data** menu of the menu bar. Switching datasets clears all filters. Datasets you imported are marked **(uploaded)**. For those, a **Delete this dataset** button appears next to the menu; it asks for confirmation and cannot be undone. Bundled datasets can't be deleted.

## Canvases

| Control | Where | What it does |
|---|---|---|
| **Add** | Menu bar, **Canvas** | Adds a canvas. Up to four; the grid rearranges itself. |
| **Fit all** | Menu bar, **Canvas** | Fits every canvas to its content. |
| **Fit to screen** | Top right of a canvas | Fits this canvas to its content. |
| **Maximize canvas** / **Restore canvas** | Top right of a canvas | Shows this canvas alone, or returns to the grid. |
| **Remove canvas** | Top right of a canvas | Removes the canvas. Disabled when only one is left. |

### Canvas settings

The bar at the top of each canvas shows **Pos:** (the projection), **Time:** (the dataset version, if there is one) and **Color:** (the colour attribute, with its colour scale). Click **Pos:** to open the canvas settings:

- **TIME STAMP:** the dataset version to show.
- **DIMENSIONALITY REDUCTION:** the projection this canvas uses, e.g. `pca`, `umap`, `tsne` or, for imported data, `fastmap` and the methods you chose in the wizard. Changing it moves the items to their new positions in an animation.
- **BACKGROUND PROJECTIONS:** right after an import, the projections that are still being computed. Each finished one is added to **DIMENSIONALITY REDUCTION**.
- **TRANSITION SPEED AND PLAYBACK:** the speed of that animation (**−** / **+**) and a play/pause button for it.
- **Avoid collision:** pushes overlapping items apart. Turning it off (or fitting the canvas) moves them back.
- **Aggregate items:** merges items that lie close together. In the zoomed-out view, each group is drawn as a single ring.

## Navigating

Three mode buttons appear in a canvas while the mouse moves over it (they hide again 2 seconds after the mouse stops):

| Mode | Key | What the mouse does |
|---|---|---|
| **Navigation Mode** | **N** | Drag to pan. Hover shows a tooltip. Click an item to show and pin its tooltip; click it again, or click empty space, to close it. |
| **Magic Lens** | **L** | A round lens follows the cursor and shows the items under it as full-size glyphs. |
| **Selection Mode** | **S** | Click or drag to select items. |

- **Zoom:** scroll wheel, centred on the cursor. On a touch screen, drag with one finger to pan and pinch with two to zoom. Wheel zooming is paused while a tooltip is pinned or the magic lens is on; pinching still zooms.
- **Fit:** **F**, or the **Fit to screen** button.

Keys only act while the mouse is over the canvas and has moved within the last 2 seconds, and you aren't typing in a text field.

| Key | Action |
|---|---|
| **N** | Navigation mode |
| **S** | Toggle selection mode |
| **L** | Toggle the magic lens |
| **F** | Fit to screen |
| **C** | Toggle **Avoid collision** |
| **A** | Toggle **Aggregate items** |

## Points and glyphs

How an item is drawn depends on the zoom level:

| Zoom | Drawn as |
|---|---|
| Zoomed out (fitted view) | A coloured dot |
| Zoomed in | The selected glyph type |
| Zoomed in further | A larger glyph of the selected type |

The size of the dots and glyphs is set with **Size** in the sidebar's **Encoding** tab. The glyph type is chosen there too, under **GLYPH TYPE**:

| Glyph type | Button | Shape |
|---|---|---|
| Star | **Star** | A radar chart: one axis per glyph feature; the outline connects the values. |
| Flower | **Flower** | One petal per glyph feature; petal length shows the value. |
| Image | **Image** | The item's image, for datasets that include images: `wineqr`, or a dataset imported with a ZIP of item images (see [Importing data](importing-data.md#step-1-upload-data)). For other datasets the button is greyed out, and a dataset without images opens with **Star**. |

Which features a glyph shows, and in which order, is set in the glyph legend at the top of the sidebar ([Encoding and filters](encoding-and-filters.md#glyph-legend)). Axis 1 points up and the others follow clockwise. The colour comes from the feature chosen under **COLOR BY**. Items that don't match the current filters or selection are drawn in light grey and behind the others, at every zoom level.

When you hover over an item, the same item is highlighted in the other canvases. Hovering also shows the item in the glyph legend.

## Tooltip

Hover over an item for a moment and a tooltip appears, titled **Item:** with the item's ID. It lists the original value of every feature; missing values show as **missing**. Metadata columns (text kept for reference, see [Importing data](importing-data.md#feature-or-metadata)) follow in a separate group below.

Click an item to show its tooltip right away and pin it, so you can move the mouse without losing it. Clicking another item shows that item's tooltip instead; clicking the same item again, or empty space, closes it.

## Magic lens

Turn the lens on with the **Magic Lens** button or **L**. It shows the items near the cursor as large glyphs, in the same arrangement as on the canvas, spread out just enough not to overlap, even where the canvas is crowded or zoomed out. The fewer items, the larger they are drawn. The lens shows up to 30 items, those nearest the cursor; where more are under it, the ring around the cursor shrinks to the area the lens shows. The same items are enlarged in the other canvases.

- **Click** to pin the lens in place (the canvas dims). Then hover over the glyphs inside the lens to see their tooltips.
- **Click again** to release it.
- Moving the mouse out of the canvas closes the lens unless it is pinned.

## Selecting items

In **Selection Mode** (**S**):

- **Click an item** to add it to the selection, or remove it again.
- **Drag a rectangle** to select the items inside it. This replaces the current selection; hold **Shift** while you drag to add to it.
- **Click empty space** to clear the selection.

Selected items keep their colour; all others turn grey in every canvas. The selection is listed among the active filters under **FILTERS** in the sidebar (**N selected**). The histograms in the **Filters** tab highlight the share of selected items in each bar.

## Exporting

| Button | Result |
|---|---|
| **Export** (menu bar) | A CSV of all items that are currently not greyed out: the ID, the original feature values and then the metadata columns. The file name contains a timestamp, the dataset name and the number of items. |
| **Screenshot** (menu bar) | One PNG per canvas, at twice the screen resolution. |
