import * as THREE from 'three';
import { GlyphSizeInfo } from '../glyph-size-info';
import { GlyphRenderer, GlyphRenderContext } from './glyph-renderer';
import { GlyphRenderConfig, ThumbnailImage } from '../glyph-render-config';
import { createGrayPlaceholderTexture } from '../../shared/helpers/three-helper';

/**
 * Thumbnail renderer is special: it needs runtime config for loading images.
 * Constructed with a GlyphRenderConfig snapshot rather than Angular services.
 */
export class ThumbnailRenderer implements GlyphRenderer {
  constructor(
    private glyphId: string,
    private renderConfig: GlyphRenderConfig
  ) {}

  render(_ctx: GlyphRenderContext, sizeInfo: GlyphSizeInfo, _linearScale: boolean): THREE.Object3D {
    const placeholderTexture = createGrayPlaceholderTexture();
    const geom = new THREE.PlaneGeometry(sizeInfo.radius * 2, sizeInfo.radius * 2);
    const mat = new THREE.MeshBasicMaterial({ map: placeholderTexture, transparent: true });
    const mesh = new THREE.Mesh(geom, mat);

    // Without an image the grey placeholder stays.
    this.renderConfig.thumbnailResolver?.requestThumb(this.renderConfig.loadedData, this.glyphId).subscribe(image => {
      if (image) this.applyThumbnailTexture(image, mesh, mat, sizeInfo);
    });
    return mesh;
  }

  private applyThumbnailTexture(
    image: ThumbnailImage,
    mesh: THREE.Mesh,
    mat: THREE.MeshBasicMaterial,
    sizeInfo: GlyphSizeInfo
  ) {
    const originalWidth = image.width;
    const originalHeight = image.height;

    const maxDim = sizeInfo.radius * 3;
    const widthRatio = maxDim / originalWidth;
    const heightRatio = maxDim / originalHeight;
    const scale = Math.min(widthRatio, heightRatio, 1);

    const finalWidth = originalWidth * scale;
    const finalHeight = originalHeight * scale;

    const geom = new THREE.PlaneGeometry(finalWidth, finalHeight);
    mesh.geometry.dispose();
    mesh.geometry = geom;

    const texture = new THREE.Texture(image);
    texture.needsUpdate = true;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;

    mat.map = texture;
    mat.needsUpdate = true;

    this.renderConfig.onReRender?.();
  }
}
