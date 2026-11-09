import { LensItem, layoutLens } from './lens-layout';

const LENS_RADIUS = 120;

function cluster(count: number, extent = 0.5): LensItem[] {
  // Items on a small spiral, as in a dense part of a projection.
  return Array.from({ length: count }, (_, i) => ({
    x: Math.cos(i * 2.4) * Math.sqrt(i) * 3,
    y: Math.sin(i * 2.4) * Math.sqrt(i) * 3,
    extent,
  }));
}

describe('layoutLens', () => {
  it('centres a single glyph', () => {
    const layout = layoutLens([{ x: 40, y: -7, extent: 1 }], LENS_RADIUS);

    expect(layout.positions[0].x).toBeCloseTo(0);
    expect(layout.positions[0].y).toBeCloseTo(0);
  });

  it('draws few glyphs larger than many', () => {
    expect(layoutLens(cluster(2), LENS_RADIUS).radius).toBeGreaterThan(layoutLens(cluster(20), LENS_RADIUS).radius);
  });

  it('draws glyphs that reach less with a larger radius', () => {
    expect(layoutLens(cluster(5, 0.3), LENS_RADIUS).radius).toBeGreaterThan(
      layoutLens(cluster(5, 1), LENS_RADIUS).radius
    );
  });

  it('keeps every glyph inside the lens', () => {
    const items = cluster(30, 0.6);
    const layout = layoutLens(items, LENS_RADIUS);

    layout.positions.forEach(p => {
      expect(Math.hypot(p.x, p.y) + 0.6 * layout.radius).toBeLessThanOrEqual(LENS_RADIUS + 1e-6);
    });
  });

  it('pushes glyphs at the same spot apart', () => {
    const items = Array.from({ length: 8 }, () => ({ x: 5, y: 5, extent: 0.5 }));
    const layout = layoutLens(items, LENS_RADIUS);
    const reach = 0.5 * layout.radius;

    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = layout.positions[i];
        const b = layout.positions[j];
        expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(reach * 2 * 0.9);
      }
    }
  });

  it('keeps the arrangement of the canvas, scaled up', () => {
    const layout = layoutLens(
      [
        { x: -10, y: 0, extent: 0.4 },
        { x: 10, y: 0, extent: 0.4 },
        { x: 0, y: 12, extent: 0.4 },
      ],
      LENS_RADIUS
    );
    const [left, right, top] = layout.positions;

    expect(left.x).toBeLessThan(right.x);
    expect(top.y).toBeGreaterThan(left.y);
    expect(top.y).toBeGreaterThan(right.y);
    expect(right.x - left.x).toBeGreaterThan(20);
  });

  it('gives the same picture for the same items', () => {
    expect(layoutLens(cluster(12), LENS_RADIUS)).toEqual(layoutLens(cluster(12), LENS_RADIUS));
  });

  it('is empty without items', () => {
    expect(layoutLens([], LENS_RADIUS)).toEqual({ radius: 0, positions: [] });
  });
});
