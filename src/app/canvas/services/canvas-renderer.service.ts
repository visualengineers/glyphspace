import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { GlyphObject } from '../../glyph/glyph-object';
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
import { LENS_ENLARGEMENT_FACTOR } from '../../shared/constants/canvas-constants';
import { GlyphRenderConfig } from '../../glyph/glyph-render-config';

// Reusable scratch vector to avoid per-frame allocations
const _tempVec3 = new THREE.Vector3();

@Injectable()
export class CanvasRendererService {
  scene!: THREE.Scene;
  renderer!: THREE.WebGLRenderer;
  glyphGroup = new THREE.Group();

  sizeInfo = new GlyphSizeInfo();
  positionBounds: { minX: number; maxX: number; minY: number; maxY: number } | undefined;

  // Spatial grid
  spatialGrid = new SpatialGrid<GlyphObject>(100);
  spatialGridDirty = true;

  // Render task management
  needsRender = new Set<RenderTask>();
  private onRenderRequested?: () => void;

  // Background colors
  readonly standardBackgroundColor = new THREE.Color(0xffffff);
  readonly disabledBackgroundColor = new THREE.Color(0xf0f0f0);

  // Clipping
  private clippingFrameCounter = 0;

  // Render throttling to prevent cascading re-renders
  private lastRenderTime = 0;
  private pendingRender: ReturnType<typeof setTimeout> | null = null;
  private readonly MIN_RENDER_INTERVAL_MS = 50;

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
    this.sizeInfo.update(width, height);
  }

  updateRendererSize(width: number, height: number): void {
    this.renderer.setSize(width, height, false);
    this.sizeInfo.update(width, height);
  }

  requestRender(task: RenderTask): void {
    this.needsRender.add(task);
    this.onRenderRequested?.();
  }

  cancelRender(task: RenderTask): void {
    requestAnimationFrame(() => {
      this.needsRender.delete(task);
    });
  }

  renderGlyphs(
    glyphData: GlyphObject[],
    canvasId: number,
    selectedTimestamp: string,
    selectedAlgorithm: string,
    aggregated: boolean,
    renderConfig: GlyphRenderConfig,
    force = false
  ): void {
    if (!this.scene) return;

    const now = performance.now();
    const elapsed = now - this.lastRenderTime;

    // Throttle: if called too rapidly, schedule a single trailing render
    if (elapsed < this.MIN_RENDER_INTERVAL_MS && !force) {
      if (!this.pendingRender) {
        this.pendingRender = setTimeout(() => {
          this.pendingRender = null;
          this.doRenderGlyphs(
            glyphData,
            canvasId,
            selectedTimestamp,
            selectedAlgorithm,
            aggregated,
            renderConfig,
            force
          );
        }, this.MIN_RENDER_INTERVAL_MS - elapsed);
      }
      return;
    }

    this.doRenderGlyphs(glyphData, canvasId, selectedTimestamp, selectedAlgorithm, aggregated, renderConfig, force);
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

    glyphData.forEach((glyph: GlyphObject) => {
      const cacheObject = glyph.getCacheObject(canvasId, selectedTimestamp, selectedAlgorithm);
      const oldMesh = cacheObject.mesh;
      if (oldMesh) this.glyphGroup.remove(oldMesh);
      if (cacheObject.visible || force) {
        const mesh = glyph.render(
          this.sizeInfo,
          selectedTimestamp,
          selectedAlgorithm,
          canvasId,
          aggregated,
          renderConfig
        );
        if (mesh != null) this.glyphGroup.add(mesh);
      }
    });

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
    const mesh = glyph.getMesh(selectedTimestamp, selectedAlgorithm, canvasId);
    if (mesh !== undefined) this.glyphGroup.remove(mesh);

    const newMesh = glyph.render(
      this.sizeInfo,
      selectedTimestamp,
      selectedAlgorithm,
      canvasId,
      aggregated,
      renderConfig
    );
    if (newMesh) this.glyphGroup.add(newMesh);

    this.requestRender(RenderTask.SceneRender);
  }

  updateClipping(
    glyphData: GlyphObject[],
    viewRect: { left: number; right: number; top: number; bottom: number },
    lastViewRect: { left: number; right: number; top: number; bottom: number },
    canvasId: number,
    selectedTimestamp: string,
    selectedAlgorithm: string,
    aggregated: boolean,
    renderConfig: GlyphRenderConfig
  ): void {
    // Throttle to 30fps (every 2nd frame)
    this.clippingFrameCounter++;
    if (this.clippingFrameCounter % 2 !== 0) return;

    const { left, right, bottom, top } = viewRect;

    // Skip if viewport hasn't changed significantly
    const threshold = this.sizeInfo.radius * 0.5;
    if (
      Math.abs(left - lastViewRect.left) < threshold &&
      Math.abs(right - lastViewRect.right) < threshold &&
      Math.abs(top - lastViewRect.top) < threshold &&
      Math.abs(bottom - lastViewRect.bottom) < threshold
    )
      return;

    // Update cached viewport
    lastViewRect.left = left;
    lastViewRect.right = right;
    lastViewRect.top = top;
    lastViewRect.bottom = bottom;

    const r = this.sizeInfo.radius;

    // Use spatial grid for efficient viewport culling if available
    if (this.spatialGrid.size > 0 && glyphData.length > 500) {
      const visibleGlyphs = this.spatialGrid.queryRect(left - r, right + r, bottom - r, top + r);

      for (const glyph of glyphData) {
        const cachedObject = glyph.getCacheObject(canvasId, selectedTimestamp, selectedAlgorithm);
        if (!visibleGlyphs.has(glyph)) {
          cachedObject.visible = false;
        }
      }

      for (const glyph of visibleGlyphs) {
        const cachedObject = glyph.getCacheObject(canvasId, selectedTimestamp, selectedAlgorithm);
        if (!cachedObject.visible) {
          this.renderGlyph(glyph, selectedTimestamp, selectedAlgorithm, canvasId, aggregated, renderConfig);
        }
        cachedObject.visible = true;
      }
    } else {
      glyphData.forEach(glyph => {
        const cachedObject = glyph.getCacheObject(canvasId, selectedTimestamp, selectedAlgorithm);
        const cachedMesh = cachedObject.mesh;
        if (cachedMesh) {
          const isVisible =
            cachedMesh.position.x + r > left &&
            cachedMesh.position.x - r < right &&
            cachedMesh.position.y + r > bottom &&
            cachedMesh.position.y - r < top;
          if (!cachedObject.visible && isVisible) {
            this.renderGlyph(glyph, selectedTimestamp, selectedAlgorithm, canvasId, aggregated, renderConfig);
          }
          cachedObject.visible = isVisible;
        }
      });
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
    glyphData.forEach(glyph => {
      if (this.positionBounds === undefined) return;

      const cacheObject = glyph.getCacheObject(canvasId, selectedTimestamp, selectedAlgorithm);
      const originalX = glyph.getPosition(selectedTimestamp, selectedAlgorithm).x ?? 0;
      const originalY = glyph.getPosition(selectedTimestamp, selectedAlgorithm).y ?? 0;

      const { x: scaledX, y: scaledY } = scalePosition(
        originalX,
        originalY,
        this.positionBounds!, // eslint-disable-line @typescript-eslint/no-non-null-assertion -- guarded by `if (this.positionBounds == undefined) return` above
        canvasWidth,
        canvasHeight
      );

      cacheObject.position.x = scaledX;
      cacheObject.position.y = scaledY;
      cacheObject.x = scaledX;
      cacheObject.y = scaledY;
      cacheObject.mesh?.position.set(scaledX, scaledY, 0);
    });
  }

  /** Returns true when all glyphs have reached their original positions */
  animateBackToOriginal(
    glyphData: GlyphObject[],
    canvasId: number,
    selectedTimestamp: string,
    selectedAlgorithm: string,
    animationSpeed: number
  ): boolean {
    let finished = true;
    glyphData.forEach(glyph => {
      const cachedObject = glyph.getCacheObject(canvasId, selectedTimestamp, selectedAlgorithm);
      const target = cachedObject.position;
      const mesh = cachedObject.mesh;

      if (mesh) {
        const finalPosition = nearlyEqual(mesh.position.x, target.x) && nearlyEqual(mesh.position.y, target.y);
        finished = finished && finalPosition;
        mesh.position.lerp(_tempVec3.set(target.x, target.y, 0), animationSpeed);
      }
    });
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

  rebuildSpatialGrid(
    glyphData: GlyphObject[],
    canvasId: number,
    selectedTimestamp: string,
    selectedAlgorithm: string
  ): void {
    this.spatialGrid.clear();

    const count = glyphData.length;
    if (count > 0 && this.positionBounds) {
      const width = this.positionBounds.maxX - this.positionBounds.minX;
      const height = this.positionBounds.maxY - this.positionBounds.minY;
      const area = width * height;
      const targetCellArea = area / (count / 100);
      const cellSize = Math.max(50, Math.sqrt(targetCellArea));
      this.spatialGrid.setCellSize(cellSize);
    }

    const radius = this.sizeInfo.radius;
    for (const glyph of glyphData) {
      const cacheObject = glyph.getCacheObject(canvasId, selectedTimestamp, selectedAlgorithm);
      const x = cacheObject.position.x ?? 0;
      const y = cacheObject.position.y ?? 0;
      this.spatialGrid.insert(glyph, x, y, radius);
    }

    this.spatialGridDirty = false;
  }

  renderMagicLensGlyphs(
    glyphs: GlyphObject[],
    glyphData: GlyphObject[],
    canvasId: number,
    selectedTimestamp: string,
    selectedAlgorithm: string,
    aggregated: boolean,
    renderConfig: GlyphRenderConfig
  ): void {
    const highlightedIds = new Set(glyphs.map(g => g.id));

    // Reset unhighlighted glyphs to their original positions
    for (const glyph of glyphData) {
      if (highlightedIds.has(glyph.id)) continue;
      const node = glyph.getCacheObject(canvasId, selectedTimestamp, selectedAlgorithm);
      node.x = node.position.x;
      node.y = node.position.y;
      node.vx = 0;
      node.vy = 0;
      node.mesh?.position.set(node.position.x, node.position.y, 0);
    }

    if (glyphs.length > 1) {
      const nodes: { x: number; y: number; mesh: THREE.Object3D | undefined }[] = [];
      glyphs.forEach(glyph => {
        const cache = glyph.getCacheObject(canvasId, selectedTimestamp, selectedAlgorithm);
        nodes.push({ x: cache.position.x, y: cache.position.y, mesh: cache.mesh });
      });

      // Simple iterative collision resolution
      const enlargedRadius = this.sizeInfo.getRadius(ZoomLevel.high) * LENS_ENLARGEMENT_FACTOR;
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

      nodes.forEach(node => {
        node.mesh?.position.set(node.x, node.y, 0);
      });
    }

    glyphs.forEach(glyph => {
      const lensSize = this.sizeInfo.clone();
      lensSize.currentZoomLevel = ZoomLevel.high;
      lensSize.radius = lensSize.radius * LENS_ENLARGEMENT_FACTOR;

      const mesh = glyph.getMesh(selectedTimestamp, selectedAlgorithm, canvasId);
      if (mesh !== undefined) this.glyphGroup.remove(mesh);
      const newMesh = glyph.render(lensSize, selectedTimestamp, selectedAlgorithm, canvasId, aggregated, renderConfig);
      if (newMesh) this.glyphGroup.add(newMesh);
    });

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

    // Convert screen to world coordinates
    const worldPos = screenToWorld(event, this.renderer, camera);
    const searchRadius = this.sizeInfo.radius * 3;
    const nearbyGlyphs = this.spatialGrid.queryPoint(worldPos.x, worldPos.y, searchRadius);

    if (nearbyGlyphs.size === 0) return null;

    const candidates: THREE.Object3D[] = [];
    for (const glyph of nearbyGlyphs) {
      const mesh = glyph.getMesh(selectedTimestamp, selectedAlgorithm, canvasId);
      if (mesh) candidates.push(mesh);
    }

    return hitTestCandidates(event, this.renderer, candidates, camera, this.sizeInfo);
  }

  dispose(): void {
    this.scene?.traverse(obj => {
      if ((obj as THREE.Mesh).geometry) {
        (obj as THREE.Mesh).geometry.dispose();
      }
      if ((obj as THREE.Mesh).material) {
        const material = (obj as THREE.Mesh).material;
        if (Array.isArray(material)) {
          material.forEach(m => m.dispose());
        } else {
          material.dispose();
        }
      }
    });

    this.renderer?.forceContextLoss?.();
    if (this.renderer) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- intentional cleanup to release DOM reference
      this.renderer.domElement = null!;
      this.renderer.dispose();
    }
    this.glyphGroup.clear();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- intentional cleanup to release scene reference
    this.scene = null!;
  }
}
