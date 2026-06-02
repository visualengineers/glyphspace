import { Observable } from 'rxjs';
import { GlyphType } from '../shared/enum/glyph-type';
import { ConfigService } from '../services/config.service';
import { DataProcessorService } from '../services/data-processor';

/**
 * Abstracts thumbnail loading away from DataProcessorService.
 */
export interface ThumbnailResolver {
  requestThumb(path: string): Observable<ImageBitmap | null>;
}

/**
 * Plain-data configuration snapshot that GlyphObject.render() needs.
 * Decouples GlyphObject from Angular services.
 */
export interface GlyphRenderConfig {
  colorFeature: string;
  featureTypes: Record<string, string>;
  featureMaxValues: Record<string, number>;
  colorScale: ((value: number) => string) | undefined;
  glyphType: GlyphType;
  scaleLinear: boolean;
  useContour: boolean;
  useBackground: boolean;
  useCoordinateSystem: boolean;
  activeFeatures: string[];
  dataSource: string;
  loadedData: string;
  thumbnailResolver?: ThumbnailResolver;
  onReRender?: () => void;
}

/**
 * Build a GlyphRenderConfig snapshot from the current ConfigService state.
 */
export function buildGlyphRenderConfig(config: ConfigService, dataProcessor?: DataProcessorService): GlyphRenderConfig {
  const glyphConfig = config.getConfiguration();
  return {
    colorFeature: config.colorFeature,
    featureTypes: config.featureTypes,
    featureMaxValues: config.featureMaxValues,
    colorScale: config.color as ((value: number) => string) | undefined,
    glyphType: glyphConfig.glyphType,
    scaleLinear: glyphConfig.scaleLinear,
    useContour: glyphConfig.useContour,
    useBackground: glyphConfig.useBackground,
    useCoordinateSystem: glyphConfig.useCoordinateSystem,
    activeFeatures: config.activeFeatures,
    dataSource: config.dataSource,
    loadedData: config.loadedData,
    thumbnailResolver: dataProcessor ? { requestThumb: (path: string) => dataProcessor.requestThumb(path) } : undefined,
    onReRender: () => config.reRender(),
  };
}
