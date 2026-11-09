import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { GlyphSizeInfo } from '../glyph-size-info';
import { axisAngle, axisLength, traceFlowerPetal } from '../glyph-geometry';
import { ZoomLevel } from '../../shared/enum/zoom-level';
import { GlyphRenderer, GlyphRenderContext } from './glyph-renderer';
import { addBackgroundCircle, addCoordinateAxes, addPlaceHolder, getCachedContourMaterial } from './shared-rendering';

/** Petals are nearly opaque, as in Glyphboard, so the grid behind them stays in the background. */
const PETAL_OPACITY = 0.85;
/** Segments per Bézier piece of a petal outline: fewer for the small glyphs at medium zoom. */
const PETAL_CURVE_SEGMENTS: Record<ZoomLevel, number> = {
  [ZoomLevel.low]: 3,
  [ZoomLevel.medium]: 3,
  [ZoomLevel.high]: 6,
};

/**
 * A zoom-level change redraws every glyph at once, so a glyph is kept to few
 * objects: all petals share one mesh, and all petal outlines one line (each
 * outline starts and ends at the center, so they chain into one polyline).
 */
export class FlowerGlyphRenderer implements GlyphRenderer {
  render(ctx: GlyphRenderContext, sizeInfo: GlyphSizeInfo, linearScale: boolean): THREE.Object3D {
    const group = new THREE.Group();
    addBackgroundCircle(group, sizeInfo, ctx);

    const { featureMap, keys, values, featureMaxValues, segments, color } = ctx;
    if (keys.length === 0) return group;

    addCoordinateAxes(group, segments, sizeInfo, ctx);
    if (addPlaceHolder(group, values, sizeInfo, color)) return group;

    const petals: THREE.Shape[] = [];
    keys.forEach((key, i) => {
      const value = +featureMap[key] || 0;
      if (value <= 0) return;
      const petal = new THREE.Shape();
      traceFlowerPetal(
        petal,
        sizeInfo.radius * axisLength(value, featureMaxValues[i], linearScale),
        axisAngle(i, segments)
      );
      petals.push(petal);
    });
    if (petals.length === 0) return group;

    const curveSegments = PETAL_CURVE_SEGMENTS[sizeInfo.currentZoomLevel];
    const petalMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: PETAL_OPACITY,
      side: THREE.DoubleSide,
    });
    group.add(new THREE.Mesh(new THREE.ShapeGeometry(petals, curveSegments), petalMat));

    // The outline is the petals' own colour: on the small glyphs below full detail
    // it adds nothing visible but about a hundred line segments per glyph.
    if (ctx.useContour && sizeInfo.currentZoomLevel === ZoomLevel.high) {
      const positions = petals.flatMap(petal => petal.getPoints(curveSegments).flatMap(p => [p.x, p.y, 0]));
      const lineGeom = new LineGeometry();
      lineGeom.setPositions(positions);

      const contourLine = new Line2(lineGeom, getCachedContourMaterial(color, sizeInfo.contourThickness));
      contourLine.computeLineDistances();
      group.add(contourLine);
    }

    return group;
  }
}
