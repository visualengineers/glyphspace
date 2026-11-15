import { TestBed } from '@angular/core/testing';
import * as THREE from 'three';
import { CanvasRendererService, gridCellSize } from './canvas-renderer.service';
import { GlyphObject } from '../../glyph/glyph-object';
import { GlyphRenderConfig } from '../../glyph/glyph-render-config';
import { GlyphType } from '../../shared/enum/glyph-type';
import { ZoomLevel } from '../../shared/enum/zoom-level';
import { RenderTask } from '../../shared/enum/render-task';
import { getColorScaleById } from '../../shared/interfaces/color-scale';
import { MIN_RENDER_INTERVAL_MS } from '../../shared/constants/canvas-constants';
import { isShared } from '../../glyph/mesh-disposal';

function createService(): CanvasRendererService {
  return TestBed.runInInjectionContext(() => new CanvasRendererService());
}

/** A service with a scene but no WebGL renderer (rendering is not exercised). */
function createServiceWithScene(): CanvasRendererService {
  const service = createService();
  service.scene = new THREE.Scene();
  service.scene.add(service.glyphGroup);
  return service;
}

function createGlyph(id: string, x = 0, y = 0): GlyphObject {
  const glyph = new GlyphObject(id);
  glyph.features = { '1': { '1': 0.5, '2': 0.8, '3': 0.3 } };
  glyph.positions = { t: { umap: { x, y } } };
  return glyph;
}

function renderConfig(glyphType = GlyphType.Star): GlyphRenderConfig {
  return {
    colorFeature: '1',
    featureTypes: {},
    featureMaxValues: {},
    featureCategoryCounts: {},
    colorScale: getColorScaleById(2),
    glyphType,
    scaleLinear: false,
    useContour: false,
    useBackground: false,
    useCoordinateSystem: false,
    activeFeatures: ['1', '2', '3'],
    loadedData: 'd',
  };
}

/** Geometries of `object` and its descendants. */
function geometries(object: THREE.Object3D): THREE.BufferGeometry[] {
  const found: THREE.BufferGeometry[] = [];
  object.traverse(child => {
    const geometry = (child as THREE.Mesh).geometry;
    if (geometry) found.push(geometry);
  });
  return found;
}

function watchDisposal(resource: THREE.EventDispatcher<{ dispose: object }>): () => boolean {
  let disposed = false;
  resource.addEventListener('dispose', () => (disposed = true));
  return () => disposed;
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('CanvasRendererService glyph scale', () => {
  it('scales the glyphs on the canvas', () => {
    const service = createService();
    service.renderGlyph(createGlyph('a'), 't', 'umap', 0, false, renderConfig());

    service.setGlyphScale(0.5);

    expect(service.glyphGroup.children[0].scale.x).toBe(0.5);
    expect(service.glyphScale).toBe(0.5);
  });

  it('draws new glyphs at the current scale', () => {
    const service = createService();
    service.setGlyphScale(0.4);

    service.renderGlyph(createGlyph('a'), 't', 'umap', 0, false, renderConfig());

    expect(service.glyphGroup.children[0].scale.toArray()).toEqual([0.4, 0.4, 0.4]);
  });
});

describe('CanvasRendererService mesh ownership', () => {
  it('disposes the geometry and material of a replaced glyph mesh', () => {
    const service = createService();
    service.sizeInfo.currentZoomLevel = ZoomLevel.medium;
    const glyph = createGlyph('a');

    service.renderGlyph(glyph, 't', 'umap', 0, false, renderConfig());
    const first = glyph.getMesh('t', 'umap', 0) as THREE.Object3D;
    const owned = geometries(first).filter(geometry => !isShared(geometry));
    expect(owned.length).toBeGreaterThan(0);
    const disposed = owned.map(watchDisposal);

    service.renderGlyph(glyph, 't', 'umap', 0, false, renderConfig());

    expect(disposed.every(isDisposed => isDisposed())).toBe(true);
    expect(service.glyphGroup.children).toEqual([glyph.getMesh('t', 'umap', 0)]);
  });

  it('keeps the shared point geometry and material when a point is replaced', () => {
    const service = createService();
    const glyph = createGlyph('a');
    service.renderGlyph(glyph, 't', 'umap', 0, false, renderConfig());
    const point = glyph.getMesh('t', 'umap', 0) as THREE.Mesh;
    const geometryDisposed = watchDisposal(point.geometry);
    const materialDisposed = watchDisposal(point.material as THREE.Material);

    service.renderGlyph(glyph, 't', 'umap', 0, false, renderConfig());

    expect(geometryDisposed()).toBe(false);
    expect(materialDisposed()).toBe(false);
  });

  it('forgets the mesh of an item that aggregation leaves out', () => {
    const service = createService();
    const glyph = createGlyph('a');
    service.renderGlyph(glyph, 't', 'umap', 0, true, renderConfig());
    const cache = glyph.getCacheObject(0, 't', 'umap');
    cache.isClustered = true;

    service.renderGlyph(glyph, 't', 'umap', 0, true, renderConfig());

    expect(cache.mesh).toBeUndefined();
    expect(service.glyphGroup.children.length).toBe(0);
  });

  it('clears one canvas: disposes its meshes and forgets its cache entries only', () => {
    const service = createService();
    service.sizeInfo.currentZoomLevel = ZoomLevel.medium;
    const glyph = createGlyph('a');
    glyph.getCacheObject(1, 't', 'umap'); // another canvas
    service.renderGlyph(glyph, 't', 'umap', 0, false, renderConfig());
    const disposed = geometries(glyph.getMesh('t', 'umap', 0) as THREE.Object3D)
      .filter(geometry => !isShared(geometry))
      .map(watchDisposal);

    service.clearGlyphs([glyph], 0);

    expect(disposed.every(isDisposed => isDisposed())).toBe(true);
    expect(service.glyphGroup.children.length).toBe(0);
    expect(glyph.renderCache.has(0)).toBe(false);
    expect(glyph.renderCache.has(1)).toBe(true);
  });
});

describe('CanvasRendererService render throttle', () => {
  it('draws the arguments of the latest throttled call', async () => {
    const service = createServiceWithScene();
    const first = createGlyph('first');
    const second = createGlyph('second');
    service.renderGlyphs([], 0, 't', 'umap', false, renderConfig(), true);

    service.renderGlyphs([first], 0, 't', 'umap', false, renderConfig());
    service.renderGlyphs([second], 0, 't', 'umap', false, renderConfig());
    await wait(MIN_RENDER_INTERVAL_MS + 30);

    expect(second.getMesh('t', 'umap', 0)).toBeDefined();
    expect(first.renderCache.get(0)?.mesh).toBeUndefined();
  });

  it('drops a pending call when a forced one draws first', async () => {
    const service = createServiceWithScene();
    const stale = createGlyph('stale');
    service.renderGlyphs([], 0, 't', 'umap', false, renderConfig(), true);

    service.renderGlyphs([stale], 0, 't', 'umap', false, renderConfig());
    service.renderGlyphs([], 0, 't', 'umap', false, renderConfig(), true);
    await wait(MIN_RENDER_INTERVAL_MS + 30);

    expect(stale.renderCache.get(0)?.mesh).toBeUndefined();
  });

  it('draws nothing after it was disposed', async () => {
    const service = createServiceWithScene();
    const glyph = createGlyph('a');
    service.renderGlyphs([], 0, 't', 'umap', false, renderConfig(), true);
    service.renderGlyphs([glyph], 0, 't', 'umap', false, renderConfig());

    service.dispose();
    await wait(MIN_RENDER_INTERVAL_MS + 30);

    expect(glyph.renderCache.get(0)?.mesh).toBeUndefined();
    service.requestRender(RenderTask.SceneRender);
    expect(service.needsRender.size).toBe(0);
  });
});

describe('CanvasRendererService render tasks', () => {
  it('keeps a task that is requested again before its delayed cancel', async () => {
    const service = createService();
    service.requestRender(RenderTask.GlyphAnimation);

    service.cancelRender(RenderTask.GlyphAnimation);
    service.requestRender(RenderTask.GlyphAnimation);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    expect(service.needsRender.has(RenderTask.GlyphAnimation)).toBe(true);
  });

  it('ends a cancelled task one frame later', async () => {
    const service = createService();
    service.requestRender(RenderTask.SceneRender);

    service.cancelRender(RenderTask.SceneRender);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    expect(service.needsRender.has(RenderTask.SceneRender)).toBe(false);
  });
});

describe('CanvasRendererService viewport clipping', () => {
  const view = { left: -100, right: 100, top: 100, bottom: -100 };

  it('builds an item that moved into the view while the camera stayed', () => {
    const service = createService();
    const glyph = createGlyph('a');
    const cache = glyph.getCacheObject(0, 't', 'umap');
    cache.moveTo(1000, 1000);
    const lastView = { ...view };
    service.updateClipping([glyph], view, lastView, 0, 't', 'umap', false, renderConfig); // frame 1: throttled
    service.updateClipping([glyph], view, lastView, 0, 't', 'umap', false, renderConfig);
    expect(cache.visible).toBe(false);
    expect(cache.mesh).toBeUndefined();

    cache.moveTo(0, 0);
    service.invalidateClipping();
    service.updateClipping([glyph], view, lastView, 0, 't', 'umap', false, renderConfig);
    service.updateClipping([glyph], view, lastView, 0, 't', 'umap', false, renderConfig);

    expect(cache.visible).toBe(true);
    expect(cache.mesh).toBeDefined();
  });

  it('leaves out the items aggregation hides', () => {
    const service = createService();
    const glyph = createGlyph('a');
    const cache = glyph.getCacheObject(0, 't', 'umap');
    cache.isClustered = true;
    service.invalidateClipping();

    service.updateClipping([glyph], view, { ...view }, 0, 't', 'umap', true, renderConfig);
    service.updateClipping([glyph], view, { ...view }, 0, 't', 'umap', true, renderConfig);

    expect(cache.mesh).toBeUndefined();
  });
});

describe('CanvasRendererService positions', () => {
  it('moves the items a step towards their targets and reports arrival', () => {
    const service = createService();
    const glyph = createGlyph('a');
    const cache = glyph.getCacheObject(0, 't', 'umap');
    cache.position = { x: 10, y: 0 };

    expect(service.animateBackToOriginal([glyph], 0, 't', 'umap', 0.5)).toBe(false);
    expect(cache.display).toEqual({ x: 5, y: 0 });

    cache.moveTo(10, 0.001);
    expect(service.animateBackToOriginal([glyph], 0, 't', 'umap', 0.5)).toBe(true);
    expect(cache.display).toEqual({ x: 10, y: 0 });
  });

  it('enlarges the items of another canvas’s lens aside without moving them', () => {
    const service = createService();
    const a = createGlyph('a', 0, 0);
    const b = createGlyph('b', 1, 0);
    service.renderGlyph(a, 't', 'umap', 0, false, renderConfig());
    service.renderGlyph(b, 't', 'umap', 0, false, renderConfig());

    service.renderMagicLensGlyphs([a, b], 0, 't', 'umap', false, renderConfig());

    const meshA = a.getMesh('t', 'umap', 0) as THREE.Object3D;
    const meshB = b.getMesh('t', 'umap', 0) as THREE.Object3D;
    expect(meshA.position.distanceTo(meshB.position)).toBeGreaterThan(1);
    expect(a.getCacheObject(0, 't', 'umap').display).toEqual({ x: 0, y: 0 });
    expect(b.getCacheObject(0, 't', 'umap').display).toEqual({ x: 1, y: 0 });

    // Leaving the lens redraws the item where it is.
    service.renderGlyph(a, 't', 'umap', 0, false, renderConfig());
    expect((a.getMesh('t', 'umap', 0) as THREE.Object3D).position.toArray()).toEqual([0, 0, 0]);
  });

  it('leaves the other items alone when another canvas’s lens changes', () => {
    const service = createService();
    const inLens = createGlyph('lens');
    const other = createGlyph('other');
    service.renderGlyph(other, 't', 'umap', 0, false, renderConfig());
    other.getCacheObject(0, 't', 'umap').moveTo(40, 40); // e.g. held by collision avoidance

    service.renderMagicLensGlyphs([inLens], 0, 't', 'umap', false, renderConfig());

    expect((other.getMesh('t', 'umap', 0) as THREE.Object3D).position.toArray()).toEqual([40, 40, 0]);
  });
});

describe('gridCellSize', () => {
  it('aims at about 100 items per cell in the space of the points', () => {
    const points = Array.from({ length: 10_000 }, (_, i) => ({ x: (i % 100) * 10, y: Math.floor(i / 100) * 10 }));

    expect(gridCellSize(points)).toBeCloseTo(99, 0);
  });

  it('falls back to the smallest cell without an extent', () => {
    expect(gridCellSize([])).toBe(10);
    expect(
      gridCellSize([
        { x: 3, y: 3 },
        { x: 3, y: 3 },
      ])
    ).toBe(10);
    expect(
      gridCellSize([
        { x: 0, y: 0 },
        { x: 1000, y: 0 },
      ])
    ).toBe(10);
  });
});
