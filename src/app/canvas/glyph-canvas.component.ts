import { Component, ElementRef, HostListener, OnInit, ViewChild, AfterViewInit, OnDestroy, Input, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';
import { ConfigService } from '../services/config.service';
import { Subscription } from 'rxjs';
import { DataProviderService } from '../services/dataprovider.service';
import { GlyphObject } from '../glyph/glyph-object';
import { ZoomLevel } from '../shared/enum/zoom-level';
import { forceCollide, forceSimulation, Simulation } from 'd3-force';
import { clusterGlyphs, getGlyphFromObject } from '../shared/helpers/glyph-helper';
import { InteractionCommand } from '../shared/enum/interaction-command';
import { GlyphCacheObject } from '../glyph/glyph-cache-object';
import { convertToScreenSpace, exportThreeSceneAsPNG, hitTest, jitterFromVector, nearlyEqual, panCamera, scalePosition } from '../shared/helpers/three-helper';
import { TooltipComponent } from "./tooltip/tooltip.component";
import { MagiclensComponent } from "./magiclens/magiclens.component";
import { CommonModule } from '@angular/common';
import { OverlayControlsComponent } from "./overlaycontrols/overlaycontrols.component";
import { GlyphSizeInfo } from '../glyph/glyph-size-info';
import { ItemFilter } from '../shared/filter/item-filter';
import { IdFilter } from '../shared/filter/id-filter';
import { FilterMode } from '../shared/enum/filter-mode';
import { checkTextInput } from '../shared/helpers/angular-helper';
import { LoggerService } from '../services/logger-service';
import { RenderTask } from '../shared/enum/render-task';

@Component({
  selector: 'glyph-canvas',
  standalone: true,
  imports: [CommonModule, FormsModule, TooltipComponent, MagiclensComponent, OverlayControlsComponent],
  templateUrl: './glyph-canvas.component.html',
  styleUrls: ['./glyph-canvas.component.scss']
})
export class GlyphCanvasComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef;
  @ViewChild(TooltipComponent) tooltipComponent!: TooltipComponent;
  @ViewChild(MagiclensComponent) magicLensComponent!: MagiclensComponent;

  @Input() id = 0;
  private glyphData: GlyphObject[] = [];

  // Infrastructure fields
  private configSub = new Subscription();
  private canvasWidth = 0;
  private canvasHeight = 0;
  private sizeInfo = new GlyphSizeInfo();
  private positionBounds: { minX: number; maxX: number; minY: number; maxY: number; } | undefined;

  // Basic THREE.js properties
  public scene!: THREE.Scene;
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.OrthographicCamera;
  private target: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  glyphGroup = new THREE.Group();
  private animationFrameId: number | undefined;
  private needsRender = new Set<RenderTask>();
  private resizeObserver!: ResizeObserver;
  private standardBackgroundColor = new THREE.Color(0xfafafa);
  private disabledBackgroundColor = new THREE.Color(0xf0f0f0);
  private viewRect = { left: 0, right: 0, top: 0, bottom: 0 };

  // D3 force simulation and aggregation
  private simulation: Simulation<GlyphCacheObject, undefined> | undefined;
  collisionAvoidance = false;
  private currentTicks = 0;
  private maxTicks = 50;
  aggregated = false;

  // Fields responsible for animating transitions in the scene
  private fitAnimationStartTime: number | null = null;
  private fitStartPosition!: THREE.Vector3;
  private fitEndPosition!: THREE.Vector3;
  private fitStartTarget!: THREE.Vector3;
  private fitEndTarget!: THREE.Vector3;
  private fitStartZoom!: number;
  private fitEndZoom!: number;
  private fitDuration = 500; // ms

  // Helpers for navigation
  private isPanning = false;
  private mouseInside = false;
  lastMousePosition = new THREE.Vector2();
  lastTouchPosition: { x: number, y: number } | null = { x: 0, y: 0 };
  private mouseDownTime: number = 0;
  private readonly clickThreshold = 4; // pixels
  private readonly clickTimeThreshold = 300; // milliseconds  
  private zoomFactor = 1.1;
  private touchZoomStartDistance: number | null = null;
  private lastZoom: number | null = null;

  // Used for selecting and highlighting logic
  private mouse = new THREE.Vector2();
  private currentHoveredObject: GlyphObject | null = null;
  private animateGlyph: GlyphObject | null = null;
  private pulseStartTime = performance.now();
  private lastHitTestTime = 0;
  private throttleDelay = 50;

  private selectionStart = new THREE.Vector2();
  private selectionEnd = new THREE.Vector2();
  private selectionFilter: ItemFilter = new IdFilter();
  selectionMode = false;
  private isShiftDown = false;
  isSelecting = false;
  selectionBox = { left: 0, top: 0, width: 0, height: 0 };

  // Overlay controls
  showSettings = false;
  timestamps: string[] = [];
  algorithms: string[] = [];
  contexts: string[] = [];
  selectedTimestamp = "";
  selectedAlgorithm = "";
  selectedContext = "";

  constructor(private ngZone: NgZone, private logger: LoggerService, private config: ConfigService, private dataProvider: DataProviderService) {
  }

  //#region Life Cycle methods
  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initThree();
    this.subscribeToEvents();
    this.observeResize();
  }

  ngOnChanges(): void {
    this.logger.log("The component has changed " + this.id);
  }

  ngOnDestroy(): void {
    this.logger.log("Destroy " + this.id);
    this.glyphData.forEach((glyph: GlyphObject) => {
      glyph.clearCache(this.id);
    });

    this.configSub.unsubscribe();

    // Cleanup THREE.js
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

    this.scene.traverse((obj) => {
      if ((obj as THREE.Mesh).geometry) {
        (obj as THREE.Mesh).geometry.dispose();
      }

      if ((obj as THREE.Mesh).material) {
        const material = (obj as THREE.Mesh).material;
        if (Array.isArray(material)) {
          material.forEach((m) => m.dispose());
        } else {
          material.dispose();
        }
      }
    });
    this.renderer.forceContextLoss?.(); // Optional for full GPU cleanup
    this.renderer.domElement = null!;
    this.scene = null!;
    this.camera = null!;
    this.glyphGroup.clear();
    this.renderer.dispose();
    this.resizeObserver.disconnect();
  }
  //#endregion

  //#region Initialization Methods
  private initThree(): void {
    const rect = this.canvasContainer.nativeElement.getBoundingClientRect();
    const container = this.canvasContainer.nativeElement;
    this.canvasWidth = rect.width
    this.canvasHeight = rect.height;
    this.sizeInfo.update(this.canvasWidth, this.canvasHeight);

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = this.standardBackgroundColor;

    // Orthographic Camera Setup
    this.camera = new THREE.OrthographicCamera(
      (-this.canvasWidth) / 2,
      (this.canvasWidth) / 2,
      this.canvasHeight / 2,
      -this.canvasHeight / 2,
      1,
      1000
    );

    this.camera.position.set(0, 0, 10);  // Looking down the Z axis
    this.camera.zoom = 1;
    this.camera.updateProjectionMatrix();

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    // Take retina devices into account / high density displays
    let pixelRatio = window.devicePixelRatio > 1 ? window.devicePixelRatio * 4 : window.screen.pixelDepth;
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block'; // prevent extra spacing
    this.scene.add(this.glyphGroup);
    container.appendChild(this.renderer.domElement);
  }

  private subscribeToEvents() {
    this.dataProvider.dataSetCollectionSubject$.subscribe(data => {

    });
    this.configSub.add(
      this.config.loadedDataSubject$.subscribe(async loadedData => {
        if (loadedData == "") return;

        const data = await this.dataProvider.getGlyphData();

        this.ngZone.run(() => {
          this.timestamps = this.dataProvider.getTimestamps(loadedData);
          this.algorithms = this.dataProvider.getPositions(loadedData);
          this.contexts = this.dataProvider.getContexts(loadedData);

          this.selectedTimestamp = this.timestamps[0];
          this.selectedAlgorithm = this.algorithms[0];
          this.selectedContext = this.contexts[0];

          if (data) {
            this.glyphGroup.clear();
            this.glyphData = data;
            this.positionBounds = undefined;
            this.updatePositionBounds();
            this.fitToView();
            this.initSimulation();
          }
        });
      })
    );
    this.configSub.add(
      this.config.commandSubject$.subscribe((command) => {
        if (command == InteractionCommand.fittoscreen) {
          this.fitToView();
        } else if (command == InteractionCommand.redraw) {
          this.renderGlyphs();
        } else if (command == InteractionCommand.rerender) {
          this.requestRender(RenderTask.SceneRender);
        } else if (command == InteractionCommand.clearselection) {
          this.selectionFilter.clear();
          this.renderGlyphs();
        } else if (command == InteractionCommand.exportimage) {
          exportThreeSceneAsPNG(this.renderer, this.scene, this.camera,
            {
              filename: "three-scene-" + this.id + ".png",
              scaleFactor: 2,
              restoreAfterExport: true,
              canvasElement: this.canvasContainer.nativeElement
            }
          )
        }
      })
    );
    this.configSub.add(
      this.config.redrawGlyphSubject$.subscribe(glyph => {
        if (glyph != null && this.glyphData.includes(glyph)) this.renderGlyph(glyph);
      })
    );
    this.configSub.add(
      this.config.animateGlyphSubject$.subscribe(glyph => {
        if (this.mouseInside) return; // no animation in current canvas
        if (this.animateGlyph == glyph) return;

        this.resetAnimatedGlyph();
        this.startAnimateGlyph(glyph);
      })
    );
    this.configSub.add(
      this.config.glyphConfigSubject$.subscribe(() => {
        if (this.magicLenseStatus) this.magicLensComponent.renderMagicLensGlyphs(this.selectedTimestamp, this.selectedAlgorithm, true);
        this.renderGlyphs();
      })
    );
  }

  private observeResize() {
    const container = this.canvasContainer.nativeElement;

    this.resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const width = Math.floor(entry.contentRect.width);
        const height = Math.floor(entry.contentRect.height);
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.sizeInfo.update(this.canvasWidth, this.canvasHeight);

        // this.renderer.setSize(width, height, false); // corrupts scene
        this.camera.left = width / -2;
        this.camera.right = width / 2;
        this.camera.top = height / 2;
        this.camera.bottom = height / -2;
        this.camera.updateProjectionMatrix();
        this.simulation?.force('collide', forceCollide(this.sizeInfo.getRadius(ZoomLevel.high)));
        this.resetAnimatedGlyph();
        this.renderGlyphs();
      }
    });

    this.resizeObserver.observe(container);
  }

  private initSimulation() {
    this.simulation = forceSimulation(this.glyphData.map(glyph => glyph.getCacheObject(this.id, this.selectedTimestamp, this.selectedAlgorithm)))
      .force('collide', forceCollide(this.sizeInfo.getRadius(ZoomLevel.high)))
      .velocityDecay(0.5)
      .stop();
  }
  //#endregion

  //#region Mode Changes
  toggleSelectionMode(doToggle = true) {
    this.selectionMode = !this.selectionMode && doToggle;
    if (this.selectionMode) {
      this.canvasContainer.nativeElement.classList.add('selecting');
      this.clearHoveredGlyph();
      this.tooltipComponent.cancelHoverPopup();
      this.toggleMagicLens(false);
    } else {
      this.canvasContainer.nativeElement.classList.remove('selecting');
    }
  }

  toggleCollisionAvoidance(doToggle = true) {
    if (this.needsRender.has(RenderTask.ForceSimulation || this.needsRender.has(RenderTask.OriginalSimulation))) return;

    this.collisionAvoidance = !this.collisionAvoidance && doToggle;

    if (!this.collisionAvoidance) {
      this.glyphData.forEach(glyph => {
        const cached = glyph.getCacheObject(this.id, this.selectedTimestamp, this.selectedAlgorithm);
        cached.x = cached.position.x;
        cached.y = cached.position.y;
      })
      this.requestRender(RenderTask.OriginalSimulation);
    } else {
      this.requestRender(RenderTask.ForceSimulation);
    }
  }

  toggleAggregation() {
    this.aggregated = !this.aggregated;

    if (this.aggregated) {
      const glyphs: GlyphCacheObject[] = this.glyphData.map(glyph => glyph.getCacheObject(this.id, this.selectedTimestamp, this.selectedAlgorithm));
      clusterGlyphs(glyphs, 10);
    }

    this.renderGlyphs();
  }

  toggleMagicLens(doToggle = true): void {
    this.magicLensComponent.toggle(this.lastMousePosition, doToggle);
    this.tooltipComponent.toggleFixation(false);
    this.tooltipComponent.hideTooltip();
    if (this.magicLensComponent.isActive()) {
      this.tooltipComponent.cancelHoverPopup();
      this.clearHoveredGlyph();
      this.canvasContainer.nativeElement.classList.add('lensing');
      this.toggleSelectionMode(false);
    } else {
      this.canvasContainer.nativeElement.classList.remove('lensing');
      this.toggleFixMagicLens(false);
    }
  }

  toggleFixMagicLens(doToggle = true): void {
    this.magicLensComponent.toggleFix(doToggle);
    if (this.magicLensComponent.isFixed()) {
      this.scene.background = this.disabledBackgroundColor
      this.canvasContainer.nativeElement.classList.remove('lensing');;
    } else {
      if (this.magicLensComponent.isActive()) {
        this.canvasContainer.nativeElement.classList.add('lensing');
      }
      this.scene.background = this.standardBackgroundColor;
    }
  }

  fitToView() {
    if (this.collisionAvoidance) this.toggleCollisionAvoidance();

    this.scaleGroupToFit();
    this.sizeInfo.currentZoomLevel = ZoomLevel.low;
    this.renderGlyphs(true);

    const box = new THREE.Box3().setFromObject(this.glyphGroup);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const margin = 1.1; // 10% padding
    const widthWithMargin = size.x * margin;
    const heightWithMargin = size.y * margin;

    const cameraWidth = this.camera.right - this.camera.left;
    const cameraHeight = this.camera.top - this.camera.bottom;

    const zoomX = cameraWidth / widthWithMargin;
    const zoomY = cameraHeight / heightWithMargin;
    const requiredZoom = Math.min(zoomX, zoomY);

    // Direction preserved
    const direction = new THREE.Vector3().subVectors(this.camera.position, this.target);
    const newTarget = center.clone();
    const newPosition = center.clone().add(direction);

    // Save animation state
    this.fitStartPosition = this.camera.position.clone();
    this.fitEndPosition = newPosition;
    this.fitStartTarget = this.target.clone();
    this.fitEndTarget = newTarget;
    this.fitStartZoom = this.camera.zoom;
    this.fitEndZoom = requiredZoom;
    this.fitAnimationStartTime = performance.now();

    this.requestRender(RenderTask.FitAnimation);
  }

  toggleSettings(): void {
    this.showSettings = !this.showSettings;
  }

  onSettingsChange(payload: { timestamp: string; algorithm: string; context: string }): void {
    this.selectedTimestamp = payload.timestamp;
    this.selectedAlgorithm = payload.algorithm;
    this.selectedContext = payload.context;

    this.positionBounds = undefined;
    this.renderGlyphs();
    this.fitToView();
    this.magicLensComponent.clearLensGlyphs();
    this.magicLensComponent.renderMagicLensGlyphs(this.selectedTimestamp, this.selectedAlgorithm);
  }

  onMouseEnter() {
    this.mouseInside = true;
    this.isShiftDown = false;
  }

  onMouseLeave() {
    this.mouseInside = false;
    this.isShiftDown = false;
    if (this.magicLensComponent.isActive() && !this.magicLensComponent.isFixed()) {
      this.toggleMagicLens();
    }
    this.config.animateGlyph(null);
    this.clearHoveredGlyph();
    this.tooltipComponent.cancelHoverPopup();
    this.isPanning = false;
  }

  get magicLenseStatus(): boolean {
    return this.magicLensComponent?.isActive() ?? false;
  }
  //#endregion

  //#region Helper Methods
  private calculateZoomlevel(zoomLevel: number): ZoomLevel {
    let level = ZoomLevel.high;
    if (zoomLevel < 2)
      level = ZoomLevel.low;
    else if (zoomLevel < 10)
      level = ZoomLevel.medium;
    return level;
  }

  checkZoomLevelChanged(oldZoom: number, newZoom: number): boolean {
    const oldZoomLevel = this.calculateZoomlevel(oldZoom);
    const newZoomLevel = this.calculateZoomlevel(newZoom);
    if (oldZoomLevel != newZoomLevel) {
      this.sizeInfo.currentZoomLevel = newZoomLevel;
      this.sizeInfo.update(this.canvasWidth, this.canvasHeight);
      this.renderGlyphs();
    }
    return oldZoomLevel != newZoomLevel;
  }

  updateMousePositions(event: MouseEvent) {
    // Convert screen (px) to NDC (-1 to 1)
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  logStatus() {
    this.logger.log("Component " + this.id);
    this.logger.log("-- isPanning: " + this.isPanning);
    this.logger.log("-- magicLensActive: " + this.magicLensComponent.isActive());
    this.logger.log("-- isSelecting: " + this.isSelecting);
    this.logger.log("-- selectionMode: " + this.selectionMode);
  }
  //#endregion

  //#region Rendering and Glyph Manipulations
  public cancelRender(task: RenderTask) {
    requestAnimationFrame(() => {
      this.needsRender.delete(task);
    });
  }

  public requestRender(task: RenderTask) {
    if (!this.animationFrameId) {
      this.needsRender.add(task);
      this.animate();
    } else {
      requestAnimationFrame(() => {
        this.needsRender.add(task);
      });
    }
  }

  private updateViewRect(): void {
    this.camera.updateMatrixWorld();            // keep pos / rot fresh

    const halfW = (this.camera.right - this.camera.left) / this.camera.zoom * 0.5;
    const halfH = (this.camera.top - this.camera.bottom) / this.camera.zoom * 0.5;

    // camera looks down −Z; x‑y plane is world‑aligned
    this.viewRect.left = this.camera.position.x - halfW;
    this.viewRect.right = this.camera.position.x + halfW;
    this.viewRect.bottom = this.camera.position.y - halfH;
    this.viewRect.top = this.camera.position.y + halfH;
  }

  private animate = () => {
    if (this.needsRender.size == 0) {
      this.animationFrameId = undefined; // stop the loop
      return;
    }

    this.animationFrameId = requestAnimationFrame(this.animate);

    if (this.needsRender.has(RenderTask.ForceSimulation)) {
      this.currentTicks++;
      this.simulation?.tick();

      // Update node positions
      this.glyphData.forEach(glyph => {
        const cached = glyph.getCacheObject(this.id, this.selectedTimestamp, this.selectedAlgorithm);
        cached.mesh?.position.set(cached.x ?? 0, cached.y ?? 0, 0);
      });

      if (this.currentTicks > this.maxTicks) {
        this.currentTicks = 0;
        this.cancelRender(RenderTask.ForceSimulation);
      }
    } else if (this.needsRender.has(RenderTask.OriginalSimulation)) {
      this.animateBackToOriginal();
    }

    if (this.needsRender.has(RenderTask.GlyphAnimation) && this.sizeInfo.currentZoomLevel == ZoomLevel.low) {
      if (this.animateGlyph != null) {
        const elapsed = performance.now() - this.pulseStartTime;
        // Pulsate with sine wave (e.g., 2 Hz frequency)
        const scaleFactor = 2 + 0.8 * Math.sin((elapsed / 3000) * 2 * Math.PI * 2);
        this.animateGlyph.getMesh(this.selectedTimestamp, this.selectedAlgorithm, this.id)?.scale.set(scaleFactor, scaleFactor, scaleFactor);
      }
    }

    this.updateFitAnimation();
    this.updateClipping();
    this.renderer.render(this.scene, this.camera);
    this.magicLensComponent.renderLens(this.lastMousePosition);
    this.cancelRender(RenderTask.SceneRender);
  };

  private animateBackToOriginal(speed = 0.1) {
    let finished = true;
    this.glyphData.forEach(glyph => {
      const cachedObject = glyph.getCacheObject(this.id, this.selectedTimestamp, this.selectedAlgorithm);
      const target = cachedObject.position;
      const mesh = cachedObject.mesh;

      if (mesh) {
        const finalPosition = nearlyEqual(mesh.position.x, target.x) && nearlyEqual(mesh.position.y, target.y);
        finished = finished && finalPosition;
        mesh.position.lerp(
          new THREE.Vector3(target.x, target.y, 0),
          speed
        );
      }
    });
    if (finished) this.needsRender.delete(RenderTask.OriginalSimulation);
  }

  private scaleGroupToFit(): void {
    this.glyphData.forEach(glyph => {
      if (this.positionBounds == undefined) return;

      const cacheObject = glyph.getCacheObject(this.id, this.selectedTimestamp, this.selectedAlgorithm);
      const originalX = glyph.getPosition(this.selectedTimestamp, this.selectedAlgorithm).x ?? 0;
      const originalY = glyph.getPosition(this.selectedTimestamp, this.selectedAlgorithm).y ?? 0;

      const { x: scaledX, y: scaledY } = scalePosition(
        originalX,
        originalY,
        this.positionBounds, // set this during layout initialization
        this.canvasWidth,
        this.canvasHeight
      );

      cacheObject.position.x = scaledX; // save for later reference to restore collision detection etc. 
      cacheObject.position.y = scaledY;
      cacheObject.x = scaledX;
      cacheObject.y = scaledY;
      cacheObject.mesh?.position.set(scaledX, scaledY, 0);
    });
  }

  private updateFitAnimation() {
    if (this.fitAnimationStartTime === null) return;

    if (this.glyphData.length > 5000) {
      this.fitAnimationStartTime = null;
      this.camera.position.copy(this.fitEndPosition);
      this.target.copy(this.fitEndTarget);
      this.camera.zoom = this.fitEndZoom;
      this.camera.updateProjectionMatrix();
      this.camera.lookAt(this.target);
    } else {
      const now = performance.now();
      const elapsed = now - this.fitAnimationStartTime;
      const t = Math.min(elapsed / this.fitDuration, 1);

      // Easing function: easeInOutQuad
      const easedT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      // Interpolate position
      const currentPosition = new THREE.Vector3().lerpVectors(
        this.fitStartPosition,
        this.fitEndPosition,
        easedT
      );
      this.camera.position.copy(currentPosition);

      // Interpolate target
      const currentTarget = new THREE.Vector3().lerpVectors(
        this.fitStartTarget,
        this.fitEndTarget,
        easedT
      );
      this.target.copy(currentTarget);

      // Interpolate zoom
      this.camera.zoom = THREE.MathUtils.lerp(this.fitStartZoom, this.fitEndZoom, easedT);
      this.camera.updateProjectionMatrix();
      this.camera.lookAt(this.target);

      if (t === 1) {
        this.checkZoomLevelChanged(this.fitStartZoom, this.camera.zoom);
        this.cancelRender(RenderTask.FitAnimation);
        this.fitAnimationStartTime = null;
      }
    }
  }

  private updateClipping() {
    this.updateViewRect();
    const { left, right, bottom, top } = this.viewRect;
    const r = this.sizeInfo.radius;

    this.glyphData.forEach(glyph => {
      const cachedObject = glyph.getCacheObject(this.id, this.selectedTimestamp, this.selectedAlgorithm);
      const isVisible =
        cachedObject.position.x + r > left &&                // right edge > left pane
        cachedObject.position.x - r < right &&                // left  edge < right pane
        cachedObject.position.y + r > bottom &&                // top    edge > bottom pane
        cachedObject.position.y - r < top;                     // bottom edge < top pane
      if (!cachedObject.visible && isVisible) this.renderGlyph(glyph);
      cachedObject.visible = isVisible;
    });
  }

  private startAnimateGlyph(glyph: GlyphObject | null) {
    if (glyph == null) {
      this.animateGlyph = null;
    } else {
      this.renderGlyph(glyph);
      this.animateGlyph = glyph;
      this.pulseStartTime = performance.now();
      this.requestRender(RenderTask.GlyphAnimation);
    }
  }

  private resetAnimatedGlyph() {
    this.animateGlyph?.getMesh(this.selectedTimestamp, this.selectedAlgorithm, this.id)?.scale.set(1, 1, 1); // Reset scale
    if (this.animateGlyph != null) this.renderGlyph(this.animateGlyph);
    this.cancelRender(RenderTask.GlyphAnimation);
  }

  private renderGlyphs(force = false): void {
    if (this.scene === undefined) return;

    this.glyphData.forEach((glyph: GlyphObject) => {
      const cacheObject = glyph.getCacheObject(this.id, this.selectedTimestamp, this.selectedAlgorithm);
      const oldMesh = cacheObject.mesh;
      if (oldMesh) this.glyphGroup.remove(oldMesh);
      if (cacheObject.visible || force) {
        const mesh = glyph.render(this.sizeInfo, this.selectedTimestamp, this.selectedAlgorithm, this.id, this.aggregated);
        if (mesh != null) this.glyphGroup.add(mesh);
      }
    });

    this.updatePositionBounds();
    this.requestRender(RenderTask.SceneRender);
  }

  private updatePositionBounds() {
    if (this.positionBounds == undefined && this.glyphData.length > 0) {
      const xs = this.glyphData.map(g => g.getPosition(this.selectedTimestamp, this.selectedAlgorithm).x ?? 0);
      const ys = this.glyphData.map(g => g.getPosition(this.selectedTimestamp, this.selectedAlgorithm).y ?? 0);
      this.positionBounds = {
        minX: Math.min(...xs),
        maxX: Math.max(...xs),
        minY: Math.min(...ys),
        maxY: Math.max(...ys),
      };
    }
  }

  private renderGlyph(glyph: GlyphObject) {
    let mesh = glyph.getMesh(this.selectedTimestamp, this.selectedAlgorithm, this.id);
    if (mesh != undefined) this.glyphGroup.remove(mesh);

    let newMesh = glyph.render(this.sizeInfo, this.selectedTimestamp, this.selectedAlgorithm, this.id, this.aggregated);

    if (newMesh) {
      // TODO: Implement new method for rendering glyphs from other lens
      if (glyph.isInLense &&
        !this.magicLensComponent.lensGlyphs.includes(glyph) &&
        this.sizeInfo.currentZoomLevel == ZoomLevel.low) {
        const lensSize = this.sizeInfo.clone();
        lensSize.currentZoomLevel = ZoomLevel.high;
        lensSize.radius = lensSize.radius * 8;
        const spread = 120;

        const lensMesh = glyph.render(lensSize, this.selectedTimestamp, this.selectedAlgorithm, this.id, this.aggregated);
        if (lensMesh != null) {
          const pos = lensMesh.position.clone();

          const jitter = new THREE.Vector3(
            jitterFromVector(pos) * spread,
            jitterFromVector(pos.clone().addScalar(1)) * spread, 0
          );

          lensMesh.position.copy(pos.add(jitter));
          // lensMesh.scale.addScalar(scale);
          newMesh = lensMesh;
        }
      }
      this.glyphGroup.add(newMesh);
    }
    this.requestRender(RenderTask.SceneRender);
  }

  private applyFilters() {
    const filters = this.dataProvider.getFilters();
    if (!filters.includes(this.selectionFilter)) {
      this.selectionFilter.filterMode = FilterMode.Or;
      filters.push(this.selectionFilter);
    }
    this.dataProvider.refreshFilters();
    this.config.redraw();
  }

  private highlightSelectedObjects(selectedObjects: THREE.Object3D[], replace = false): void {
    if (selectedObjects.length == 0) {
      this.dataProvider.clearIdFilters();
    } else {
      if (replace) {
        this.dataProvider.clearIdFilters();
      }
      for (const glyph of this.glyphData) {
        const cache = glyph.getCacheObject(this.id, this.selectedTimestamp, this.selectedAlgorithm);
        const obj = cache.mesh;

        if (obj && selectedObjects.includes(obj)) {
          (this.selectionFilter as IdFilter).add(glyph.id);
        }
      }
    }
    this.applyFilters();
  }

  private clearHoveredGlyph() {
    if (this.currentHoveredObject != null) {
      this.currentHoveredObject.setHighlighted(false);
      this.config.redrawGlyph(this.currentHoveredObject);
    }
  }
  //#endregion

  //#region Selection
  private isMouseOverOverlay(event: MouseEvent): boolean {
    const el = document.elementFromPoint(event.clientX, event.clientY);
    return el?.closest('.overlay-controls') !== null;
  }

  private updateSelectionBox(): void {
    const x = Math.min(this.selectionStart.x, this.selectionEnd.x);
    const y = Math.min(this.selectionStart.y, this.selectionEnd.y);
    const w = Math.abs(this.selectionEnd.x - this.selectionStart.x);
    const h = Math.abs(this.selectionEnd.y - this.selectionStart.y);

    this.selectionBox = { left: x, top: y, width: w, height: h };
  }

  private selectObjectsInRectangle(): void {
    this.selectionBox = { left: 0, top: 0, width: 0, height: 0 };

    const x1 = Math.min(this.selectionStart.x, this.selectionEnd.x);
    const y1 = Math.min(this.selectionStart.y, this.selectionEnd.y);
    const x2 = Math.max(this.selectionStart.x, this.selectionEnd.x);
    const y2 = Math.max(this.selectionStart.y, this.selectionEnd.y);

    const contained: THREE.Object3D[] = [];

    this.glyphGroup.children.forEach((obj) => {
      const screen = convertToScreenSpace(obj, this.camera, this.renderer.domElement);
      if (screen.x >= x1 && screen.x <= x2 && screen.y >= y1 && screen.y <= y2) {
        contained.push(obj);
      }
    });

    this.highlightSelectedObjects(contained, !this.isShiftDown);
  }
  //#endregion

  //#region HostListeners
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Shift') this.isShiftDown = true;
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    if (checkTextInput(event)) return;

    if (!this.mouseInside) return;

    if (event.key === 'Shift') this.isShiftDown = false;
    if (event.key.toLowerCase() === 'c') {
      this.toggleCollisionAvoidance();
    }
    if (event.key.toLowerCase() === 'f') {
      this.fitToView();
    }
    if (event.key.toLowerCase() === 'a') {
      this.toggleAggregation();
    }
    if (event.key.toLowerCase() === 'd') {
      this.toggleSettings();
    }
    if (event.key.toLowerCase() === 's') {
      this.toggleSelectionMode();
    }
    if (event.key.toLowerCase() === 'x') {
      this.renderGlyphs();
    }
    // TODO: Magic lens feature is broken
    // if (event.key.toLowerCase() === 'l') {
    //   this.toggleMagicLens();
    //   this.clearHoveredGlyph();
    //   this.magicLensComponent.updateMagicLens(this.lastMousePosition, this.camera, this.renderer);
    //   this.magicLensComponent.renderMagicLensGlyphs(this.selectedTimestamp, this.selectedAlgorithm);
    // }
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    this.mouseDownTime = Date.now();

    if (this.magicLensComponent.isActive()) return;

    this.lastMousePosition.set(event.clientX, event.clientY);
    this.isPanning = true;

    if (this.selectionMode) {
      this.isSelecting = true;
      this.selectionStart.set(event.clientX, event.clientY);
      this.selectionEnd.copy(this.selectionStart);
    }
  }

  @HostListener('mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    this.isPanning = false;

    if (this.isMouseOverOverlay(event)) {
      // Skip THREE.js interaction
      return;
    }

    const dx = event.clientX - this.lastMousePosition.x;
    const dy = event.clientY - this.lastMousePosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const elapsedTime = Date.now() - this.mouseDownTime;

    const isClick = distance < this.clickThreshold && elapsedTime < this.clickTimeThreshold;

    if (isClick && this.magicLensComponent.isActive()) {
      this.toggleFixMagicLens();
      return;
    }

    if (this.magicLensComponent.isFixed() && this.magicLensComponent.isActive()) {
      this.tooltipComponent.cancelHoverPopup();
      this.toggleFixMagicLens();
    }

    if (isClick && !this.selectionMode) {
      if (this.currentHoveredObject != null) {
        this.tooltipComponent.toggleFixation();
      }
      return;
    }

    if (this.isSelecting && this.selectionMode) {
      this.isSelecting = false;

      // Single selection is a simple click
      if (this.selectionStart.distanceTo(this.selectionEnd) < 0.1) {
        let closestObject: THREE.Object3D | null = hitTest(event, this.renderer, this.glyphGroup, this.camera, this.sizeInfo);
        this.updateMousePositions(event);

        if (closestObject != null) {
          const glyph = getGlyphFromObject(closestObject);
          if (glyph != null) {
            (this.selectionFilter as IdFilter).toggle(glyph.id);
            this.applyFilters();
          }
        } else {
          this.dataProvider.clearIdFilters();
          this.applyFilters();
        }
      } else {
        this.selectObjectsInRectangle();
      }
    }
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isMouseOverOverlay(event) || this.tooltipComponent.isFixed()) {
      this.isSelecting = false;
      this.tooltipComponent.cancelHoverPopup();
      // Skip THREE.js interaction
      return;
    }

    this.updateMousePositions(event);

    if (this.magicLensComponent.isActive() && this.magicLensComponent.isFixed()) {
      let closestObject: THREE.Object3D | null = this.magicLensComponent.doHitTest(event);
      if (closestObject != null) {
        const hoveredGlyph = getGlyphFromObject(closestObject);
        if (hoveredGlyph != null && this.currentHoveredObject != hoveredGlyph) {
          this.currentHoveredObject = hoveredGlyph;
          this.tooltipComponent.cancelHoverPopup();
          this.tooltipComponent.scheduleHoverPopup(event.clientX, event.clientY, closestObject as THREE.Object3D);
        }
      } else {
        this.tooltipComponent.cancelHoverPopup();
        this.currentHoveredObject = null;
      }
      return;
    }

    if (this.magicLensComponent.isActive()) {
      this.lastMousePosition.set(event.clientX, event.clientY);
      this.magicLensComponent.renderMagicLensGlyphs(this.selectedTimestamp, this.selectedAlgorithm);
      this.magicLensComponent.updateMagicLens(this.lastMousePosition, this.camera, this.renderer);
      return;
    }

    if (this.isSelecting) {
      this.selectionEnd.set(event.clientX, event.clientY);
      this.updateSelectionBox();
    } else if (this.isPanning && !this.selectionMode) {
      this.tooltipComponent.cancelHoverPopup();
      panCamera(this.camera, this.lastMousePosition, event, this.target);
      this.requestRender(RenderTask.SceneRender);
    } else if (!this.needsRender.has(RenderTask.ForceSimulation) && !this.isSelecting && !this.selectionMode) {
      const now = performance.now();
      if (now - this.lastHitTestTime < this.throttleDelay) return;
      this.lastHitTestTime = now;

      let closestObject: THREE.Object3D | null = hitTest(event, this.renderer, this.glyphGroup, this.camera, this.sizeInfo);

      if (closestObject != null) {
        const hoveredGlyph = getGlyphFromObject(closestObject);
        if (this.currentHoveredObject != hoveredGlyph) {
          this.clearHoveredGlyph();
          if (hoveredGlyph != null && !hoveredGlyph.highlighted) {
            hoveredGlyph?.setHighlighted(true)
            this.pulseStartTime = performance.now();
            this.renderGlyph(hoveredGlyph);
            this.config.animateGlyph(hoveredGlyph);
            this.currentHoveredObject = hoveredGlyph;
          }
          this.requestRender(RenderTask.SceneRender);

          this.tooltipComponent.cancelHoverPopup();
          this.tooltipComponent.scheduleHoverPopup(event.clientX, event.clientY, closestObject as THREE.Object3D);
        }
      } else {
        this.clearHoveredGlyph();
        this.tooltipComponent.cancelHoverPopup();
        this.config.animateGlyph(null);
        if (this.currentHoveredObject != null) this.requestRender(RenderTask.SceneRender);
        this.currentHoveredObject = null;
      }
    }

    this.lastMousePosition.set(event.clientX, event.clientY);
  }

  private applyZoomAtScreenPoint(screenX: number, screenY: number, newZoom: number, oldZoom: number): void {
    const rect = this.renderer.domElement.getBoundingClientRect();

    const xNDC = ((screenX - rect.left) / rect.width) * 2 - 1;
    const yNDC = -((screenY - rect.top) / rect.height) * 2 + 1;

    const worldBefore = new THREE.Vector3(xNDC, yNDC, 0).unproject(this.camera);

    this.camera.zoom = newZoom;
    this.camera.updateProjectionMatrix();

    const worldAfter = new THREE.Vector3(xNDC, yNDC, 0).unproject(this.camera);
    const delta = worldBefore.sub(worldAfter);

    this.camera.position.x += delta.x;
    this.camera.position.y += delta.y;

    if (this.target) {
      this.target.x += delta.x;
      this.target.y += delta.y;
    }

    this.checkZoomLevelChanged(oldZoom, newZoom);
    this.requestRender(RenderTask.SceneRender);
  }

  private getTouchDistance(event: TouchEvent): number {
    const dx = event.touches[0].clientX - event.touches[1].clientX;
    const dy = event.touches[0].clientY - event.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private touchCenter = { x: 0, y: 0 };
  private updateTouchCenter(event: TouchEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const cx = (event.touches[0].clientX + event.touches[1].clientX) / 2;
    const cy = (event.touches[0].clientY + event.touches[1].clientY) / 2;

    this.touchCenter.x = ((cx - rect.left) / rect.width) * 2 - 1;
    this.touchCenter.y = -((cy - rect.top) / rect.height) * 2 + 1;
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    if (!this.camera || !this.renderer || this.magicLensComponent.isActive() || this.tooltipComponent.isFixed()) return;

    event.preventDefault();
    this.tooltipComponent.cancelHoverPopup();

    const oldZoom = this.camera.zoom;
    const direction = event.deltaY < 0 ? 1 : -1;
    const scale = Math.pow(this.zoomFactor, direction);
    const newZoom = THREE.MathUtils.clamp(this.camera.zoom * scale, 0.5, 50);

    this.applyZoomAtScreenPoint(event.clientX, event.clientY, newZoom, oldZoom);
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    if (event.touches.length === 1) {
      this.lastTouchPosition = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      };
    }
    if (event.touches.length === 2) {
      this.touchZoomStartDistance = this.getTouchDistance(event);
      this.lastZoom = this.camera?.zoom ?? null;
    }
  }

  @HostListener('touchend', ['$event'])
  @HostListener('touchcancel', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    if (event.touches.length < 2) {
      this.touchZoomStartDistance = null;
      this.lastZoom = null;
    }
    if (event.touches.length < 1) {
      this.lastTouchPosition = null;
    }
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (!this.camera || !this.renderer) return;
    event.preventDefault();

    if (event.touches.length === 1 && this.lastTouchPosition) {
      const currentTouch = event.touches[0];
      const fakeMouseEvent = {
        clientX: currentTouch.clientX,
        clientY: currentTouch.clientY
      } as MouseEvent;

      const from = new THREE.Vector2(this.lastTouchPosition.x, this.lastTouchPosition.y);
      this.tooltipComponent.cancelHoverPopup();

      panCamera(this.camera, from, fakeMouseEvent, this.target);
      this.requestRender(RenderTask.SceneRender);

      this.lastTouchPosition = {
        x: currentTouch.clientX,
        y: currentTouch.clientY
      };
    }

    if (event.touches.length === 2 && this.touchZoomStartDistance !== null) {

      const currentDistance = this.getTouchDistance(event);
      const zoomRatio = currentDistance / this.touchZoomStartDistance;

      const oldZoom = this.lastZoom ?? this.camera.zoom;
      const newZoom = THREE.MathUtils.clamp(oldZoom * zoomRatio, 0.5, 50);

      const centerX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
      const centerY = (event.touches[0].clientY + event.touches[1].clientY) / 2;

      this.updateTouchCenter(event); // similar to `updateMousePositions()`

      this.applyZoomAtScreenPoint(centerX, centerY, newZoom, oldZoom);
    }
  }
  //#endregion
}
