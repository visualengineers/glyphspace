import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { ZoomLevel } from '../../shared/enum/zoom-level';
import { panCamera } from '../../shared/helpers/three-helper';
import { FIT_ANIMATION_DURATION_MS, FIT_MARGIN_FACTOR } from '../../shared/constants/canvas-constants';

@Injectable()
export class CanvasCameraService {
  camera!: THREE.OrthographicCamera;
  target = new THREE.Vector3(0, 0, 0);

  // Fit animation state
  fitAnimationStartTime: number | null = null;
  fitStartZoom!: number;
  private fitEndZoom!: number;
  private fitStartPosition!: THREE.Vector3;
  private fitEndPosition!: THREE.Vector3;
  private fitStartTarget!: THREE.Vector3;
  private fitEndTarget!: THREE.Vector3;
  private fitDuration = FIT_ANIMATION_DURATION_MS;

  // Navigation
  isPanning = false;
  zoomFactor = 1.1;

  // Touch
  lastTouchPosition: { x: number; y: number } | null = { x: 0, y: 0 };
  touchZoomStartDistance: number | null = null;
  lastZoom: number | null = null;
  private touchCenter = { x: 0, y: 0 };

  // View rect (for clipping)
  viewRect = { left: 0, right: 0, top: 0, bottom: 0 };
  lastViewRect = { left: 0, right: 0, top: 0, bottom: 0 };

  initCamera(width: number, height: number): void {
    this.camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 1, 1000);
    this.camera.position.set(0, 0, 10);
    this.camera.zoom = 1;
    this.camera.updateProjectionMatrix();
  }

  updateCameraBounds(width: number, height: number): void {
    this.camera.left = width / -2;
    this.camera.right = width / 2;
    this.camera.top = height / 2;
    this.camera.bottom = height / -2;
    this.camera.updateProjectionMatrix();
  }

  updateViewRect(): void {
    this.camera.updateMatrixWorld();
    const halfW = ((this.camera.right - this.camera.left) / this.camera.zoom) * 0.5;
    const halfH = ((this.camera.top - this.camera.bottom) / this.camera.zoom) * 0.5;
    this.viewRect.left = this.camera.position.x - halfW;
    this.viewRect.right = this.camera.position.x + halfW;
    this.viewRect.bottom = this.camera.position.y - halfH;
    this.viewRect.top = this.camera.position.y + halfH;
  }

  startFitAnimation(glyphGroup: THREE.Group): void {
    const box = new THREE.Box3().setFromObject(glyphGroup);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const margin = FIT_MARGIN_FACTOR;
    const widthWithMargin = size.x * margin;
    const heightWithMargin = size.y * margin;

    const cameraWidth = this.camera.right - this.camera.left;
    const cameraHeight = this.camera.top - this.camera.bottom;

    const zoomX = cameraWidth / widthWithMargin;
    const zoomY = cameraHeight / heightWithMargin;
    const requiredZoom = Math.min(zoomX, zoomY);

    const direction = new THREE.Vector3().subVectors(this.camera.position, this.target);
    const newTarget = center.clone();
    const newPosition = center.clone().add(direction);

    this.fitStartPosition = this.camera.position.clone();
    this.fitEndPosition = newPosition;
    this.fitStartTarget = this.target.clone();
    this.fitEndTarget = newTarget;
    this.fitStartZoom = this.camera.zoom;
    this.fitEndZoom = requiredZoom;
    this.fitAnimationStartTime = performance.now();
  }

  /** Returns true if animation completed this frame */
  updateFitAnimation(glyphCount: number): boolean {
    if (this.fitAnimationStartTime === null) return false;

    if (glyphCount > 5000) {
      this.fitAnimationStartTime = null;
      this.camera.position.copy(this.fitEndPosition);
      this.target.copy(this.fitEndTarget);
      this.camera.zoom = this.fitEndZoom;
      this.camera.updateProjectionMatrix();
      this.camera.lookAt(this.target);
      return true;
    }

    const now = performance.now();
    const elapsed = now - this.fitAnimationStartTime;
    const t = Math.min(elapsed / this.fitDuration, 1);

    // Easing function: easeInOutQuad
    const easedT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const currentPosition = new THREE.Vector3().lerpVectors(this.fitStartPosition, this.fitEndPosition, easedT);
    this.camera.position.copy(currentPosition);

    const currentTarget = new THREE.Vector3().lerpVectors(this.fitStartTarget, this.fitEndTarget, easedT);
    this.target.copy(currentTarget);

    this.camera.zoom = THREE.MathUtils.lerp(this.fitStartZoom, this.fitEndZoom, easedT);
    this.camera.updateProjectionMatrix();
    this.camera.lookAt(this.target);

    if (t === 1) {
      this.fitAnimationStartTime = null;
      return true;
    }
    return false;
  }

  calculateZoomLevel(zoomLevel: number): ZoomLevel {
    if (zoomLevel < 2) return ZoomLevel.low;
    if (zoomLevel < 10) return ZoomLevel.medium;
    return ZoomLevel.high;
  }

  applyZoomAtScreenPoint(
    screenX: number,
    screenY: number,
    newZoom: number,
    oldZoom: number,
    rendererElement: HTMLElement
  ): void {
    const rect = rendererElement.getBoundingClientRect();
    const xNDC = ((screenX - rect.left) / rect.width) * 2 - 1;
    const yNDC = -((screenY - rect.top) / rect.height) * 2 + 1;

    const worldBefore = new THREE.Vector3(xNDC, yNDC, 0).unproject(this.camera);
    this.camera.zoom = newZoom;
    this.camera.updateProjectionMatrix();

    const worldAfter = new THREE.Vector3(xNDC, yNDC, 0).unproject(this.camera);
    const delta = worldBefore.sub(worldAfter);

    this.camera.position.x += delta.x;
    this.camera.position.y += delta.y;
    this.target.x += delta.x;
    this.target.y += delta.y;
  }

  pan(lastPos: THREE.Vector2, event: MouseEvent): void {
    panCamera(this.camera, lastPos, event, this.target);
  }

  getTouchDistance(event: TouchEvent): number {
    const dx = event.touches[0].clientX - event.touches[1].clientX;
    const dy = event.touches[0].clientY - event.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  updateTouchCenter(event: TouchEvent, rendererElement: HTMLElement): void {
    const rect = rendererElement.getBoundingClientRect();
    const cx = (event.touches[0].clientX + event.touches[1].clientX) / 2;
    const cy = (event.touches[0].clientY + event.touches[1].clientY) / 2;
    this.touchCenter.x = ((cx - rect.left) / rect.width) * 2 - 1;
    this.touchCenter.y = -((cy - rect.top) / rect.height) * 2 + 1;
  }
}
