import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  NgZone,
  ChangeDetectorRef,
  OnChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';
import { ConfigService } from '../services/config.service';
import { Subscription } from 'rxjs';
import { DataLoaderService } from '../services/data-loader.service';
import { FilterService } from '../services/filter.service';
import { GlyphObject } from '../glyph/glyph-object';
import { ZoomLevel } from '../shared/enum/zoom-level';
import { forceCollide, forceSimulation, Simulation } from 'd3-force';
import { clusterGlyphs, getGlyphFromObject } from '../shared/helpers/glyph-helper';
import { InteractionCommand } from '../shared/enum/interaction-command';
import { GlyphCacheObject } from '../glyph/glyph-cache-object';
import { exportThreeSceneAsPNG, scalePosition } from '../shared/helpers/three-helper';
import { TooltipComponent } from './tooltip/tooltip.component';
import { MagiclensComponent } from './magiclens/magiclens.component';
import { IdFilter } from '../shared/filter/id-filter';
import { checkTextInput } from '../shared/helpers/angular-helper';
import { LoggerService } from '../services/logger-service';
import { RenderTask } from '../shared/enum/render-task';
import { CanvasNavigationControlsComponent } from './navigationcontrols/navigationcontrols.component';
import { SettingsControlPanelComponent } from './settingscontrols/settingscontrols.component';
import { CanvasCameraService } from './services/canvas-camera.service';
import { CanvasRendererService } from './services/canvas-renderer.service';
import { CanvasSelectionService } from './services/canvas-selection.service';
import {
  HIT_TEST_THROTTLE_MS,
  MOUSE_IDLE_MS,
  CLICK_TIME_THRESHOLD_MS,
  CLICK_DISTANCE_THRESHOLD,
} from '../shared/constants/canvas-constants';
import { DataProcessorService } from '../services/data-processor';
import { buildGlyphRenderConfig, GlyphRenderConfig } from '../glyph/glyph-render-config';

@Component({
  selector: 'glyph-canvas',
  standalone: true,
  imports: [
    FormsModule,
    TooltipComponent,
    MagiclensComponent,
    CanvasNavigationControlsComponent,
    SettingsControlPanelComponent,
  ],
  providers: [CanvasCameraService, CanvasRendererService, CanvasSelectionService],
  templateUrl: './glyph-canvas.component.html',
  styleUrls: ['./glyph-canvas.component.scss'],
})
export class GlyphCanvasComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef;
  @ViewChild('sceneContainer') sceneContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('settingsPanel') settingsPanel!: SettingsControlPanelComponent;
  @ViewChild(TooltipComponent) tooltipComponent!: TooltipComponent;
  @ViewChild(MagiclensComponent) magicLensComponent!: MagiclensComponent;

  @Input() id = 0;
  @Input() totalCells = 0;
  @Input() maximized = false;
  @Output() toggleMaximize = new EventEmitter<void>();
  private glyphData: GlyphObject[] = [];

  // Infrastructure
  private configSub = new Subscription();
  private canvasWidth = 0;
  private canvasHeight = 0;
  private animationFrameId: number | undefined;
  private resizeObserver!: ResizeObserver;

  // D3 force simulation and aggregation
  private simulation: Simulation<GlyphCacheObject, undefined> | undefined;
  collisionAvoidance = false;
  private currentTicks = 0;
  private maxTicks = 50;
  aggregated = false;
  private animationSpeed = 0.1;

  // Hover and interaction
  private mouse = new THREE.Vector2();
  private currentHoveredObject: GlyphObject | null = null;
  private animateGlyph: GlyphObject | null = null;
  private pulseStartTime = performance.now();
  private lastHitTestTime = 0;
  lastMousePosition = new THREE.Vector2();
  mouseInside = false;
  private mouseIdleTimer: ReturnType<typeof setTimeout> | undefined;
  private mouseDownTime = 0;

  // Overlay controls
  canvasActivated = false;
  showSettings = false;
  timestamps: string[] = [];
  algorithms: string[] = [];
  contexts: string[] = [];
  selectedTimestamp = '';
  selectedAlgorithm = '';
  selectedContext = '';

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private logger: LoggerService,
    private config: ConfigService,
    private dataLoader: DataLoaderService,
    private dataProcessor: DataProcessorService,
    private filterService: FilterService,
    public cameraSvc: CanvasCameraService,
    public rendererSvc: CanvasRendererService,
    public selectionSvc: CanvasSelectionService
  ) {}

  private buildRenderConfig(): GlyphRenderConfig {
    return buildGlyphRenderConfig(this.config, this.dataProcessor);
  }

  //#region Life Cycle methods
  ngAfterViewInit(): void {
    this.initThree();
    this.subscribeToEvents();
    this.observeResize();
  }

  ngOnChanges(): void {
    this.logger.log('The component has changed ' + this.id);
  }

  ngOnDestroy(): void {
    this.logger.log('Destroy ' + this.id);
    this.glyphData.forEach((glyph: GlyphObject) => {
      glyph.clearCache(this.id);
    });

    this.configSub.unsubscribe();

    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.rendererSvc.dispose();
    this.resizeObserver.disconnect();
  }
  //#endregion

  //#region Initialization Methods
  private initThree(): void {
    const rect = this.canvasContainer.nativeElement.getBoundingClientRect();
    const container = this.canvasContainer.nativeElement;
    this.canvasWidth = rect.width;
    this.canvasHeight = rect.height;

    this.cameraSvc.initCamera(this.canvasWidth, this.canvasHeight);
    this.rendererSvc.initRenderer(container, this.canvasWidth, this.canvasHeight);

    // Wire up the animation loop — renderer service requests trigger the component's animate loop
    this.rendererSvc.setRenderRequestCallback(() => {
      if (!this.animationFrameId) {
        this.animate();
      }
    });
  }

  private subscribeToEvents() {
    this.configSub.add(
      this.config.loadedDataSubject$.subscribe(async loadedData => {
        if (loadedData === '') return;

        const data = await this.dataLoader.getGlyphData(this.config.loadedData, this.selectedTimestamp);
        if (data) this.glyphData = data;

        this.ngZone.run(() => {
          this.timestamps = this.dataLoader.getTimestamps(loadedData);
          this.algorithms = this.dataLoader.getPositions(loadedData);
          this.contexts = this.dataLoader.getContexts(loadedData);

          this.selectedTimestamp = this.timestamps[0];
          this.selectedAlgorithm = this.algorithms[0];
          this.selectedContext = this.contexts[0];

          this.rendererSvc.glyphGroup.clear();

          if (data) {
            this.rendererSvc.positionBounds = undefined;
            this.rendererSvc.updatePositionBounds(this.glyphData, this.selectedTimestamp, this.selectedAlgorithm);
            this.rendererSvc.spatialGridDirty = true;
            // Note: spatial grid is rebuilt inside fitToView() after positions are scaled
            this.fitToView();
            this.initSimulation();
          } else {
            console.warn(`[Canvas ${this.id}] No data received!`);
          }
          this.cdr.detectChanges();
        });
      })
    );
    // Subscribe to collection updates to catch new algorithms added by background projections
    this.configSub.add(
      this.dataLoader.dataSetCollectionSubject$.subscribe(() => {
        const loadedData = this.config.loadedData;
        if (loadedData) {
          const newAlgorithms = this.dataLoader.getPositions(loadedData);
          // Only update if we have new algorithms
          if (newAlgorithms.length > this.algorithms.length) {
            this.ngZone.run(() => {
              this.algorithms = newAlgorithms;
              this.cdr.detectChanges();
            });
          }
        }
      })
    );
    this.configSub.add(
      this.config.drawMagicLensGlyphsSubject$.subscribe(glyphs => {
        if (glyphs != null) {
          if (!this.magicLenseStatus) {
            // Other canvases — show enlarged/highlighted glyphs
            this.rendererSvc.renderMagicLensGlyphs(
              glyphs,
              this.glyphData,
              this.id,
              this.selectedTimestamp,
              this.selectedAlgorithm,
              this.aggregated,
              this.buildRenderConfig()
            );
          }
        }
      })
    );
    this.configSub.add(
      this.config.commandSubject$.subscribe(command => {
        if (command === InteractionCommand.fittoscreen) {
          this.fitToView();
        } else if (command === InteractionCommand.redraw) {
          this.rendererSvc.renderGlyphs(
            this.glyphData,
            this.id,
            this.selectedTimestamp,
            this.selectedAlgorithm,
            this.aggregated,
            this.buildRenderConfig()
          );
        } else if (command === InteractionCommand.rerender) {
          this.rendererSvc.requestRender(RenderTask.SceneRender);
        } else if (command === InteractionCommand.clearselection) {
          this.selectionSvc.selectionFilter.clear();
          this.rendererSvc.renderGlyphs(
            this.glyphData,
            this.id,
            this.selectedTimestamp,
            this.selectedAlgorithm,
            this.aggregated,
            this.buildRenderConfig()
          );
        } else if (command === InteractionCommand.exportimage) {
          exportThreeSceneAsPNG(this.rendererSvc.renderer, this.rendererSvc.scene, this.cameraSvc.camera, {
            filename: 'three-scene-' + this.id + '.png',
            scaleFactor: 2,
            restoreAfterExport: true,
            canvasElement: this.canvasContainer.nativeElement,
          });
        }
      })
    );
    this.configSub.add(
      this.config.redrawGlyphSubject$.subscribe(glyph => {
        if (glyph != null && this.glyphData.includes(glyph)) {
          this.rendererSvc.renderGlyph(
            glyph,
            this.selectedTimestamp,
            this.selectedAlgorithm,
            this.id,
            this.aggregated,
            this.buildRenderConfig()
          );
        }
      })
    );
    this.configSub.add(
      this.config.animateGlyphSubject$.subscribe(glyph => {
        if (this.mouseInside) return; // no animation in current canvas
        if (this.animateGlyph === glyph) return;

        this.resetAnimatedGlyph();
        this.startAnimateGlyph(glyph);
      })
    );
    this.configSub.add(
      this.config.glyphConfigSubject$.subscribe(() => {
        if (this.magicLenseStatus)
          this.magicLensComponent.renderMagicLensGlyphs(this.selectedTimestamp, this.selectedAlgorithm);
        // Force render all glyphs when config changes - glyph geometry needs to be
        // recreated with new features, regardless of current visibility state
        this.rendererSvc.renderGlyphs(
          this.glyphData,
          this.id,
          this.selectedTimestamp,
          this.selectedAlgorithm,
          this.aggregated,
          this.buildRenderConfig(),
          true
        );
      })
    );
  }

  private observeResize() {
    const container = this.canvasContainer.nativeElement;

    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const width = Math.floor(entry.contentRect.width);
        const height = Math.floor(entry.contentRect.height);
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.rendererSvc.updateRendererSize(width, height);
        this.cameraSvc.updateCameraBounds(width, height);
        this.simulation?.force('collide', forceCollide(this.rendererSvc.sizeInfo.getRadius(ZoomLevel.high)));
        this.resetAnimatedGlyph();
        this.rendererSvc.renderGlyphs(
          this.glyphData,
          this.id,
          this.selectedTimestamp,
          this.selectedAlgorithm,
          this.aggregated,
          this.buildRenderConfig()
        );
      }
    });

    this.resizeObserver.observe(container);
  }

  private initSimulation() {
    this.simulation = forceSimulation(
      this.glyphData.map(glyph => glyph.getCacheObject(this.id, this.selectedTimestamp, this.selectedAlgorithm))
    )
      .force('collide', forceCollide(this.rendererSvc.sizeInfo.getRadius(ZoomLevel.high)))
      .velocityDecay(0.5)
      .stop();
  }
  //#endregion

  //#region Mode Changes
  toggleNavigationMode(_doToggle = true) {
    this.toggleSelectionMode(false);
    this.toggleMagicLens(false);
  }

  toggleSelectionMode(doToggle = true) {
    const active = this.selectionSvc.toggleSelectionMode(doToggle);
    if (active) {
      this.canvasContainer.nativeElement.classList.add('selecting');
      this.clearHoveredGlyph();
      this.tooltipComponent.cancelHoverPopup();
      this.toggleMagicLens(false);
    } else {
      this.canvasContainer.nativeElement.classList.remove('selecting');
    }
  }

  toggleCollisionAvoidance(doToggle = true) {
    if (
      this.rendererSvc.needsRender.has(RenderTask.ForceSimulation) ||
      this.rendererSvc.needsRender.has(RenderTask.OriginalSimulation)
    )
      return;

    this.collisionAvoidance = !this.collisionAvoidance && doToggle;

    if (!this.collisionAvoidance) {
      this.glyphData.forEach(glyph => {
        const cached = glyph.getCacheObject(this.id, this.selectedTimestamp, this.selectedAlgorithm);
        cached.x = cached.position.x;
        cached.y = cached.position.y;
      });
      this.animationSpeed = 0.1;
      this.rendererSvc.requestRender(RenderTask.OriginalSimulation);
    } else {
      this.rendererSvc.requestRender(RenderTask.ForceSimulation);
    }
  }

  toggleAggregation() {
    this.aggregated = !this.aggregated;

    if (this.aggregated) {
      const glyphs: GlyphCacheObject[] = this.glyphData.map(glyph =>
        glyph.getCacheObject(this.id, this.selectedTimestamp, this.selectedAlgorithm)
      );
      clusterGlyphs(glyphs, 10);
    }

    this.rendererSvc.renderGlyphs(
      this.glyphData,
      this.id,
      this.selectedTimestamp,
      this.selectedAlgorithm,
      this.aggregated,
      this.buildRenderConfig()
    );
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
      this.rendererSvc.scene.background = this.rendererSvc.disabledBackgroundColor;
      this.canvasContainer.nativeElement.classList.remove('lensing');
      this.rendererSvc.requestRender(RenderTask.SceneRender);
    } else {
      if (this.magicLensComponent.isActive()) {
        this.canvasContainer.nativeElement.classList.add('lensing');
      }
      this.rendererSvc.scene.background = this.rendererSvc.standardBackgroundColor;
    }
  }

  takeScreenshot() {
    exportThreeSceneAsPNG(this.rendererSvc.renderer, this.rendererSvc.scene, this.cameraSvc.camera, {
      filename: 'three-scene-' + this.id + '.png',
      scaleFactor: 2,
      restoreAfterExport: true,
      canvasElement: this.canvasContainer.nativeElement,
    });
  }

  fitToView() {
    if (this.collisionAvoidance) this.toggleCollisionAvoidance();

    this.rendererSvc.scaleGroupToFit(
      this.glyphData,
      this.id,
      this.selectedTimestamp,
      this.selectedAlgorithm,
      this.canvasWidth,
      this.canvasHeight
    );
    // Rebuild spatial grid after positions are scaled
    this.rendererSvc.rebuildSpatialGrid(this.glyphData, this.id, this.selectedTimestamp, this.selectedAlgorithm);
    this.rendererSvc.sizeInfo.currentZoomLevel = ZoomLevel.low;
    this.rendererSvc.renderGlyphs(
      this.glyphData,
      this.id,
      this.selectedTimestamp,
      this.selectedAlgorithm,
      this.aggregated,
      this.buildRenderConfig(),
      true
    );

    this.cameraSvc.startFitAnimation(this.rendererSvc.glyphGroup);
    this.rendererSvc.requestRender(RenderTask.FitAnimation);
  }

  toggleSettings(): void {
    this.showSettings = !this.showSettings;
  }

  onAnimationSpeedChanged(speed: number) {
    this.animationSpeed = speed;
  }

  onTogglePlayback() {
    if (!this.rendererSvc.needsRender.has(RenderTask.OriginalSimulation)) {
      this.rendererSvc.requestRender(RenderTask.OriginalSimulation);
    } else {
      this.rendererSvc.cancelRender(RenderTask.OriginalSimulation);
    }
  }

  onSettingsChange(payload: { timestamp: string; algorithm: string; context: string }): void {
    this.selectedTimestamp = payload.timestamp;
    this.selectedAlgorithm = payload.algorithm;
    this.selectedContext = payload.context;

    this.rendererSvc.positionBounds = undefined;
    this.rendererSvc.updatePositionBounds(this.glyphData, this.selectedTimestamp, this.selectedAlgorithm);

    this.glyphData.forEach(glyph => {
      const cache = glyph.getCacheObject(this.id, this.selectedTimestamp, this.selectedAlgorithm);
      if (cache && this.rendererSvc.positionBounds) {
        const newPos = glyph.getPosition(this.selectedTimestamp, this.selectedAlgorithm);
        const scalePos = scalePosition(
          newPos.x,
          newPos.y,
          this.rendererSvc.positionBounds,
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
    this.rendererSvc.rebuildSpatialGrid(this.glyphData, this.id, this.selectedTimestamp, this.selectedAlgorithm);

    this.rendererSvc.requestRender(RenderTask.OriginalSimulation);
    this.magicLensComponent.clearLensGlyphs();
  }

  private resetMouseIdleTimer(): void {
    this.clearMouseIdleTimer();

    this.mouseIdleTimer = setTimeout(() => {
      this.mouseInside = false;
    }, MOUSE_IDLE_MS);
  }

  private clearMouseIdleTimer(): void {
    if (this.mouseIdleTimer) {
      clearTimeout(this.mouseIdleTimer);
      this.mouseIdleTimer = undefined;
    }
  }

  onMouseEnter() {
    this.mouseInside = true;
    this.selectionSvc.isShiftDown = false;
    this.resetMouseIdleTimer();
  }

  onMouseLeave() {
    this.clearMouseIdleTimer();
    this.mouseInside = false;
    this.selectionSvc.isShiftDown = false;
    if (this.magicLensComponent.isActive() && !this.magicLensComponent.isFixed()) {
      this.toggleMagicLens();
    }
    this.config.animateGlyph(null);
    this.clearHoveredGlyph();
    this.tooltipComponent.cancelHoverPopup();
    this.cameraSvc.isPanning = false;
  }

  get magicLenseStatus(): boolean {
    return this.magicLensComponent?.isActive() ?? false;
  }
  //#endregion

  //#region Helper Methods
  private handleZoomLevelChange(oldZoom: number, newZoom: number): boolean {
    const oldLevel = this.cameraSvc.calculateZoomLevel(oldZoom);
    const newLevel = this.cameraSvc.calculateZoomLevel(newZoom);
    if (oldLevel !== newLevel) {
      this.rendererSvc.sizeInfo.currentZoomLevel = newLevel;
      this.rendererSvc.sizeInfo.update(this.canvasWidth, this.canvasHeight);
      // Rebuild spatial grid with new radius for correct hit testing
      this.rendererSvc.rebuildSpatialGrid(this.glyphData, this.id, this.selectedTimestamp, this.selectedAlgorithm);
      // Force render all glyphs when zoom level changes
      this.rendererSvc.renderGlyphs(
        this.glyphData,
        this.id,
        this.selectedTimestamp,
        this.selectedAlgorithm,
        this.aggregated,
        this.buildRenderConfig(),
        true
      );
      return true;
    }
    return false;
  }

  updateMousePositions(event: MouseEvent) {
    // Convert screen (px) to NDC (-1 to 1)
    const rect = this.rendererSvc.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }
  //#endregion

  //#region Rendering and Glyph Manipulations
  private animate = () => {
    if (this.rendererSvc.needsRender.size === 0) {
      this.animationFrameId = undefined; // stop the loop
      return;
    }

    this.animationFrameId = requestAnimationFrame(this.animate);

    if (this.rendererSvc.needsRender.has(RenderTask.ForceSimulation)) {
      this.currentTicks++;
      this.simulation?.tick();

      // Update node positions
      this.glyphData.forEach(glyph => {
        const cached = glyph.getCacheObject(this.id, this.selectedTimestamp, this.selectedAlgorithm);
        cached.mesh?.position.set(cached.x ?? 0, cached.y ?? 0, 0);
      });

      if (this.currentTicks > this.maxTicks) {
        this.currentTicks = 0;
        this.rendererSvc.cancelRender(RenderTask.ForceSimulation);
      }
    } else if (this.rendererSvc.needsRender.has(RenderTask.OriginalSimulation)) {
      const finished = this.rendererSvc.animateBackToOriginal(
        this.glyphData,
        this.id,
        this.selectedTimestamp,
        this.selectedAlgorithm,
        this.animationSpeed
      );
      if (finished) {
        this.rendererSvc.needsRender.delete(RenderTask.OriginalSimulation);
      }
    }

    if (
      this.rendererSvc.needsRender.has(RenderTask.GlyphAnimation) &&
      this.rendererSvc.sizeInfo.currentZoomLevel === ZoomLevel.low
    ) {
      if (this.animateGlyph != null) {
        const elapsed = performance.now() - this.pulseStartTime;
        // Pulsate with sine wave (e.g., 2 Hz frequency)
        const scaleFactor = 2 + 0.8 * Math.sin((elapsed / 3000) * 2 * Math.PI * 2);
        this.animateGlyph
          .getMesh(this.selectedTimestamp, this.selectedAlgorithm, this.id)
          ?.scale.set(scaleFactor, scaleFactor, scaleFactor);
      }
    }

    const fitCompleted = this.cameraSvc.updateFitAnimation(this.glyphData.length);
    if (fitCompleted) {
      this.handleZoomLevelChange(this.cameraSvc.fitStartZoom, this.cameraSvc.camera.zoom);
      this.rendererSvc.cancelRender(RenderTask.FitAnimation);
    }

    this.cameraSvc.updateViewRect();
    this.rendererSvc.updateClipping(
      this.glyphData,
      this.cameraSvc.viewRect,
      this.cameraSvc.lastViewRect,
      this.id,
      this.selectedTimestamp,
      this.selectedAlgorithm,
      this.aggregated,
      this.buildRenderConfig()
    );

    this.rendererSvc.renderer.render(this.rendererSvc.scene, this.cameraSvc.camera);
    this.rendererSvc.cancelRender(RenderTask.SceneRender);
  };

  private startAnimateGlyph(glyph: GlyphObject | null) {
    if (glyph == null) {
      this.animateGlyph = null;
    } else {
      this.rendererSvc.renderGlyph(
        glyph,
        this.selectedTimestamp,
        this.selectedAlgorithm,
        this.id,
        this.aggregated,
        this.buildRenderConfig()
      );
      this.animateGlyph = glyph;
      this.pulseStartTime = performance.now();
      this.rendererSvc.requestRender(RenderTask.GlyphAnimation);
    }
  }

  private resetAnimatedGlyph() {
    this.animateGlyph?.getMesh(this.selectedTimestamp, this.selectedAlgorithm, this.id)?.scale.set(1, 1, 1); // Reset scale
    if (this.animateGlyph != null)
      this.rendererSvc.renderGlyph(
        this.animateGlyph,
        this.selectedTimestamp,
        this.selectedAlgorithm,
        this.id,
        this.aggregated,
        this.buildRenderConfig()
      );
    this.rendererSvc.cancelRender(RenderTask.GlyphAnimation);
  }

  private clearHoveredGlyph() {
    if (this.currentHoveredObject != null) {
      this.currentHoveredObject.setHighlighted(false);
      this.config.redrawGlyph(this.currentHoveredObject);
    }
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
      if ((event.target as HTMLElement).localName === 'canvas') {
        this.settingsPanel.hideMenus();
      }
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Shift') this.selectionSvc.isShiftDown = true;
  }

  private keyBindings = new Map<string, () => void>([
    ['c', () => this.toggleCollisionAvoidance()],
    ['f', () => this.fitToView()],
    ['a', () => this.toggleAggregation()],
    ['d', () => this.toggleSettings()],
    [
      'n',
      () => {
        if (this.selectionSvc.selectionMode) this.toggleSelectionMode();
        if (this.magicLensComponent.isActive()) this.toggleMagicLens();
      },
    ],
    ['s', () => this.toggleSelectionMode()],
    [
      'x',
      () =>
        this.rendererSvc.renderGlyphs(
          this.glyphData,
          this.id,
          this.selectedTimestamp,
          this.selectedAlgorithm,
          this.aggregated,
          this.buildRenderConfig()
        ),
    ],
    [
      'l',
      () => {
        this.clearHoveredGlyph();
        this.toggleMagicLens();
        this.magicLensComponent.updateMagicLens(
          this.lastMousePosition,
          this.cameraSvc.camera,
          this.rendererSvc.renderer
        );
        this.magicLensComponent.renderMagicLensGlyphs(this.selectedTimestamp, this.selectedAlgorithm);
      },
    ],
  ]);

  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    if (checkTextInput(event)) return;
    if (!this.mouseInside) return;

    if (event.key === 'Shift') {
      this.selectionSvc.isShiftDown = false;
      return;
    }

    const action = this.keyBindings.get(event.key.toLowerCase());
    action?.();
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    this.mouseDownTime = Date.now();

    if (this.magicLensComponent.isActive()) return;

    this.lastMousePosition.set(event.clientX, event.clientY);
    this.cameraSvc.isPanning = true;

    if (this.selectionSvc.selectionMode) {
      this.selectionSvc.isSelecting = true;
      this.selectionSvc.selectionStart.set(event.clientX, event.clientY);
      this.selectionSvc.selectionEnd.copy(this.selectionSvc.selectionStart);
    }
  }

  @HostListener('mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    this.cameraSvc.isPanning = false;

    if (this.selectionSvc.isMouseOverOverlay(event)) {
      // Skip THREE.js interaction
      return;
    }

    const dx = event.clientX - this.lastMousePosition.x;
    const dy = event.clientY - this.lastMousePosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const elapsedTime = Date.now() - this.mouseDownTime;

    const isClick = distance < CLICK_DISTANCE_THRESHOLD && elapsedTime < CLICK_TIME_THRESHOLD_MS;

    if (isClick && this.magicLensComponent.isActive()) {
      this.toggleFixMagicLens();
      return;
    }

    if (this.magicLensComponent.isFixed() && this.magicLensComponent.isActive()) {
      this.tooltipComponent.cancelHoverPopup();
      this.toggleFixMagicLens();
    }

    if (isClick && !this.selectionSvc.selectionMode) {
      if (this.currentHoveredObject != null) {
        this.tooltipComponent.toggleFixation();
      }
      return;
    }

    if (this.selectionSvc.isSelecting && this.selectionSvc.selectionMode) {
      this.selectionSvc.isSelecting = false;

      // Single selection is a simple click
      if (this.selectionSvc.selectionStart.distanceTo(this.selectionSvc.selectionEnd) < 0.1) {
        const closestObject: THREE.Object3D | null = this.rendererSvc.optimizedHitTest(
          event,
          this.glyphData,
          this.cameraSvc.camera,
          this.selectedTimestamp,
          this.selectedAlgorithm,
          this.id
        );
        this.updateMousePositions(event);

        if (closestObject != null) {
          const glyph = getGlyphFromObject(closestObject);
          if (glyph != null) {
            (this.selectionSvc.selectionFilter as IdFilter).toggle(glyph.id);
            this.selectionSvc.applyFilters();
          }
        } else {
          this.filterService.clearIdFilters();
          this.selectionSvc.applyFilters();
        }
      } else {
        this.selectionSvc.selectObjectsInRectangle(
          this.rendererSvc.glyphGroup,
          this.cameraSvc.camera,
          this.rendererSvc.renderer.domElement,
          this.glyphData,
          this.id,
          this.selectedTimestamp,
          this.selectedAlgorithm
        );
      }
    }
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.mouseInside = true;
    this.resetMouseIdleTimer();

    if (this.selectionSvc.isMouseOverOverlay(event) || this.tooltipComponent.isFixed()) {
      this.selectionSvc.isSelecting = false;
      this.tooltipComponent.cancelHoverPopup();
      // Skip THREE.js interaction
      return;
    }

    this.updateMousePositions(event);

    if (this.magicLensComponent.isActive() && this.magicLensComponent.isFixed()) {
      const closestObject: THREE.Object3D | null = this.magicLensComponent.doHitTest(event);
      if (closestObject != null) {
        const hoveredGlyph = getGlyphFromObject(closestObject);
        if (hoveredGlyph != null && this.currentHoveredObject !== hoveredGlyph) {
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
      const change = this.magicLensComponent.updateMagicLens(
        this.lastMousePosition,
        this.cameraSvc.camera,
        this.rendererSvc.renderer
      );
      if (change) this.magicLensComponent.renderMagicLensGlyphs(this.selectedTimestamp, this.selectedAlgorithm);
      return;
    }

    if (this.selectionSvc.isSelecting) {
      this.selectionSvc.selectionEnd.set(event.clientX, event.clientY);
      this.selectionSvc.updateSelectionBox();
    } else if (this.cameraSvc.isPanning && !this.selectionSvc.selectionMode) {
      this.tooltipComponent.cancelHoverPopup();
      this.cameraSvc.pan(this.lastMousePosition, event);
      this.rendererSvc.requestRender(RenderTask.SceneRender);
    } else if (
      !this.rendererSvc.needsRender.has(RenderTask.ForceSimulation) &&
      !this.selectionSvc.isSelecting &&
      !this.selectionSvc.selectionMode
    ) {
      const now = performance.now();
      if (now - this.lastHitTestTime < HIT_TEST_THROTTLE_MS) return;
      this.lastHitTestTime = now;

      const closestObject: THREE.Object3D | null = this.rendererSvc.optimizedHitTest(
        event,
        this.glyphData,
        this.cameraSvc.camera,
        this.selectedTimestamp,
        this.selectedAlgorithm,
        this.id
      );

      if (closestObject != null) {
        const hoveredGlyph = getGlyphFromObject(closestObject);
        if (this.currentHoveredObject !== hoveredGlyph) {
          this.clearHoveredGlyph();
          if (hoveredGlyph != null && !hoveredGlyph.highlighted) {
            hoveredGlyph?.setHighlighted(true);
            this.pulseStartTime = performance.now();
            this.rendererSvc.renderGlyph(
              hoveredGlyph,
              this.selectedTimestamp,
              this.selectedAlgorithm,
              this.id,
              this.aggregated,
              this.buildRenderConfig()
            );
            this.config.animateGlyph(hoveredGlyph);
            this.currentHoveredObject = hoveredGlyph;
          }
          this.rendererSvc.requestRender(RenderTask.SceneRender);

          this.tooltipComponent.cancelHoverPopup();
          this.tooltipComponent.scheduleHoverPopup(event.clientX, event.clientY, closestObject as THREE.Object3D);
        }
      } else {
        this.clearHoveredGlyph();
        this.tooltipComponent.cancelHoverPopup();
        this.config.animateGlyph(null);
        if (this.currentHoveredObject != null) this.rendererSvc.requestRender(RenderTask.SceneRender);
        this.currentHoveredObject = null;
      }
    }

    this.lastMousePosition.set(event.clientX, event.clientY);
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    // Always prevent default to avoid browser zoom, even when Magic Lens is active
    event.preventDefault();

    if (
      !this.cameraSvc.camera ||
      !this.rendererSvc.renderer ||
      this.magicLensComponent.isActive() ||
      this.tooltipComponent.isFixed()
    )
      return;
    this.tooltipComponent.cancelHoverPopup();

    const oldZoom = this.cameraSvc.camera.zoom;
    const direction = event.deltaY < 0 ? 1 : -1;
    const scale = Math.pow(this.cameraSvc.zoomFactor, direction);
    const newZoom = THREE.MathUtils.clamp(this.cameraSvc.camera.zoom * scale, 0.5, 50);

    this.cameraSvc.applyZoomAtScreenPoint(
      event.clientX,
      event.clientY,
      newZoom,
      oldZoom,
      this.rendererSvc.renderer.domElement
    );
    this.handleZoomLevelChange(oldZoom, newZoom);
    this.rendererSvc.requestRender(RenderTask.SceneRender);
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    if (event.touches.length === 1) {
      this.cameraSvc.lastTouchPosition = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      };
    }
    if (event.touches.length === 2) {
      this.cameraSvc.touchZoomStartDistance = this.cameraSvc.getTouchDistance(event);
      this.cameraSvc.lastZoom = this.cameraSvc.camera?.zoom ?? null;
    }
  }

  @HostListener('touchend', ['$event'])
  @HostListener('touchcancel', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    if (event.touches.length < 2) {
      this.cameraSvc.touchZoomStartDistance = null;
      this.cameraSvc.lastZoom = null;
    }
    if (event.touches.length < 1) {
      this.cameraSvc.lastTouchPosition = null;
    }
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (!this.cameraSvc.camera || !this.rendererSvc.renderer) return;
    event.preventDefault();

    if (event.touches.length === 1 && this.cameraSvc.lastTouchPosition) {
      const currentTouch = event.touches[0];
      const fakeMouseEvent = {
        clientX: currentTouch.clientX,
        clientY: currentTouch.clientY,
      } as MouseEvent;

      const from = new THREE.Vector2(this.cameraSvc.lastTouchPosition.x, this.cameraSvc.lastTouchPosition.y);
      this.tooltipComponent.cancelHoverPopup();

      this.cameraSvc.pan(from, fakeMouseEvent);
      this.rendererSvc.requestRender(RenderTask.SceneRender);

      this.cameraSvc.lastTouchPosition = {
        x: currentTouch.clientX,
        y: currentTouch.clientY,
      };
    }

    if (event.touches.length === 2 && this.cameraSvc.touchZoomStartDistance !== null) {
      const currentDistance = this.cameraSvc.getTouchDistance(event);
      const zoomRatio = currentDistance / this.cameraSvc.touchZoomStartDistance;

      const oldZoom = this.cameraSvc.lastZoom ?? this.cameraSvc.camera.zoom;
      const newZoom = THREE.MathUtils.clamp(oldZoom * zoomRatio, 0.5, 50);

      const centerX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
      const centerY = (event.touches[0].clientY + event.touches[1].clientY) / 2;

      this.cameraSvc.updateTouchCenter(event, this.rendererSvc.renderer.domElement);

      this.cameraSvc.applyZoomAtScreenPoint(centerX, centerY, newZoom, oldZoom, this.rendererSvc.renderer.domElement);
      this.handleZoomLevelChange(oldZoom, newZoom);
      this.rendererSvc.requestRender(RenderTask.SceneRender);
    }
  }
  //#endregion
}
