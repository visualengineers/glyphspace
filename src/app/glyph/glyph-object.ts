import { Object3D } from 'three';
import { Coordinates } from '../shared/interfaces/coordinates';
import { ZoomLevel } from '../shared/enum/zoom-level';
import * as THREE from 'three';
import { Features, StringStringMap } from '../shared/interfaces/glyph-feature';
import { GlyphCacheObject } from './glyph-cache-object';
import { GlyphType } from '../shared/enum/glyph-type';
import { GlyphSizeInfo } from './glyph-size-info';
import { normalizeFeatureValue } from '../shared/helpers/color-helper';
import { GlyphRenderContext, getGlyphRenderer } from './renderers/glyph-renderer';
import { ThumbnailRenderer } from './renderers/thumbnail.renderer';
import { getCachedCircleGeometry, getCachedRingGeometry, getCachedBasicMaterial } from './renderers/shared-rendering';
import { GlyphRenderConfig } from './glyph-render-config';

// Side-effect import: registers all built-in glyph renderers
import './renderers/glyph-renderer-registry';

export class GlyphObject {
  id: string;
  positions: Record<string, Record<string, Coordinates>> = {};
  defaultcontext = 0;
  features!: Features;
  values: StringStringMap | undefined;
  currentContext = 1;
  renderCache = new Map<number, GlyphCacheObject>();
  passive = false;
  highlighted = false;
  isInLense = false;
  lensCenter: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  highlightColor = 0x9b274d;
  passivecolor = 0xe0e0e0;

  constructor(id: string) {
    this.id = id;
  }

  public getPosition(timestamp: string, algorithm: string): Coordinates {
    return this.positions[timestamp][algorithm];
  }

  public clearCache(owner: number) {
    this.renderCache.delete(owner);
  }

  public getCacheObject(owner = 0, timestamp: string, algorithm: string): GlyphCacheObject {
    let cacheObject = this.renderCache.get(owner);
    if (cacheObject == null) {
      cacheObject = new GlyphCacheObject(this.id, { ...this.getPosition(timestamp, algorithm) });
      this.renderCache.set(owner, cacheObject);
    }

    return cacheObject;
  }

  public getMesh(timestamp: string, algorithm: string, owner = 0): Object3D | undefined {
    const cacheObject = this.getCacheObject(owner, timestamp, algorithm);
    return cacheObject.mesh;
  }

  public setHighlighted(highlight: boolean) {
    if (this.highlighted === highlight) return;

    this.highlighted = highlight;
  }

  private getCurrentColor(renderConfig: GlyphRenderConfig, trueColor = false): string | number {
    if (this.highlighted && !trueColor) {
      return this.highlightColor;
    }
    if (this.passive && !trueColor) {
      return this.passivecolor;
    }

    let currentColor: string | number = 0x00cc88;
    if (this.features != null) {
      const featureValue = normalizeFeatureValue(
        this.features['1'][renderConfig.colorFeature],
        renderConfig.colorFeature,
        renderConfig.featureTypes,
        renderConfig.featureMaxValues
      );

      const scale = renderConfig.colorScale;
      if (scale) {
        currentColor = scale(featureValue);
      }
    }

    return currentColor;
  }

  public render(
    sizeInfo: GlyphSizeInfo,
    timestamp: string,
    algorithm: string,
    owner: number,
    clustered: boolean,
    renderConfig: GlyphRenderConfig
  ): THREE.Object3D | null {
    const mesh = this.renderGlyph(sizeInfo, timestamp, algorithm, owner, clustered, renderConfig);
    const cacheObject = this.getCacheObject(owner, timestamp, algorithm);
    if (mesh) cacheObject.mesh = mesh;
    return mesh;
  }

  public renderGlyph(
    sizeInfo: GlyphSizeInfo,
    timestamp: string,
    algorithm: string,
    owner: number,
    clustered: boolean,
    renderConfig: GlyphRenderConfig
  ): THREE.Object3D | null {
    const cacheObject = this.getCacheObject(owner, timestamp, algorithm);
    const cachedMesh = cacheObject.mesh;

    let mesh: THREE.Object3D;

    if (sizeInfo.currentZoomLevel === ZoomLevel.low) {
      if (clustered && cacheObject.isClustered && !cacheObject.isClusterRepresentative) {
        return null; // Omit this glyph entirely
      }

      const currentColor = this.getCurrentColor(renderConfig);

      if (cacheObject.isClusterRepresentative && clustered) {
        const ringGeom = getCachedRingGeometry(sizeInfo.radius - 1, sizeInfo.radius, 24);
        const ringMat = getCachedBasicMaterial(currentColor, { side: THREE.DoubleSide });
        mesh = new THREE.Mesh(ringGeom, ringMat);
      } else {
        const geom = getCachedCircleGeometry(sizeInfo.radius, 24);
        const mat = getCachedBasicMaterial(currentColor);
        mesh = new THREE.Mesh(geom, mat);
      }
    } else {
      const glyphType = renderConfig.glyphType;

      // Thumbnail is special: needs per-glyph service injection
      if (glyphType === GlyphType.Thumb) {
        const thumbRenderer = new ThumbnailRenderer(this.id, renderConfig);
        mesh = thumbRenderer.render(
          this.buildRenderContext(sizeInfo, renderConfig),
          sizeInfo,
          renderConfig.scaleLinear
        );
      } else {
        const renderer = getGlyphRenderer(glyphType);
        if (renderer) {
          mesh = renderer.render(this.buildRenderContext(sizeInfo, renderConfig), sizeInfo, renderConfig.scaleLinear);
        } else {
          // Fallback to flower
          const fallback = getGlyphRenderer(GlyphType.Flower);
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Flower renderer is always registered
          mesh = fallback!.render(this.buildRenderContext(sizeInfo, renderConfig), sizeInfo, renderConfig.scaleLinear);
        }
      }
    }

    const x = cachedMesh ? cachedMesh.position.x : (cacheObject.x ?? 0);
    const y = cachedMesh ? cachedMesh.position.y : (cacheObject.y ?? 0);
    mesh.position.set(x, y, 0);
    mesh.userData = { item: new WeakRef(this) };
    mesh.renderOrder = this.passive ? 1 : 99;

    return mesh;
  }

  /**
   * Build the render context that glyph renderers need.
   */
  private buildRenderContext(sizeInfo: GlyphSizeInfo, renderConfig: GlyphRenderConfig): GlyphRenderContext {
    const featureCtx = this.getFeatureContext(this.currentContext, renderConfig);
    const color = this.getCurrentColor(renderConfig, sizeInfo.currentZoomLevel === ZoomLevel.high);

    return {
      featureMap: featureCtx?.featureMap ?? {},
      keys: featureCtx?.keys ?? [],
      values: featureCtx?.values ?? [],
      featureMaxValues: featureCtx?.featureMaxValues ?? [],
      segments: featureCtx?.segments ?? 0,
      color,
      useContour: renderConfig.useContour,
      useBackground: renderConfig.useBackground,
      useCoordinateSystem: renderConfig.useCoordinateSystem,
      highlighted: this.highlighted,
      highlightColor: this.highlightColor,
    };
  }

  // === Shared feature extraction ===
  private getFeatureContext(contextId: number, renderConfig: GlyphRenderConfig) {
    if (!this.features) return null;

    const featureMap = Object.fromEntries(
      Object.entries(this.features[contextId] || {}).filter(([k]) => renderConfig.activeFeatures.includes(k))
    );
    const keys = Object.keys(featureMap);
    const values = keys.map(k => +featureMap[k]);

    const globalMaxValues = renderConfig.featureMaxValues;
    const featureMaxValues = keys.map(k => globalMaxValues[k] ?? 1);

    const localMaxValue = Math.max(...values) || 1;
    const segments = keys.length;

    return { featureMap, keys, values, featureMaxValues, localMaxValue, segments };
  }
}
