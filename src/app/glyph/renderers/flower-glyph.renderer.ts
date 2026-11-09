import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { GlyphSizeInfo } from '../glyph-size-info';
import { axisAngle, axisLength, traceFlowerPetal } from '../glyph-geometry';
import { GlyphRenderer, GlyphRenderContext } from './glyph-renderer';
import { addBackgroundCircle, addCoordinateAxes, addPlaceHolder } from './shared-rendering';

/** Petals are nearly opaque, as in Glyphboard, so the grid behind them stays in the background. */
const PETAL_OPACITY = 0.85;
/** Segments per Bézier piece of a petal outline. */
const PETAL_CURVE_SEGMENTS = 6;

export class FlowerGlyphRenderer implements GlyphRenderer {
  render(ctx: GlyphRenderContext, sizeInfo: GlyphSizeInfo, linearScale: boolean): THREE.Object3D {
    const group = new THREE.Group();
    addBackgroundCircle(group, sizeInfo, ctx);

    const { featureMap, keys, values, featureMaxValues, segments, color } = ctx;
    if (keys.length === 0) return group;

    addCoordinateAxes(group, segments, sizeInfo, ctx);
    if (addPlaceHolder(group, values, sizeInfo, color)) return group;

    const petalMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: PETAL_OPACITY,
      side: THREE.DoubleSide,
    });

    keys.forEach((key, i) => {
      const value = +featureMap[key] || 0;
      if (value <= 0) return;

      const petalLength = sizeInfo.radius * axisLength(value, featureMaxValues[i], linearScale);
      const petal = new THREE.Shape();
      traceFlowerPetal(petal, petalLength, axisAngle(i, segments));

      group.add(new THREE.Mesh(new THREE.ShapeGeometry(petal, PETAL_CURVE_SEGMENTS), petalMat));

      if (ctx.useContour) {
        const positions: number[] = [];
        petal.getPoints(PETAL_CURVE_SEGMENTS).forEach(p => positions.push(p.x, p.y, 0));

        const lineGeom = new LineGeometry();
        lineGeom.setPositions(positions);

        const lineMat = new LineMaterial({
          color,
          linewidth: sizeInfo.contourThickness,
          transparent: true,
          opacity: 0.9,
        });

        const contourLine = new Line2(lineGeom, lineMat);
        contourLine.computeLineDistances();
        group.add(contourLine);
      }
    });

    return group;
  }
}
