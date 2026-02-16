import * as THREE from 'three';
import { GlyphSizeInfo } from '../glyph-size-info';
import { GlyphRenderer, GlyphRenderContext } from './glyph-renderer';
import { ConfigService } from '../../services/config.service';
import { DataProcessorService } from '../../services/data-processor';
import { createGrayPlaceholderTexture } from '../../shared/helpers/three-helper';

/**
 * Thumbnail renderer is special: it needs runtime services for loading images.
 * Constructed with service references rather than being a pure stateless renderer.
 */
export class ThumbnailRenderer implements GlyphRenderer {
  constructor(
    private glyphId: string,
    private config: ConfigService,
    private dataProcessor: DataProcessorService
  ) {}

  render(_ctx: GlyphRenderContext, sizeInfo: GlyphSizeInfo, _linearScale: boolean): THREE.Object3D {
    const placeholderTexture = createGrayPlaceholderTexture();
    const geom = new THREE.PlaneGeometry(sizeInfo.radius * 2, sizeInfo.radius * 2);
    const mat = new THREE.MeshBasicMaterial({ map: placeholderTexture, transparent: true });
    const mesh = new THREE.Mesh(geom, mat);

    const file = `${this.config.loadedData}/${this.glyphId}.jpg`;

    if (this.config.dataSource == 'wasm') {
      this.dataProcessor.requestThumb(file).subscribe(bitmap => {
        if (bitmap) {
          this.applyThumbnailTexture(bitmap, mesh, mat, sizeInfo);
        }
      });
    } else {
      const image = new Image();
      image.src = `assets/thumbnails/${this.config.loadedData}/${this.glyphId}.jpg`;
      image.crossOrigin = 'anonymous';

      image.onload = () => {
        this.applyThumbnailTexture(image, mesh, mat, sizeInfo);
      };

      image.onerror = () => {
        console.warn(`Failed to load thumbnail from local: ${image.src}`);
      };
    }
    return mesh;
  }

  private applyThumbnailTexture(
    image: HTMLImageElement | ImageBitmap,
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

    this.config.reRender();
  }
}
