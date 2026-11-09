import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { GlyphSizeInfo } from '../glyph-size-info';
import { axisLength, starPoints } from '../glyph-geometry';
import { GlyphRenderer, GlyphRenderContext } from './glyph-renderer';
import { addBackgroundCircle, addCoordinateAxes, addPlaceHolder } from './shared-rendering';

export class RadarChartRenderer implements GlyphRenderer {
  render(ctx: GlyphRenderContext, sizeInfo: GlyphSizeInfo, linearScale: boolean): THREE.Object3D {
    const group = new THREE.Group();
    addBackgroundCircle(group, sizeInfo, ctx);

    const { featureMap, keys, values, featureMaxValues, segments, color } = ctx;
    if (keys.length === 0) return group;

    addCoordinateAxes(group, segments, sizeInfo, ctx);
    if (addPlaceHolder(group, values, sizeInfo, color)) return group;

    const lengths = keys.map((key, i) => axisLength(+featureMap[key] || 0, featureMaxValues[i], linearScale));
    const points = starPoints(lengths, sizeInfo.radius).map(([x, y]) => new THREE.Vector2(x, y));

    // Fill shape
    const shape = new THREE.Shape(points);
    const fillMat = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    group.add(new THREE.Mesh(new THREE.ShapeGeometry(shape), fillMat));

    if (ctx.useContour) {
      const closedPoints = [...points.map(p => new THREE.Vector3(p.x, p.y, 0))];
      closedPoints.push(closedPoints[0].clone());

      const positions: number[] = [];
      closedPoints.forEach(p => positions.push(p.x, p.y, p.z));

      const lineGeom = new LineGeometry();
      lineGeom.setPositions(positions);

      const lineMat = new LineMaterial({
        color: color,
        linewidth: sizeInfo.contourThickness,
        transparent: true,
        opacity: 0.9,
      });

      const line = new Line2(lineGeom, lineMat);
      line.computeLineDistances();
      line.scale.set(1, 1, 1);
      group.add(line);
    }

    return group;
  }
}
