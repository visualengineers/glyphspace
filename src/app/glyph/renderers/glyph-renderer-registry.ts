import { GlyphType } from '../../shared/enum/glyph-type';
import { registerGlyphRenderer } from './glyph-renderer';
import { RadarChartRenderer } from './radar-chart.renderer';
import { FlowerGlyphRenderer } from './flower-glyph.renderer';
import { WhiskerGlyphRenderer } from './whisker-glyph.renderer';

// Register all built-in glyph renderers.
// Thumbnail is excluded because it requires per-glyph service injection.
registerGlyphRenderer(GlyphType.Star, new RadarChartRenderer());
registerGlyphRenderer(GlyphType.Flower, new FlowerGlyphRenderer());
registerGlyphRenderer(GlyphType.Whisker, new WhiskerGlyphRenderer());
