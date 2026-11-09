import {
  axesSvgPath,
  axisAngle,
  axisLength,
  axisPoint,
  flowerPetalControlPoints,
  flowerPetalSvgPath,
  PathSink,
  polygonSvgPath,
  starPoints,
  traceFlowerPetal,
} from './glyph-geometry';

function expectPoint(actual: readonly [number, number], x: number, y: number): void {
  expect(actual[0]).toBeCloseTo(x, 6);
  expect(actual[1]).toBeCloseTo(y, 6);
}

/** Records the path calls, collecting every point the path passes through or uses as a control point. */
function recordingSink(): PathSink & { calls: string[]; points: [number, number][] } {
  const calls: string[] = [];
  const points: [number, number][] = [];
  const take = (...coords: number[]) => {
    for (let i = 0; i < coords.length; i += 2) points.push([coords[i], coords[i + 1]]);
  };
  return {
    calls,
    points,
    moveTo: (x, y) => (calls.push('moveTo'), take(x, y)),
    lineTo: (x, y) => (calls.push('lineTo'), take(x, y)),
    bezierCurveTo: (...c) => (calls.push('bezierCurveTo'), take(...c)),
    closePath: () => calls.push('closePath'),
  };
}

describe('glyph geometry', () => {
  describe('axisAngle', () => {
    it('starts at the top and runs clockwise', () => {
      expect(axisAngle(0, 4)).toBeCloseTo(Math.PI / 2);
      expectPoint(axisPoint(1, 4, 1), 1, 0); // right
      expectPoint(axisPoint(2, 4, 1), 0, -1); // bottom
      expectPoint(axisPoint(3, 4, 1), -1, 0); // left
    });
  });

  describe('axisLength', () => {
    it('divides by the feature maximum unless the scale is linear', () => {
      expect(axisLength(0.5, 2, false)).toBe(0.25);
      expect(axisLength(0.5, 2, true)).toBe(0.5);
    });

    it('treats a missing or zero maximum as 1', () => {
      expect(axisLength(0.5, undefined, false)).toBe(0.5);
      expect(axisLength(0.5, 0, false)).toBe(0.5);
    });
  });

  describe('starPoints', () => {
    it('puts each corner on its axis at the value times the radius', () => {
      const points = starPoints([1, 0.5, 0.25, 0], 10);
      expectPoint(points[0], 0, 10);
      expectPoint(points[1], 5, 0);
      expectPoint(points[2], 0, -2.5);
      expectPoint(points[3], 0, 0);
    });
  });

  describe('flower petal', () => {
    it('is symmetric around its axis and starts and ends at the center', () => {
      const points = flowerPetalControlPoints(10, Math.PI / 2); // pointing up
      expectPoint(points[0], 0, 0);
      expectPoint(points[points.length - 1], 0, 0);
      for (let i = 1; i < 3; i++) {
        const mirror = points[points.length - 1 - i];
        expect(points[i][0]).toBeCloseTo(-mirror[0], 6);
        expect(points[i][1]).toBeCloseTo(mirror[1], 6);
      }
    });

    it('has the Glyphboard proportions: 23 % wide at 89 % of its length', () => {
      const points = flowerPetalControlPoints(100, 0); // pointing right
      expectPoint(points[2], 89, 23);
      expectPoint(points[3], 103, 0);
    });

    it('rotates with the axis', () => {
      const [, , , tip] = flowerPetalControlPoints(1, axisAngle(1, 4)); // right axis
      expectPoint(tip, 1.03, 0);
    });

    it('traces a smooth closed outline that stays inside the length plus the tip overshoot', () => {
      const sink = recordingSink();
      traceFlowerPetal(sink, 10, Math.PI / 2);

      expect(sink.calls[0]).toBe('moveTo');
      expect(sink.calls).toContain('bezierCurveTo');
      expectPoint(sink.points[sink.points.length - 1], 0, 0);
      const reach = Math.max(...sink.points.map(([x, y]) => Math.hypot(x, y)));
      expect(reach).toBeLessThanOrEqual(10.3);
      expect(reach).toBeGreaterThan(9);
    });

    it('builds SVG path data with a downward y axis', () => {
      const path = flowerPetalSvgPath(10, Math.PI / 2, 50, 50);
      expect(path.startsWith('M50,50')).toBe(true);
      // The petal points up, so every y of the path is at most the center y.
      const ys = [...path.matchAll(/[\d.]+,([\d.]+)/g)].map(m => +m[1]);
      expect(Math.max(...ys)).toBeLessThanOrEqual(50.0001);
    });
  });

  describe('SVG helpers', () => {
    it('closes polygons and flips y', () => {
      expect(
        polygonSvgPath(
          [
            [0, 10],
            [10, 0],
          ],
          50,
          50
        )
      ).toBe('M50,40L60,50Z');
      expect(polygonSvgPath([], 50, 50)).toBe('');
    });

    it('draws one spoke per axis from the center', () => {
      expect(axesSvgPath(2, 10, 50, 50)).toBe('M50,50L50,40M50,50L50,60');
    });
  });
});
