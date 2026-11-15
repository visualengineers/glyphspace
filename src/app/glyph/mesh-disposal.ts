import * as THREE from 'three';

/*
 * Who frees the GPU resources of a glyph mesh.
 *
 * A glyph mesh owns its geometries, materials and textures, and whoever takes
 * it out of a scene disposes it (`disposeObject`). The exceptions are the
 * resources that many meshes, and all canvases, share: the cached geometries
 * and materials of `renderers/shared-rendering.ts`. They are marked with
 * `markShared` and never disposed with a mesh; each canvas's WebGLRenderer
 * releases its own copies of them when it is disposed.
 */

const sharedResources = new WeakSet<object>();

/** Mark a geometry, material or texture as shared: `disposeObject` leaves it alone. */
export function markShared<T extends object>(resource: T): T {
  sharedResources.add(resource);
  return resource;
}

export function isShared(resource: object): boolean {
  return sharedResources.has(resource);
}

const DISPOSE_CALLBACKS = 'onDispose';

/** Run `callback` when `object` is disposed, e.g. to cancel loading an image for it. */
export function onDispose(object: THREE.Object3D, callback: () => void): void {
  const callbacks = (object.userData[DISPOSE_CALLBACKS] as (() => void)[] | undefined) ?? [];
  callbacks.push(callback);
  object.userData[DISPOSE_CALLBACKS] = callbacks;
}

/**
 * Free what `root` and its descendants own: geometries, materials and the
 * materials' textures, except shared ones, and run their dispose callbacks.
 * Calling it twice is harmless.
 */
export function disposeObject(root: THREE.Object3D): void {
  root.traverse(object => {
    const callbacks = object.userData[DISPOSE_CALLBACKS] as (() => void)[] | undefined;
    if (callbacks) {
      delete object.userData[DISPOSE_CALLBACKS];
      callbacks.forEach(callback => callback());
    }

    const { geometry, material } = object as Partial<THREE.Mesh>;
    if (geometry && !sharedResources.has(geometry)) geometry.dispose();
    if (Array.isArray(material)) material.forEach(disposeMaterial);
    else if (material) disposeMaterial(material);
  });
}

function disposeMaterial(material: THREE.Material): void {
  if (sharedResources.has(material)) return;
  for (const value of Object.values(material)) {
    if (value instanceof THREE.Texture && !sharedResources.has(value)) value.dispose();
  }
  material.dispose();
}
