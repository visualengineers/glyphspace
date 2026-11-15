import * as THREE from 'three';
import { Subject } from 'rxjs';
import { ThumbnailRenderer, thumbnailSize } from './thumbnail.renderer';
import { GlyphRenderConfig, ThumbnailImage } from '../glyph-render-config';
import { GlyphRenderContext } from './glyph-renderer';
import { GlyphSizeInfo } from '../glyph-size-info';
import { GlyphType } from '../../shared/enum/glyph-type';
import { disposeObject, isShared } from '../mesh-disposal';

function config(image$: Subject<ThumbnailImage | null>, onReRender = vi.fn()): GlyphRenderConfig {
  return {
    colorFeature: '1',
    featureTypes: {},
    featureMaxValues: {},
    featureCategoryCounts: {},
    colorScale: undefined,
    glyphType: GlyphType.Thumb,
    scaleLinear: false,
    useContour: false,
    useBackground: false,
    useCoordinateSystem: false,
    activeFeatures: [],
    loadedData: 'd',
    thumbnailResolver: { requestThumb: () => image$.asObservable() },
    onReRender,
  };
}

function image(width: number, height: number): ThumbnailImage {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas as unknown as ThumbnailImage;
}

describe('thumbnailSize', () => {
  it('spans the glyph diameter with the longer side, like the placeholder', () => {
    expect(thumbnailSize(100, 50, 10)).toEqual({ width: 20, height: 10 });
    expect(thumbnailSize(40, 80, 10)).toEqual({ width: 10, height: 20 });
  });

  it('scales small images up too', () => {
    expect(thumbnailSize(4, 4, 10)).toEqual({ width: 20, height: 20 });
  });

  it('keeps the placeholder size for an image without size', () => {
    expect(thumbnailSize(0, 0, 10)).toEqual({ width: 20, height: 20 });
  });
});

describe('ThumbnailRenderer', () => {
  const sizeInfo = new GlyphSizeInfo();
  const ctx = {} as GlyphRenderContext;

  it('shows the shared grey placeholder until the image arrives, then the image', () => {
    const image$ = new Subject<ThumbnailImage | null>();
    const onReRender = vi.fn();
    const mesh = new ThumbnailRenderer('7', config(image$, onReRender)).render(ctx, sizeInfo, false) as THREE.Mesh;
    const material = mesh.material as THREE.MeshBasicMaterial;
    expect(isShared(material.map as THREE.Texture)).toBe(true);

    image$.next(image(64, 32));

    expect(isShared(material.map as THREE.Texture)).toBe(false);
    expect(onReRender).toHaveBeenCalledTimes(1);
  });

  it('stops waiting for the image when its mesh is disposed', () => {
    const image$ = new Subject<ThumbnailImage | null>();
    const onReRender = vi.fn();
    const mesh = new ThumbnailRenderer('7', config(image$, onReRender)).render(ctx, sizeInfo, false);

    disposeObject(mesh);
    image$.next(image(64, 32));

    expect(image$.observed).toBe(false);
    expect(onReRender).not.toHaveBeenCalled();
  });
});
