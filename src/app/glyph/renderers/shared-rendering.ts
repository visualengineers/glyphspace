import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { GlyphSizeInfo } from '../glyph-size-info';
import { ZoomLevel } from '../../shared/enum/zoom-level';
import { axisAngle } from '../glyph-geometry';
import { GlyphRenderContext } from './glyph-renderer';

/*
 * Reference grid behind the glyph (background disc, its ring and the axes).
 * It is kept light and thin so that it never looks stronger than the data
 * drawn on top of it.
 */
const BACKGROUND_COLOR = 0xf3f3f3;
const RING_COLOR = 0xe0e0e0;
/** Ring width as a fraction of the glyph radius. */
const RING_WIDTH = 0.01;
const AXES_COLOR = 0xd4d4d4;
/** Axis line width as a fraction of the glyph radius, so lines scale with the glyph. */
const AXES_WIDTH = 0.015;

// Shared geometry cache for performance (reuse common geometries)
const geometryCache = {
  circles: new Map<string, THREE.CircleGeometry>(),
  rings: new Map<string, THREE.RingGeometry>(),
  spokes: new Map<string, THREE.BufferGeometry>(),
};

// Shared material cache for performance (reuse materials by color + options)
const materialCache = new Map<string, THREE.MeshBasicMaterial>();

// Contour line materials by colour and width. A LineMaterial clones the whole
// line shader's uniforms, too costly once per glyph when a zoom-level change
// redraws all of them. Sharing is safe: contours are transparent, and three.js
// orders transparent objects by depth, not by material.
const lineMaterialCache = new Map<string, LineMaterial>();

export function getCachedContourMaterial(color: string | number, linewidth: number): LineMaterial {
  const key = `${color}_${linewidth}`;
  let mat = lineMaterialCache.get(key);
  if (!mat) {
    mat = new LineMaterial({ color, linewidth, transparent: true, opacity: 0.9 });
    lineMaterialCache.set(key, mat);
  }
  return mat;
}

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
  const mat = new THREE.MeshBasicMaterial({ color: BACKGROUND_COLOR });
  if (ctx.highlighted) {
    const color = new THREE.Color(ctx.highlightColor);
    color.lerp(new THREE.Color(0xffffff), 0.6);
    mat.color.copy(color);
  }
  group.add(new THREE.Mesh(geom, mat));

  if (ctx.useContour) {
    // Opaque like the disc, so it is drawn before (behind) the transparent glyph shape.
    const ringWidth = sizeInfo.radius * RING_WIDTH;
    const contourGeom = getCachedRingGeometry(sizeInfo.radius - ringWidth, sizeInfo.radius, 32);
    const contourMat = new THREE.MeshBasicMaterial({ color: RING_COLOR, side: THREE.DoubleSide });
    group.add(new THREE.Mesh(contourGeom, contourMat));
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

  // A material of its own, created after the disc's: three.js sorts opaque objects
  // by material id, which keeps each glyph's spokes above its own disc and below
  // the discs of glyphs drawn later. The geometry can be shared.
  const mat = new THREE.MeshBasicMaterial({ color: AXES_COLOR, side: THREE.DoubleSide });
  group.add(new THREE.Mesh(getCachedSpokesGeometry(segments, sizeInfo.radius), mat));
}

/**
 * The spokes of a glyph with `count` axes as one geometry, shared by every
 * glyph of that radius: a zoom-level change redraws all glyphs at once.
 */
export function getCachedSpokesGeometry(count: number, radius: number): THREE.BufferGeometry {
  const key = `${count}_${radius.toFixed(2)}`;
  let geom = geometryCache.spokes.get(key);
  if (!geom) {
    const spokes = Array.from({ length: count }, (_, i) => {
      const spoke = new THREE.PlaneGeometry(radius * AXES_WIDTH, radius);
      spoke.translate(0, radius / 2, 0);
      // The plane points up (+y); turn it onto the axis direction.
      spoke.rotateZ(axisAngle(i, count) - Math.PI / 2);
      return spoke;
    });
    geom = mergeGeometries(spokes);
    spokes.forEach(spoke => spoke.dispose());
    geometryCache.spokes.set(key, geom);
  }
  return geom;
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
