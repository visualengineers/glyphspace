# 0012. Glyphs grow slower than the zoom

**Status:** Accepted · **Date:** 2026-11-09 · **Related:** [ADR 0010](0010-one-size-for-points-and-glyphs.md), [Dashboard](../development/dashboard.md#zoom-levels-and-how-glyphs-are-drawn)

## Context

Glyphs had a fixed size in world units, like the positions. Zooming in magnified both alike, so glyphs that overlapped zoomed out still overlapped zoomed in, only larger. Since [ADR 0010](0010-one-size-for-points-and-glyphs.md) the glyph radius is about 2.5 times what a typical glyph covers (so that the glyph looks as large as its point), and at full detail the background disc and axes fill that whole radius. On `wineqr` at zoom 12 they were about 180 px wide and covered each other.

Collision avoidance pushed items apart by the full glyph radius at every zoom level. Around the dot-to-glyph switch, where only the petals are drawn, that spread the items into an even grid and lost the projection's structure; at full detail the 50 ticks did not separate the discs.

## Decision

- Beyond the zoom where points turn into glyphs (`GLYPH_ZOOM`, 2), a glyph's size on screen grows with the square root of the zoom (`GLYPH_ZOOM_GROWTH`, 0.5), the distances between items with the zoom itself. `glyphScale(zoom)` (`glyph/glyph-zoom.ts`) is the factor; `CanvasRendererService.setGlyphScale` applies it to every glyph mesh on each frame of a zoom change, without rebuilding a glyph. At `GLYPH_ZOOM` the factor is 1, so ADR 0010's match of glyph and point size holds where the user sees both.
- Collision avoidance keeps apart what is visible at the current level and scale (`visibleRadius` in `glyph/glyph-reach.ts`): the point; the glyph's own longest axis; or its whole circle for images, and at full detail with a background or the axes. It runs again when the zoom level changes while it is on.

## Alternatives considered

- **A smaller radius at full detail only:** the glyph would shrink on screen at the step to full detail.
- **Background disc and axes at the typical reach instead of the radius:** values above it would stick out of the disc, which no longer marks the feature maximum.
- **Glyphs of constant screen size (growth 0):** zooming in would never show more detail.

## Consequences

- At high zoom glyphs are smaller on screen than before (zoom 12: about 2.4 times), and zooming in separates them.
- Anything that draws or measures a glyph mesh on the canvas has to take `glyphScale` into account; hit testing and the spatial grid use the unscaled radius, which is larger and therefore safe.
- `GLYPH_ZOOM_GROWTH` is the one value to change if glyphs should grow faster or slower when zooming in.
