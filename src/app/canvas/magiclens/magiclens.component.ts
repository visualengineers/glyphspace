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
  mousePosition = new THREE.Vector2();
  relativePosition = new THREE.Vector2();
  magicLensActive = false;
  isLensFixed = false;
  lensRadius = 250; // in pixels
  lensZoomFactor = 8; // how much magnification to apply
  lensGlyphs: GlyphObject[] = [];
  private sizeInfo = new GlyphSizeInfo();

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
    this.mousePosition.set(lastMousePosition.x, lastMousePosition.y);
    const canvasRect = this.container.getBoundingClientRect();
    // Adjusted mouse position relative to canvas
    const relativeMouseX = lastMousePosition.x - canvasRect.left;
    const relativeMouseY = lastMousePosition.y - canvasRect.top;
    this.relativePosition.set(relativeMouseX, relativeMouseY);
  }

  renderMagicLensGlyphs(timestamp: string, algorithm: string, forceRerender: boolean = false): void {
    this.lensGlyphGroup.clear();
    this.lensGlyphs.forEach(glyph => {
      const mesh = glyph.renderGlyph(this.sizeInfo, timestamp, algorithm, this.parentId, false);
      if (mesh != null) {
        const wrapper = new THREE.Group();
        wrapper.name = "Wrapper";
        wrapper.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
        wrapper.userData = { item: new WeakRef(glyph) };
        wrapper.add(mesh);
        mesh.position.set(0, 0, 0);
        this.lensGlyphGroup.add(wrapper);
      }
    });

    // Apply force simulation
    const nodes: { x: number; y: number; fx?: number; fy?: number; threeObj: THREE.Object3D }[] = [];

    this.lensGlyphGroup.traverse((obj) => {
      if (obj.name != "Wrapper") return;

      const pos = new THREE.Vector3();
      obj.getWorldPosition(pos);
      nodes.push({ x: pos.x, y: pos.y, threeObj: obj });
    });

    const simulation = forceSimulation(nodes)
      .force('collide', forceCollide().radius(this.sizeInfo.radius))
      .stop();

    // Reduced ticks for better performance (was 80, now 30)
    // Most layouts converge quickly, 30 ticks is sufficient for collision resolution
    simulation.tick(30);

    nodes.forEach(node => {
      node.threeObj.position.x = node.x;
      node.threeObj.position.y = node.y;
    });

    // Adjust camera setting
    const bbox = new THREE.Box3();
    this.lensGlyphGroup.traverse((obj) => {
      const objBox = new THREE.Box3().setFromObject(obj);
      bbox.union(objBox);
    });

    const center = new THREE.Vector3();
    bbox.getCenter(center);

    this.lensCamera.position.set(center.x, center.y, 10); // maintain z=10
    this.lensCamera.lookAt(center.x, center.y, 0);

    // Inform other canvases about redrawing the glyph
    this.lensGlyphs.forEach((glyph) => {
      glyph.isInLense = true;
    });
    this.config.drawMagicLensGlyphs(this.lensGlyphs);
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
