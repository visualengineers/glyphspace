import { inject, Injectable, NgZone } from '@angular/core';
import * as THREE from 'three';
import { GlyphObject } from '../../glyph/glyph-object';
import { GlyphCacheObject } from '../../glyph/glyph-cache-object';
import { GlyphSizeInfo } from '../../glyph/glyph-size-info';
import { RenderTask } from '../../shared/enum/render-task';
import { SpatialGrid } from '../../shared/helpers/spatial-grid';
import { ZoomLevel } from '../../shared/enum/zoom-level';
import {
  hitTest,
  hitTestCandidates,
  nearlyEqual,
  scalePosition,
  screenToWorld,
} from '../../shared/helpers/three-helper';
import { LENS_ENLARGEMENT_FACTOR, MIN_RENDER_INTERVAL_MS } from '../../shared/constants/canvas-constants';
import { GlyphRenderConfig } from '../../glyph/glyph-render-config';
import { disposeObject } from '../../glyph/mesh-disposal';

interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}
interface ViewRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}
type RenderGlyphsArgs = [GlyphObject[], number, string, string, boolean, GlyphRenderConfig];

/** Smallest cell of the spatial grid, in canvas units. */
const MIN_GRID_CELL = 10;
/** Items per grid cell the cell size aims at. */
const ITEMS_PER_GRID_CELL = 100;

/**
 * The scene of one canvas. It owns the glyph meshes in `glyphGroup`: a mesh it
 * takes out of the group is disposed (`releaseMesh`), so GPU memory does not
 * grow with every redraw.
 */
@Injectable()
export class CanvasRendererService {
  private ngZone = inject(NgZone);

  scene!: THREE.Scene;
  renderer!: THREE.WebGLRenderer;
  glyphGroup = new THREE.Group();

  sizeInfo = new GlyphSizeInfo();
  /** Scale of every glyph mesh, from the camera zoom (see glyphScale). */
  private _glyphScale = 1;
  positionBounds: Bounds | undefined;

  // Spatial grid
  spatialGrid = new SpatialGrid<GlyphObject>(100);
  spatialGridDirty = true;

  // Render task management
  needsRender = new Set<RenderTask>();
  /** Counts the requests of each task, so a delayed cancel can tell it was requested again. */
  private taskRequests = new Map<RenderTask, number>();
  private onRenderRequested?: () => void;
  private disposed = false;

  // Background colors
  readonly standardBackgroundColor = new THREE.Color(0xffffff);
  readonly disabledBackgroundColor = new THREE.Color(0xf0f0f0);

  // Clipping
  private clippingFrameCounter = 0;
  /** Items moved: the next clipping checks the view even if the camera stayed. */
  private clippingDirty = true;

  // Render throttling to prevent cascading re-renders
  private lastRenderTime = 0;
  private pendingRender: ReturnType<typeof setTimeout> | null = null;
  private pendingArgs: RenderGlyphsArgs | null = null;

  setRenderRequestCallback(fn: () => void): void {
    this.onRenderRequested = fn;
  }

  initRenderer(container: HTMLElement, width: number, height: number): void {
    this.scene = new THREE.Scene();
    this.scene.background = this.standardBackgroundColor;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';

    this.scene.add(this.glyphGroup);
    container.appendChild(this.renderer.domElement);

    this.renderer.setSize(width, height, false);
    this.sizeInfo.update();
  }

  /** Take over the canvas size. A hidden canvas (0 × 0) keeps its last size. */
  updateRendererSize(width: number, height: number): void {
    if (width <= 0 || height <= 0) return;
    this.renderer.setSize(width, height, false);
    this.sizeInfo.update();
  }

  get isDisposed(): boolean {
    return this.disposed;
  }

  requestRender(task: RenderTask): void {
    if (this.disposed) return;
    this.taskRequests.set(task, (this.taskRequests.get(task) ?? 0) + 1);
    this.needsRender.add(task);
    this.onRenderRequested?.();
  }

  /**
   * End `task` one frame later, so the frame that finishes it is still drawn.
   * A request of the task in between keeps it.
   */
  cancelRender(task: RenderTask): void {
    const requests = this.taskRequests.get(task);
    this.ngZone.runOutsideAngular(() =>
      requestAnimationFrame(() => {
        if (this.taskRequests.get(task) === requests) this.needsRender.delete(task);
      })
    );
  }

  /**
   * Rebuild the meshes of the items in the view (all items with `force`) and
   * drop the others'. Calls less than MIN_RENDER_INTERVAL_MS apart collapse
   * into one trailing call with the latest arguments; a forced call replaces
   * a pending one.
   */
  renderGlyphs(
    glyphData: GlyphObject[],
    canvasId: number,
    selectedTimestamp: string,
    selectedAlgorithm: string,
    aggregated: boolean,
    renderConfig: GlyphRenderConfig,
    force = false
  ): void {
    if (!this.scene || this.disposed) return;

    const elapsed = performance.now() - this.lastRenderTime;
    if (elapsed < MIN_RENDER_INTERVAL_MS && !force) {
      this.pendingArgs = [glyphData, canvasId, selectedTimestamp, selectedAlgorithm, aggregated, renderConfig];
      this.pendingRender ??= this.ngZone.runOutsideAngular(() =>
        setTimeout(() => {
          const args = this.pendingArgs;
          this.pendingRender = null;
          this.pendingArgs = null;
          if (args && this.scene && !this.disposed) this.doRenderGlyphs(...args, false);
        }, MIN_RENDER_INTERVAL_MS - elapsed)
      );
      return;
    }

    this.cancelPendingRender();
    this.doRenderGlyphs(glyphData, canvasId, selectedTimestamp, selectedAlgorithm, aggregated, renderConfig, force);
  }

  private cancelPendingRender(): void {
    if (this.pendingRender) clearTimeout(this.pendingRender);
    this.pendingRender = null;
    this.pendingArgs = null;
  }

  private doRenderGlyphs(
    glyphData: GlyphObject[],
    canvasId: number,
    selectedTimestamp: string,
    selectedAlgorithm: string,
    aggregated: boolean,
    renderConfig: GlyphRenderConfig,
    force: boolean
  ): void {
    this.lastRenderTime = performance.now();

    for (const glyph of glyphData) {
      const cacheObject = glyph.getCacheObject(canvasId, selectedTimestamp, selectedAlgorithm);
      if (cacheObject.visible || force) {
        this.buildMesh(
          glyph,
          cacheObject,
          this.sizeInfo,
          canvasId,
          selectedTimestamp,
          selectedAlgorithm,
          aggregated,
          renderConfig
        );
      } else {
        this.releaseMesh(cacheObject);
      }
    }

    this.updatePositionBounds(glyphData, selectedTimestamp, selectedAlgorithm);
    this.requestRender(RenderTask.SceneRender);
  }

  renderGlyph(
    glyph: GlyphObject,
    selectedTimestamp: string,
    selectedAlgorithm: string,
    canvasId: number,
    aggregated: boolean,
    renderConfig: GlyphRenderConfig
  ): void {
    if (this.disposed) return;
    const cacheObject = glyph.getCacheObject(canvasId, selectedTimestamp, selectedAlgorithm);
    this.buildMesh(
      glyph,
      cacheObject,
      this.sizeInfo,
      canvasId,
      selectedTimestamp,
      selectedAlgorithm,
      aggregated,
      renderConfig
    );
    this.requestRender(RenderTask.SceneRender);
  }

  /** Replace the item's mesh with a new one (none when aggregation leaves it out). */
  private buildMesh(
    glyph: GlyphObject,
    cacheObject: GlyphCacheObject,
    sizeInfo: GlyphSizeInfo,
    canvasId: number,
    selectedTimestamp: string,
    selectedAlgorithm: string,
    aggregated: boolean,
    renderConfig: GlyphRenderConfig
  ): THREE.Object3D | null {
    this.releaseMesh(cacheObject);
    const mesh = glyph.render(sizeInfo, selectedTimestamp, selectedAlgorithm, canvasId, aggregated, renderConfig);
    if (mesh) this.addGlyphMesh(mesh);
    return mesh;
  }

  /** Take the item's mesh out of the scene and free what it owns. */
  private releaseMesh(cacheObject: GlyphCacheObject): void {
    const mesh = cacheObject.mesh;
    if (!mesh) return;
    this.glyphGroup.remove(mesh);
    disposeObject(mesh);
    cacheObject.mesh = undefined;
  }

  /**
   * Take the items of `glyphData` out of this canvas: dispose their meshes and
   * forget their cache entries for `canvasId`. Whatever else is left in the
   * scene (e.g. meshes whose cache entries the dataset cache dropped) goes too.
   */
  clearGlyphs(glyphData: GlyphObject[], canvasId: number): void {
    this.cancelPendingRender();
    for (const glyph of glyphData) {
      const cacheObject = glyph.renderCache.get(canvasId);
      if (cacheObject) this.releaseMesh(cacheObject);
      glyph.clearCache(canvasId);
    }
    for (const child of this.glyphGroup.children) disposeObject(child);
    this.glyphGroup.clear();
    this.spatialGrid.clear();
    this.clippingDirty = true;
  }

  get glyphScale(): number {
    return this._glyphScale;
  }

  /**
   * Scale all glyph meshes, e.g. after the camera zoom changed. Cheap: no
   * glyph is rebuilt, three.js applies the scale when it draws.
   */
  setGlyphScale(scale: number): void {
    if (scale === this._glyphScale) return;
    this._glyphScale = scale;
    for (const mesh of this.glyphGroup.children) mesh.scale.setScalar(scale);
    this.requestRender(RenderTask.SceneRender);
  }

  private addGlyphMesh(mesh: THREE.Object3D): void {
    mesh.scale.setScalar(this._glyphScale);
    this.glyphGroup.add(mesh);
  }

  /** Items moved without the camera moving: the next clipping checks every item again. */
  invalidateClipping(): void {
    this.clippingDirty = true;
  }

  /**
   * Viewport clipping: mark which items lie in the view (where they are drawn
   * now) and build the meshes of those that come into it. Runs every second
   * frame, when the view moved by half a glyph radius or items moved
   * (invalidateClipping). The render config is only built when a mesh is.
   */
  updateClipping(
    glyphData: GlyphObject[],
    viewRect: ViewRect,
    lastViewRect: ViewRect,
    canvasId: number,
    selectedTimestamp: string,
    selectedAlgorithm: string,
    aggregated: boolean,
    renderConfig: () => GlyphRenderConfig
  ): void {
    // Throttle to 30fps (every 2nd frame)
    this.clippingFrameCounter++;
    if (this.clippingFrameCounter % 2 !== 0) return;

    const { left, right, bottom, top } = viewRect;

    // Skip if neither the viewport nor the items moved significantly
    const threshold = this.sizeInfo.radius * 0.5;
    const viewMoved = !(
      Math.abs(left - lastViewRect.left) < threshold &&
      Math.abs(right - lastViewRect.right) < threshold &&
      Math.abs(top - lastViewRect.top) < threshold &&
      Math.abs(bottom - lastViewRect.bottom) < threshold
    );
    if (!viewMoved && !this.clippingDirty) return;
    this.clippingDirty = false;

    // Update cached viewport
    lastViewRect.left = left;
    lastViewRect.right = right;
    lastViewRect.top = top;
    lastViewRect.bottom = bottom;

    const r = this.sizeInfo.radius;
    const level = this.sizeInfo.currentZoomLevel;
    let config: GlyphRenderConfig | undefined;
    for (const glyph of glyphData) {
      const cacheObject = glyph.getCacheObject(canvasId, selectedTimestamp, selectedAlgorithm);
      const { x, y } = cacheObject.display;
      const inView = x + r > left && x - r < right && y + r > bottom && y - r < top;
      if (inView && !cacheObject.mesh && !cacheObject.isAggregatedAway(aggregated, level)) {
        config ??= renderConfig();
        this.buildMesh(
          glyph,
          cacheObject,
          this.sizeInfo,
          canvasId,
          selectedTimestamp,
          selectedAlgorithm,
          aggregated,
          config
        );
        this.requestRender(RenderTask.SceneRender);
      }
      cacheObject.visible = inView;
    }
  }

  scaleGroupToFit(
    glyphData: GlyphObject[],
    canvasId: number,
    selectedTimestamp: string,
    selectedAlgorithm: string,
    canvasWidth: number,
    canvasHeight: number
  ): void {
    const bounds = this.positionBounds;
    if (bounds === undefined) return;

    for (const glyph of glyphData) {
      const cacheObject = glyph.getCacheObject(canvasId, selectedTimestamp, selectedAlgorithm);
      const original = glyph.getPosition(selectedTimestamp, selectedAlgorithm);
      const { x, y } = scalePosition(original.x ?? 0, original.y ?? 0, bounds, canvasWidth, canvasHeight);

      cacheObject.position.x = x;
      cacheObject.position.y = y;
      cacheObject.x = x;
      cacheObject.y = y;
      cacheObject.moveTo(x, y);
    }
    this.clippingDirty = true;
  }

  /**
   * Move every item a step of `animationSpeed` towards its target position.
   * Returns true when all have arrived.
   */
  animateBackToOriginal(
    glyphData: GlyphObject[],
    canvasId: number,
    selectedTimestamp: string,
    selectedAlgorithm: string,
    animationSpeed: number
  ): boolean {
    let finished = true;
    for (const glyph of glyphData) {
      const cacheObject = glyph.getCacheObject(canvasId, selectedTimestamp, selectedAlgorithm);
      const { display, position } = cacheObject;
      if (nearlyEqual(display.x, position.x) && nearlyEqual(display.y, position.y)) {
        if (display.x !== position.x || display.y !== position.y) cacheObject.moveTo(position.x, position.y);
        continue;
      }
      finished = false;
      cacheObject.moveTo(
        display.x + (position.x - display.x) * animationSpeed,
        display.y + (position.y - display.y) * animationSpeed
      );
    }
    this.clippingDirty = true;
    return finished;
  }

  updatePositionBounds(glyphData: GlyphObject[], selectedTimestamp: string, selectedAlgorithm: string): void {
    if (this.positionBounds === undefined && glyphData.length > 0) {
      let minX = Infinity,
        maxX = -Infinity;
      let minY = Infinity,
        maxY = -Infinity;

      for (const glyph of glyphData) {
        const pos = glyph.getPosition(selectedTimestamp, selectedAlgorithm);
        const x = pos.x ?? 0;
        const y = pos.y ?? 0;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }

      this.positionBounds = { minX, maxX, minY, maxY };
    }
  }

  /**
   * Index the items by where they are drawn, for hit testing. The cell size
   * aims at about ITEMS_PER_GRID_CELL items per cell, measured in the canvas
   * space the items are inserted in.
   */
  rebuildSpatialGrid(
    glyphData: GlyphObject[],
    canvasId: number,
    selectedTimestamp: string,
    selectedAlgorithm: string
  ): void {
    this.spatialGrid.clear();

    const caches = glyphData.map(glyph => glyph.getCacheObject(canvasId, selectedTimestamp, selectedAlgorithm));
    this.spatialGrid.setCellSize(gridCellSize(caches.map(cache => cache.display)));

    const radius = this.sizeInfo.radius;
    glyphData.forEach((glyph, i) => this.spatialGrid.insert(glyph, caches[i].display.x, caches[i].display.y, radius));

    this.spatialGridDirty = false;
  }

  /**
   * Show the items in another canvas's magic lens enlarged here, pushed apart
   * so they don't cover each other. Only the new meshes move: the items keep
   * their positions, and a redraw (as when they leave the lens) puts them back.
   */
  renderMagicLensGlyphs(
    glyphs: GlyphObject[],
    canvasId: number,
    selectedTimestamp: string,
    selectedAlgorithm: string,
    aggregated: boolean,
    renderConfig: GlyphRenderConfig
  ): void {
    if (this.disposed || glyphs.length === 0) return;

    const nodes = glyphs.map(glyph => {
      const cacheObject = glyph.getCacheObject(canvasId, selectedTimestamp, selectedAlgorithm);
      return { glyph, cacheObject, x: cacheObject.display.x, y: cacheObject.display.y };
    });

    // Simple iterative collision resolution
    const enlargedRadius = this.sizeInfo.getRadius(ZoomLevel.high) * LENS_ENLARGEMENT_FACTOR * this._glyphScale;
    const minDist = enlargedRadius * 2;
    for (let iter = 0; iter < 5; iter++) {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < minDist && dist > 0) {
            const overlap = (minDist - dist) / 2;
            const nx = dx / dist;
            const ny = dy / dist;
            nodes[i].x -= nx * overlap;
            nodes[i].y -= ny * overlap;
            nodes[j].x += nx * overlap;
            nodes[j].y += ny * overlap;
          }
        }
      }
    }

    const lensSize = this.sizeInfo.clone();
    lensSize.currentZoomLevel = ZoomLevel.high;
    lensSize.radius = lensSize.radius * LENS_ENLARGEMENT_FACTOR;
    for (const { glyph, cacheObject, x, y } of nodes) {
      const mesh = this.buildMesh(
        glyph,
        cacheObject,
        lensSize,
        canvasId,
        selectedTimestamp,
        selectedAlgorithm,
        aggregated,
        renderConfig
      );
      mesh?.position.set(x, y, 0);
    }

    this.requestRender(RenderTask.SceneRender);
  }

  optimizedHitTest(
    event: MouseEvent,
    glyphData: GlyphObject[],
    camera: THREE.OrthographicCamera,
    selectedTimestamp: string,
    selectedAlgorithm: string,
    canvasId: number
  ): THREE.Object3D | null {
    // For small datasets, use standard hit test (less overhead)
    if (glyphData.length <= 500 || this.spatialGrid.size === 0) {
      return hitTest(event, this.renderer, this.glyphGroup, camera, this.sizeInfo);
    }

    // The hit test accepts items within the hit tolerance in screen pixels;
    // candidates are the items within that distance in canvas units.
    const worldPos = screenToWorld(event, this.renderer, camera);
    const searchRadius = this.sizeInfo.hitTolerance / camera.zoom;
    const nearbyGlyphs = this.spatialGrid.queryPoint(worldPos.x, worldPos.y, searchRadius);

    if (nearbyGlyphs.size === 0) return null;

    const candidates: THREE.Object3D[] = [];
    for (const glyph of nearbyGlyphs) {
      const mesh = glyph.getMesh(selectedTimestamp, selectedAlgorithm, canvasId);
      if (mesh) candidates.push(mesh);
    }

    return hitTestCandidates(event, this.renderer, candidates, camera, this.sizeInfo);
  }

  /**
   * Free the canvas's meshes and its WebGL renderer, and stop rendering. The
   * renderer releases its copies of the shared geometries and materials; those
   * stay for the other canvases.
   */
  dispose(): void {
    this.disposed = true;
    this.cancelPendingRender();
    this.needsRender.clear();
    this.onRenderRequested = undefined;

    for (const child of this.glyphGroup.children) disposeObject(child);
    this.glyphGroup.clear();

    this.renderer?.forceContextLoss?.();
    if (this.renderer) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- intentional cleanup to release DOM reference
      this.renderer.domElement = null!;
      this.renderer.dispose();
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- intentional cleanup to release scene reference
    this.scene = null!;
  }
}

/**
 * Cell size for a spatial grid over `points` (canvas units): about
 * ITEMS_PER_GRID_CELL points per cell over their bounding box, at least
 * MIN_GRID_CELL.
 */
export function gridCellSize(points: readonly { x: number; y: number }[]): number {
  if (points.length === 0) return MIN_GRID_CELL;
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const { x, y } of points) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const area = (maxX - minX) * (maxY - minY);
  const cellSize = Math.sqrt(area / Math.max(points.length / ITEMS_PER_GRID_CELL, 1));
  return Number.isFinite(cellSize) ? Math.max(MIN_GRID_CELL, cellSize) : MIN_GRID_CELL;
}
