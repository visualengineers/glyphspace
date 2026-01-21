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
import { convertToScreenSpace, exportThreeSceneAsPNG, hitTest, hitTestCandidates, jitterFromVector, nearlyEqual, panCamera, scalePosition, screenToWorld } from '../shared/helpers/three-helper';
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
import { CanvasNavigationControlsComponent } from './navigationcontrols/navigationcontrols.component';
import { SettingsControlPanelComponent } from "./settingscontrols/settingscontrols.component";
import { SpatialGrid } from '../shared/helpers/spatial-grid';
import { HybridGlyphRenderer, GlyphShaderType } from '../glyph/instanced-glyph-renderer';

@Component({
  selector: 'glyph-canvas',
  standalone: true,
  imports: [CommonModule, FormsModule, TooltipComponent, MagiclensComponent, CanvasNavigationControlsComponent, SettingsControlPanelComponent],
  templateUrl: './glyph-canvas.component.html',
  styleUrls: ['./glyph-canvas.component.scss']
})
export class GlyphCanvasComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef;
  @ViewChild('sceneContainer') sceneContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('settingsPanel') settingsPanel!: SettingsControlPanelComponent;
  @ViewChild(TooltipComponent) tooltipComponent!: TooltipComponent;
  @ViewChild(MagiclensComponent) magicLensComponent!: MagiclensComponent;

  @Input() id = 0;
  @Input() totalCells: number = 0;
  glyphData: GlyphObject[] = []; // Public for template binding

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
  private standardBackgroundColor = new THREE.Color(0xffffff);
  private disabledBackgroundColor = new THREE.Color(0xf0f0f0);
  private viewRect = { left: 0, right: 0, top: 0, bottom: 0 };
  private lastViewRect = { left: 0, right: 0, top: 0, bottom: 0 };
  private clippingFrameCounter = 0;
  private spatialGrid = new SpatialGrid<GlyphObject>(100); // Cell size optimized for typical glyph density
  private spatialGridDirty = true;

  // Instanced rendering for large datasets (40K+ glyphs)
  // Increased to 500K to support very large datasets
  private hybridRenderer = new HybridGlyphRenderer(500000);
  private instancedMesh: THREE.InstancedMesh | null = null;
  useInstancedRendering = false; // Public for template binding
  private instancedMeshZoomLevel: ZoomLevel | null = null; // Track which zoom level the mesh was created for
  private instancedMeshGlyphType: GlyphShaderType | null = null; // Track which glyph type the mesh was created for

  // Safety mechanism to prevent infinite render loops
  private renderGlyphsCallCount = 0;
  private renderGlyphsResetTimer: any = null;
  private readonly MAX_RENDER_CALLS_PER_SECOND = 20;
  private isRenderingGlyphs = false; // Guard against re-entrant calls
  private isLoadingData = false; // Guard against config updates during data load

  // D3 force simulation and aggregation
  private simulation: Simulation<GlyphCacheObject, undefined> | undefined;
  collisionAvoidance = false;
  private currentTicks = 0;
  private maxTicks = 50;
  aggregated = false;
  private lensSimulation?: Simulation<GlyphCacheObject, undefined> | undefined;

  // Fields responsible for animating transitions in the scene
  private fitAnimationStartTime: number | null = null;
  private fitStartPosition!: THREE.Vector3;
  private fitEndPosition!: THREE.Vector3;
  private fitStartTarget!: THREE.Vector3;
  private fitEndTarget!: THREE.Vector3;
  private fitStartZoom!: number;
  private fitEndZoom!: number;
  private fitDuration = 500; // ms
  private animationSpeed = 0.1;

  // Helpers for navigation
  private isPanning = false;
  mouseInside = false;
  private mouseIdleTimer: any;
  private readonly MOUSE_IDLE_MS = 2000;
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
  canvasActivated = false;
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

    // Cleanup instanced renderer
    this.hybridRenderer.dispose();
    if (this.instancedMesh) {
      this.instancedMesh.geometry.dispose();
      (this.instancedMesh.material as THREE.Material).dispose();
      this.instancedMesh = null;
    }

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

        console.log(`[Canvas ${this.id}] loadedDataSubject$ fired for: ${loadedData}`);

        // Set loading flag to prevent config change subscriptions from triggering extra renders
        this.isLoadingData = true;

        // Get available timestamps/algorithms for the NEW dataset FIRST
        // This ensures we use valid values when fetching glyph data
        const newTimestamps = this.dataProvider.getTimestamps(loadedData);
        const newAlgorithms = this.dataProvider.getPositions(loadedData);
        const newContexts = this.dataProvider.getContexts(loadedData);

        console.log(`[Canvas ${this.id}] New timestamps: [${newTimestamps.join(', ')}]`);
        console.log(`[Canvas ${this.id}] New algorithms: [${newAlgorithms.join(', ')}]`);

        // Use the first timestamp from the new dataset (not the old selectedTimestamp)
        const timestamp = newTimestamps[0];
        console.log(`[Canvas ${this.id}] Using timestamp: ${timestamp}, algorithm: ${newAlgorithms[0]}`);

        let data = await this.dataProvider.getGlyphData(loadedData, timestamp);
        console.log(`[Canvas ${this.id}] Got ${data?.length ?? 0} glyphs`);

        if (data) this.glyphData = data;

        this.ngZone.run(() => {
          this.timestamps = newTimestamps;
          this.algorithms = newAlgorithms;
          this.contexts = newContexts;

          this.selectedTimestamp = timestamp;
          this.selectedAlgorithm = this.algorithms[0];
          this.selectedContext = this.contexts[0];

          console.log(`[Canvas ${this.id}] Set selectedTimestamp=${this.selectedTimestamp}, selectedAlgorithm=${this.selectedAlgorithm}`);

          this.glyphGroup.clear();

          // Force instanced mesh to be recreated for the new dataset
          // The old mesh might have stale instance data from the previous dataset
          if (this.instancedMesh) {
            this.instancedMesh.geometry.dispose();
            (this.instancedMesh.material as THREE.Material).dispose();
            this.instancedMesh = null;
            this.instancedMeshZoomLevel = null;
            this.instancedMeshGlyphType = null;
            console.log(`[Canvas ${this.id}] Disposed old instanced mesh for new dataset`);
          }

          if (data) {
            // Check if first glyph has positions for this timestamp/algorithm
            const firstGlyph = data[0];
            if (firstGlyph) {
              const hasTimestamp = !!firstGlyph.positions[this.selectedTimestamp];
              const hasAlgorithm = hasTimestamp && !!firstGlyph.positions[this.selectedTimestamp][this.selectedAlgorithm];
              console.log(`[Canvas ${this.id}] First glyph positions check: hasTimestamp=${hasTimestamp}, hasAlgorithm=${hasAlgorithm}`);
              if (hasTimestamp) {
                console.log(`[Canvas ${this.id}] Available algorithms for timestamp: [${Object.keys(firstGlyph.positions[this.selectedTimestamp]).join(', ')}]`);
              }
              console.log(`[Canvas ${this.id}] Available timestamps in glyph: [${Object.keys(firstGlyph.positions).join(', ')}]`);
            }

            this.positionBounds = undefined;
            this.updatePositionBounds();
            console.log(`[Canvas ${this.id}] Position bounds: ${JSON.stringify(this.positionBounds)}`);

            this.spatialGridDirty = true;
            // Reset viewport tracking to force updateClipping to recalculate visibility
            this.lastViewRect = { left: Infinity, right: -Infinity, top: -Infinity, bottom: Infinity };

            // Note: spatial grid is rebuilt inside fitToView() after positions are scaled
            this.fitToView();
            this.initSimulation();
          } else {
            console.warn(`[Canvas ${this.id}] No data received!`);
          }

          // Clear loading flag after data is loaded and rendered
          this.isLoadingData = false;
        });
      })
    );
    // Subscribe to collection updates to catch new algorithms added by background projections
    this.configSub.add(
      this.dataProvider.dataSetCollectionSubject$.subscribe(() => {
        const loadedData = this.config.loadedData;
        if (loadedData) {
          const newAlgorithms = this.dataProvider.getPositions(loadedData);
          // Only update if we have new algorithms
          if (newAlgorithms.length > this.algorithms.length) {
            this.ngZone.run(() => {
              this.algorithms = newAlgorithms;
            });
          }
        }
      })
    );
    this.configSub.add(
      this.config.drawMagicLensGlyphsSubject$.subscribe(glyphs => {
        if (glyphs != null) {
          this.renderMagicLensGlyphs(glyphs);
        }
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
        // Skip if we're currently loading data - fitToView() will handle rendering
        if (this.isLoadingData) return;

        // Debounce config changes to prevent rapid-fire renders during background projections
        if (this.configDebounceTimer) {
          clearTimeout(this.configDebounceTimer);
        }
        this.configDebounceTimer = setTimeout(() => {
          if (this.magicLenseStatus) this.magicLensComponent.renderMagicLensGlyphs(this.selectedTimestamp, this.selectedAlgorithm, true);
          // Force render all glyphs when config changes - glyph geometry needs to be
          // recreated with new features, regardless of current visibility state
          this.renderGlyphs(true);
        }, 100);
      })
    );
  }

  private configDebounceTimer: any = null;

  private resizeDebounceTimer: any = null;

  private observeResize() {
    const container = this.canvasContainer.nativeElement;

    this.resizeObserver = new ResizeObserver(entries => {
      // Skip resize handling during data loading to prevent render loops
      if (this.isLoadingData) return;

      for (let entry of entries) {
        const width = Math.floor(entry.contentRect.width);
        const height = Math.floor(entry.contentRect.height);

        // Skip if dimensions haven't actually changed
        if (width === this.canvasWidth && height === this.canvasHeight) return;
        // Skip zero-dimension sizes (element being removed/hidden)
        if (width === 0 || height === 0) return;

        // Debounce resize handling to prevent rapid-fire calls
        if (this.resizeDebounceTimer) {
          clearTimeout(this.resizeDebounceTimer);
        }

        this.resizeDebounceTimer = setTimeout(() => {
          this.handleResize(width, height);
        }, 100);
      }
    });

    this.resizeObserver.observe(container);
  }

  private handleResize(width: number, height: number): void {
    // Double-check in case something changed during debounce
    if (this.isLoadingData) return;
    if (width === this.canvasWidth && height === this.canvasHeight) return;

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

  private initSimulation() {
    this.simulation = forceSimulation(this.glyphData.map(glyph => glyph.getCacheObject(this.id, this.selectedTimestamp, this.selectedAlgorithm)))
      .force('collide', forceCollide(this.sizeInfo.getRadius(ZoomLevel.high)))
      .velocityDecay(0.5)
      .stop();
  }
  //#endregion

  //#region Mode Changes
  toggleNavigationMode(doToggle = true) {
    this.toggleSelectionMode(false);
    this.toggleMagicLens(false);
  }

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
      this.animationSpeed = 0.1;
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
      this.scene.background = this.disabledBackgroundColor;
      this.canvasContainer.nativeElement.classList.remove('lensing');
      this.requestRender(RenderTask.SceneRender);
    } else {
      if (this.magicLensComponent.isActive()) {
        this.canvasContainer.nativeElement.classList.add('lensing');
      }
      this.scene.background = this.standardBackgroundColor;
    }
  }

  takeScreenshot() {
    exportThreeSceneAsPNG(this.renderer, this.scene, this.camera,
      {
        filename: "three-scene-" + this.id + ".png",
        scaleFactor: 2,
        restoreAfterExport: true,
        canvasElement: this.canvasContainer.nativeElement
      }
    )
  }

  fitToView() {
    if (this.collisionAvoidance) this.toggleCollisionAvoidance();

    this.scaleGroupToFit();
    // Rebuild spatial grid after positions are scaled
    this.rebuildSpatialGrid();
    this.sizeInfo.currentZoomLevel = ZoomLevel.low;
    this.renderGlyphs(true);

    // Calculate bounding box from glyph cache positions
    // (instanced meshes don't update their bounding box from instance positions)
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    for (const glyph of this.glyphData) {
      const cache = glyph.getCacheObject(this.id, this.selectedTimestamp, this.selectedAlgorithm);
      const x = cache.x ?? 0;
      const y = cache.y ?? 0;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }

    const size = new THREE.Vector3(maxX - minX, maxY - minY, 0);
    const center = new THREE.Vector3((minX + maxX) / 2, (minY + maxY) / 2, 0);

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

    console.log(`[Canvas ${this.id}] fitToView: bounds=(${minX.toFixed(1)}, ${minY.toFixed(1)}) to (${maxX.toFixed(1)}, ${maxY.toFixed(1)}), center=(${center.x.toFixed(1)}, ${center.y.toFixed(1)}), zoom=${requiredZoom.toFixed(3)}, camPos=(${newPosition.x.toFixed(1)}, ${newPosition.y.toFixed(1)})`);

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

  onAnimationSpeedChanged(speed: number) {
    this.animationSpeed = speed;
  }

  onTogglePlayback() {
    if (!this.needsRender.has(RenderTask.OriginalSimulation)) {
      this.requestRender(RenderTask.OriginalSimulation);
    } else {
      this.cancelRender(RenderTask.OriginalSimulation);
    }
  }

  onSettingsChange(payload: { timestamp: string; algorithm: string; context: string }): void {
    console.log(`[Canvas ${this.id}] onSettingsChange: timestamp=${payload.timestamp}, algorithm=${payload.algorithm}, context=${payload.context}`);
    console.log(`[Canvas ${this.id}] Previous: timestamp=${this.selectedTimestamp}, algorithm=${this.selectedAlgorithm}`);

    this.selectedTimestamp = payload.timestamp;
    this.selectedAlgorithm = payload.algorithm;
    this.selectedContext = payload.context;

    this.positionBounds = undefined;
    this.updatePositionBounds();

    this.glyphData.forEach(glyph => {
      const cache = glyph.getCacheObject(this.id, this.selectedTimestamp, this.selectedAlgorithm);
      if (cache && this.positionBounds) {
        const newPos = glyph.getPosition(this.selectedTimestamp, this.selectedAlgorithm);
        const scalePos = scalePosition(
          newPos.x,
          newPos.y,
          this.positionBounds, // set this during layout initialization
          this.canvasWidth,
          this.canvasHeight
        );
        cache.position.x = scalePos.x;
        cache.position.y = scalePos.y;
        cache.x = scalePos.x;
        cache.y = scalePos.y;
      }
    });

    // Rebuild spatial grid with new positions for correct hit testing
    this.rebuildSpatialGrid();

    // Log first glyph positions for debugging
    if (this.glyphData.length > 0) {
      const firstGlyph = this.glyphData[0];
      const firstCache = firstGlyph.getCacheObject(this.id, this.selectedTimestamp, this.selectedAlgorithm);
      console.log(`[Canvas ${this.id}] After onSettingsChange: first glyph target=(${firstCache.position.x.toFixed(1)}, ${firstCache.position.y.toFixed(1)}), mesh pos=(${firstCache.mesh?.position.x.toFixed(1) ?? 'no mesh'}, ${firstCache.mesh?.position.y.toFixed(1) ?? 'no mesh'})`);
    }

    // Animate glyphs to their new positions
    // For instanced rendering, the animation loop will update instance matrices
    // For individual rendering, the animation loop will lerp mesh positions
    console.log(`[Canvas ${this.id}] Requesting OriginalSimulation render task, useInstancedRendering=${this.useInstancedRendering}`);
    this.requestRender(RenderTask.OriginalSimulation);
    this.magicLensComponent.clearLensGlyphs();
  }

  private resetMouseIdleTimer(): void {
    this.clearMouseIdleTimer();

    this.mouseIdleTimer = setTimeout(() => {
      this.mouseInside = false;
    }, this.MOUSE_IDLE_MS);
  }

  private clearMouseIdleTimer(): void {
    if (this.mouseIdleTimer) {
      clearTimeout(this.mouseIdleTimer);
      this.mouseIdleTimer = null;
    }
  }

  onMouseEnter() {
    this.mouseInside = true;
    this.isShiftDown = false;
    this.resetMouseIdleTimer();
  }

  onMouseLeave() {
    this.clearMouseIdleTimer();
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

      // Reset the tracked zoom level so renderGlyphsInstanced knows to recreate the mesh
      // The mesh will be recreated with the appropriate shader in renderGlyphs()
      this.instancedMeshZoomLevel = null;
      this.instancedMeshGlyphType = null;

      // Rebuild spatial grid with new radius for correct hit testing
      this.rebuildSpatialGrid();
      // Force render all glyphs when zoom level changes - glyph geometry
      // needs to be recreated and visibility state may be stale
      this.renderGlyphs(true);
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
      if (this.useInstancedRendering && this.instancedMesh) {
        // For instanced rendering, update currentX/currentY and refresh the instance buffer
        this.glyphData.forEach(glyph => {
          const cached = glyph.getCacheObject(this.id, this.selectedTimestamp, this.selectedAlgorithm);
          cached.currentX = cached.x ?? 0;
          cached.currentY = cached.y ?? 0;
        });
        const renderer = this.hybridRenderer.getInstancedRenderer();
        renderer.updateInstances(
          this.instancedMesh,
          this.glyphData,
          this.sizeInfo,
          this.config.color.bind(this.config),
          this.config.colorFeature,
          this.config.activeFeatures,
          this.config.featureMaxValues,
          this.config.featureTypes,
          this.selectedTimestamp,
          this.selectedAlgorithm,
          this.id
        );
        renderer.applyToMesh(this.instancedMesh);
      } else {
        // For individual rendering, update mesh positions directly
        this.glyphData.forEach(glyph => {
          const cached = glyph.getCacheObject(this.id, this.selectedTimestamp, this.selectedAlgorithm);
          cached.mesh?.position.set(cached.x ?? 0, cached.y ?? 0, 0);
        });
      }

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
    this.cancelRender(RenderTask.SceneRender);
  };

  private animateBackToOriginal() {
    if (this.useInstancedRendering) {
      this.animateBackToOriginalInstanced();
    } else {
      this.animateBackToOriginalIndividual();
    }
  }

  private animateBackToOriginalIndividual() {
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
          this.animationSpeed
        );
      }
    });
    if (finished) {
      this.needsRender.delete(RenderTask.OriginalSimulation);
    }
  }

  private animateBackToOriginalInstanced() {
    // If instanced mesh doesn't exist yet, create it first
    if (!this.instancedMesh) {
      const renderer = this.hybridRenderer.getInstancedRenderer();
      // Get the current glyph type for shader selection
      const glyphTypeEnum = this.config.getConfiguration().glyphType;
      const currentGlyphType = HybridGlyphRenderer.getShaderType(
        glyphTypeEnum === 1 ? 'star' : (glyphTypeEnum === 2 ? 'flower' : (glyphTypeEnum === 3 ? 'whisker' : 'star'))
      );
      this.instancedMesh = renderer.createInstancedMesh(this.sizeInfo.currentZoomLevel, currentGlyphType);
      this.instancedMeshZoomLevel = this.sizeInfo.currentZoomLevel;
      this.instancedMeshGlyphType = currentGlyphType;
      this.glyphGroup.add(this.instancedMesh);
    }

    let finished = true;

    // Lerp all glyph positions toward their targets
    for (const glyph of this.glyphData) {
      const cachedObject = glyph.getCacheObject(this.id, this.selectedTimestamp, this.selectedAlgorithm);
      if (!cachedObject.visible) continue;

      const done = cachedObject.lerpToTarget(this.animationSpeed);
      if (!done) {
        finished = false;
      }
    }

    // Update instanced mesh with new positions
    const renderer = this.hybridRenderer.getInstancedRenderer();
    renderer.updateInstances(
      this.instancedMesh,
      this.glyphData,
      this.sizeInfo,
      this.config.color.bind(this.config),
      this.config.colorFeature,
      this.config.activeFeatures,
      this.config.featureMaxValues,
      this.config.featureTypes,
      this.selectedTimestamp,
      this.selectedAlgorithm,
      this.id
    );
    renderer.applyToMesh(this.instancedMesh);

    if (finished) {
      this.needsRender.delete(RenderTask.OriginalSimulation);
    }
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
      // Also set current position for instanced animation (no animation on initial load)
      cacheObject.currentX = scaledX;
      cacheObject.currentY = scaledY;
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
    // Throttle to 30fps (every 2nd frame)
    this.clippingFrameCounter++;
    if (this.clippingFrameCounter % 2 !== 0) return;

    this.updateViewRect();
    const { left, right, bottom, top } = this.viewRect;

    // Skip if viewport hasn't changed significantly
    const threshold = this.sizeInfo.radius * 0.5;
    if (
      Math.abs(left - this.lastViewRect.left) < threshold &&
      Math.abs(right - this.lastViewRect.right) < threshold &&
      Math.abs(top - this.lastViewRect.top) < threshold &&
      Math.abs(bottom - this.lastViewRect.bottom) < threshold
    ) {
      return;
    }

    // Update cached viewport
    this.lastViewRect.left = left;
    this.lastViewRect.right = right;
    this.lastViewRect.top = top;
    this.lastViewRect.bottom = bottom;

    const r = this.sizeInfo.radius;
    let visibilityChanged = false;

    // Use spatial grid for efficient viewport culling if available
    if (this.spatialGrid.size > 0 && this.glyphData.length > 500) {
      // For large datasets, use spatial grid O(k) instead of full scan O(n)
      // Use a generous margin based on the spatial grid cell size to ensure we don't miss glyphs
      // when zoomed in (sizeInfo.radius changes with zoom but grid was built with original radius)
      const gridMargin = Math.max(r, this.spatialGrid.getCellSize());
      const visibleGlyphs = this.spatialGrid.queryRect(left - gridMargin, right + gridMargin, bottom - gridMargin, top + gridMargin);

      // Mark glyphs based on viewport visibility
      // First, mark all glyphs that are in the spatial query result as potentially visible
      // Then do a precise bounds check for each
      for (const glyph of this.glyphData) {
        const cachedObject = glyph.getCacheObject(this.id, this.selectedTimestamp, this.selectedAlgorithm);
        const wasVisible = cachedObject.visible;

        // If glyph is in the spatial query result, do precise bounds check
        let isNowVisible = false;
        if (visibleGlyphs.has(glyph)) {
          const x = cachedObject.x ?? 0;
          const y = cachedObject.y ?? 0;
          // Use precise bounds check with current radius
          isNowVisible = x + r > left && x - r < right && y + r > bottom && y - r < top;
        }

        if (wasVisible !== isNowVisible) {
          visibilityChanged = true;
          cachedObject.visible = isNowVisible;
        }

        // For individual rendering, render newly visible glyphs
        if (!this.useInstancedRendering && !wasVisible && isNowVisible) {
          this.renderGlyph(glyph);
        }
      }
    } else {
      // For small datasets, use simple iteration (more efficient due to less overhead)
      this.glyphData.forEach(glyph => {
        const cachedObject = glyph.getCacheObject(this.id, this.selectedTimestamp, this.selectedAlgorithm);
        const x = cachedObject.x ?? 0;
        const y = cachedObject.y ?? 0;
        const wasVisible = cachedObject.visible;
        const isNowVisible =
          x + r > left &&
          x - r < right &&
          y + r > bottom &&
          y - r < top;

        if (wasVisible !== isNowVisible) {
          visibilityChanged = true;
          cachedObject.visible = isNowVisible;
        }

        // For individual rendering, render newly visible glyphs
        if (!this.useInstancedRendering && !wasVisible && isNowVisible) {
          this.renderGlyph(glyph);
        }
      });
    }

    // For instanced rendering, rebuild instances when visibility changes
    if (this.useInstancedRendering && visibilityChanged && this.instancedMesh) {
      const renderer = this.hybridRenderer.getInstancedRenderer();
      renderer.updateInstances(
        this.instancedMesh,
        this.glyphData,
        this.sizeInfo,
        this.config.color.bind(this.config),
        this.config.colorFeature,
        this.config.activeFeatures,
        this.config.featureMaxValues,
        this.config.featureTypes,
        this.selectedTimestamp,
        this.selectedAlgorithm,
        this.id
      );
      renderer.applyToMesh(this.instancedMesh);
    }
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

    // Guard against re-entrant calls (can happen when config updates trigger renders)
    if (this.isRenderingGlyphs) return;
    this.isRenderingGlyphs = true;

    // Debug: log call stack when calls are getting frequent
    if (this.renderGlyphsCallCount > 5) {
      console.log(`[Canvas ${this.id}] renderGlyphs call #${this.renderGlyphsCallCount + 1} stack:`, new Error().stack?.split('\n').slice(1, 5).join('\n'));
    }

    console.log(`[Canvas ${this.id}] renderGlyphs called: force=${force}, glyphCount=${this.glyphData.length}, timestamp=${this.selectedTimestamp}, algorithm=${this.selectedAlgorithm}`);

    // Safety mechanism to prevent infinite render loops
    this.renderGlyphsCallCount++;
    if (this.renderGlyphsResetTimer) {
      clearTimeout(this.renderGlyphsResetTimer);
    }
    this.renderGlyphsResetTimer = setTimeout(() => {
      this.renderGlyphsCallCount = 0;
    }, 1000);

    if (this.renderGlyphsCallCount > this.MAX_RENDER_CALLS_PER_SECOND) {
      console.error(`Infinite render loop detected (${this.renderGlyphsCallCount} calls/sec). Breaking loop.`);
      this.renderGlyphsCallCount = 0;
      this.isRenderingGlyphs = false;
      return;
    }

    // Get the current glyph type for instancing decision
    // GlyphType enum: None=0, Star=1, Flower=2, Whisker=3, Dot=4, Thumb=5
    const glyphType = this.config.getConfiguration().glyphType;
    const glyphTypeStr = glyphType === 1 ? 'star' : (glyphType === 2 ? 'flower' : (glyphType === 3 ? 'whisker' : 'other'));

    // Check if we should use instanced rendering for performance
    const shouldUseInstancing = this.hybridRenderer.shouldUseInstancing(
      this.glyphData.length,
      this.sizeInfo.currentZoomLevel,
      glyphTypeStr
    );
    console.log(`[Canvas ${this.id}] Rendering mode: instanced=${shouldUseInstancing}, zoomLevel=${this.sizeInfo.currentZoomLevel}, glyphType=${glyphTypeStr}`);

    // If switching rendering mode, clean up the old mode
    if (shouldUseInstancing !== this.useInstancedRendering) {
      if (this.useInstancedRendering && this.instancedMesh) {
        // Switching from instanced to individual - remove and dispose instanced mesh
        this.glyphGroup.remove(this.instancedMesh);
        this.instancedMesh.geometry.dispose();
        (this.instancedMesh.material as THREE.Material).dispose();
        this.instancedMesh = null;
        this.instancedMeshZoomLevel = null;
        this.instancedMeshGlyphType = null;
      } else if (!this.useInstancedRendering) {
        // Switching from individual to instanced - remove all individual meshes
        this.glyphData.forEach((glyph: GlyphObject) => {
          const cacheObject = glyph.getCacheObject(this.id, this.selectedTimestamp, this.selectedAlgorithm);
          if (cacheObject.mesh) {
            this.glyphGroup.remove(cacheObject.mesh);
            cacheObject.mesh = undefined;
          }
        });
      }
      this.useInstancedRendering = shouldUseInstancing;
    }

    if (this.useInstancedRendering) {
      // Use instanced rendering for large datasets at low zoom
      this.renderGlyphsInstanced(force);
    } else {
      // Use individual mesh rendering for smaller datasets or higher zoom levels
      this.renderGlyphsIndividual(force);
    }

    this.updatePositionBounds();
    this.requestRender(RenderTask.SceneRender);

    // Release the re-entrancy guard
    this.isRenderingGlyphs = false;
  }

  /**
   * Render glyphs using instanced mesh for high performance with large datasets.
   * - Low zoom: Single draw call for circles
   * - Medium zoom: Shader-based star/radar glyphs
   */
  private renderGlyphsInstanced(force = false): void {
    const renderer = this.hybridRenderer.getInstancedRenderer();
    const isGlyphMode = this.sizeInfo.currentZoomLevel !== ZoomLevel.low;

    // Get the current glyph type for shader selection
    const glyphTypeEnum = this.config.getConfiguration().glyphType;
    const currentGlyphType = HybridGlyphRenderer.getShaderType(
      glyphTypeEnum === 1 ? 'star' : (glyphTypeEnum === 2 ? 'flower' : (glyphTypeEnum === 3 ? 'whisker' : 'star'))
    );

    console.log(`[Canvas ${this.id}] renderGlyphsInstanced: force=${force}, isGlyphMode=${isGlyphMode}, glyphType=${currentGlyphType}`);

    // Check if we need to recreate the mesh (zoom level or glyph type changed means different shader)
    const needsNewMesh = !this.instancedMesh ||
      this.instancedMeshZoomLevel !== this.sizeInfo.currentZoomLevel ||
      (isGlyphMode && this.instancedMeshGlyphType !== currentGlyphType);

    console.log(`[Canvas ${this.id}] needsNewMesh=${needsNewMesh}, hasMesh=${!!this.instancedMesh}, meshZoomLevel=${this.instancedMeshZoomLevel}, meshGlyphType=${this.instancedMeshGlyphType}, currentZoomLevel=${this.sizeInfo.currentZoomLevel}, currentGlyphType=${currentGlyphType}`);

    if (needsNewMesh) {
      // Dispose old mesh if it exists
      if (this.instancedMesh) {
        this.glyphGroup.remove(this.instancedMesh);
        this.instancedMesh.geometry.dispose();
        (this.instancedMesh.material as THREE.Material).dispose();
      }
      // Create new mesh for current zoom level and glyph type
      this.instancedMesh = renderer.createInstancedMesh(this.sizeInfo.currentZoomLevel, currentGlyphType);
      this.instancedMeshZoomLevel = this.sizeInfo.currentZoomLevel;
      this.instancedMeshGlyphType = currentGlyphType;
      this.glyphGroup.add(this.instancedMesh);
      console.log(`[Canvas ${this.id}] Created new instanced mesh for glyphType=${currentGlyphType}`);
    }

    // Update shader uniforms when in glyph mode (not circle mode)
    if (isGlyphMode) {
      const glyphConfig = this.config.getConfiguration();
      const numFeatures = this.config.activeFeatures.length;
      const featureMaxValues = this.config.activeFeatures.map(f => this.config.featureMaxValues[f] || 1);

      // Background and axes are only shown at high zoom level (matching mesh-based rendering)
      const isHighZoom = this.sizeInfo.currentZoomLevel === ZoomLevel.high;
      const useBackground = isHighZoom && glyphConfig.useBackground;
      const useAxes = isHighZoom && glyphConfig.useCoordinateSystem;

      renderer.updateUniforms(
        numFeatures,
        featureMaxValues,
        useBackground,
        glyphConfig.useContour,
        useAxes
      );
    }

    // Mark all glyphs as visible if force rendering
    if (force) {
      this.glyphData.forEach((glyph: GlyphObject) => {
        const cacheObject = glyph.getCacheObject(this.id, this.selectedTimestamp, this.selectedAlgorithm);
        cacheObject.visible = true;
      });
    }

    // Safety check - should never happen since we create mesh above
    if (!this.instancedMesh) return;

    // Update instance data from glyphs
    renderer.updateInstances(
      this.instancedMesh,
      this.glyphData,
      this.sizeInfo,
      this.config.color.bind(this.config),
      this.config.colorFeature,
      this.config.activeFeatures,
      this.config.featureMaxValues,
      this.config.featureTypes,
      this.selectedTimestamp,
      this.selectedAlgorithm,
      this.id
    );

    // Apply the updates to the mesh
    renderer.applyToMesh(this.instancedMesh);
  }

  /**
   * Render glyphs using individual meshes.
   * Used for smaller datasets or when detailed glyph shapes are needed.
   * Note: Instanced mesh cleanup is handled in renderGlyphs() during mode switching.
   */
  private renderGlyphsIndividual(force = false): void {
    let renderedCount = 0;
    let skippedCount = 0;
    let nullMeshCount = 0;

    this.glyphData.forEach((glyph: GlyphObject, index: number) => {
      const cacheObject = glyph.getCacheObject(this.id, this.selectedTimestamp, this.selectedAlgorithm);

      // Debug first glyph
      if (index === 0) {
        console.log(`[Canvas ${this.id}] First glyph cache: x=${cacheObject.x}, y=${cacheObject.y}, visible=${cacheObject.visible}, hasMesh=${!!cacheObject.mesh}`);
      }

      const oldMesh = cacheObject.mesh;
      if (oldMesh) this.glyphGroup.remove(oldMesh);
      if (cacheObject.visible || force) {
        const mesh = glyph.render(this.sizeInfo, this.selectedTimestamp, this.selectedAlgorithm, this.id, this.aggregated);
        if (mesh != null) {
          this.glyphGroup.add(mesh);
          renderedCount++;
          // Debug first rendered glyph position
          if (renderedCount === 1) {
            console.log(`[Canvas ${this.id}] First rendered mesh position: x=${mesh.position.x}, y=${mesh.position.y}`);
          }
        } else {
          nullMeshCount++;
        }
      } else {
        skippedCount++;
      }
    });

    console.log(`[Canvas ${this.id}] renderGlyphsIndividual complete: rendered=${renderedCount}, skipped=${skippedCount}, nullMesh=${nullMeshCount}`);
  }

  private updatePositionBounds() {
    if (this.positionBounds == undefined && this.glyphData.length > 0) {
      // Single-pass calculation to avoid creating large temporary arrays
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;

      for (const glyph of this.glyphData) {
        const pos = glyph.getPosition(this.selectedTimestamp, this.selectedAlgorithm);
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
   * Rebuild the spatial grid with current glyph positions.
   * Called when data is loaded or positions change significantly.
   */
  private rebuildSpatialGrid(): void {
    this.spatialGrid.clear();

    // Adjust cell size based on data density and typical viewport
    const count = this.glyphData.length;
    if (count > 0 && this.positionBounds) {
      const width = this.positionBounds.maxX - this.positionBounds.minX;
      const height = this.positionBounds.maxY - this.positionBounds.minY;
      const area = width * height;
      // Target ~100 items per cell for optimal query performance
      const targetCellArea = area / (count / 100);
      const cellSize = Math.max(50, Math.sqrt(targetCellArea));
      this.spatialGrid.setCellSize(cellSize);
    }

    const radius = this.sizeInfo.radius;
    for (const glyph of this.glyphData) {
      const cacheObject = glyph.getCacheObject(this.id, this.selectedTimestamp, this.selectedAlgorithm);
      const x = cacheObject.position.x ?? 0;
      const y = cacheObject.position.y ?? 0;
      this.spatialGrid.insert(glyph, x, y, radius);
    }

    this.spatialGridDirty = false;
  }

  /**
   * Optimized hit test using spatial grid for large datasets.
   * Falls back to full scene scan for small datasets or when grid is unavailable.
   */
  private optimizedHitTest(event: MouseEvent): THREE.Object3D | null {
    // For small datasets, use standard hit test (less overhead)
    if (this.glyphData.length <= 500 || this.spatialGrid.size === 0) {
      return hitTest(event, this.renderer, this.glyphGroup, this.camera, this.sizeInfo);
    }

    // Convert screen to world coordinates
    const worldPos = screenToWorld(event, this.renderer, this.camera);

    // Query spatial grid for nearby glyphs (use generous radius for hit tolerance)
    // For instanced rendering at medium zoom, use a larger search radius
    const isMediumZoom = this.sizeInfo.currentZoomLevel === ZoomLevel.medium;
    const radiusMultiplier = isMediumZoom && this.useInstancedRendering ? 2.5 : 1;
    const searchRadius = this.sizeInfo.radius * 3 * radiusMultiplier;
    const nearbyGlyphs = this.spatialGrid.queryPoint(worldPos.x, worldPos.y, searchRadius);

    if (nearbyGlyphs.size === 0) {
      return null;
    }

    // For instanced rendering, find the closest glyph by position
    // since individual glyphs don't have mesh objects
    if (this.useInstancedRendering) {
      return this.findClosestGlyphByPosition(worldPos.x, worldPos.y, nearbyGlyphs);
    }

    // Get meshes for nearby glyphs (individual rendering)
    const candidates: THREE.Object3D[] = [];
    for (const glyph of nearbyGlyphs) {
      const mesh = glyph.getMesh(this.selectedTimestamp, this.selectedAlgorithm, this.id);
      if (mesh) {
        candidates.push(mesh);
      }
    }

    // Run hit test only on candidates
    return hitTestCandidates(event, this.renderer, candidates, this.camera, this.sizeInfo);
  }

  /**
   * Find the closest glyph by position for instanced rendering hit testing.
   * Returns a temporary Object3D with the glyph reference in userData.
   */
  private findClosestGlyphByPosition(worldX: number, worldY: number, nearbyGlyphs: Set<GlyphObject>): THREE.Object3D | null {
    let closestGlyph: GlyphObject | null = null;
    let closestDistance = Infinity;

    // Get the effective hit radius (account for medium zoom scaling)
    const isMediumZoom = this.sizeInfo.currentZoomLevel === ZoomLevel.medium;
    const effectiveRadius = isMediumZoom ? this.sizeInfo.radius * 2.5 : this.sizeInfo.radius;
    const hitTolerance = effectiveRadius + this.sizeInfo.hitTolerance;

    for (const glyph of nearbyGlyphs) {
      const cache = glyph.getCacheObject(this.id, this.selectedTimestamp, this.selectedAlgorithm);
      if (!cache.visible) continue;

      // Use currentX/currentY for animated positions, fall back to target position
      const glyphX = cache.currentX ?? cache.position.x;
      const glyphY = cache.currentY ?? cache.position.y;

      const dx = worldX - glyphX;
      const dy = worldY - glyphY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < hitTolerance && distance < closestDistance) {
        closestDistance = distance;
        closestGlyph = glyph;
      }
    }

    if (!closestGlyph) {
      return null;
    }

    // Create a temporary Object3D with the glyph reference in userData
    // This allows getGlyphFromObject() to work with instanced rendering
    const tempObject = new THREE.Object3D();
    tempObject.userData['item'] = new WeakRef(closestGlyph);
    return tempObject;
  }

  private resetUnhighlightedGlyphs(highlighted: Set<string>) {
    for (const glyph of this.glyphData) {
      if (highlighted.has(glyph.id)) continue;

      const node = glyph.getCacheObject(
        this.id,
        this.selectedTimestamp,
        this.selectedAlgorithm
      );

      node.x = node.position.x;
      node.y = node.position.y;
      node.vx = 0;
      node.vy = 0;
      node.mesh?.position.set(node.position.x, node.position.y, 0);
    }
  }

  private renderMagicLensGlyphs(glyphs: GlyphObject[]) {
    if (this.magicLensComponent.isActive()) return;

    this.lensSimulation?.stop();

    const highlightedIds = new Set(glyphs.map(g => g.id));
    this.resetUnhighlightedGlyphs(highlightedIds);

    if (glyphs.length > 1) {
      const nodes = glyphs.map(glyph =>
        glyph.getCacheObject(
          this.id,
          this.selectedTimestamp,
          this.selectedAlgorithm
        )
      );

      this.lensSimulation = forceSimulation(nodes)
        .force(
          'collide',
          forceCollide(this.sizeInfo.getRadius(ZoomLevel.high) * 4)
        )
        .velocityDecay(0.5)
        .stop();

      this.lensSimulation.tick(20);

      nodes.forEach(node => {
        node.mesh?.position.set(node.x ?? 0, node.y ?? 0, 0);
      });
    }

    glyphs.forEach(glyph => {
      const lensSize = this.sizeInfo.clone();
      lensSize.currentZoomLevel = ZoomLevel.high;
      lensSize.radius = lensSize.radius * 8;

      let mesh = glyph.getMesh(this.selectedTimestamp, this.selectedAlgorithm, this.id);
      if (mesh != undefined) {
        this.glyphGroup.remove(mesh);
      }
      let newMesh = glyph.render(lensSize, this.selectedTimestamp, this.selectedAlgorithm, this.id, this.aggregated);
      if (newMesh) {
        this.glyphGroup.add(newMesh);
      }
    });

    this.requestRender(RenderTask.SceneRender);
  }


  private renderGlyph(glyph: GlyphObject) {
    // For instanced rendering, update the instance buffer instead of re-rendering individual mesh
    if (this.useInstancedRendering && this.instancedMesh) {
      const renderer = this.hybridRenderer.getInstancedRenderer();
      renderer.updateInstances(
        this.instancedMesh,
        this.glyphData,
        this.sizeInfo,
        this.config.color.bind(this.config),
        this.config.colorFeature,
        this.config.activeFeatures,
        this.config.featureMaxValues,
        this.config.featureTypes,
        this.selectedTimestamp,
        this.selectedAlgorithm,
        this.id
      );
      renderer.applyToMesh(this.instancedMesh);
      this.requestRender(RenderTask.SceneRender);
      return;
    }

    let mesh = glyph.getMesh(this.selectedTimestamp, this.selectedAlgorithm, this.id);
    if (mesh != undefined) this.glyphGroup.remove(mesh);

    let newMesh = glyph.render(this.sizeInfo, this.selectedTimestamp, this.selectedAlgorithm, this.id, this.aggregated);
    if (newMesh) this.glyphGroup.add(newMesh);

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
      // For instanced rendering, update the instance buffer
      if (this.useInstancedRendering && this.instancedMesh) {
        const renderer = this.hybridRenderer.getInstancedRenderer();
        renderer.updateInstances(
          this.instancedMesh,
          this.glyphData,
          this.sizeInfo,
          this.config.color.bind(this.config),
          this.config.colorFeature,
          this.config.activeFeatures,
          this.config.featureMaxValues,
          this.config.featureTypes,
          this.selectedTimestamp,
          this.selectedAlgorithm,
          this.id
        );
        renderer.applyToMesh(this.instancedMesh);
      } else {
        this.config.redrawGlyph(this.currentHoveredObject);
      }
    }
  }
  //#endregion

  //#region Selection
  private isMouseOverOverlay(event: MouseEvent): boolean {
    const el = document.elementFromPoint(event.clientX, event.clientY);
    const isOverOverlay =
      el?.closest('.settings-panel') !== null
      || el?.closest('.tooltip-popup') !== null
      || el?.closest('.nav-controls-panel') !== null
    return isOverOverlay;
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

  /** Listen to clicks anywhere in the document */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = this.sceneContainer?.nativeElement.contains(event.target as Node);
    if (!clickedInside) {
      this.canvasActivated = false; // revert border
      this.settingsPanel.deactivatePanel();
    } else {
      this.canvasActivated = true;
      this.resetMouseIdleTimer();
      this.settingsPanel.activatePanel();
      if ((event.target as HTMLElement).localName === "canvas") {
        this.settingsPanel.hideMenus();
      }
    }
  }

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
    if (event.key.toLowerCase() === 'n') {
      if (this.selectionMode) this.toggleSelectionMode();
      if (this.magicLensComponent.isActive()) this.toggleMagicLens();
    }
    if (event.key.toLowerCase() === 's') {
      this.toggleSelectionMode();
    }
    if (event.key.toLowerCase() === 'x') {
      this.renderGlyphs();
    }
    if (event.key.toLowerCase() === 'l') {
      this.clearHoveredGlyph();
      this.toggleMagicLens();
      this.magicLensComponent.updateMagicLens(this.lastMousePosition, this.camera, this.renderer, this.selectedTimestamp, this.selectedAlgorithm);
      this.magicLensComponent.renderMagicLensGlyphs(this.selectedTimestamp, this.selectedAlgorithm);
    }
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
      // Sticky tooltip on click disabled
      return;
    }

    if (this.isSelecting && this.selectionMode) {
      this.isSelecting = false;

      // Single selection is a simple click
      if (this.selectionStart.distanceTo(this.selectionEnd) < 0.1) {
        let closestObject: THREE.Object3D | null = this.optimizedHitTest(event);
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
    this.mouseInside = true;
    this.resetMouseIdleTimer();

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
      this.magicLensComponent.renderLens(this.lastMousePosition);
      const change = this.magicLensComponent.updateMagicLens(this.lastMousePosition, this.camera, this.renderer, this.selectedTimestamp, this.selectedAlgorithm);
      if (change) this.magicLensComponent.renderMagicLensGlyphs(this.selectedTimestamp, this.selectedAlgorithm);
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

      let closestObject: THREE.Object3D | null = this.optimizedHitTest(event);

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
    // Always prevent default to avoid browser zoom, even when Magic Lens is active
    event.preventDefault();

    if (!this.camera || !this.renderer || this.magicLensComponent.isActive() || this.tooltipComponent.isFixed()) return;
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
