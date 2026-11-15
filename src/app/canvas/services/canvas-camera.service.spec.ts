import * as THREE from 'three';
import { CanvasCameraService, clampZoom } from './canvas-camera.service';
import { ZOOM_LIMITS } from '../../shared/constants/canvas-constants';

function groupWith(...positions: [number, number, number][]): THREE.Group {
  const group = new THREE.Group();
  for (const [x, y, size] of positions) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size));
    mesh.position.set(x, y, 0);
    group.add(mesh);
  }
  return group;
}

/** Run the fit animation to its end. */
function finishFit(service: CanvasCameraService): void {
  service.updateFitAnimation(10_000); // many items: the camera jumps
}

describe('CanvasCameraService fit', () => {
  let service: CanvasCameraService;

  beforeEach(() => {
    service = new CanvasCameraService();
    service.initCamera(400, 200);
  });

  it('zooms so that the items fit with a margin and centres them', () => {
    expect(service.startFitAnimation(groupWith([-100, 0, 10], [100, 0, 10]))).toBe(true);
    finishFit(service);

    expect(service.camera.zoom).toBeCloseTo(400 / (210 * 1.1), 5);
    expect(service.camera.position.x).toBeCloseTo(0);
  });

  it('leaves the camera alone when there is nothing to fit', () => {
    service.camera.zoom = 3;

    expect(service.startFitAnimation(new THREE.Group())).toBe(false);
    expect(service.camera.zoom).toBe(3);
  });

  it('keeps the zoom of a single tiny item within the zoom limits', () => {
    service.startFitAnimation(groupWith([5, 5, 0.01]));
    finishFit(service);

    expect(service.camera.zoom).toBe(ZOOM_LIMITS.max);
    expect(Number.isFinite(service.camera.projectionMatrix.elements[0])).toBe(true);
  });

  it('fits a line of items by its length', () => {
    const line = new THREE.Group();
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-50, 0, 0),
      new THREE.Vector3(50, 0, 0),
    ]);
    line.add(new THREE.Line(geometry));

    service.startFitAnimation(line);
    finishFit(service);

    expect(service.camera.zoom).toBeCloseTo(400 / (100 * 1.1), 5);
  });
});

describe('CanvasCameraService bounds', () => {
  it('keeps its bounds when the canvas has no size (hidden by a maximised canvas)', () => {
    const service = new CanvasCameraService();
    service.initCamera(400, 200);

    service.updateCameraBounds(0, 0);

    expect([service.camera.left, service.camera.right, service.camera.top, service.camera.bottom]).toEqual([
      -200, 200, 100, -100,
    ]);
  });

  it('starts with usable bounds on a canvas without a size', () => {
    const service = new CanvasCameraService();
    service.initCamera(0, 0);

    expect(service.camera.projectionMatrix.elements.every(Number.isFinite)).toBe(true);
  });
});

describe('clampZoom', () => {
  it('keeps zooms within the limits', () => {
    expect(clampZoom(0.1)).toBe(ZOOM_LIMITS.min);
    expect(clampZoom(3)).toBe(3);
    expect(clampZoom(Infinity)).toBe(ZOOM_LIMITS.max);
    expect(clampZoom(NaN)).toBe(1);
  });
});
