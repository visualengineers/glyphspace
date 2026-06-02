import * as THREE from 'three';
import { GlyphSizeInfo } from '../glyph-size-info';
import { GlyphType } from '../../shared/enum/glyph-type';

/**
 * Context provided to glyph renderers containing everything they need
 * to create the glyph mesh without coupling to GlyphObject internals.
 */
export interface GlyphRenderContext {
  /** Feature data: { featureId: value, ... } */
  featureMap: Record<string, number>;
  /** Ordered feature keys */
  keys: string[];
  /** Ordered numeric values */
  values: number[];
  /** Per-feature max values for normalization */
  featureMaxValues: number[];
  /** Number of feature axes */
  segments: number;
  /** Resolved color for this glyph (hex number or string) */
  color: string | number;
  /** Whether to use contour outlines */
  useContour: boolean;
  /** Whether to show background circle */
  useBackground: boolean;
  /** Whether to show coordinate axes */
  useCoordinateSystem: boolean;
  /** Whether the glyph is highlighted */
  highlighted: boolean;
  /** Highlight color */
  highlightColor: number;
}

/**
 * Interface for glyph type renderers.
 * Each glyph type (Star, Flower, Whisker, Thumb) implements this.
 */
export interface GlyphRenderer {
  render(ctx: GlyphRenderContext, sizeInfo: GlyphSizeInfo, linearScale: boolean): THREE.Object3D;
}

/**
 * Registry of glyph renderers by type.
 * Import individual renderers and register them here.
 */
const GLYPH_RENDERERS = new Map<GlyphType, GlyphRenderer>();

export function registerGlyphRenderer(type: GlyphType, renderer: GlyphRenderer): void {
  GLYPH_RENDERERS.set(type, renderer);
}

export function getGlyphRenderer(type: GlyphType): GlyphRenderer | undefined {
  return GLYPH_RENDERERS.get(type);
}
