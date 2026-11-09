# 0010. One size for points and glyphs, glyph radius from the dataset

**Status:** Accepted · **Date:** 2026-11-09 · **Related:** #90, [Dashboard](../development/dashboard.md#the-glyph-model)

## Context

Zoomed out, an item is a filled dot; zoomed in past camera zoom 2, it becomes a glyph. The sidebar had two sliders, **Point size** and **Glyph size**. With the defaults, the dots were much larger than the glyphs that replaced them: a glyph's radius is the reach of an axis at the feature's maximum, but most values are far below the maximum, so a typical glyph covers a fraction of its circle. How small depends on the dataset: its value distribution and the axes chosen. No fixed ratio between the two sliders keeps the size steady across datasets.

## Decision

We have one **Size** setting (`GlyphConfiguration.itemSize`): the diameter of a dot at 100 % zoom. The glyph radius follows from it and from the dataset: `pointRadius × GLYPH_REACH_IN_POINT_RADII / reach`, where `reach` is the median, over the items, of the longest axis as a fraction of the radius (`typicalGlyphReach`, at least 0.25). A typical glyph thus reaches two dot radii, one dot diameter; mostly empty space between thin petals or spokes needs that much to look as large as a filled dot. Image glyphs fill their circle, so their reach is 1.

The magic lens doesn't use this radius: it sizes its glyphs to fit the lens (`layoutLens`).

## Alternatives considered

- **Two sliders** (as before): the user has to match them for every dataset, and the mismatch is what users noticed first.
- **A fixed ratio of glyph radius to dot radius:** steady on one dataset, too small or too large on others.
- **A radius per item from its own reach:** glyphs would no longer share a scale, and comparing them is what they are for.
- **The mean instead of the median reach:** a few long axes pull it up; the median describes the typical glyph.

## Consequences

- Glyph radii depend on the loaded dataset and change when glyph axes are added or removed, or when the scale changes. The canvas recomputes them on every configuration change (`GlyphCanvasComponent.applyGlyphSizes`), samples at most 2,000 items for it, and updates the collision force and spatial grid.
- On a dataset with small values, the glyph circle (background disc, axes) is large compared with the dots, because the data inside it is small.
- `GLYPH_REACH_IN_POINT_RADII` (2) was set by eye on `wineqr` and `nutrients`; change it there if glyphs look too large or too small at the switch.
