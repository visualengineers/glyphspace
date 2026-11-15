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
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';
import { ConfigService } from '../services/config.service';
import { Subscription } from 'rxjs';
import { DataLoaderService } from '../services/data-loader.service';
import { FilterService } from '../services/filter.service';
import { GlyphObject } from '../glyph/glyph-object';
import { ZoomLevel } from '../shared/enum/zoom-level';
import { forceCollide, forceSimulation, forceX, forceY, Simulation } from 'd3';
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
import { CanvasCameraService, clampZoom } from './services/canvas-camera.service';
import { CanvasRendererService } from './services/canvas-renderer.service';
import { CanvasSelectionService } from './services/canvas-selection.service';
import {
  HIT_TEST_THROTTLE_MS,
  MOUSE_IDLE_MS,
  CLICK_TIME_THRESHOLD_MS,
  CLICK_DISTANCE_THRESHOLD,
  TRANSITION_SPEED,
  transitionStep,
  COLLISION_ATTRACTION,
  AGGREGATION_RADIUS,
} from '../shared/constants/canvas-constants';
import { ThumbnailService } from '../services/thumbnail.service';
import { buildGlyphRenderConfig, GlyphRenderConfig } from '../glyph/glyph-render-config';
import { GlyphConfiguration } from '../glyph/glyph-configuration';
import { typicalGlyphReach, visibleRadius } from '../glyph/glyph-reach';
import { glyphScale } from '../glyph/glyph-zoom';
import { hasFeatureAxes } from '../shared/enum/glyph-type';

/**
 * Whether a press and release make a click: released within the click
 * distance of where the button went down, and soon enough. Movement in
 * between doesn't matter, only the distance between the two points.
 */
export function isClick(
  down: { x: number; y: number; time: number } | null,
  up: { x: number; y: number; time: number }
): boolean {
  if (!down) return false;
  const distance = Math.hypot(up.x - down.x, up.y - down.y);
  return distance < CLICK_DISTANCE_THRESHOLD && up.time - down.time < CLICK_TIME_THRESHOLD_MS;
}

/**
 * One canvas. Pointer moves, wheel and touch input are handled outside
 * Angular's zone, and so is the render loop: they run at frame rate, and
 * change detection runs only where they change what the template shows.
 */
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
  changeDetection: ChangeDetectionStrategy.Eager,
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
  /** The items of glyphData, for membership tests. */
  private glyphSet = new Set<GlyphObject>();

  // Infrastructure
  private configSub = new Subscription();
  private pointerListeners = new AbortController();
  private destroyed = false;
  private canvasWidth = 0;
  private canvasHeight = 0;
  /** A fit was asked for while the canvas had no size (another one is maximised); it runs once it has one. */
  private fitPending = false;
  private animationFrameId: number | undefined;
  private resizeObserver: ResizeObserver | undefined;

  // D3 force simulation and aggregation
  private simulation: Simulation<GlyphCacheObject, undefined> | undefined;
  /** Radii the collision force keeps apart, by glyphData index. */
  private collisionRadii: number[] = [];
  collisionAvoidance = false;
  private currentTicks = 0;
  private maxTicks = 50;
  aggregated = false;
  /** Step of the transitions, from the speed level of the settings overlay. */
  private animationSpeed = transitionStep(TRANSITION_SPEED.default);

  // Hover and interaction
  private mouse = new THREE.Vector2();
  private currentHoveredObject: GlyphObject | null = null;
  private animateGlyph: GlyphObject | null = null;
  private pulseStartTime = performance.now();
  private lastHitTestTime = 0;
  lastMousePosition = new THREE.Vector2();
  /** Where and when the mouse button went down on the canvas (not on an overlay). */
  private mouseDown: { x: number; y: number; time: number } | null = null;
  mouseInside = false;
  private mouseIdleTimer: ReturnType<typeof setTimeout> | undefined;

  // Overlay controls
  canvasActivated = false;
  timestamps: string[] = [];
  algorithms: string[] = [];
  selectedTimestamp = '';
  selectedAlgorithm = '';

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private host: ElementRef<HTMLElement>,
    private logger: LoggerService,
    private config: ConfigService,
    private dataLoader: DataLoaderService,
    private thumbnails: ThumbnailService,
    private filterService: FilterService,
    public cameraSvc: CanvasCameraService,
    public rendererSvc: CanvasRendererService,
    public selectionSvc: CanvasSelectionService
  ) {}

  private requestSceneRender = () => this.rendererSvc.requestRender(RenderTask.SceneRender);

  /** Render config of this canvas: an image that arrives later redraws this canvas only. */
  private buildRenderConfig(): GlyphRenderConfig {
    return buildGlyphRenderConfig(this.config, this.thumbnails, this.requestSceneRender);
  }

  private get hasSize(): boolean {
    return this.canvasWidth > 0 && this.canvasHeight > 0;
  }

  //#region Life Cycle methods
  ngAfterViewInit(): void {
    this.initThree();
    this.subscribeToEvents();
    this.observeResize();
    this.bindPointerListeners();
  }

  ngOnChanges(): void {
    this.logger.log('The component has changed ' + this.id);
  }

  ngOnDestroy(): void {
    this.logger.log('Destroy ' + this.id);
    this.destroyed = true;

    this.configSub.unsubscribe();
    this.pointerListeners.abort();
    this.clearMouseIdleTimer();
    // The selection goes with its canvas: the other canvases no longer grey out what it left out.
    if (this.filterService.removeFilter(this.selectionSvc.selectionFilter)) this.config.redraw();

    if (this.animationFrameId !== undefined) cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = undefined;
    this.resizeObserver?.disconnect();
    // Dispose this canvas's meshes and forget its cache entries; the items are shared.
    this.rendererSvc.clearGlyphs(this.glyphData, this.id);
    this.rendererSvc.dispose();
  }
  //#endregion

  //#region Initialization Methods
  private initThree(): void {
    const rect = this.canvasContainer.nativeElement.getBoundingClientRect();
    const container = this.canvasContainer.nativeElement;
    this.canvasWidth = Math.floor(rect.width);
    this.canvasHeight = Math.floor(rect.height);

    this.cameraSvc.initCamera(this.canvasWidth, this.canvasHeight);
    this.rendererSvc.initRenderer(container, this.canvasWidth, this.canvasHeight);

    // Render requests start the animation loop, outside Angular's zone: a
    // frame changes nothing the templates show.
    this.rendererSvc.setRenderRequestCallback(() => {
      if (this.animationFrameId !== undefined || this.destroyed) return;
      this.ngZone.runOutsideAngular(() => {
        this.animationFrameId = requestAnimationFrame(this.animate);
      });
    });
  }

  /** Pointer moves, wheel and touch: frequent, so outside Angular's zone (see the class comment). */
  private bindPointerListeners(): void {
    const host = this.host.nativeElement;
    const signal = this.pointerListeners.signal;
    this.ngZone.runOutsideAngular(() => {
      host.addEventListener('mousemove', event => this.onMouseMove(event), { signal });
      host.addEventListener('wheel', event => this.onWheel(event), { signal, passive: false });
      host.addEventListener('touchstart', event => this.onTouchStart(event), { signal, passive: true });
      host.addEventListener('touchmove', event => this.onTouchMove(event), { signal, passive: false });
      host.addEventListener('touchend', event => this.onTouchEnd(event), { signal, passive: true });
      host.addEventListener('touchcancel', event => this.onTouchEnd(event), { signal, passive: true });
    });
  }

  private subscribeToEvents() {
    this.configSub.add(
      this.config.loadedDataSubject$.subscribe(async loadedData => {
        if (loadedData === '') return;

        const data = await this.dataLoader.getGlyphData(loadedData);
        // Another dataset was chosen while this one loaded, or the canvas is gone.
        if (this.destroyed || loadedData !== this.config.loadedData) return;

        this.ngZone.run(() => this.showDataset(loadedData, data ?? []));
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
        // Other canvases show the items of a canvas's magic lens enlarged.
        if (glyphs == null || this.magicLenseStatus) return;
        this.rendererSvc.renderMagicLensGlyphs(
          glyphs.filter(glyph => this.glyphSet.has(glyph)),
          this.id,
          this.selectedTimestamp,
          this.selectedAlgorithm,
          this.aggregated,
          this.buildRenderConfig()
        );
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
        if (glyph != null && this.glyphSet.has(glyph)) {
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
      this.config.glyphConfigSubject$.subscribe(glyphConfig => {
        this.applyGlyphSizes(glyphConfig);
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

  /** Replace what the canvas shows with the items of `dataset`. */
  private showDataset(dataset: string, data: GlyphObject[]): void {
    this.magicLensComponent.clearLensGlyphs();
    // The previous dataset's meshes and cache entries of this canvas go.
    this.rendererSvc.clearGlyphs(this.glyphData, this.id);
    this.glyphData = data;
    this.glyphSet = new Set(data);
    this.currentHoveredObject = null;
    this.animateGlyph = null;

    this.timestamps = this.dataLoader.getTimestamps(dataset);
    this.algorithms = this.dataLoader.getPositions(dataset);
    this.selectedTimestamp = this.timestamps[0];
    this.selectedAlgorithm = this.algorithms[0];
    // Glyph radii depend on the dataset (see applyGlyphSizes); positions need the selection above.
    this.applyGlyphSizes(this.config.getConfiguration());

    this.rendererSvc.positionBounds = undefined;
    if (data.length > 0) {
      this.rendererSvc.updatePositionBounds(this.glyphData, this.selectedTimestamp, this.selectedAlgorithm);
      this.rendererSvc.spatialGridDirty = true;
      this.fitToView();
    } else {
      console.warn(`[Canvas ${this.id}] No data received!`);
      this.rendererSvc.requestRender(RenderTask.SceneRender);
    }
    this.cdr.detectChanges();
  }

  private observeResize() {
    const container = this.canvasContainer.nativeElement;

    this.resizeObserver = new ResizeObserver(entries => {
      const entry = entries.at(-1);
      if (!entry) return;
      this.canvasWidth = Math.floor(entry.contentRect.width);
      this.canvasHeight = Math.floor(entry.contentRect.height);
      // A hidden canvas (another one is maximised) keeps its renderer and camera as they are.
      if (!this.hasSize) return;

      this.rendererSvc.updateRendererSize(this.canvasWidth, this.canvasHeight);
      this.cameraSvc.updateCameraBounds(this.canvasWidth, this.canvasHeight);
      this.resetAnimatedGlyph();
      if (this.fitPending) {
        this.fitToView();
        return;
      }
      this.rendererSvc.invalidateClipping();
      this.rendererSvc.renderGlyphs(
        this.glyphData,
        this.id,
        this.selectedTimestamp,
        this.selectedAlgorithm,
        this.aggregated,
        this.buildRenderConfig()
      );
    });

    this.resizeObserver.observe(container);
  }

  /**
   * Take over the item size. Glyphs get a radius that makes a typical glyph of
   * this dataset look about as large as its point; images fill their radius.
   * Hit testing and collision avoidance depend on the radius.
   */
  private applyGlyphSizes(glyphConfig: GlyphConfiguration): void {
    const sizeInfo = this.rendererSvc.sizeInfo;
    const reach = hasFeatureAxes(glyphConfig.glyphType)
      ? typicalGlyphReach(
          this.glyphData,
          this.config.activeFeatures,
          this.config.featureMaxValues,
          glyphConfig.scaleLinear
        )
      : 1;
    const changed = sizeInfo.setSizes(glyphConfig.itemSize, reach);
    // Size, axes and options such as the background change what collision
    // avoidance keeps apart; while it is on, it follows at once.
    if (this.updateCollisionForce()) this.rerunCollisionAvoidance();
    if (!changed) return;
    this.rendererSvc.rebuildSpatialGrid(this.glyphData, this.id, this.selectedTimestamp, this.selectedAlgorithm);
  }

  /**
   * The collision simulation over the cache objects of glyphData. forceX and
   * forceY read the target positions when they are set, so this runs again
   * whenever the targets change (fit, projection switch).
   */
  private initSimulation() {
    this.simulation?.stop();
    this.simulation = forceSimulation(
      this.glyphData.map(glyph => glyph.getCacheObject(this.id, this.selectedTimestamp, this.selectedAlgorithm))
    )
      .force('x', forceX<GlyphCacheObject>(node => node.position.x).strength(COLLISION_ATTRACTION))
      .force('y', forceY<GlyphCacheObject>(node => node.position.y).strength(COLLISION_ATTRACTION))
      .velocityDecay(0.5)
      .stop();
    this.collisionRadii = [];
    this.updateCollisionForce();
  }

  /**
   * Collision avoidance keeps apart what is drawn at the current zoom level, at
   * its current scale: points, the glyphs' own reach, or whole circles where a
   * background or the axes are drawn (visibleRadius). The simulation's nodes
   * are the cache objects of glyphData, in the same order. Returns whether a
   * radius changed.
   */
  private updateCollisionForce(): boolean {
    if (!this.simulation) return false;
    const sizeInfo = this.rendererSvc.sizeInfo;
    const level = sizeInfo.currentZoomLevel;
    const config = this.buildRenderConfig();
    const scale = this.rendererSvc.glyphScale;
    const radii = this.glyphData.map(glyph => visibleRadius(glyph, level, sizeInfo, config) * scale);
    const changed =
      radii.length !== this.collisionRadii.length || radii.some((radius, i) => radius !== this.collisionRadii[i]);
    this.collisionRadii = radii;
    this.simulation.force('collide', forceCollide<GlyphCacheObject>((_, i) => radii[i] ?? 0).iterations(2));
    return changed;
  }

  /**
   * While collision avoidance is on, run it again from where the items are:
   * larger items move apart, smaller ones back towards their own positions.
   */
  private rerunCollisionAvoidance(): void {
    if (!this.collisionAvoidance || !this.simulation) return;
    this.currentTicks = 0;
    this.simulation.alpha(1);
    this.rendererSvc.requestRender(RenderTask.ForceSimulation);
  }

  /** With aggregation on, group the items again: after any change of their positions. */
  private refreshAggregation(): void {
    if (!this.aggregated) return;
    clusterGlyphs(
      this.glyphData.map(glyph => glyph.getCacheObject(this.id, this.selectedTimestamp, this.selectedAlgorithm)),
      AGGREGATION_RADIUS
    );
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
      this.rendererSvc.requestRender(RenderTask.OriginalSimulation);
    } else {
      this.updateCollisionForce();
      this.rerunCollisionAvoidance();
    }
  }

  toggleAggregation() {
    this.aggregated = !this.aggregated;
    this.refreshAggregation();
    this.rendererSvc.invalidateClipping();

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

  /**
   * Scale the positions to the canvas and ease the camera onto all items. A
   * canvas without a size (another one is maximised) does it once it has one:
   * positions are scaled to the canvas size.
   */
  fitToView() {
    if (!this.hasSize) {
      this.fitPending = true;
      return;
    }
    this.fitPending = false;
    if (this.collisionAvoidance) this.toggleCollisionAvoidance();

    this.rendererSvc.scaleGroupToFit(
      this.glyphData,
      this.id,
      this.selectedTimestamp,
      this.selectedAlgorithm,
      this.canvasWidth,
      this.canvasHeight
    );
    this.initSimulation();
    this.refreshAggregation();
    this.rendererSvc.sizeInfo.currentZoomLevel = ZoomLevel.low;
    // Rebuild spatial grid after positions are scaled
    this.rendererSvc.rebuildSpatialGrid(this.glyphData, this.id, this.selectedTimestamp, this.selectedAlgorithm);
    this.rendererSvc.renderGlyphs(
      this.glyphData,
      this.id,
      this.selectedTimestamp,
      this.selectedAlgorithm,
      this.aggregated,
      this.buildRenderConfig(),
      true
    );

    if (this.cameraSvc.startFitAnimation(this.rendererSvc.glyphGroup)) {
      this.rendererSvc.requestRender(RenderTask.FitAnimation);
    } else {
      this.rendererSvc.requestRender(RenderTask.SceneRender);
    }
  }

  onAnimationSpeedChanged(level: number) {
    this.animationSpeed = transitionStep(level);
  }

  onTogglePlayback() {
    if (!this.rendererSvc.needsRender.has(RenderTask.OriginalSimulation)) {
      this.rendererSvc.requestRender(RenderTask.OriginalSimulation);
    } else {
      this.rendererSvc.cancelRender(RenderTask.OriginalSimulation);
    }
  }

  onSettingsChange(payload: { timestamp: string; algorithm: string }): void {
    this.selectedTimestamp = payload.timestamp;
    this.selectedAlgorithm = payload.algorithm;

    this.rendererSvc.positionBounds = undefined;
    this.rendererSvc.updatePositionBounds(this.glyphData, this.selectedTimestamp, this.selectedAlgorithm);
    this.magicLensComponent.clearLensGlyphs();

    // Positions are scaled to the canvas size: a hidden canvas takes them over once it is shown.
    const bounds = this.rendererSvc.positionBounds;
    if (!this.hasSize || !bounds) {
      this.fitPending = !this.hasSize;
      return;
    }

    this.glyphData.forEach(glyph => {
      const cache = glyph.getCacheObject(this.id, this.selectedTimestamp, this.selectedAlgorithm);
      const newPos = glyph.getPosition(this.selectedTimestamp, this.selectedAlgorithm);
      const scalePos = scalePosition(newPos.x, newPos.y, bounds, this.canvasWidth, this.canvasHeight);
      cache.position.x = scalePos.x;
      cache.position.y = scalePos.y;
      cache.x = scalePos.x;
      cache.y = scalePos.y;
    });

    // Collision avoidance and aggregation follow the new targets. The items
    // move there (OriginalSimulation); the spatial grid follows when they arrive.
    this.initSimulation();
    if (this.aggregated) {
      this.refreshAggregation();
      this.rendererSvc.renderGlyphs(
        this.glyphData,
        this.id,
        this.selectedTimestamp,
        this.selectedAlgorithm,
        this.aggregated,
        this.buildRenderConfig()
      );
    }
    this.rendererSvc.invalidateClipping();
    this.rendererSvc.requestRender(RenderTask.OriginalSimulation);
  }

  private resetMouseIdleTimer(): void {
    this.clearMouseIdleTimer();

    // Pointer handlers run outside Angular's zone; the overlays' visibility is bound to mouseInside.
    this.mouseIdleTimer = setTimeout(() => this.ngZone.run(() => (this.mouseInside = false)), MOUSE_IDLE_MS);
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
  /**
   * Draw what the zoom level of `zoom` draws, if that is not what is drawn now
   * (compared with the level drawn, not with an earlier zoom: a pinch, or a fit
   * that started at another level, changes the zoom in many steps).
   */
  private syncZoomLevel(zoom: number): boolean {
    const level = this.cameraSvc.calculateZoomLevel(zoom);
    const sizeInfo = this.rendererSvc.sizeInfo;
    if (level === sizeInfo.currentZoomLevel) return false;

    sizeInfo.currentZoomLevel = level;
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
    // Another level draws something else (points, glyphs, backgrounds): keep that apart too.
    if (this.collisionAvoidance) {
      this.rendererSvc.setGlyphScale(glyphScale(zoom));
      this.updateCollisionForce();
      this.rerunCollisionAvoidance();
    }
    // The hover pulse shows at the low level only.
    if (level === ZoomLevel.low && this.animateGlyph) this.rendererSvc.requestRender(RenderTask.GlyphAnimation);
    return true;
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
    const needsRender = this.rendererSvc.needsRender;
    if (this.destroyed || this.rendererSvc.isDisposed || needsRender.size === 0) {
      this.animationFrameId = undefined; // stop the loop
      return;
    }

    this.animationFrameId = requestAnimationFrame(this.animate);

    if (needsRender.has(RenderTask.ForceSimulation)) {
      this.currentTicks++;
      this.simulation?.tick();

      // Draw the items where the simulation put them
      for (const glyph of this.glyphData) {
        const cached = glyph.getCacheObject(this.id, this.selectedTimestamp, this.selectedAlgorithm);
        cached.moveTo(cached.x ?? cached.display.x, cached.y ?? cached.display.y);
      }
      this.rendererSvc.invalidateClipping();

      if (this.currentTicks > this.maxTicks) {
        this.currentTicks = 0;
        this.rendererSvc.cancelRender(RenderTask.ForceSimulation);
        this.rendererSvc.rebuildSpatialGrid(this.glyphData, this.id, this.selectedTimestamp, this.selectedAlgorithm);
      }
    } else if (needsRender.has(RenderTask.OriginalSimulation)) {
      const finished = this.rendererSvc.animateBackToOriginal(
        this.glyphData,
        this.id,
        this.selectedTimestamp,
        this.selectedAlgorithm,
        this.animationSpeed
      );
      if (finished) {
        needsRender.delete(RenderTask.OriginalSimulation);
        this.rendererSvc.rebuildSpatialGrid(this.glyphData, this.id, this.selectedTimestamp, this.selectedAlgorithm);
        // After a projection switch, collision avoidance that is on applies to the new layout.
        this.rerunCollisionAvoidance();
      }
    }

    if (needsRender.has(RenderTask.GlyphAnimation)) this.pulseAnimatedGlyph();

    const fitCompleted = this.cameraSvc.updateFitAnimation(this.glyphData.length);
    this.rendererSvc.setGlyphScale(glyphScale(this.cameraSvc.camera.zoom));
    if (fitCompleted) {
      this.syncZoomLevel(this.cameraSvc.camera.zoom);
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
      () => this.buildRenderConfig()
    );

    this.rendererSvc.renderer.render(this.rendererSvc.scene, this.cameraSvc.camera);
    this.rendererSvc.cancelRender(RenderTask.SceneRender);
  };

  /**
   * Pulse the item hovered in another canvas. Only points pulse (low zoom); at
   * other levels, or without a drawn item, the task ends so the loop can stop.
   */
  private pulseAnimatedGlyph(): void {
    const mesh =
      this.rendererSvc.sizeInfo.currentZoomLevel === ZoomLevel.low
        ? this.animateGlyph?.getMesh(this.selectedTimestamp, this.selectedAlgorithm, this.id)
        : undefined;
    if (!mesh) {
      this.rendererSvc.needsRender.delete(RenderTask.GlyphAnimation);
      return;
    }
    const elapsed = performance.now() - this.pulseStartTime;
    // Pulsate with sine wave (e.g., 2 Hz frequency)
    mesh.scale.setScalar(2 + 0.8 * Math.sin((elapsed / 3000) * 2 * Math.PI * 2));
  }

  private startAnimateGlyph(glyph: GlyphObject | null) {
    if (glyph == null || !this.glyphSet.has(glyph)) {
      this.animateGlyph = null;
      return;
    }
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
    if (this.rendererSvc.sizeInfo.currentZoomLevel === ZoomLevel.low) {
      this.rendererSvc.requestRender(RenderTask.GlyphAnimation);
    }
  }

  private resetAnimatedGlyph() {
    this.animateGlyph
      ?.getMesh(this.selectedTimestamp, this.selectedAlgorithm, this.id)
      ?.scale.setScalar(this.rendererSvc.glyphScale); // Reset the pulse
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

  /** End the hover of the item hovered in this canvas, if any; returns whether there was one. */
  private clearHoveredGlyph(): boolean {
    const glyph = this.currentHoveredObject;
    this.currentHoveredObject = null;
    if (glyph == null) return false;
    glyph.setHighlighted(false);
    this.config.redrawGlyph(glyph);
    return true;
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
    // A press on an overlay (settings, tooltip, navigation) is the overlay's.
    if (this.selectionSvc.isMouseOverOverlay(event)) {
      this.mouseDown = null;
      return;
    }
    this.mouseDown = { x: event.clientX, y: event.clientY, time: Date.now() };

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
    const down = this.mouseDown;
    this.mouseDown = null;

    if (this.selectionSvc.isMouseOverOverlay(event)) {
      // Skip THREE.js interaction
      return;
    }

    // A click: released near where the button went down, not near the last
    // mouse move (a quick pan is no click).
    const click = isClick(down, { x: event.clientX, y: event.clientY, time: Date.now() });

    if (click && this.magicLensComponent.isActive()) {
      this.toggleFixMagicLens();
      return;
    }

    if (this.magicLensComponent.isFixed() && this.magicLensComponent.isActive()) {
      this.tooltipComponent.cancelHoverPopup();
      this.toggleFixMagicLens();
    }

    if (click && !this.selectionSvc.selectionMode) {
      this.fixTooltipAt(event);
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
          this.rendererSvc.renderer.domElement
        );
      }
    }
  }

  /**
   * A click shows and fixes the tooltip of the item under the pointer. The hover
   * state can lag behind a quick click (hit tests are throttled, the hover popup
   * is delayed), so the clicked item is looked up at the click position.
   * Clicking the item of the fixed tooltip again, or empty space, closes it.
   */
  private fixTooltipAt(event: MouseEvent): void {
    const object = this.rendererSvc.optimizedHitTest(
      event,
      this.glyphData,
      this.cameraSvc.camera,
      this.selectedTimestamp,
      this.selectedAlgorithm,
      this.id
    );
    const glyph = object ? getGlyphFromObject(object) : null;
    if (!object || !glyph || glyph.id === this.tooltipComponent.fixedItemId) {
      this.tooltipComponent.release();
      return;
    }
    this.tooltipComponent.showFixed(event.clientX, event.clientY, object);
  }

  /** Runs outside Angular's zone (bindPointerListeners). */
  onMouseMove(event: MouseEvent): void {
    if (!this.mouseInside) this.ngZone.run(() => (this.mouseInside = true));
    this.resetMouseIdleTimer();

    if (this.selectionSvc.isMouseOverOverlay(event) || this.tooltipComponent.isFixed()) {
      if (this.selectionSvc.isSelecting) {
        this.selectionSvc.isSelecting = false;
        this.cdr.detectChanges();
      }
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
      const change = this.magicLensComponent.updateMagicLens(
        this.lastMousePosition,
        this.cameraSvc.camera,
        this.rendererSvc.renderer
      );
      if (change) this.magicLensComponent.renderMagicLensGlyphs(this.selectedTimestamp, this.selectedAlgorithm);
      this.magicLensComponent.renderLens(this.lastMousePosition);
      this.magicLensComponent.refreshView();
      return;
    }

    if (this.selectionSvc.isSelecting) {
      this.selectionSvc.selectionEnd.set(event.clientX, event.clientY);
      this.selectionSvc.updateSelectionBox();
      this.cdr.detectChanges();
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
            hoveredGlyph.setHighlighted(true);
            this.pulseStartTime = performance.now();
            this.rendererSvc.renderGlyph(
              hoveredGlyph,
              this.selectedTimestamp,
              this.selectedAlgorithm,
              this.id,
              this.aggregated,
              this.buildRenderConfig()
            );
            // The sidebar's glyph legend shows the hovered item.
            this.ngZone.run(() => this.config.animateGlyph(hoveredGlyph));
            this.currentHoveredObject = hoveredGlyph;
          }
          this.rendererSvc.requestRender(RenderTask.SceneRender);

          this.tooltipComponent.cancelHoverPopup();
          this.tooltipComponent.scheduleHoverPopup(event.clientX, event.clientY, closestObject as THREE.Object3D);
        }
      } else {
        const hadHover = this.clearHoveredGlyph();
        this.tooltipComponent.cancelHoverPopup();
        this.config.animateGlyph(null);
        if (hadHover) this.rendererSvc.requestRender(RenderTask.SceneRender);
      }
    }

    this.lastMousePosition.set(event.clientX, event.clientY);
  }

  /** Runs outside Angular's zone (bindPointerListeners). */
  onWheel(event: WheelEvent): void {
    // A fixed tooltip scrolls its own content.
    if (event.target instanceof Element && event.target.closest('.tooltip')) return;
    // Prevent the browser from zooming the page, even when Magic Lens is active
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
    const newZoom = clampZoom(oldZoom * Math.pow(this.cameraSvc.zoomFactor, direction));

    this.cameraSvc.applyZoomAtScreenPoint(
      event.clientX,
      event.clientY,
      newZoom,
      oldZoom,
      this.rendererSvc.renderer.domElement
    );
    this.syncZoomLevel(newZoom);
    this.rendererSvc.requestRender(RenderTask.SceneRender);
  }

  /** Runs outside Angular's zone (bindPointerListeners). */
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

  /** Runs outside Angular's zone (bindPointerListeners). */
  onTouchEnd(event: TouchEvent): void {
    if (event.touches.length < 2) {
      this.cameraSvc.touchZoomStartDistance = null;
      this.cameraSvc.lastZoom = null;
    }
    if (event.touches.length < 1) {
      this.cameraSvc.lastTouchPosition = null;
    }
  }

  /** Runs outside Angular's zone (bindPointerListeners). */
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

      // The zoom follows the distance of the fingers since the pinch began.
      const startZoom = this.cameraSvc.lastZoom ?? this.cameraSvc.camera.zoom;
      const oldZoom = this.cameraSvc.camera.zoom;
      const newZoom = clampZoom(startZoom * zoomRatio);

      const centerX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
      const centerY = (event.touches[0].clientY + event.touches[1].clientY) / 2;

      this.cameraSvc.updateTouchCenter(event, this.rendererSvc.renderer.domElement);

      this.cameraSvc.applyZoomAtScreenPoint(centerX, centerY, newZoom, oldZoom, this.rendererSvc.renderer.domElement);
      this.syncZoomLevel(newZoom);
      this.rendererSvc.requestRender(RenderTask.SceneRender);
    }
  }
  //#endregion
}
