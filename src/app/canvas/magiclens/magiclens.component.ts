import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { forceSimulation, forceCollide } from 'd3-force';
import * as THREE from 'three';
import { GlyphObject } from '../../glyph/glyph-object';
import { ZoomLevel } from '../../shared/enum/zoom-level';
import { getGlyphFromObject } from '../../shared/helpers/glyph-helper';
import { hitTest, screenToWorld } from '../../shared/helpers/three-helper';
import { ConfigService } from '../../services/config.service';
import { GlyphSizeInfo } from '../../glyph/glyph-size-info';

@Component({
  selector: 'app-magiclens',
  imports: [],
  templateUrl: './magiclens.component.html',
  styleUrl: './magiclens.component.scss'
})
export class MagiclensComponent {
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
  lensRadius = 250; // in pixels
  lensZoomFactor = 12; // how much magnification to apply
  lensGlyphs: GlyphObject[] = [];
  private sizeInfo = new GlyphSizeInfo();

  // Adaptive performance settings
  private maxLensGlyphs = 30; // Starting value, will adapt
  private readonly MIN_LENS_GLYPHS = 10;
  private readonly MAX_LENS_GLYPHS = 30;
  private readonly TARGET_FRAME_TIME = 12; // ms (target ~80fps to leave headroom)
  private lastRenderTime = 0;

  constructor(private config: ConfigService) {
    this.sizeInfo.currentZoomLevel = ZoomLevel.high;
    this.sizeInfo.radius = this.sizeInfo.radius * this.lensZoomFactor;
    this.sizeInfo.hitTolerance = this.sizeInfo.radius;
  }

  ngAfterViewInit() {
    // Lens Renderer
    if (this.lensCanvasRef) {
      this.lensRenderer = new THREE.WebGLRenderer({
        canvas: this.lensCanvasRef.nativeElement,
        alpha: true,
        antialias: true
      });
      this.lensRenderer.setClearColor(0xffffff, 1);
      this.lensRenderer.setSize(this.lensRadius, this.lensRadius);
      this.lensScene.add(this.lensGlyphGroup);

      // Lens Camera is just a zoomed clone of main
      this.lensCamera = new THREE.OrthographicCamera(
        (-this.lensRadius) / 2,
        (this.lensRadius) / 2,
        this.lensRadius / 2,
        -this.lensRadius / 2,
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
    this.lensRenderer.domElement = null!;
    this.lensScene = null!;
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
  }

  updateMagicLens(lastMousePosition: THREE.Vector2, camera: THREE.OrthographicCamera, renderer: THREE.WebGLRenderer): boolean {
    if (!this.magicLensActive || !this.lensCamera) return false;

    this.updatePositions(lastMousePosition);
    const newLensGlyphs: GlyphObject[] = [];

    // Convert screen position to world coordinates using shared helper
    const mouseEvent = { clientX: lastMousePosition.x, clientY: lastMousePosition.y } as MouseEvent;
    const mouseWorld = screenToWorld(mouseEvent, renderer, camera);

    // Calculate world-space radius based on screen pixel radius (30px) and camera zoom
    // This avoids converting every glyph to screen space
    const screenRadius = 30; // pixels - slightly larger tolerance for better UX
    const worldRadius = screenRadius / camera.zoom;

    // Check glyphs within world-space radius (O(n) but with cheaper distance calc)
    this.glyphGroup.children.forEach((obj) => {
      const dx = obj.position.x - mouseWorld.x;
      const dy = obj.position.y - mouseWorld.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < worldRadius * worldRadius) {
        const glyph = getGlyphFromObject(obj);
        if (glyph != null) {
          newLensGlyphs.push(glyph);
        }
      }
    });

    // Compare current lens glyphs to new ones
    const same =
      newLensGlyphs.length === this.lensGlyphs.length &&
      newLensGlyphs.every((g, i) => g === this.lensGlyphs[i]);

    if (same) return false;

    // Update
    this.clearLensGlyphs();
    this.lensGlyphs = newLensGlyphs;

    return true;
  }

  updatePositions(lastMousePosition: THREE.Vector2) {
    const canvasRect = this.container.getBoundingClientRect();
    this.relativePosition.set(
      lastMousePosition.x - canvasRect.left,
      lastMousePosition.y - canvasRect.top
    );
  }

  renderMagicLensGlyphs(timestamp: string, algorithm: string): void {
    const startTime = performance.now();
    this.lensGlyphGroup.clear();

    // Adaptive limit based on previous performance
    const glyphsToRender = this.lensGlyphs.length > this.maxLensGlyphs
      ? this.lensGlyphs.slice(0, this.maxLensGlyphs)
      : this.lensGlyphs;

    // Build nodes array while creating glyphs
    const nodes: { x: number; y: number; threeObj: THREE.Object3D }[] = [];

    for (const glyph of glyphsToRender) {
      const mesh = glyph.renderGlyph(this.sizeInfo, timestamp, algorithm, this.parentId, false);
      if (mesh != null) {
        const wrapper = new THREE.Group();
        wrapper.name = "Wrapper";
        wrapper.userData = { item: new WeakRef(glyph) };
        wrapper.add(mesh);
        mesh.position.set(0, 0, 0);
        this.lensGlyphGroup.add(wrapper);

        nodes.push({
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          threeObj: wrapper
        });
      }
    }

    const count = nodes.length;

    // Skip simulation for 0-1 glyphs
    if (count <= 1) {
      this.finalizeLensCamera(glyphsToRender, startTime);
      return;
    }

    // For 2-3 glyphs, use simple circular positions (no simulation needed)
    if (count <= 3) {
      const angleStep = (2 * Math.PI) / count;
      const radius = this.sizeInfo.radius * 1.2;
      nodes.forEach((node, i) => {
        node.threeObj.position.x = Math.cos(angleStep * i) * radius;
        node.threeObj.position.y = Math.sin(angleStep * i) * radius;
      });
      this.finalizeLensCamera(glyphsToRender, startTime);
      return;
    }

    // Run force simulation for 4+ glyphs
    this.runForceSimulation(nodes, count);
    this.finalizeLensCamera(glyphsToRender, startTime);
  }

  private runForceSimulation(nodes: { x: number; y: number; threeObj: THREE.Object3D }[], count: number): void {
    const maxRadius = (this.lensRadius / 2) - this.sizeInfo.radius;
    const maxRadiusSq = maxRadius * maxRadius;

    const simulation = forceSimulation(nodes)
      .force('collide', forceCollide().radius(this.sizeInfo.radius).strength(1))
      .velocityDecay(0.3)
      .stop();

    const totalTicks = Math.min(50, 20 + count * 2);

    for (let i = 0; i < totalTicks; i++) {
      simulation.tick(1);
      if (i % 5 === 0) this.enforceBoundary(nodes, maxRadius, maxRadiusSq);
    }

    // Final boundary enforcement and apply positions
    this.enforceBoundary(nodes, maxRadius, maxRadiusSq);
    for (const node of nodes) {
      node.threeObj.position.set(node.x, node.y, 0);
    }
  }

  private enforceBoundary(nodes: { x: number; y: number }[], maxRadius: number, maxRadiusSq: number): void {
    for (const node of nodes) {
      const distSq = node.x * node.x + node.y * node.y;
      if (distSq > maxRadiusSq) {
        const scale = maxRadius / Math.sqrt(distSq);
        node.x *= scale;
        node.y *= scale;
      }
    }
  }

  private finalizeLensCamera(renderedGlyphs: GlyphObject[], startTime: number): void {
    this.lensCamera.zoom = 1;
    this.lensCamera.position.set(0, 0, 10);
    this.lensCamera.lookAt(0, 0, 0);
    this.lensCamera.updateProjectionMatrix();

    renderedGlyphs.forEach((glyph) => {
      glyph.isInLense = true;
    });
    this.config.drawMagicLensGlyphs(renderedGlyphs);

    // Adapt glyph limit based on render performance
    this.lastRenderTime = performance.now() - startTime;
    this.adaptGlyphLimit(renderedGlyphs.length);
  }

  private adaptGlyphLimit(renderedCount: number): void {
    // Only adapt if we rendered near the limit (otherwise we can't measure properly)
    if (renderedCount < this.maxLensGlyphs * 0.8) return;

    if (this.lastRenderTime > this.TARGET_FRAME_TIME * 1.5) {
      // Too slow - decrease limit
      this.maxLensGlyphs = Math.max(
        this.MIN_LENS_GLYPHS,
        Math.floor(this.maxLensGlyphs * 0.8)
      );
    } else if (this.lastRenderTime < this.TARGET_FRAME_TIME * 0.5) {
      // Fast enough - can increase limit
      this.maxLensGlyphs = Math.min(
        this.MAX_LENS_GLYPHS,
        Math.floor(this.maxLensGlyphs * 1.2)
      );
    }
  }

  renderLens(lastMousePosition: THREE.Vector2) {
    if (!this.magicLensActive) return;

    this.updatePositions(lastMousePosition);
    this.lensRenderer.render(this.lensScene, this.lensCamera);

    const lensElem = this.lensCanvasRef!.nativeElement;
    const canvasRect = this.container.getBoundingClientRect(); // or your canvas element

    // Dimensions
    const lensWidth = lensElem.offsetWidth;
    const lensHeight = lensElem.offsetHeight;

    const padding = 10; // spacing from mouse
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
