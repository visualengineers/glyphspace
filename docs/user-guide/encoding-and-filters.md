# Encoding and filters

_For people exploring a dataset in GlyphSpace._

The sidebar on the right of the screen controls what the glyphs show and which items stand out. Its icon strip opens three panels: **Encoding**, **Style** and **Filters**. Clicking the icon of the open panel collapses the sidebar; clicking any icon opens it again. Every setting applies to all canvases.

## Sidebar header

The header shows the name of the open panel and the number of items: **N items** when nothing is filtered, or **visible / total** when filters are active.

When any filter is active, a **N active** button appears in the header. It opens the list of **Active filters**: search terms, feature filters (by feature name) and the canvas selection (**N selected**). Remove a single entry with its close button, or everything with **Clear all**.

## Encoding

| Control | What it does |
|---|---|
| Glyph preview | Draws one item with the current settings. It shows the item under the mouse while you hover over a canvas. |
| **GLYPH AXES** | The features a glyph shows, one axis (or petal or spoke) each. The counter reads **n of m**. Tick or untick a feature to add or remove it; selected features are listed first. |
| **COLOR ATTRIBUTE** | The feature that colours the items. |
| **COLOR SCALE** | The colours used for it. |

The colour scales:

| Group | Scales | Use for |
|---|---|---|
| Diverging color scales | Diverge, Spectral | Numeric features |
| Sequential color scales | Viridis, Plasma | Numeric features |
| Categorical color scales | Observable10, Tableau20 | Categorical features |

If you pick a colour attribute whose type doesn't fit the current scale (a categorical feature with a numeric scale, or the other way round), the scale switches to the first scale of the matching type.

The import wizard sets the initial glyph features, colour attribute and scale. You can change all of them here at any time.

## Style

| Control | What it does |
|---|---|
| **GLYPH TYPE** | **Star Shape**, **Flower Shape**, **Whisker Shape** or **Thumbnails**. See [Points and glyphs](dashboard.md#points-and-glyphs). |
| **GLYPH OPTIONS** | Toggles for the glyph drawing: **Coordinate System**, **Circle Background** and **Contour**. |

## Filters

Filters never remove items from the canvases. Items that don't match turn light grey and are drawn behind the others. **Export** in the menu bar downloads only the matching items.

### Text search

Type into **Text search in features...** and press **Enter**. The term is added to a list, which appears below the field while it has focus; remove a term there with its close button, or clear all terms with the button inside the field.

- The search matches parts of words and ignores case.
- It looks at the original values of all features and of the metadata columns (text kept for the tooltip, see [Importing data](importing-data.md#feature-or-metadata)).
- With several terms, an item matches if it contains any one of them.

### Histograms

The panel shows one histogram per feature, labelled with the feature name and its type.

- **Numeric features:** drag across the histogram to keep a range. Bars outside it turn grey. Click outside the brushed range to remove the filter.
- **Categorical features:** each bar is one category. Click bars to keep those categories; click again to drop one. A categorical feature with more than 40 categories is shown as a numeric histogram instead.
- Hover over a bar to see its range or category.
- The bars of the current colour attribute use its colour scale; all other histograms are grey.
- When items are selected in a canvas, each bar shows the share of selected items in blue.

### How filters combine

An item stays coloured only if it passes every active filter: each histogram, the text search and the canvas selection. Within one filter, it is enough to match one of its parts: any search term, any of the clicked categories, or a selection in any canvas.

Switching datasets in the **Data** menu clears all filters.
