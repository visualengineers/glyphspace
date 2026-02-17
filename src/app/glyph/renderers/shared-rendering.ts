import * as THREE from 'three';
import { GlyphSizeInfo } from '../glyph-size-info';
import { ZoomLevel } from '../../shared/enum/zoom-level';
import { GlyphRenderContext } from './glyph-renderer';

// Shared geometry cache for performance (reuse common geometries)
const geometryCache = {
  circles: new Map<string, THREE.CircleGeometry>(),
  rings: new Map<string, THREE.RingGeometry>(),
};

// Shared material cache for performance (reuse materials by color + options)
const materialCache = new Map<string, THREE.MeshBasicMaterial>();

export function getCachedBasicMaterial(
  color: string | number,
  options?: { side?: THREE.Side; transparent?: boolean; opacity?: number; depthTest?: boolean }
): THREE.MeshBasicMaterial {
  const key = `${color}_${options?.side ?? THREE.FrontSide}_${options?.transparent ?? false}_${options?.opacity ?? 1}_${options?.depthTest ?? true}`;
  let mat = materialCache.get(key);
  if (!mat) {
    mat = new THREE.MeshBasicMaterial({ color, ...options });
    materialCache.set(key, mat);
  }
  return mat;
}

export function getCachedCircleGeometry(radius: number, segments = 32): THREE.CircleGeometry {
  const key = `${radius.toFixed(2)}_${segments}`;
  let geom = geometryCache.circles.get(key);
  if (!geom) {
    geom = new THREE.CircleGeometry(radius, segments);
    geometryCache.circles.set(key, geom);
  }
  return geom;
}

export function getCachedRingGeometry(innerRadius: number, outerRadius: number, segments = 32): THREE.RingGeometry {
  const key = `${innerRadius.toFixed(2)}_${outerRadius.toFixed(2)}_${segments}`;
  let geom = geometryCache.rings.get(key);
  if (!geom) {
    geom = new THREE.RingGeometry(innerRadius, outerRadius, segments);
    geometryCache.rings.set(key, geom);
  }
  return geom;
}

export function addBackgroundCircle(group: THREE.Group, sizeInfo: GlyphSizeInfo, ctx: GlyphRenderContext): void {
  const background = sizeInfo.currentZoomLevel === ZoomLevel.high && ctx.useBackground;
  if (!background) return;

  const geom = getCachedCircleGeometry(sizeInfo.radius, 32);
  const mat = new THREE.MeshBasicMaterial({ color: 0xf0f0f0 });
  if (ctx.highlighted) {
    const color = new THREE.Color(ctx.highlightColor);
    color.lerp(new THREE.Color(0xffffff), 0.6);
    mat.color.copy(color);
  }
  group.add(new THREE.Mesh(geom, mat));

  if (ctx.useContour) {
    const ringWidth = sizeInfo.radius * 0.01;
    const contourGeom = getCachedRingGeometry(sizeInfo.radius - ringWidth, sizeInfo.radius, 32);
    const contourMat = new THREE.MeshBasicMaterial({
      color: 0xcccccc,
      side: THREE.DoubleSide,
      depthTest: false,
    });
    const contour = new THREE.Mesh(contourGeom, contourMat);
    contour.renderOrder = 999;
    group.add(contour);
  }
}

export function addCoordinateAxes(
  group: THREE.Group,
  segments: number,
  sizeInfo: GlyphSizeInfo,
  ctx: GlyphRenderContext
): void {
  const axes = sizeInfo.currentZoomLevel === ZoomLevel.high && ctx.useCoordinateSystem;
  if (!axes) return;

  const axesColor = 0xa0a0a0;
  const lineWidth = sizeInfo.contourThickness / 3;
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const geom = new THREE.PlaneGeometry(lineWidth, sizeInfo.radius);
    geom.translate(0, sizeInfo.radius / 2, 0);
    const mat = new THREE.MeshBasicMaterial({ color: axesColor, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.rotation.z = angle - Math.PI / 2;
    group.add(mesh);
  }
}

export function addPlaceHolder(
  group: THREE.Group,
  values: number[],
  sizeInfo: GlyphSizeInfo,
  trueColor: string | number
): boolean {
  if (values.every(v => v <= 0.001)) {
    const geom = getCachedCircleGeometry(sizeInfo.getRadius(ZoomLevel.low) / 4, 16);
    const mat = new THREE.MeshBasicMaterial({
      color: trueColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    group.add(new THREE.Mesh(geom, mat));
    return true;
  }
  return false;
}
