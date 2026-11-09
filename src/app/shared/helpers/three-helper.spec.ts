import type { Mock } from 'vitest';
import * as THREE from 'three';
import { GlyphSizeInfo } from '../../glyph/glyph-size-info';
import { hitTest, hitTestCandidates, screenToWorld } from './three-helper';

// A 200x200 px canvas at the page origin looking at world [-100, 100] on both axes,
// so world (x, y) maps to client (x + 100, 100 - y).
const CANVAS_SIZE = 200;
const HALF_EXTENT = 100;

function createRendererStub(): { renderer: THREE.WebGLRenderer; getRect: Mock } {
  const getRect = vi.fn().mockReturnValue(new DOMRect(0, 0, CANVAS_SIZE, CANVAS_SIZE));
  const renderer = { domElement: { getBoundingClientRect: getRect } } as unknown as THREE.WebGLRenderer;
  return { renderer, getRect };
}

function createCamera(): THREE.OrthographicCamera {
  const camera = new THREE.OrthographicCamera(-HALF_EXTENT, HALF_EXTENT, HALF_EXTENT, -HALF_EXTENT, 0.1, 1000);
  camera.position.z = 10;
  camera.updateMatrixWorld();
  return camera;
}

function mouseAtWorld(x: number, y: number): MouseEvent {
  return new MouseEvent('mousemove', { clientX: x + HALF_EXTENT, clientY: HALF_EXTENT - y });
}

function objectAt(x: number, y: number): THREE.Object3D {
  const object = new THREE.Object3D();
  object.position.set(x, y, 0);
  return object;
}

function sizeInfoWithTolerance(tolerancePx: number): GlyphSizeInfo {
  const sizeInfo = new GlyphSizeInfo();
  sizeInfo.hitTolerance = tolerancePx;
  return sizeInfo;
}

describe('three-helper hit testing', () => {
  let camera: THREE.OrthographicCamera;
  let near: THREE.Object3D;
  let far: THREE.Object3D;
  let scene: THREE.Group;

  beforeEach(() => {
    camera = createCamera();
    near = objectAt(10, 0);
    far = objectAt(0, 0);
    scene = new THREE.Group();
    scene.add(far, near);
  });

  it('hitTest returns the closest object within tolerance', () => {
    const { renderer } = createRendererStub();

    const hit = hitTest(mouseAtWorld(8, 0), renderer, scene, camera, sizeInfoWithTolerance(20));

    expect(hit).toBe(near);
  });

  it('hitTest returns null when no object is within tolerance', () => {
    const { renderer } = createRendererStub();

    const hit = hitTest(mouseAtWorld(50, 50), renderer, scene, camera, sizeInfoWithTolerance(5));

    expect(hit).toBeNull();
  });

  it('hitTestCandidates uses the world position of nested objects', () => {
    const { renderer } = createRendererStub();
    const parent = new THREE.Group();
    parent.position.set(30, 30, 0);
    const child = objectAt(0, 0);
    parent.add(child);

    const hit = hitTestCandidates(mouseAtWorld(31, 30), renderer, [child], camera, sizeInfoWithTolerance(5));

    expect(hit).toBe(child);
  });

  it('hitTestCandidates only considers the given candidates', () => {
    const { renderer } = createRendererStub();

    const hit = hitTestCandidates(mouseAtWorld(8, 0), renderer, [far], camera, sizeInfoWithTolerance(20));

    expect(hit).toBe(far);
  });

  it('hitTestCandidates agrees with hitTest for the same objects', () => {
    const { renderer } = createRendererStub();
    const sizeInfo = sizeInfoWithTolerance(20);
    const event = mouseAtWorld(3, 1);

    expect(hitTestCandidates(event, renderer, [far, near], camera, sizeInfo)).toBe(
      hitTest(event, renderer, scene, camera, sizeInfo)
    );
  });

  it('hitTestCandidates returns null for no candidates without measuring the canvas', () => {
    const { renderer, getRect } = createRendererStub();

    const hit = hitTestCandidates(mouseAtWorld(0, 0), renderer, [], camera, sizeInfoWithTolerance(20));

    expect(hit).toBeNull();
    expect(getRect).not.toHaveBeenCalled();
  });
});

describe('three-helper screenToWorld', () => {
  it('maps the mouse position to orthographic world coordinates', () => {
    const { renderer } = createRendererStub();

    const world = screenToWorld(mouseAtWorld(50, -25), renderer, createCamera());

    expect(world.x).toBeCloseTo(50);
    expect(world.y).toBeCloseTo(-25);
  });
});
