import * as THREE from 'three';
import { CanvasRendererService } from './canvas-renderer.service';
import { GlyphObject } from '../../glyph/glyph-object';
import { GlyphRenderConfig } from '../../glyph/glyph-render-config';

describe('CanvasRendererService glyph scale', () => {
  const glyph = () =>
    ({
      getMesh: () => undefined,
      render: () => new THREE.Group(),
    }) as unknown as GlyphObject;

  it('scales the glyphs on the canvas', () => {
    const service = new CanvasRendererService();
    service.renderGlyph(glyph(), 't', 'umap', 0, false, {} as GlyphRenderConfig);

    service.setGlyphScale(0.5);

    expect(service.glyphGroup.children[0].scale.x).toBe(0.5);
    expect(service.glyphScale).toBe(0.5);
  });

  it('draws new glyphs at the current scale', () => {
    const service = new CanvasRendererService();
    service.setGlyphScale(0.4);

    service.renderGlyph(glyph(), 't', 'umap', 0, false, {} as GlyphRenderConfig);

    expect(service.glyphGroup.children[0].scale.toArray()).toEqual([0.4, 0.4, 0.4]);
  });
});
