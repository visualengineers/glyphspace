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
| `GlyphConfiguration` | `glyph/glyph-configuration.ts` | App (inside `ConfigService`) | Glyph type (default Star) and the style toggles. The Style pane offers `useCoordinateSystem`, `useBackground` and `useContour` (its `glyphOptions`); `useLabels` only affects the sidebar preview; `useCategories` and `scaleLinear` have no UI |
| `GlyphRenderConfig` | `glyph/glyph-render-config.ts` | Render call | A plain snapshot of the `ConfigService` state that rendering needs, built by `buildGlyphRenderConfig`. It keeps `GlyphObject` free of Angular services |
| `GlyphSizeInfo` | `glyph/glyph-size-info.ts` | Canvas (and magic lens) | Radius, contour thickness and hit tolerance for each zoom level, derived from the canvas size and the device pixel ratio |

**The render cache is keyed by canvas id only.** `GlyphObject.getCacheObject(owner, timestamp, algorithm)` uses `timestamp` and `algorithm` only when it creates the cache object. When a canvas switches projection, `GlyphCanvasComponent.onSettingsChange` rewrites `position`, `x` and `y` of the existing cache objects. Any new way of changing positions has to do the same. A destroyed canvas removes its entries with `glyph.clearCache(id)`.

**State on `GlyphObject` is shared.** `passive` and `highlighted` live on the item, not on the canvas, so a filter or a hover shows in every canvas.

## Zoom levels and how glyphs are drawn

`CanvasCameraService.calculateZoomLevel` maps the camera zoom to a `ZoomLevel` (`shared/enum/zoom-level.ts`): below 2 is `low`, below 10 `medium`, from 10 `high`. Wheel and pinch zoom are clamped to 0.5–50. When the level changes, the canvas updates `GlyphSizeInfo`, rebuilds the spatial grid and re-renders every glyph.

`GlyphObject.renderGlyph` decides what to draw:

- **Low:** a flat circle in the item's colour, using geometries and materials cached in `glyph/renderers/shared-rendering.ts`. With aggregation on, a cluster's representative is drawn as a ring and the other members are left out.
- **Medium and high:** the renderer registered for the configured `GlyphType` (`glyph/renderers/glyph-renderer-registry.ts`): Star (`radar-chart.renderer.ts`), Flower and Whisker. Thumbnails (`thumbnail.renderer.ts`) are created per item because they load an image. A type without a renderer falls back to Flower. At high zoom the shared helpers add a background disc, axes and a contour ring, if those style options are on.

**Colour.** The colour feature's value (context `1`) goes through `normalizeFeatureValue` (`shared/helpers/color-helper.ts`), which divides categorical values by the feature's maximum, and then through the selected scale from `COLOR_SCALES` (`shared/interfaces/color-scale.ts`). Hovered items are drawn in `0x9b274d`, passive items in `0xe0e0e0` with a lower `renderOrder` (1 instead of 99) so active items stay on top. At high zoom the glyph shape keeps its data colour even when hovered or passive; a hovered glyph's background disc is tinted instead.

**Positions.** `scalePosition` (`shared/helpers/three-helper.ts`) maps the raw coordinates of the selected projection into canvas space so that the data fills the canvas width and height. The aspect ratio of the projection is not preserved.

**Feature contexts.** The dataset format allows several feature contexts (`variantcontext` in the schema), but the dashboard reads context `1` only: `GlyphObject.currentContext` is fixed at 1, the colour code reads `features['1']`, and `DatasetCollectionService.getContexts` returns an empty list.

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
| `glyphConfigSubject$` | Glyph type, style, features or colour change (`updateConfiguration`) | Force re-rendering every glyph (and the magic lens) |
| `commandSubject$` with `InteractionCommand.redraw` | Filters or selection changed (`redraw`) | Re-rendering every glyph |
| … `rerender` | `reRender()`, e.g. a thumbnail finished loading | Drawing one frame |
| … `fittoscreen` | Fit all (menubar) | `fitToView()` |
| … `clearselection` | `clearSelection()` | Clearing the canvas's own selection filter and re-rendering |
| … `exportimage` | Save canvas as PNG (menubar) | Downloading `three-scene-<id>.png` at twice the pixel ratio |
| `redrawGlyphSubject$` | One item changed (hover ended, left the magic lens) | Re-rendering that item |
| `animateGlyphSubject$` | An item is hovered in a canvas | Pulsing it in the other canvases; the sidebar preview shows it |
| `drawMagicLensGlyphsSubject$` | The magic lens content changed | Enlarging the same items in the other canvases |
| `removeCanvasSubject$` | Remove canvas (settings overlay) | `AppComponent` removes that canvas |

## Main flows

### Loading a dataset

1. `ConfigService.loadData(name)` emits. The menubar does this on dataset selection (after `FilterService.clearFilters()`), `DataLoaderService` for the first bundled dataset and after an import.
2. Each canvas calls `DataLoaderService.getGlyphData(name)`. It takes the `GlyphObject`s from `DatasetCacheService`, gives them to `FilterService` (`setActiveGlyphData`, counts), and sets `ConfigService.dataSource` from the collection entry.
3. The canvas takes the timestamps and projections from `DatasetCollectionService` and selects the first of each.
4. It clears the scene, computes the position bounds, and calls `fitToView`: scale positions, rebuild the spatial grid, reset to the low zoom level, render all glyphs, animate the camera.
5. Meanwhile the sidebar calls `getMetaData()` and `getSchema()`. `getSchema` applies the schema to `ConfigService` through `SchemaConfigSyncService` (below). The sidebar keeps the current colour feature if the new dataset has it, otherwise takes the schema's. If that feature is `numeric` or `categorical` and the selected scale is of the other type, it switches to the first scale of the feature's type. It also picks a random item for the glyph preview.

`SchemaConfigSyncService.applySchemaToConfig` copies `color` → `colorFeature`, `glyph` → `activeFeatures`, `label` → `featureLabels`, `metadata` → `metadataLabels`, `types` → `featureTypes`, and `colorScaleId` → the selected scale. Older schemas without `colorScaleId` use `colorRange`: `true` selects scale 0, `false` scale 4. The maxima for normalising categorical colours (`ConfigService.featureMaxValues`) are set from the meta file's `max` values when an imported dataset is loaded (`extractFeatureMaxValuesFromMeta`), and recomputed from the items, for categorical features only, whenever `getSchema()` runs (`calculateFeatureMaxValues`).

`DatasetCacheService.buildDataSet` creates a `GlyphObject` only for ids it doesn't have yet. For an id that already exists under that dataset name, it adds the positions of the new timestamp but keeps the existing features, values and metadata.

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

- A click (less than 4 px movement and 300 ms, `canvas-constants.ts`) on an item toggles its id in the canvas's `IdFilter`; a click on empty space clears all id filters.
- Dragging draws a rectangle. On release, every glyph whose screen position is inside is selected, replacing the previous selection unless Shift is held.

Both end in `CanvasSelectionService.applyFilters`, which registers the filter as an Or filter, refreshes the filters and calls `redraw()`.

### Hovering and the tooltip

Outside selection mode, `mousemove` hit-tests at most every 50 ms. Below 500 glyphs it tests every mesh in the scene; above, it queries the spatial grid around the cursor first. The closest glyph within the zoom level's hit tolerance (in screen pixels) is highlighted, re-rendered and broadcast through `animateGlyph`. The tooltip (`canvas/tooltip/`) appears after 750 ms and lists the feature values with their labels, then the metadata values. A click pins it. It is rendered through template bindings, so CSV content is escaped. Tooltips are suppressed while `ConfigService.modalOpen` is set (the wizard is open).

### Magic lens

`l` or the navigation overlay toggles the lens (`canvas/magiclens/`). It has its own `WebGLRenderer` on a 250 px canvas that follows the cursor. Items within 30 screen pixels of the cursor are rendered at the high zoom level with 12 times the radius and laid out without overlap: one item in the centre, two or three on a circle, more with a d3 force simulation. It shows at most 30 items and lowers that limit to as few as 10 when rendering gets slow. A click pins the lens and greys the canvas background; hovering items in a pinned lens shows their tooltips. The lens broadcasts its items through `drawMagicLensGlyphs`, and the other canvases draw the same items five times larger (`LENS_ENLARGEMENT_FACTOR`) and push them apart.

### Other canvas modes

Keyboard shortcuts work while the mouse is over the canvas and not in a text field (`checkTextInput`, `shared/helpers/angular-helper.ts`):

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

`sidebar/sidebar.component.ts` has three panes, switched from an activity bar; clicking the active pane's button collapses the sidebar.

- **Encoding:** the glyph preview, glyph axes (toggles ids in `ConfigService.activeFeatures` in place, active ones first), colour attribute and colour scale. Choosing an attribute whose type doesn't match the scale's type (`numeric` or `categorical`) switches to the first scale of the attribute's type, if there is one.
- **Style:** glyph type and the style options of `GlyphConfiguration`.
- **Filters:** text search (Enter adds a term) and one histogram per feature.

The header shows the active filters as chips with a popover to remove them one by one or all at once.

The glyph preview is drawn on a 2D canvas, not with three.js: `drawGlyphPreview` calls `drawRadarChart`, `drawWhiskerGlyph` or `drawFlowerGlyph` from `shared/helpers/d3-helper.ts`. Other glyph types fall back to the flower.

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
| `shared/helpers/d3-helper.ts` | `hexToRgb`, `addAlphaToRgba`, and the 2D glyph drawings for the sidebar preview |
| `shared/helpers/color-helper.ts` | `normalizeFeatureValue` |
| `shared/interfaces/color-scale.ts` | `COLOR_SCALES` (ids 0–3 numeric: Diverge, Spectral, Viridis, Plasma; 4–5 categorical: Observable10, Tableau20) and lookup helpers |
| `shared/constants/canvas-constants.ts` | Timings and thresholds of the canvas interaction |

## Thumbnails

With the Thumbnail glyph type, `ThumbnailRenderer` shows a grey placeholder and replaces it when the image has loaded. For datasets whose `dataSource` is `wasm` it asks `DataProcessorService.requestThumb` for `<dataset>/<id>.jpg` in the Pyodide file system; for all others it loads `assets/thumbnails/<dataset>/<id>.jpg`. The bundled `wineqr` dataset has its images in `src/assets/thumbnails/wineqr/`.

## Tests

Specs sit next to the code. Dashboard-related ones: `services/filter.service.spec.ts`, `services/data-export.service.spec.ts`, `services/dataset-cache.service.spec.ts`, `services/dataset-collection.service.spec.ts`, `shared/filter/text-filter.spec.ts`, `shared/helpers/*.spec.ts`, `canvas/tooltip/tooltip.component.spec.ts`, `menubar/menubar.component.spec.ts`. How to run them: [testing.md](testing.md).
