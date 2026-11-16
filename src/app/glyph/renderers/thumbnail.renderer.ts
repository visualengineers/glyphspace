import * as THREE from 'three';
import { GlyphSizeInfo } from '../glyph-size-info';
import { GlyphRenderer, GlyphRenderContext } from './glyph-renderer';
import { GlyphRenderConfig, ThumbnailImage } from '../glyph-render-config';
import { createGrayPlaceholderTexture } from '../../shared/helpers/three-helper';
import { markShared, onDispose } from '../mesh-disposal';

let placeholderTexture: THREE.Texture | undefined;

/** The grey square shown until an item's image has loaded, shared by all image glyphs. */
function sharedPlaceholderTexture(): THREE.Texture {
  placeholderTexture ??= markShared(createGrayPlaceholderTexture());
  return placeholderTexture;
}

/**
 * Size of an image of `width` × `height` px drawn as a glyph of `radius`:
 * its longer side spans the glyph's diameter, like the placeholder
 * ([ADR 0010](../../../../docs/decisions/0010-one-size-for-points-and-glyphs.md):
 * images fill their circle, so their reach is 1).
 */
export function thumbnailSize(width: number, height: number, radius: number): { width: number; height: number } {
  if (!(width > 0) || !(height > 0)) return { width: radius * 2, height: radius * 2 };
  const scale = (radius * 2) / Math.max(width, height);
  return { width: width * scale, height: height * scale };
}

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
    const radius = sizeInfo.radius;
    const geom = new THREE.PlaneGeometry(radius * 2, radius * 2);
    const mat = new THREE.MeshBasicMaterial({ map: sharedPlaceholderTexture(), transparent: true });
    const mesh = new THREE.Mesh(geom, mat);

    // Without an image the grey placeholder stays. A mesh that is replaced
    // before its image arrives stops waiting for it.
    const subscription = this.renderConfig.thumbnailResolver
      ?.requestThumb(this.renderConfig.loadedData, this.glyphId)
      .subscribe(image => {
        if (image) this.applyThumbnailTexture(image, mesh, mat, radius);
      });
    if (subscription) onDispose(mesh, () => subscription.unsubscribe());
    return mesh;
  }

  private applyThumbnailTexture(image: ThumbnailImage, mesh: THREE.Mesh, mat: THREE.MeshBasicMaterial, radius: number) {
    const { width, height } = thumbnailSize(image.width, image.height, radius);
    mesh.geometry.dispose();
    mesh.geometry = new THREE.PlaneGeometry(width, height);

    // Owned by this mesh: disposed with it (mesh-disposal.ts). Images are drawn
    // smaller than their pixel size most of the time, so they get mipmaps.
    const texture = new THREE.Texture(image);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    texture.needsUpdate = true;

    mat.map = texture;
    mat.needsUpdate = true;

    this.renderConfig.onReRender?.();
  }
}
