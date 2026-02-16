import * as THREE from 'three';
import { GlyphSizeInfo } from '../glyph-size-info';
import { GlyphRenderer, GlyphRenderContext } from './glyph-renderer';
import { addBackgroundCircle, addCoordinateAxes, addPlaceHolder } from './shared-rendering';

export class WhiskerGlyphRenderer implements GlyphRenderer {
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
      const whiskerLength = sizeInfo.radius * norm;

      const barWidth = 0.8;
      const barHeight = whiskerLength;

      const angle = (i / segments) * Math.PI * 2;
      const container = new THREE.Object3D();
      container.rotation.z = angle - (3 * Math.PI) / 2;

      const geom = new THREE.PlaneGeometry(barWidth, barHeight);
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geom, mat);

      mesh.position.y = -barHeight / 2;
      container.add(mesh);
      group.add(container);
    });

    return group;
  }
}
