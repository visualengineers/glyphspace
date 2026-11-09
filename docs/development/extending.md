# Extending GlyphSpace

_For contributors adding a glyph type, a colour scale, a projection method or a wizard error class._

Paths are relative to `src/app/` unless they start with `src/`, `tools/` or `docs/`.

Each how-to lists every file to touch, in order. Where the compiler catches an omission, the step says so; the other steps are the ones that are easy to forget. Background on the code involved: [dashboard.md](dashboard.md), [wizard.md](wizard.md), [processing-pipeline.md](processing-pipeline.md).

## Add a glyph type

1. **Enum and name.** Add a member to `GlyphType` in `shared/enum/glyph-type.ts`, after the existing ones, and its display name to `GLYPH_TYPE_NAMES` in the same file. `GLYPH_TYPE_NAMES` is a `Record<GlyphType, string>`, so the compiler insists on the name.
2. **Renderer.** Create `glyph/renderers/<name>.renderer.ts` with a class implementing `GlyphRenderer` (`glyph/renderers/glyph-renderer.ts`). Its `render(ctx, sizeInfo, linearScale)` returns a new `THREE.Object3D` every time it is called:
   - Build the glyph around the origin. `GlyphObject.renderGlyph` sets the position, `userData` (used by hit testing and the tooltip) and `renderOrder` afterwards.
   - Size it with `sizeInfo.radius`; the radius already reflects the zoom level and the user's **Size** setting.
   - Keep the number of objects per glyph small: a zoom-level change rebuilds every glyph at once (see [Dashboard](dashboard.md#zoom-levels-and-how-glyphs-are-drawn)).
   - Read the data from `ctx`: `keys`, `values` and `featureMaxValues` are parallel arrays for the active glyph features in axis order, `segments` is their count, `color` is already resolved (the filter colour at every zoom level, the hover colour below the high level). Take the geometry from `glyph/glyph-geometry.ts`, so the axes start at the top and run clockwise like in the other glyphs: `axisLength(value, featureMaxValues[i], linearScale)` for the length and `axisAngle(i, segments)` or `axisPoint` for the direction.
   - Use the helpers in `glyph/renderers/shared-rendering.ts`: `addBackgroundCircle` and `addCoordinateAxes` (both draw only at the high zoom level and when the appearance option is on) and `addPlaceHolder`, which draws a small dot and returns `true` when all values are about zero. `radar-chart.renderer.ts` is a short example.
   - Renderers are only called at the medium and high zoom levels. At the low level `GlyphObject` draws plain circles itself.
3. **Register it** in `glyph/renderers/glyph-renderer-registry.ts` with `registerGlyphRenderer(GlyphType.<Name>, new <Name>Renderer())`. Until you do, the type falls back to the Flower renderer without an error. A renderer that needs per-item state, like `ThumbnailRenderer`, is special-cased in `GlyphObject.renderGlyph` instead.
4. **Button.** Add the type to `glyphTypes` in `sidebar/encoding-tab/encoding-tab.component.ts`. The Encoding tab renders one button per entry, labelled with `getGlyphTypeName`.
5. **Legend and icons.** If the type has one axis per feature, add it to `hasFeatureAxes` in `shared/enum/glyph-type.ts`; otherwise the glyph legend shows its "not applicable" card and the filter cards show no glyph icons, as for Image. The legend (`sidebar/glyph-legend/`) and the filter-card icon (`sidebar/glyph-icon/glyph-icon.component.ts`) are SVG drawings, separate from the three.js renderer: the legend draws a star for Star and petals for any other axis type, the icon a flower for Flower and a star for any other. Add a branch to both, with an SVG path built from `glyph/glyph-geometry.ts` (see `polygonSvgPath`, `flowerPetalSvgPath`).
6. **Tests.** Add a spec for the renderer, e.g. that it returns a group with the background only at the high zoom level, and extend `glyph/glyph-geometry.spec.ts` if you added geometry.
7. **Docs.** Add the type to the glyph table in [the user guide's dashboard page](../user-guide/dashboard.md#points-and-glyphs) and to **GLYPH TYPE** in [Encoding and filters](../user-guide/encoding-and-filters.md#encoding).

The canvas settings overlay shows the type's name from `getGlyphTypeName` without further changes. The wizard's Step 5 has its own glyph preview (`selectedGlyphType` in `preprocessing-wizard/steps/step5-glyph-color-settings/`), which only knows `star` and `flower` and builds its shapes with `buildGlyphPreview` (`glyph-preview-geometry.ts`) from the same `glyph/glyph-geometry.ts`; extend it if the new type should be previewed there.

## Add a colour scale

1. **Entry.** Append an object to `COLOR_SCALES` in `shared/interfaces/color-scale.ts`:
   - `id`: a new number, the next after the highest id in use and in `RETIRED_SCALE_IDS` (9 at present). Never renumber or reuse an id: processed datasets store it as `schema.colorScaleId` (also in IndexedDB), and the wizard state stores it as `colorScaleId`. To remove a scale, map its id to a replacement in `RETIRED_SCALE_IDS`; `resolveColorScaleId` reads stored ids through that map.
   - `type`: `'numeric'` with a `d3.scaleLinear<string>()` over the domain `[0, 1]`, which gets feature values normalised to that range; or `'categorical'` with `categoricalPalette([...colours])`, a `d3.scaleQuantize<string>()` over `[0, 1]`. A categorical palette colours a feature with categories by category code (`paletteColor`: code `i` takes colour `i`, cycling), so put the most distinct colours first. Leave out grey: it marks filtered-out items.
   - `group`: the heading the selector lists it under. Scales with the same `group` string are grouped (`buildGroupedColorScales`).
2. **Defaults.** The first scale of each `type` in `COLOR_SCALES` is that type's default (`defaultColorScaleId`): the wizard picks it when the colour feature changes type (`colorScaleForFeature`), and datasets that only store the old boolean `colorRange` get it (`SchemaConfigSyncService.applySchemaToConfig`). Append a scale after the existing ones of its type unless it should become the default.
3. **No UI changes.** The colour scale selector (`shared/components/color-scale-selector/`) shows the new scale in the sidebar's Encoding tab and in Step 5, as a gradient for numeric and as swatches for categorical scales.
4. **Docs.** Add the scale to the table in [Encoding and filters](../user-guide/encoding-and-filters.md#encoding).

## Add a projection method

Projections are computed by DruidJS, so a new method must be a DruidJS class. FastMap is the primary method and always runs; everything below is about the optional background methods.

1. **Method id.** Add it to `ProjectionMethod` in `shared/types/projection.types.ts`. Add any parameters to `ProjectionComputeConfig` in the same file.
2. **DruidJS call.** In `workers/druid-runner.ts`, add the DruidJS class name to `DruidClassName` and a `case` to `druidSpecFor` that returns `{ className, params }`. The parameter type is taken from DruidJS's own declarations, so a parameter DruidJS doesn't know fails to compile. The `default` branch throws at runtime, so the compiler doesn't remind you of a missing `case`. `workers/projection.worker.ts` dispatches through `druidSpecFor` and needs no change; only t-SNE is special-cased (`runTsneProjection`).
3. **Service method.** Add `run<Name>(features, ids, config?)` to `services/projection.service.ts`. It calls `runProjectionInWorker('<id>', features, ids, …)` and maps the wizard's parameter names to `ProjectionComputeConfig` keys (see `runIsoMap`).
4. **Wizard config.** In `preprocessing-wizard/models/column-config.ts`, add `enable<Name>: boolean` and any numeric parameters to `ProjectionConfig`. Add defaults to `DEFAULT_PROJECTION_CONFIG` in `preprocessing-wizard/models/preprocessing-state.ts`. Saved wizard states need no migration: `restoreProjectionConfig` (`preprocessing-wizard/services/wizard-storage.ts`) starts from the defaults' keys, so a key missing from an older save gets its default.
5. **Step 4 card.** Add an entry to `ALL_PROJECTION_METHODS` in `preprocessing-wizard/steps/step4-projection-settings/projection-methods.ts`. The list is ordered by speed, fastest first. Each parameter names its `configKey`, `min`, `max`, `default` (used by the card's reset) and a `helpKey`, which must exist in `HELP_TEXT.parameters` (`preprocessing-wizard/shared/constants/help-text.ts`). A neighbour parameter also goes into `NEIGHBOR_PARAM_KEYS` in the same file, which drives Step 4's inline warning.
6. **Preview animation.** `PROJECTION_PREVIEW_KEYS` in the same file maps the config key to a preview; the compiler asks for this entry. Either reuse an existing preview key or add one: the `PreviewKey` union in `preprocessing-wizard/shared/projection-preview/engine/preview-types.ts`, its geometry in `engine/preview-geometry.ts`, a drawing function in one of the `engine/preview-draw-*.ts` files dispatched from `engine/preview-renderer.ts`, and its text in `PREVIEW_META` and `PREVIEW_CAPTIONS` (`projection-preview.data.ts`).
7. **Background run.** Add an entry to `BACKGROUND_METHODS` in `preprocessing-wizard/steps/step6-review-processing/background-projections.ts`: `key` (the method id; it also keys the background status), `name`, `configKey` and `run`. Step 6 lists and runs the method from here.
8. **Pre-flight warnings.** In `detectPreflightIssues` (`preprocessing-wizard/shared/constants/wizard-error-classes.ts`), add a neighbour parameter to `neighborChecks` (K4), and a slow method to the `slowEnabled` check (K6).
9. **Tests.** Extend `workers/druid-runner.spec.ts`, `services/projection.service.spec.ts` and `preprocessing-wizard/steps/step6-review-processing/background-projections.spec.ts`; `preprocessing-wizard/shared/projection-preview/engine/preview-engine.spec.ts` if you added a preview.
10. **Docs.** Add the method to the class table in [Worker protocol](../specs/worker-protocol.md#methods-and-parameters), to the projection names in [Dataset format](../specs/dataset-format.md#position), and to the methods table in [Importing data](../user-guide/importing-data.md#step-4-projection).

The method id becomes the projection's key in the dataset, so it is what the canvas settings list under "Dimensionality reduction" once the background run finishes.

**Hiding a method** without removing it: add its config key to `HIDDEN_PROJECTION_METHODS` in `projection-methods.ts`. It then disappears from Step 4 and never runs, summarises or warns, even when a saved config switches it on. Deleting the key from the set brings it back. LLE is hidden this way.

## Add a wizard error class

Error classes turn a raw processing error into an issue card with a cause, a fix and a "Fix in step N" link. The current classes are listed in [wizard.md](wizard.md#errors).

1. **A recognisable message.** The raw text the classifier sees is the error message from the Pyodide worker, which for a Python exception includes the formatted traceback. Make sure the failure produces a phrase that only it produces. If it comes from a new check in Python, raise it in `src/assets/preprocessing_processor_config.py`. Its entry point `process_with_config` re-raises every error as `Failed to process data: …`, which keeps your text.
2. **Template.** Add an entry to `CLASS_TEMPLATES` in `preprocessing-wizard/shared/constants/wizard-error-classes.ts` with the next free code (`K9`, …): `severity`, an everyday-language `title`, `why`, `fix`, the target `step` (a `WizardStepId`) and an `anchorId`. Write step references in `fix` with `stepLabel(id)` or `stepNumber(id)` (`preprocessing-wizard/shared/constants/step-info.ts`), never as literal numbers, so they stay right when steps move. The anchor must be one of the `wizard-anchor-*` ids in the target step's template; the "Fix in step N" button scrolls to it through `PreprocessingService.goToStepWithScroll`.
3. **Pattern.** Add a branch to `classifyProcessingError`. The first matching branch wins, so put yours before any broader pattern that would also match your message. Two existing examples: K7 is tested before K6 because its message also mentions memory, and K8 before K1 because both say "not a number".
4. **Optional pre-flight warning.** If the problem can be predicted from the state, add a check to `detectPreflightIssues` that pushes the template with `severity: 'warning'`. Failures of background projections go through `classifyBackgroundFailure`, which reuses `classifyProcessingError` and turns the result into a dismissable warning, so they need nothing extra.
5. **Tests.** Add a row to the `cases` table in `wizard-error-classes.spec.ts` (a representative raw message with the expected code, step and anchor); the existing tests then also check that the class targets a known step. Cover a new Python check in `tools/tests/test_preprocessing_config.py`.
6. **Docs.** Add the class to the table in [wizard.md](wizard.md#errors) and to the user guide's [Troubleshooting](../user-guide/troubleshooting.md) page.
