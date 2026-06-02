import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { GlyphSizeInfo } from '../glyph-size-info';
import { GlyphRenderer, GlyphRenderContext } from './glyph-renderer';
import { addBackgroundCircle, addCoordinateAxes, addPlaceHolder } from './shared-rendering';

export class FlowerGlyphRenderer implements GlyphRenderer {
  render(ctx: GlyphRenderContext, sizeInfo: GlyphSizeInfo, linearScale: boolean): THREE.Object3D {
    const group = new THREE.Group();
    addBackgroundCircle(group, sizeInfo, ctx);

    const { featureMap, keys, values, featureMaxValues, segments, color } = ctx;
    if (keys.length === 0) return group;

    addCoordinateAxes(group, segments, sizeInfo, ctx);
    if (addPlaceHolder(group, values, sizeInfo, color)) return group;

    keys.forEach((key, i) => {
      const value = +featureMap[key] || 0;
      if (value <= 0) return;

      const maxVal = featureMaxValues[i] || 1;
      const norm = linearScale ? value : value / maxVal;
      const petalLength = sizeInfo.radius * norm;
      const baseWidth = petalLength * 0.4;

      const path = new THREE.Shape();
      path.moveTo(0, 0);
      path.bezierCurveTo(baseWidth * 0.25, -petalLength * 0.3, baseWidth * 0.6, -petalLength * 0.75, 0, -petalLength);
      path.bezierCurveTo(-baseWidth * 0.6, -petalLength * 0.75, -baseWidth * 0.25, -petalLength * 0.3, 0, 0);

      const geom = new THREE.ShapeGeometry(path);
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geom, mat);

      const angle = (i / segments) * Math.PI * 2;
      mesh.rotation.z = angle - (3 * Math.PI) / 2;
      group.add(mesh);

      if (ctx.useContour) {
        const contourPoints: THREE.Vector3[] = [];
        const outlinePoints = path.getPoints(50);
        outlinePoints.forEach(p => contourPoints.push(new THREE.Vector3(p.x, p.y, 0)));
        contourPoints.push(contourPoints[0].clone());

        const positions: number[] = [];
        contourPoints.forEach(p => positions.push(p.x, p.y, p.z));

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
        contourLine.scale.set(1, 1, 1);
        contourLine.rotation.z = angle - (3 * Math.PI) / 2;

        group.add(contourLine);
      }
    });

    return group;
  }
}
