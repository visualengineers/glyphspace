# Encoding and filters

_For people exploring a dataset in GlyphSpace._

The sidebar on the right of the screen controls what the glyphs show and which items stand out. Its top part, the glyph legend and the **FILTERS** dropdown, always stays in view. Below it are two tabs: **Filters** (open at the start) and **Encoding**. Every setting applies to all canvases.

The double chevron in the top right corner (**Hide sidebar**) collapses the whole sidebar. A handle at the right edge of the screen (**Show sidebar**) brings it back.

## Glyph legend

The header **GLYPH LEGEND · n / 8** counts the glyph's axes. Below it, the legend draws one item's glyph with a numbered label at each axis: at first an item with long axes, then the item you last hovered over in a canvas. Axis 1 points up and the others follow clockwise, in the same order as in the glyphs on the canvases.

- **Remove an axis:** click its label to select it, then click **×** next to it. **Esc** drops the selection.
- **Add an axis:** click **+ Add axis**, search the list of the other features (**Search features…**) and click one. It becomes the last axis. **Close** closes the list.

A glyph has 3 to 8 axes. At a limit, the control is disabled and the hint next to **+ Add axis** says why, for example **Limit of 8 axes reached. Remove one to add another.** The import wizard takes 3 to 8 glyph features as well. A dataset imported with more, by an older version, keeps them until you remove some.

With the **Image** glyph type there are no axes: the header reads **n/a** and the legend shows **Image glyphs** with a short note instead.

## Active filters

**FILTERS** below the legend shows the number of active filters. Next to it, **matching / total** counts the items that pass them.

Click **FILTERS** to list the active filters: search terms (in quotes), feature filters (by feature name) and the canvas selection (**N selected**). Remove a single entry with its **×**, or everything with **Clear all**.

## Filters

Filters never remove items from the canvases. Items that don't match turn light grey and are drawn behind the others. **Export** in the menu bar downloads only the matching items.

### Text search

Type into **Text search in features…** and press **Enter**. The term is added to a list, which appears below the field while it has focus; remove a term there with its close button, or clear all terms with the button inside the field. The terms are also listed under **FILTERS**.

- The search matches parts of words and ignores case.
- It looks at the original values of all features and of the metadata columns (text kept for the tooltip, see [Importing data](importing-data.md#feature-or-metadata)).
- With several terms, an item matches if it contains any one of them.

### Feature cards

The tab shows one card per feature, labelled with the feature name and its type, with a histogram.

- **Numeric features:** drag across the histogram to keep a range. Bars outside it turn grey. Click outside the brushed range to remove the filter.
- **Categorical features:** each bar is one category. Click bars to keep those categories; click again to drop one. A categorical feature with more than 40 categories is shown as a numeric histogram instead.
- Hover over a bar to see its range or category.
- The bars of the feature chosen under **COLOR BY** use its colours (with a categorical palette, in the same order as the glyphs); all other histograms are grey.
- When items are selected in a canvas, each bar shows the share of selected items in blue.

A card of a glyph feature shows a star or flower icon, like the glyph type, with its axis number; click the icon to remove the feature from the glyph. The other cards show the icon only while you hover over the card or focus the icon; click it to add the feature as the last axis. The 3 to 8 axis limit applies here too. With the **Image** glyph type the cards have no icons.

### How filters combine

An item stays coloured only if it passes every active filter: each histogram, the text search and the canvas selection. Within one filter, it is enough to match one of its parts: any search term, any of the clicked categories, or a selection in any canvas.

Switching datasets in the **Data** menu clears all filters.

## Encoding

| Control | What it does |
|---|---|
| **GLYPH TYPE** | **Star**, **Flower** or **Image**. See [Points and glyphs](dashboard.md#points-and-glyphs). |
| **COLOR BY** | The feature that colours the items. Each option shows the feature's type, such as **(numeric)**, or its number of categories, such as **(5 categories)**. |
| Colour scale (below **COLOR BY**) | The colours used for it. With a categorical palette, a hint says how many categories get a colour of their own. |
| **APPEARANCE** | Toggles for the glyph drawing: **Coordinate system**, **Circle background** and **Contour**. |
| **Point size** | Diameter of the dots at 100 % zoom: 2 to 20 px, 6 px at the start. |
| **Glyph size** | Diameter of the glyphs in the magic lens: 16 to 120 px, 48 px at the start. The glyphs on the canvases grow and shrink with it. |

The colour scales:

| Group | Scales | Use for |
|---|---|---|
| Diverging color scales | Diverge, Spectral | Numeric features |
| Sequential color scales | Viridis, Plasma | Numeric features |
| Categorical color scales | Glasbey (12 colours), Tableau 10 (10), Colorblind (8, from seaborn's colour-blind palette) | Features with categories |

The categorical palettes contain no grey, because grey marks filtered-out items. Categories take the colours in order: the first category gets the palette's first colour, the second the second, and so on. With more categories than colours, the colours repeat, and the hint below the scale says so.

If you pick a feature whose type doesn't fit the current scale (a feature with categories and a numeric scale, or the other way round), the scale switches to the first scale of the matching type.

The import wizard sets the initial glyph features, colour feature and scale. You can change all of them in the sidebar at any time.
