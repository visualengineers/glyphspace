import { Component, ElementRef, Input, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { GlyphObject } from '../../glyph/glyph-object';
import { ZoomLevel } from '../../shared/enum/zoom-level';
import { getGlyphFromObject } from '../../shared/helpers/glyph-helper';
import { hitTest, screenToWorld } from '../../shared/helpers/three-helper';
import { ConfigService } from '../../services/config.service';
import { ThumbnailService } from '../../services/thumbnail.service';
import { GlyphSizeInfo } from '../../glyph/glyph-size-info';
import { buildGlyphRenderConfig, GlyphRenderConfig } from '../../glyph/glyph-render-config';
import { hasFeatureAxes } from '../../shared/enum/glyph-type';
import { layoutLens } from './lens-layout';

@Component({
  selector: 'app-magiclens',
  imports: [],
  templateUrl: './magiclens.component.html',
  styleUrl: './magiclens.component.scss',
})
export class MagiclensComponent implements AfterViewInit, OnDestroy {
  @Input() container!: HTMLElement;
  @Input() glyphGroup!: THREE.Group;
  @Input() parentId!: number;
  @ViewChild('lensCanvas') lensCanvasRef!: ElementRef<HTMLCanvasElement>;

  private lensRenderer!: THREE.WebGLRenderer;
  private lensCamera!: THREE.OrthographicCamera;

  private lensScene = new THREE.Scene();
  private lensGlyphGroup = new THREE.Group();
  relativePosition = new THREE.Vector2();
  magicLensActive = false;
  isLensFixed = false;
  lensGlyphs: GlyphObject[] = [];
  /** Canvas positions of the lens glyphs, in the same order; the lens keeps their arrangement. */
  private lensPositions: { x: number; y: number }[] = [];
  private sizeInfo = new GlyphSizeInfo();

  // Lens geometry
  readonly lensDiameter = 300; // Lens canvas size in pixels
  private readonly LENS_PADDING_PX = 6; // Space between the glyphs and the lens border
  private readonly DETECTION_RADIUS_PX = 30; // Screen-space radius for glyph detection
  private readonly MIN_INDICATOR_RADIUS_PX = 6;
  private readonly LENS_MOUSE_OFFSET_PX = 10; // Spacing between cursor and lens popup
  /** Radius of the ring around the cursor: the area whose items the lens shows. */
  indicatorRadius = this.DETECTION_RADIUS_PX;

  // Adaptive performance
  private maxLensGlyphs = 30;
  private readonly MIN_LENS_GLYPHS = 10;
  private readonly MAX_LENS_GLYPHS = 30;
  private readonly TARGET_FRAME_TIME_MS = 12; // ~83fps to leave headroom
  private readonly SLOW_THRESHOLD = 1.5; // Frame time multiplier for slowdown
  private readonly FAST_THRESHOLD = 0.5; // Frame time multiplier for speedup
  private readonly SCALE_DOWN_FACTOR = 0.8;
  private readonly SCALE_UP_FACTOR = 1.2;
  private readonly ADAPT_THRESHOLD = 0.8; // Only adapt when near the limit
  private lastRenderTime = 0;

  constructor(
    private config: ConfigService,
    private thumbnails: ThumbnailService
  ) {
    this.sizeInfo.currentZoomLevel = ZoomLevel.high;
  }

  /** Lens glyphs get the radius of the layout; the lens camera shows world units as px. */
  private applyGlyphRadius(radius: number): void {
    this.sizeInfo.currentZoomLevel = ZoomLevel.high;
    this.sizeInfo.radius = radius;
    this.sizeInfo.hitTolerance = radius;
  }

  ngAfterViewInit() {
    // Lens Renderer
    if (this.lensCanvasRef) {
      this.lensRenderer = new THREE.WebGLRenderer({
        canvas: this.lensCanvasRef.nativeElement,
        alpha: true,
        antialias: true,
      });
      this.lensRenderer.setClearColor(0xffffff, 1);
      this.lensRenderer.setSize(this.lensDiameter, this.lensDiameter);
      this.lensScene.add(this.lensGlyphGroup);

      // Lens Camera is just a zoomed clone of main
      this.lensCamera = new THREE.OrthographicCamera(
        -this.lensDiameter / 2,
        this.lensDiameter / 2,
        this.lensDiameter / 2,
        -this.lensDiameter / 2,
        1,
        100
      );
      this.lensCamera.position.set(0, 0, 10);
      this.lensCamera.lookAt(0, 0, 0);
      this.lensCamera.zoom = 1;
      this.lensCamera.updateProjectionMatrix();
    }
  }

  ngOnDestroy(): void {
    this.lensRenderer.forceContextLoss?.(); // Optional for full GPU cleanup
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- intentional cleanup to release DOM reference
    this.lensRenderer.domElement = null!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- intentional cleanup to release scene reference
    this.lensScene = null!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- intentional cleanup to release camera reference
    this.lensCamera = null!;
    this.lensGlyphGroup.clear();
    this.lensRenderer.dispose();
  }

  toggle(lastMousePosition: THREE.Vector2, doToggle = true): void {
    this.magicLensActive = !this.magicLensActive && doToggle;
    if (!this.magicLensActive) {
      this.clearLensGlyphs();
      this.lensGlyphGroup.clear();
    } else {
      this.updatePositions(lastMousePosition);
      this.renderLens(lastMousePosition);
    }
  }

  toggleFix(doToggle = true): void {
    this.isLensFixed = !this.isLensFixed && doToggle;
  }

  clearLensGlyphs() {
    this.lensGlyphs.forEach(glyph => {
      glyph.isInLense = false;
      this.config.redrawGlyph(glyph);
    });
    this.lensGlyphs = [];
    this.lensPositions = [];
  }

  updateMagicLens(
    lastMousePosition: THREE.Vector2,
    camera: THREE.OrthographicCamera,
    renderer: THREE.WebGLRenderer
  ): boolean {
    if (!this.magicLensActive || !this.lensCamera) return false;

    this.updatePositions(lastMousePosition);

    // Convert screen position to world coordinates using shared helper
    const mouseEvent = { clientX: lastMousePosition.x, clientY: lastMousePosition.y } as MouseEvent;
    const mouseWorld = screenToWorld(mouseEvent, renderer, camera);

    // Calculate world-space radius based on screen pixel radius and camera zoom
    // This avoids converting every glyph to screen space
    const worldRadius = this.DETECTION_RADIUS_PX / camera.zoom;

    // Glyphs within the world-space radius (O(n) but with cheaper distance calc)
    const found: { glyph: GlyphObject; x: number; y: number; distSq: number }[] = [];
    this.glyphGroup.children.forEach(obj => {
      const dx = obj.position.x - mouseWorld.x;
      const dy = obj.position.y - mouseWorld.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < worldRadius * worldRadius) {
        const glyph = getGlyphFromObject(obj);
        if (glyph != null) found.push({ glyph, x: obj.position.x, y: obj.position.y, distSq });
      }
    });

    // The nearest ones, if there are more than the lens shows. The ring around
    // the cursor then shrinks to the area they cover.
    found.sort((a, b) => a.distSq - b.distSq);
    const shown = found.slice(0, this.maxLensGlyphs);
    this.indicatorRadius =
      shown.length < found.length
        ? Math.max(this.MIN_INDICATOR_RADIUS_PX, Math.sqrt(shown[shown.length - 1].distSq) * camera.zoom)
        : this.DETECTION_RADIUS_PX;
    const newLensGlyphs = shown.map(item => item.glyph);

    // Compare current lens glyphs to new ones
    const same =
      newLensGlyphs.length === this.lensGlyphs.length && newLensGlyphs.every((g, i) => g === this.lensGlyphs[i]);

    if (same) return false;

    // Update
    this.clearLensGlyphs();
    this.lensGlyphs = newLensGlyphs;
    this.lensPositions = shown.map(({ x, y }) => ({ x, y }));

    return true;
  }

  updatePositions(lastMousePosition: THREE.Vector2) {
    const canvasRect = this.container.getBoundingClientRect();
    this.relativePosition.set(lastMousePosition.x - canvasRect.left, lastMousePosition.y - canvasRect.top);
  }

  /**
   * Draw the lens glyphs as large as they fit, in their arrangement on the
   * canvas (see layoutLens).
   */
  renderMagicLensGlyphs(timestamp: string, algorithm: string): void {
    const startTime = performance.now();
    this.lensGlyphGroup.clear();

    const renderConfig = buildGlyphRenderConfig(this.config, this.thumbnails);
    const glyphs = this.lensGlyphs;
    const layout = layoutLens(
      glyphs.map((glyph, i) => ({ ...this.lensPositions[i], extent: glyphExtent(glyph, renderConfig) })),
      this.lensDiameter / 2 - this.LENS_PADDING_PX
    );
    this.applyGlyphRadius(layout.radius);

    glyphs.forEach((glyph, i) => {
      const mesh = glyph.renderGlyph(this.sizeInfo, timestamp, algorithm, this.parentId, false, renderConfig);
      if (mesh == null) return;
      const wrapper = new THREE.Group();
      wrapper.name = 'Wrapper';
      wrapper.userData = { item: new WeakRef(glyph) };
      wrapper.add(mesh);
      mesh.position.set(0, 0, 0);
      wrapper.position.set(layout.positions[i].x, layout.positions[i].y, 0);
      this.lensGlyphGroup.add(wrapper);
    });

    this.finalizeLensCamera(glyphs, startTime);
  }

  private finalizeLensCamera(renderedGlyphs: GlyphObject[], startTime: number): void {
    this.lensCamera.zoom = 1;
    this.lensCamera.position.set(0, 0, 10);
    this.lensCamera.lookAt(0, 0, 0);
    this.lensCamera.updateProjectionMatrix();

    renderedGlyphs.forEach(glyph => {
      glyph.isInLense = true;
    });
    this.config.drawMagicLensGlyphs(renderedGlyphs);

    // Adapt glyph limit based on render performance
    this.lastRenderTime = performance.now() - startTime;
    this.adaptGlyphLimit(renderedGlyphs.length);
  }

  private adaptGlyphLimit(renderedCount: number): void {
    // Only adapt if we rendered near the limit (otherwise we can't measure properly)
    if (renderedCount < this.maxLensGlyphs * this.ADAPT_THRESHOLD) return;

    if (this.lastRenderTime > this.TARGET_FRAME_TIME_MS * this.SLOW_THRESHOLD) {
      this.maxLensGlyphs = Math.max(this.MIN_LENS_GLYPHS, Math.floor(this.maxLensGlyphs * this.SCALE_DOWN_FACTOR));
    } else if (this.lastRenderTime < this.TARGET_FRAME_TIME_MS * this.FAST_THRESHOLD) {
      this.maxLensGlyphs = Math.min(this.MAX_LENS_GLYPHS, Math.floor(this.maxLensGlyphs * this.SCALE_UP_FACTOR));
    }
  }

  renderLens(lastMousePosition: THREE.Vector2) {
    if (!this.magicLensActive) return;

    this.updatePositions(lastMousePosition);
    this.lensRenderer.render(this.lensScene, this.lensCamera);

    const lensElem = this.lensCanvasRef?.nativeElement;
    if (!lensElem) return;
    const canvasRect = this.container.getBoundingClientRect(); // or your canvas element

    // Dimensions
    const lensWidth = lensElem.offsetWidth;
    const lensHeight = lensElem.offsetHeight;

    const padding = this.LENS_MOUSE_OFFSET_PX;
    const viewportWidth = canvasRect.width;
    const viewportHeight = canvasRect.height;

    // Compute default position: bottom-right
    let left = this.relativePosition.x + padding;
    let top = this.relativePosition.y + padding;

    // Flip vertically if lens would go off bottom
    if (top + lensHeight > viewportHeight) {
      top = this.relativePosition.y - lensHeight - padding;
    }

    // Flip horizontally if lens would go off right
    if (left + lensWidth > viewportWidth) {
      left = this.relativePosition.x - lensWidth - padding;
    }

    // Clamp to canvas bounds
    top = Math.max(0, top);
    left = Math.max(0, left);

    // Apply absolute position relative to canvas container
    lensElem.style.position = 'absolute';
    lensElem.style.left = `${left}px`;
    lensElem.style.top = `${top}px`;
  }

  doHitTest(event: MouseEvent): THREE.Object3D<THREE.Object3DEventMap> | null {
    return hitTest(event, this.lensRenderer, this.lensGlyphGroup, this.lensCamera, this.sizeInfo);
  }

  isActive(): boolean {
    return this.magicLensActive;
  }

  isFixed(): boolean {
    return this.isLensFixed;
  }
}

/**
 * How far an item's glyph reaches, as a fraction of its radius: its longest
 * axis, or the whole circle when a background, the axes or an image fill it.
 */
function glyphExtent(glyph: GlyphObject, config: GlyphRenderConfig): number {
  if (!hasFeatureAxes(config.glyphType) || config.useBackground || config.useCoordinateSystem) return 1;
  const lengths = glyph.axisLengths(config.activeFeatures, config.featureMaxValues, config.scaleLinear);
  return lengths.length > 0 ? Math.max(...lengths) : 1;
}
