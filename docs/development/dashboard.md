# Dashboard

_For contributors changing the canvases, glyphs, filters, sidebar or menubar._

Paths are relative to `src/app/` unless they start with `src/`, `tools/` or `docs/`.

The dashboard is everything outside the wizard: the canvas grid, the sidebar and the menubar. For what users see, read [user-guide/dashboard.md](../user-guide/dashboard.md); for how the data gets here, [architecture.md](architecture.md).

## Layout

`AppComponent` renders the menubar, a CSS grid of `GlyphCanvasComponent`s, the sidebar and the toast outlet. The grid holds one to four canvases (`addCanvas` stops at four): rows are `floor(√n)`, columns `ceil(n / rows)`. `+` and `-` add and remove a canvas; the settings overlay removes a specific one through `ConfigService.removeCanvas(id)`. One canvas can be maximised, which hides the others.

All canvases show the same dataset, filters and selection. Each canvas chooses its own projection and has its own camera.

## The glyph model

| Class | File | One per | Holds |
|---|---|---|---|
| `GlyphObject` | `glyph/glyph-object.ts` | Data item, shared by all canvases | `id`; `features[context][featureId]` (normalised values); `values` (original values by feature id); `metadata` (original values of metadata columns); `positions[timestamp][algorithm]` (raw projection coordinates); `passive` (filtered out); `highlighted` (hovered); `renderCache` |
| `GlyphCacheObject` | `glyph/glyph-cache-object.ts` | Item and canvas | Scaled position (`position`), d3 simulation state (`x`, `y`, `vx`, `vy`), the current `mesh`, `visible`, `isClustered`, `isClusterRepresentative` |
| `GlyphConfiguration` | `glyph/glyph-configuration.ts` | App (inside `ConfigService`) | Glyph type (default Star), the appearance toggles and the item size. The Encoding tab offers `useCoordinateSystem`, `useBackground` and `useContour` (its `glyphOptions`) and a slider for `itemSize` in px, which the setter rounds and clamps to `ITEM_SIZE_PX` (2–20, default 6) from `glyph/glyph-size-info.ts`; `useLabels`, `useCategories` and `scaleLinear` have no UI |
| `GlyphRenderConfig` | `glyph/glyph-render-config.ts` | Render call | A plain snapshot of the `ConfigService` state that rendering needs, built by `buildGlyphRenderConfig(config, thumbnails)`. It keeps `GlyphObject` free of Angular services; images come through its `ThumbnailResolver` ([Thumbnails](#thumbnails)) |
| `GlyphSizeInfo` | `glyph/glyph-size-info.ts` | Canvas (and magic lens) | Radius, contour thickness and hit tolerance for each zoom level. `setSizes(itemSize, reach)` sets the radii: low (the dot) is half the item size; medium and high are the same glyph radius, `pointRadius × GLYPH_REACH_IN_POINT_RADII / reach`, so a typical glyph reaches two dot radii ([ADR 0010](../decisions/0010-one-size-for-points-and-glyphs.md)). `reach` is `typicalGlyphReach` (`glyph/glyph-reach.ts`): the median longest axis of the items as a fraction of the radius, at least 0.25; 1 for Image glyphs. The canvas calls `setSizes` when a dataset is loaded and on every configuration change, axes included (`GlyphCanvasComponent.applyGlyphSizes`), and, if a size changed, updates the collision force and the spatial grid. The hit tolerances still depend on the device pixel ratio |

**The render cache is keyed by canvas id only.** `GlyphObject.getCacheObject(owner, timestamp, algorithm)` uses `timestamp` and `algorithm` only when it creates the cache object. When a canvas switches projection, `GlyphCanvasComponent.onSettingsChange` rewrites `position`, `x` and `y` of the existing cache objects. Any new way of changing positions has to do the same. A destroyed canvas removes its entries with `glyph.clearCache(id)`.

**State on `GlyphObject` is shared.** `passive` and `highlighted` live on the item, not on the canvas, so a filter or a hover shows in every canvas.

## Zoom levels and how glyphs are drawn

`CanvasCameraService.calculateZoomLevel` maps the camera zoom to a `ZoomLevel` (`shared/enum/zoom-level.ts`): below 2 is `low`, below 10 `medium`, from 10 `high`. Wheel and pinch zoom are clamped to 0.5–50. When the level changes, the canvas updates `GlyphSizeInfo`, rebuilds the spatial grid and re-renders every glyph.

`GlyphObject.renderGlyph` decides what to draw:

- **Low:** a flat circle in the item's colour, using geometries and materials cached in `glyph/renderers/shared-rendering.ts`. With aggregation on, a cluster's representative is drawn as a ring and the other members are left out.
- **Medium and high:** the renderer registered for the configured `GlyphType` (`glyph/renderers/glyph-renderer-registry.ts`): Star (`radar-chart.renderer.ts`) and Flower (`flower-glyph.renderer.ts`). Image glyphs (`GlyphType.Thumb`, `thumbnail.renderer.ts`) are created per item because they load an image. A type without a renderer falls back to Flower. At high zoom the shared helpers (`glyph/renderers/shared-rendering.ts`) add a background disc, axes and a contour ring, if those appearance options are on. The disc and ring are opaque, so they are drawn behind the semi-transparent glyph shape; the axis lines are `0.015 × radius` wide.

**Keep glyphs cheap to build.** A zoom-level change rebuilds every glyph in one go, which blocks the page for as long as it takes (about 0.4 s for 7,600 flowers). So a glyph is few objects: a flower is one mesh for all petals (`ShapeGeometry` of several shapes) and one `Line2` for all outlines, the latter only at high zoom, where it is visible. Contour `LineMaterial`s are shared per colour and width (`getCachedContourMaterial`); they are transparent, and three.js sorts transparent objects by depth, so sharing doesn't change the drawing order. The axis spokes share one merged geometry per axis count (`getCachedSpokesGeometry`) but keep a material per glyph: three.js sorts opaque objects by material, and a shared axes material would be drawn before every glyph's background disc.

**Glyph geometry.** `glyph/glyph-geometry.ts` holds the geometry that every glyph drawing shares: the three.js renderers, the sidebar's legend and icons, and the wizard's Step 5 preview. `axisAngle(i, n)` puts axis 0 at the top and the others clockwise. The axes follow the order of `ConfigService.activeFeatures` (`GlyphObject.getFeatureContext`), so an added feature becomes the last axis. `axisLength` gives the axis length as a fraction of the radius (`linearScale ? value : value / featureMax`). The flower petal (`traceFlowerPetal`, `flowerPetalSvgPath`) is Glyphboard's: a B-spline (`d3.curveBasis`) through seven control points along the axis, 23 % as wide as long.

**Colour.** `featureColor` (`shared/helpers/color-helper.ts`) colours the colour feature's value (context `1`) with the selected scale from `COLOR_SCALES` (`shared/interfaces/color-scale.ts`). Under a categorical palette, a feature with categories (`ConfigService.featureCategoryCounts`) takes the colours in category order: `categoryIndex` recovers the code from the normalised value, `paletteColor` picks colour `code mod palette size`. Every other value goes through `normalizeFeatureValue`, which divides categorical values by the feature's maximum, and then through the scale. `ConfigService.getRgbaColor` (the legend's colour) uses the same mapping, and the bars of a categorical histogram take the palette colours in the same order (`HistogramComponent.getBarColor`). Hovered items are drawn in `0x9b274d`, passive items in `0xe0e0e0` with a lower `renderOrder` (1 instead of 99) so active items stay on top. Passive glyphs are grey at every zoom level. At high zoom a hovered glyph keeps its data colour; its background disc is tinted instead.

**Positions.** `scalePosition` (`shared/helpers/three-helper.ts`) maps the raw coordinates of the selected projection into canvas space so that the data fills the canvas width and height. The aspect ratio of the projection is not preserved.

**Feature contexts.** The dataset format allows several feature contexts (`variantcontext` in the schema), but the dashboard reads context `1` only: `GlyphObject.currentContext` is fixed at 1 and the colour code reads `features['1']`. There is no UI to choose a context.

## Render loop and render tasks

There is no permanent animation loop. `CanvasRendererService.requestRender(task)` adds a `RenderTask` (`shared/enum/render-task.ts`) to `needsRender` and starts `GlyphCanvasComponent.animate` if it isn't running. `animate` runs while the set is non-empty and stops itself afterwards. `cancelRender` removes a task one frame later, so the frame that finishes the task is still drawn.

| Task | Used for |
|---|---|
| `FitAnimation` | Easing the camera to fit all glyphs (500 ms). With more than 5,000 glyphs the camera jumps instead. |
| `SceneRender` | A single frame, after any change. |
| `GlyphAnimation` | Pulsing the item hovered in another canvas (low zoom only). |
| `ForceSimulation` | Collision avoidance: a d3 `forceCollide` simulation with the high-zoom radius, 50 ticks. |
| `OriginalSimulation` | Moving glyphs back to their target positions: after collision avoidance, and as the animation when a canvas switches projection. |

Each frame `animate` also updates the camera's view rectangle and calls `CanvasRendererService.updateClipping`. Clipping runs every second frame and only when the view moved by at least half a glyph radius; glyphs outside the view are marked invisible and are left out by the next non-forced `renderGlyphs`, glyphs entering the view are rendered. With more than 500 glyphs, clipping and hit testing use the `SpatialGrid` (`shared/helpers/spatial-grid.ts`), whose cell size targets about 100 items per cell.

`renderGlyphs` is throttled: calls less than 50 ms apart (`MIN_RENDER_INTERVAL_MS`) collapse into one trailing call, unless `force` is set. Changes that alter every glyph's geometry (configuration change, zoom level change, fit) pass `force`.

## Events between components

Components talk through subjects on `ConfigService` rather than calling each other:

| Subject | Emitted when | Canvases react by |
|---|---|---|
| `loadedDataSubject$` | A dataset is chosen (`loadData`) | Loading the dataset and fitting it into view |
| `glyphConfigSubject$` | Glyph type, appearance, sizes, axes or colour change (`updateConfiguration`) | Taking over the sizes, then force re-rendering every glyph (and the magic lens) |
| `commandSubject$` with `InteractionCommand.redraw` | Filters or selection changed (`redraw`) | Re-rendering every glyph |
| … `rerender` | `reRender()`, e.g. a thumbnail finished loading | Drawing one frame |
| … `fittoscreen` | Fit all (menubar) | `fitToView()` |
| … `clearselection` | `clearSelection()` | Clearing the canvas's own selection filter and re-rendering |
| … `exportimage` | Save canvas as PNG (menubar) | Downloading `three-scene-<id>.png` at twice the pixel ratio |
| `redrawGlyphSubject$` | One item changed (hover ended, left the magic lens) | Re-rendering that item |
| `animateGlyphSubject$` | An item is hovered in a canvas | Pulsing it in the other canvases; the sidebar's glyph legend shows it |
| `drawMagicLensGlyphsSubject$` | The magic lens content changed | Enlarging the same items in the other canvases |
| `removeCanvasSubject$` | Remove canvas (settings overlay) | `AppComponent` removes that canvas |

## Main flows

### Loading a dataset

1. `ConfigService.loadData(name)` emits. The menubar does this on dataset selection (after `FilterService.clearFilters()`), `DataLoaderService` after an import and at startup. All bundled datasets are requested in parallel; the one shown at startup is the first in `src/default-dataset.ts` order that loads, however the downloads finish (`FirstInOrder`, `shared/helpers/first-in-order.ts`).
2. Each canvas calls `DataLoaderService.getGlyphData(name)`. It takes the `GlyphObject`s from `DatasetCacheService` and gives them to `FilterService` (`setActiveGlyphData`, counts).
3. The canvas takes the timestamps and projections from `DatasetCollectionService` and selects the first of each.
4. It clears the scene, computes the position bounds, and calls `fitToView`: scale positions, rebuild the spatial grid, reset to the low zoom level, render all glyphs, animate the camera.
5. Meanwhile the sidebar calls `getMetaData()`, `getSchema()` and `getGlyphData()`. `getSchema` applies the schema to `ConfigService` through `SchemaConfigSyncService` (below), which sets the colour feature to the new dataset's `schema.color` before the sidebar reads it. So after a dataset switch the colour feature is always the schema's, or the first feature if the schema's doesn't exist. If the selected scale's type doesn't suit that feature (`scaleTypeForFeature`: categorical for a feature with categories or of type `categorical`, numeric otherwise), the sidebar switches to the first scale of the suitable type. The glyph legend shows the item with the longest axes on average (`SidebarComponent.representativeGlyph`) until an item is hovered.

`SchemaConfigSyncService.applySchemaToConfig(schema, meta)` copies `color` → `colorFeature`, `glyph` → `activeFeatures`, `label` → `featureLabels`, `metadata` → `metadataLabels`, `types` → `featureTypes`, and `colorScaleId` → the selected scale. Older schemas without `colorScaleId` use `colorRange`: `true` selects scale 0, `false` scale 4. From the meta it takes the number of `categories` of each feature that has any (`ConfigService.featureCategoryCounts`), which the colour mapping and the sidebar use. The maxima for normalising categorical colours (`ConfigService.featureMaxValues`) are set from the meta file's `max` values when an imported dataset is loaded (`extractFeatureMaxValuesFromMeta`), and recomputed from the items, for categorical features only, whenever `getSchema()` runs (`calculateFeatureMaxValues`).

`DatasetCacheService.buildDataSet` replaces the timestamp it builds. It first removes that timestamp's positions from every item of the dataset and drops items that have no positions left. Then each item of the new data, new or existing, takes the new features, values and metadata, and its render cache is cleared so no mesh of the old values is reused. Features, values and metadata are stored per item, not per timestamp, so an item that also exists under another timestamp shows the values of the last build there too.

### Filtering

Filters are subclasses of `ItemFilter` (`shared/filter/`). Their owners create them and register them once with `FilterService.ensureFilter`:

| Filter | Owner | Mode | Accepts an item when |
|---|---|---|---|
| `TextFilter` | Sidebar search | And | One of its terms is a case-insensitive substring of a feature value or a metadata value |
| `FeatureFilter` | Histogram brush, numeric feature (`sidebar/histogram/`) | And | The normalised value lies in `[min, max]`, both in `[0, 1]`; the brush snaps to bins |
| `CategoryFilter` | Clicked bars of a categorical histogram | And | The value lies in one of its ranges |
| `IdFilter` | Canvas selection, one per canvas (`CanvasSelectionService`) | Or | Its id is in the list |

`FilterService.refreshFilters` sets `passive` on every item of the active dataset: an item stays active when every non-empty And filter accepts it and, if any Or filter is non-empty, at least one Or filter accepts it. With no non-empty filter, every item is active. The caller then calls `ConfigService.redraw()`, and the canvases re-render with the passive colour. Because selections are Or filters, selections made in different canvases add up.

The menubar's Download exports the active (non-passive) items of the current dataset (`services/data-export.service.ts`): an `id` column, the feature columns, then the metadata columns, with original values, all fields quoted, UTF-8 with a byte order mark.

### Selecting

Selection mode is switched with `s` or the navigation overlay (`canvas/navigationcontrols/`). In selection mode:

- A click on an item toggles its id in the canvas's `IdFilter`. Here a click means press and release at the same point: any mouse movement while pressed makes it a rectangle, and there is no time limit. (The 4 px / 300 ms click thresholds in `canvas-constants.ts` only apply outside selection mode, to pin the tooltip and fix the lens.)
- Dragging draws a rectangle. On release, every glyph whose screen position is inside is selected, replacing the previous selection unless Shift is held. A rectangle that contains no glyph clears all id filters.

Both end in `CanvasSelectionService.applyFilters`, which registers the filter as an Or filter, refreshes the filters and calls `redraw()`.

### Hovering and the tooltip

Outside selection mode, `mousemove` hit-tests at most every 50 ms. Below 500 glyphs it tests every mesh in the scene; above, it queries the spatial grid around the cursor first. The closest glyph within the zoom level's hit tolerance (in screen pixels) is highlighted, re-rendered and broadcast through `animateGlyph`. The tooltip (`canvas/tooltip/`) appears after 750 ms and lists the feature values with their labels, then the metadata values. A click does not rely on the hover state, which can lag behind: `GlyphCanvasComponent.fixTooltipAt` hit-tests at the click position and shows that item's tooltip at once, fixed (`TooltipComponent.showFixed`); a click on the fixed item again or on empty space closes it (`release`). The tooltip is rendered through template bindings, so CSV content is escaped. Tooltips are suppressed while `ConfigService.modalOpen` is set (the wizard is open).

### Magic lens

`l` or the navigation overlay toggles the lens (`canvas/magiclens/`). It has its own `WebGLRenderer` on a 300 px canvas that follows the cursor; the lens camera shows world units as pixels. `MagiclensComponent.updateMagicLens` takes the items within 30 screen pixels of the cursor, nearest first, up to the limit: 30, lowered to as few as 10 when rendering gets slow. If it had to leave items out, the ring around the cursor (`indicatorRadius`) shrinks to the distance of the farthest item shown. `layoutLens` (`canvas/magiclens/lens-layout.ts`) places them: one radius for all, so the glyphs stay comparable, chosen so that the glyphs' extents (`glyphExtent`: the longest axis, or 1 with background, axes or images) cover 55 % of the lens; target positions are the canvas positions around their centroid, scaled to the lens; a d3 simulation then pulls each glyph towards its target and pushes overlapping ones apart, deterministically. A click pins the lens and greys the canvas background; hovering items in a pinned lens shows their tooltips. The lens broadcasts its items through `drawMagicLensGlyphs`, and the other canvases draw the same items five times larger (`LENS_ENLARGEMENT_FACTOR`) and push them apart.

### Other canvas modes

Keyboard shortcuts work while the mouse is over the canvas and has moved within the last 2 seconds (`MOUSE_IDLE_MS`), and not in a text field (`checkTextInput`, `shared/helpers/angular-helper.ts`):

| Key | Action |
|---|---|
| `c` | Collision avoidance on/off |
| `a` | Aggregation on/off: `clusterGlyphs` (`shared/helpers/glyph-helper.ts`) groups items within 10 canvas units with a d3 quadtree; visible at the low zoom level |
| `f` | Fit to view |
| `s` | Selection mode |
| `l` | Magic lens |
| `n` | Back to navigation (leaves selection mode and the lens) |
| `x` | Re-render all glyphs |

The settings overlay (`canvas/settingscontrols/`) shows the current projection, timestamp and colour feature, and holds fit, maximise and remove. Its position menu switches the timestamp and the projection, shows the status of background projections, and sets the speed of the transition animation. A projection that finishes in the background appears in its list as soon as the collection grows. Touch input pans with one finger and zooms with two.

## Sidebar

`sidebar/sidebar.component.ts` holds the dataset and glyph state and passes it to its parts; the parts report changes as events, and the sidebar updates `ConfigService`. A fixed header holds the first two parts, two tabs (WAI-ARIA tabs pattern, Filters first) the others. Both tab panels stay mounted, so the histogram filters keep their state while hidden. The collapse button hides the whole sidebar (`collapsed` host class) and an edge handle brings it back.

| Part | Folder | Contents |
|---|---|---|
| Glyph legend | `sidebar/glyph-legend/` | An SVG of one item's glyph with a numbered label per axis: first the item with the longest axes on average, then the last one hovered (`animateGlyphSubject$`). Selecting a label offers its removal; **+ Add axis** opens a searchable list of the other features. Shows a "not applicable" card for Image glyphs. |
| Filter summary | `sidebar/filter-summary/` | The **Filters** dropdown: one entry per search term, per non-empty feature filter (by feature name) and per canvas selection ("N selected"), each with a remove button, plus **Clear all**; next to it `FilterService.filteredItems / totalItems`. |
| Filters tab | `sidebar/filters-tab/` | Text search (Enter adds a term to its `TextFilter`) and one card per feature with its histogram (`sidebar/histogram/`). Cards of glyph features show a star or flower icon (`sidebar/glyph-icon/`) with the axis number that removes the axis; other cards show the icon on hover or focus to add it. No icons for Image glyphs. |
| Encoding tab | `sidebar/encoding-tab/` | Glyph type (its `glyphTypes` list), colour feature and scale, the appearance toggles and the **Size** slider. Choosing a colour feature switches to the first scale of the suitable type (`scaleTypeForFeature`) if the current one doesn't suit it. Slider input redraws at most once per animation frame. |

**Glyph axes.** A glyph has 3 to 8 axes (`MIN_GLYPH_AXES`, `MAX_GLYPH_AXES` in `glyph/glyph-axes.ts`). `ConfigService.addGlyphAxis` appends a feature to `activeFeatures` and `removeGlyphAxis` takes one out; both check the limits with `canAddGlyphAxis` / `canRemoveGlyphAxis` and call `updateConfiguration`. The wizard's Step 5 (`MIN_GLYPH_FEATURES`, `MAX_GLYPH_FEATURES`) uses these constants, and the Python pipeline has the same limits. A dataset imported before the limit was 8 can have up to 12 axes; the sidebar then only lets the user remove axes. `hasFeatureAxes` (`shared/enum/glyph-type.ts`) tells which glyph types have axes (Star and Flower).

## Menubar

`menubar/menubar.component.ts`: dataset selection (clears the filters, then `loadData`), deleting a dataset whose source isn't `local` (after a `confirm`), Upload (opens the wizard and sets `ConfigService.modalOpen`), Download (CSV export), Save canvas as PNG (all canvases), add canvas (disabled at four) and fit all. When the wizard closes, focus returns to the Upload button, or to the menu toggle when the menu is collapsed.

## Toasts and logging

`ToastService` (`services/toast.service.ts`) shows success, error, info and warning toasts; `showUndo` adds an Undo action. `ToastComponent` is rendered once in `AppComponent`. `LoggerService` prints `log` and `warn` only in dev mode; `error` always.

## Shared helpers

| File | Contents |
|---|---|
| `shared/helpers/spatial-grid.ts` | `SpatialGrid<T>`: uniform grid for rectangle and point queries |
| `shared/helpers/glyph-helper.ts` | `getGlyphFromObject` (mesh → `GlyphObject` through a `WeakRef` in `userData`, also through the magic lens's wrapper groups), `clusterGlyphs` |
| `shared/helpers/three-helper.ts` | Hit tests, `screenToWorld`, `panCamera`, `convertToScreenSpace`, `scalePosition`, `exportThreeSceneAsPNG`, the grey placeholder texture for thumbnails |
| `shared/helpers/d3-helper.ts` | `hexToRgb` |
| `shared/helpers/color-helper.ts` | `featureColor`, `categoryIndex`, `normalizeFeatureValue` |
| `shared/helpers/first-in-order.ts` | `FirstInOrder`: picks the first of several parallel jobs, in a fixed order, that succeeds |
| `shared/interfaces/color-scale.ts` | `COLOR_SCALES` (ids 0–3 numeric: Diverge, Spectral, Viridis, Plasma; 6–8 categorical: Glasbey with 12 colours, Tableau 10 with its grey replaced by olive, and seaborn's colorblind palette without grey and yellow, 8 colours; no categorical palette contains grey, which marks passive items). The removed Observable10 (4) and Tableau20 (5) resolve to Glasbey and Tableau 10 (`resolveColorScaleId`). Also `paletteColor`, `scaleTypeForFeature`, `defaultColorScaleId` and lookup helpers |
| `shared/constants/canvas-constants.ts` | Timings and thresholds of the canvas interaction |

## Thumbnails

With the Image glyph type (`GlyphType.Thumb`), `ThumbnailRenderer` shows a grey placeholder and replaces it when the image has loaded. It asks the render config's `ThumbnailResolver` for `requestThumb(dataset, id)`, which is `ThumbnailService` (`services/thumbnail.service.ts`):

- **Bundled datasets** (source `local`): the image `assets/thumbnails/<dataset>/<id>.jpg`. The bundled `wineqr` dataset has its images in `src/assets/thumbnails/wineqr/`.
- **Imported datasets:** a ZIP archive chosen in the wizard's Step 1. Step 6 attaches it after FastMap (`DataLoaderService.attachThumbnails` → `ThumbnailService.attachArchive`), which stores it in IndexedDB (store `thumbnails`, see [Dataset format](../specs/dataset-format.md#stored-datasets-indexeddb)) and unpacks it in the Pyodide worker into a folder `thumbnails-<n>` (`unzip`). `indexImages` maps each picture to the item id it is named after (`<id>.jpg`, `.jpeg`, `.png` or `.webp`); the image itself comes from `DataProcessorService.requestThumb`. A dataset restored from IndexedDB in a later session is unpacked on its first request. Deleting the dataset deletes its archive.

An item without an image keeps the placeholder.

## Tests

Specs sit next to the code. Dashboard-related ones: `services/filter.service.spec.ts`, `services/config.service.spec.ts`, `services/data-export.service.spec.ts`, `services/dataset-cache.service.spec.ts`, `services/dataset-collection.service.spec.ts`, `services/thumbnail.service.spec.ts`, `shared/filter/text-filter.spec.ts`, `shared/helpers/*.spec.ts`, `shared/interfaces/color-scale.spec.ts`, `glyph/*.spec.ts`, `sidebar/**/*.spec.ts`, `canvas/tooltip/tooltip.component.spec.ts`, `menubar/menubar.component.spec.ts`. How to run them: [testing.md](testing.md).
