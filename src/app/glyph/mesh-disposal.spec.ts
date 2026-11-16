import * as THREE from 'three';
import { disposeObject, isShared, markShared, onDispose } from './mesh-disposal';
import {
  getCachedBasicMaterial,
  getCachedCircleGeometry,
  getCachedContourMaterial,
  MAX_SHARED_MATERIALS,
} from './renderers/shared-rendering';

function disposalOf(resource: THREE.EventDispatcher<{ dispose: object }>): () => boolean {
  let disposed = false;
  resource.addEventListener('dispose', () => (disposed = true));
  return () => disposed;
}

describe('disposeObject', () => {
  it('disposes the geometries, materials and textures a mesh owns, nested ones too', () => {
    const texture = new THREE.Texture();
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const geometry = new THREE.PlaneGeometry(1, 1);
    const group = new THREE.Group();
    group.add(new THREE.Mesh(geometry, material));
    const disposed = [disposalOf(texture), disposalOf(material), disposalOf(geometry)];

    disposeObject(group);

    expect(disposed.map(isDisposed => isDisposed())).toEqual([true, true, true]);
  });

  it('leaves shared resources alone', () => {
    const geometry = markShared(new THREE.PlaneGeometry(1, 1));
    const texture = markShared(new THREE.Texture());
    const sharedMaterial = markShared(new THREE.MeshBasicMaterial());
    const ownMaterial = new THREE.MeshBasicMaterial({ map: texture });
    const group = new THREE.Group();
    group.add(new THREE.Mesh(geometry, sharedMaterial), new THREE.Mesh(geometry, ownMaterial));
    const disposed = [disposalOf(geometry), disposalOf(texture), disposalOf(sharedMaterial), disposalOf(ownMaterial)];

    disposeObject(group);

    expect(disposed.map(isDisposed => isDisposed())).toEqual([false, false, false, true]);
  });

  it('runs the dispose callbacks once, and twice is harmless', () => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial());
    const callback = vi.fn();
    onDispose(mesh, callback);

    disposeObject(mesh);
    disposeObject(mesh);

    expect(callback).toHaveBeenCalledTimes(1);
  });
});

describe('shared rendering caches', () => {
  it('marks cached geometries and materials shared and hands out the same instance', () => {
    const circle = getCachedCircleGeometry(3.25, 24);

    expect(isShared(circle)).toBe(true);
    expect(getCachedCircleGeometry(3.25, 24)).toBe(circle);
  });

  it('stops caching colour materials at the limit: further colours get their own material', () => {
    // One colour per item, as a continuous colour scale gives them.
    const materials = Array.from({ length: MAX_SHARED_MATERIALS + 10 }, (_, i) =>
      getCachedBasicMaterial(`rgb(1, 2, ${i}) spec`)
    );
    const contours = Array.from({ length: MAX_SHARED_MATERIALS + 10 }, (_, i) =>
      getCachedContourMaterial(`rgb(3, 4, ${i}) spec`, 1)
    );

    const last = materials.at(-1) as THREE.MeshBasicMaterial;
    expect(isShared(last)).toBe(false);
    expect(getCachedBasicMaterial(`rgb(1, 2, ${MAX_SHARED_MATERIALS + 9}) spec`)).not.toBe(last);
    expect(isShared(contours.at(-1) as THREE.Material)).toBe(false);
  });
});
