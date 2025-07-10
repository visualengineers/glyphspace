import * as THREE from 'three';
import { GlyphSizeInfo } from '../../glyph/glyph-size-info';

export function createGrayPlaceholderTexture(size = 16, gray = 136): THREE.Texture {
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;

  return texture;
}

export function hitTest(event: MouseEvent, renderer: THREE.WebGLRenderer, scene: THREE.Group, camera: THREE.Camera, sizeInfo: GlyphSizeInfo) {
    const rect = renderer.domElement.getBoundingClientRect();

    const mouseNDC = {
        x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
        y: -((event.clientY - rect.top) / rect.height) * 2 + 1,
    };

    let closestObject: THREE.Object3D | null = null;
    let closestDist = Infinity;
    let tolerancePx = sizeInfo.hitTolerance;

    for (const object of scene.children) {
        // Use object's world position projected to screen
        const screenPos = object.getWorldPosition(new THREE.Vector3()).project(camera);

        const dx = (mouseNDC.x - screenPos.x) * rect.width / 2;
        const dy = (mouseNDC.y - screenPos.y) * rect.height / 2;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < tolerancePx && dist < closestDist) {
            closestObject = object;
            closestDist = dist;
        }
    }
    return closestObject;
}

export function panCamera(camera: THREE.OrthographicCamera, from: THREE.Vector2, to: MouseEvent, target: THREE.Vector3) {
    const dx = to.clientX - from.x;
    const dy = to.clientY - from.y;
    const panFactor = 0.8;

    const distance = 1 / camera.zoom;
    const panX = -dx * distance * panFactor;
    const panY = dy * distance * panFactor;

    const pan = new THREE.Vector3();
    const right = new THREE.Vector3(1, 0, 0);
    const up = new THREE.Vector3(0, 1, 0);

    pan.add(right.multiplyScalar(panX));
    pan.add(up.multiplyScalar(panY));

    camera.position.add(pan);
    target.add(pan);
    camera.lookAt(target);

    camera.updateProjectionMatrix();
}

export function convertToScreenSpace(obj: THREE.Object3D, camera: THREE.OrthographicCamera, domElement: HTMLCanvasElement): THREE.Vector2 {
    const pos = new THREE.Vector3();
    obj.getWorldPosition(pos);
    const rect = domElement.getBoundingClientRect();
    const ndc = pos.clone().project(camera);
    const screenX = ((ndc.x + 1) / 2) * rect.width + rect.left;
    const screenY = ((-ndc.y + 1) / 2) * rect.height + rect.top;

    return new THREE.Vector2(screenX, screenY);
}

export function jitterFromVector(vec: THREE.Vector3, amount = 5) {
    const seed = vec.x * 73856093 ^ vec.y * 19349663 ^ vec.z * 83492791;
    const rng = Math.sin(seed) * 10000;
    return (rng - Math.floor(rng)) * 2 - 1; // in [-1, 1]
}

export function scalePosition(
    x: number,
    y: number,
    bounds: { minX: number, maxX: number, minY: number, maxY: number },
    canvasWidth: number,
    canvasHeight: number,
    maxNormWidth: number = 50
): { x: number, y: number } {
    const dataWidth = bounds.maxX - bounds.minX;
    const dataHeight = bounds.maxY - bounds.minY;

    if (dataWidth === 0 || dataHeight === 0) {
        return { x: 0, y: 0 };
    }

    // Normalize to [0, 1]
    const normX = (x - bounds.minX) / dataWidth;
    const normY = (y - bounds.minY) / dataHeight;

    // Scale X to [0, maxNormWidth], and scale Y proportionally
    const xInWorld = normX * maxNormWidth;
    const scale = maxNormWidth / dataWidth;
    const yInWorld = (y - bounds.minY) * scale;

    // Center both coordinates in canvas
    const scaledX = (xInWorld - maxNormWidth / 2) * (canvasWidth / maxNormWidth);
    const scaledY = (yInWorld - (dataHeight * scale) / 2) * (canvasHeight / (dataHeight * scale));

    return { x: scaledX, y: scaledY };
}

export function nearlyEqual(a: number, b: number, epsilon: number = 0.01): boolean {
    return Math.abs(a - b) < epsilon;
}