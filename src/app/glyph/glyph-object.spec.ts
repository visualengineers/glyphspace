import * as THREE from 'three';
import { GlyphObject } from './glyph-object';
import { GlyphSizeInfo } from './glyph-size-info';
import { GlyphRenderConfig } from './glyph-render-config';
import { GlyphType } from '../shared/enum/glyph-type';
import { ZoomLevel } from '../shared/enum/zoom-level';
import { getColorScaleById } from '../shared/interfaces/color-scale';

function createGlyph(values: Record<string, number>): GlyphObject {
  const glyph = new GlyphObject('g1');
  glyph.features = { '1': values };
  glyph.positions = { t: { pca: { x: 0, y: 0 } } };
  return glyph;
}

function renderConfig(activeFeatures: string[], glyphType = GlyphType.Star): GlyphRenderConfig {
  return {
    colorFeature: '1',
    featureTypes: {},
    featureMaxValues: {},
    featureCategoryCounts: {},
    colorScale: getColorScaleById(2),
    glyphType,
    scaleLinear: false,
    useContour: false,
    useBackground: false,
    useCoordinateSystem: false,
    activeFeatures,
    loadedData: '',
  };
}

describe('GlyphObject', () => {
  it('measures the axes in the given order', () => {
    const glyph = createGlyph({ '1': 0.1, '2': 0.2, '3': 0.3 });

    expect(glyph.axisLengths(['3', '1', '2'], { '3': 0.5 }, false)).toEqual([0.6, 0.1, 0.2]);
  });

  it('draws the axes in the order of the active features, not of the feature ids', () => {
    const glyph = createGlyph({ '1': 0.5, '2': 0.5, '3': 1 });
    const sizeInfo = new GlyphSizeInfo();
    sizeInfo.currentZoomLevel = ZoomLevel.high;

    // Feature 3 is the first axis, so it points up with the full radius.
    const mesh = glyph.render(sizeInfo, 't', 'pca', 0, false, renderConfig(['3', '1', '2'])) as THREE.Group;
    const fill = mesh.children.find(child => child instanceof THREE.Mesh) as THREE.Mesh;
    fill.geometry.computeBoundingBox();

    expect(fill.geometry.boundingBox?.max.y).toBeCloseTo(sizeInfo.radius);
  });

  it('draws one petal per positive axis for the flower glyph', () => {
    const glyph = createGlyph({ '1': 0.5, '2': 0, '3': 1, '4': 0.2 });
    const sizeInfo = new GlyphSizeInfo();
    sizeInfo.currentZoomLevel = ZoomLevel.high;

    const mesh = glyph.render(sizeInfo, 't', 'pca', 0, false, renderConfig(['1', '2', '3', '4'], GlyphType.Flower));

    // All petals share one mesh, so a zoom-level change has few objects to rebuild.
    const petals = mesh?.children.filter(child => child instanceof THREE.Mesh) as THREE.Mesh[];
    expect(petals.length).toBe(1);
    expect((petals[0].geometry as THREE.ShapeGeometry).parameters.shapes).toHaveLength(3);
  });

  it('outlines flower petals only at full detail', () => {
    const glyph = createGlyph({ '1': 0.5, '2': 0.3, '3': 1 });
    const config = { ...renderConfig(['1', '2', '3'], GlyphType.Flower), useContour: true };
    const lines = (level: ZoomLevel) => {
      const sizeInfo = new GlyphSizeInfo();
      sizeInfo.currentZoomLevel = level;
      const mesh = glyph.render(sizeInfo, 't', 'pca', 0, false, config);
      return mesh?.children.filter(child => child.type === 'Line2').length;
    };

    expect(lines(ZoomLevel.medium)).toBe(0);
    expect(lines(ZoomLevel.high)).toBe(1);
  });

  // Issue #50: full-detail glyphs kept their color although they were filtered out.
  it.each([ZoomLevel.medium, ZoomLevel.high])('draws filtered-out glyphs grey at zoom level %s', level => {
    const glyph = createGlyph({ '1': 0.5, '2': 0.5, '3': 1 });
    glyph.passive = true;
    const sizeInfo = new GlyphSizeInfo();
    sizeInfo.currentZoomLevel = level;

    const mesh = glyph.render(sizeInfo, 't', 'pca', 0, false, renderConfig(['1', '2', '3'])) as THREE.Group;
    const fill = mesh.children.find(child => child instanceof THREE.Mesh) as THREE.Mesh;

    expect((fill.material as THREE.MeshBasicMaterial).color.getHex()).toBe(glyph.passivecolor);
  });

  it('keeps the data color of a hovered full-detail glyph (its background shows the highlight)', () => {
    const glyph = createGlyph({ '1': 0.5, '2': 0.5, '3': 1 });
    glyph.highlighted = true;
    const sizeInfo = new GlyphSizeInfo();
    sizeInfo.currentZoomLevel = ZoomLevel.high;
    const config = renderConfig(['1', '2', '3']);

    const mesh = glyph.render(sizeInfo, 't', 'pca', 0, false, config) as THREE.Group;
    const fill = mesh.children.find(child => child instanceof THREE.Mesh) as THREE.Mesh;

    expect((fill.material as THREE.MeshBasicMaterial).color.getHex()).not.toBe(glyph.highlightColor);
  });
});
