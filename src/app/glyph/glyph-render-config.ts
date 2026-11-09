import { Observable } from 'rxjs';
import { GlyphType } from '../shared/enum/glyph-type';
import { ConfigService } from '../services/config.service';
import { ColorScale } from '../shared/interfaces/color-scale';

export type ThumbnailImage = HTMLImageElement | ImageBitmap;

/** Finds the image of an item for the Image glyph type (see ThumbnailService). */
export interface ThumbnailResolver {
  /** Emits the image once it is loaded, or null when the item has none. */
  requestThumb(dataset: string, id: string): Observable<ThumbnailImage | null>;
}

/**
 * Plain-data configuration snapshot that GlyphObject.render() needs.
 * Decouples GlyphObject from Angular services.
 */
export interface GlyphRenderConfig {
  colorFeature: string;
  featureTypes: Record<string, string>;
  featureMaxValues: Record<string, number>;
  featureCategoryCounts: Record<string, number>;
  colorScale: ColorScale | undefined;
  glyphType: GlyphType;
  scaleLinear: boolean;
  useContour: boolean;
  useBackground: boolean;
  useCoordinateSystem: boolean;
  activeFeatures: string[];
  loadedData: string;
  thumbnailResolver?: ThumbnailResolver;
  onReRender?: () => void;
}

/**
 * Build a GlyphRenderConfig snapshot from the current ConfigService state.
 */
export function buildGlyphRenderConfig(config: ConfigService, thumbnails?: ThumbnailResolver): GlyphRenderConfig {
  const glyphConfig = config.getConfiguration();
  return {
    colorFeature: config.colorFeature,
    featureTypes: config.featureTypes,
    featureMaxValues: config.featureMaxValues,
    featureCategoryCounts: config.featureCategoryCounts,
    colorScale: config.colorScale,
    glyphType: glyphConfig.glyphType,
    scaleLinear: glyphConfig.scaleLinear,
    useContour: glyphConfig.useContour,
    useBackground: glyphConfig.useBackground,
    useCoordinateSystem: glyphConfig.useCoordinateSystem,
    activeFeatures: config.activeFeatures,
    loadedData: config.loadedData,
    thumbnailResolver: thumbnails,
    onReRender: () => config.reRender(),
  };
}
