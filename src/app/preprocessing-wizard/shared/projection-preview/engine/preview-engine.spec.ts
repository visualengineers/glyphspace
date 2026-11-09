import { PREVIEW_CAPTIONS, PREVIEW_META, isPreviewKey, resolvePreviewKey } from '../projection-preview.data';
import {
  PREVIEW_HEIGHT,
  PREVIEW_WIDTH,
  PreviewEngine,
  PreviewKey,
  buildEngine,
  cycleDuration,
  gridLayer,
  phaseAt,
  phaseOf,
  renderFrame,
  sizeCanvas,
  stillPhase,
} from './index';
import { projectOntoPivotAxis } from './preview-geometry';

const ALL_KEYS: PreviewKey[] = ['fast', 'pca', 'tri', 'mds', 'iso', 'lle', 'ltsa', 'topo', 'umap', 'sammon', 'tsne'];

/** Every number reachable from `value` (arrays and plain objects). */
function numbersIn(value: unknown): number[] {
  if (typeof value === 'number') return [value];
  if (Array.isArray(value)) return value.flatMap(numbersIn);
  if (value && typeof value === 'object') return Object.values(value).flatMap(numbersIn);
  return [];
}

function newContext(): CanvasRenderingContext2D {
  const ctx = sizeCanvas(document.createElement('canvas'), 1);
  if (!ctx) throw new Error('2-D canvas context unavailable');
  return ctx;
}

function paintedPixels(ctx: CanvasRenderingContext2D): number {
  const data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data;
  let count = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] > 0) count++;
  return count;
}

describe('projection preview engine', () => {
  describe('phases', () => {
    const steps = [{ d: 1 }, { d: 2 }, { d: 1 }];

    it('sums the step durations into the cycle duration', () => {
      expect(cycleDuration(steps)).toBe(4);
      expect(cycleDuration([])).toBe(0);
    });

    it('maps a time inside the loop to the phase index and local progress', () => {
      expect(phaseOf(steps, 0)).toEqual({ idx: 0, local: 0 });
      expect(phaseOf(steps, 0.5)).toEqual({ idx: 0, local: 0.5 });
      expect(phaseOf(steps, 1)).toEqual({ idx: 1, local: 0 });
      expect(phaseOf(steps, 2)).toEqual({ idx: 1, local: 0.5 });
      expect(phaseOf(steps, 3.5)).toEqual({ idx: 2, local: 0.5 });
    });

    it('clamps times past the end to the end of the last phase', () => {
      expect(phaseOf(steps, 10)).toEqual({ idx: 2, local: 1 });
    });

    it('wraps an ever-growing clock around the loop', () => {
      expect(phaseAt(steps, 4.5)).toEqual(phaseOf(steps, 0.5));
      expect(phaseAt(steps, 9)).toEqual(phaseOf(steps, 1));
      expect(phaseAt([], 3)).toEqual({ idx: 0, local: 0 });
    });

    it('uses the start of the final phase as the reduced-motion still', () => {
      expect(stillPhase(steps)).toEqual({ idx: 2, local: 0 });
      expect(stillPhase([])).toEqual({ idx: 0, local: 0 });
    });
  });

  describe('buildEngine', () => {
    for (const key of ALL_KEYS) {
      it(`builds a finite, "${key}"-shaped engine with one scratch position per point`, () => {
        const engine = buildEngine(key);
        expect(engine.kind).toBe(key);
        expect(engine.pts.length).toBeGreaterThan(0);
        expect(engine.pos.length).toBe(engine.pts.length);
        const numbers = numbersIn(engine);
        expect(numbers.length).toBeGreaterThan(0);
        expect(numbers.every(Number.isFinite), 'no NaN / Infinity').toBe(true);
      });
    }

    it('is deterministic', () => {
      for (const key of ALL_KEYS) expect(buildEngine(key)).toEqual(buildEngine(key));
    });

    it('exposes the method-specific structure', () => {
      const fast = buildEngine('fast') as Extract<PreviewEngine, { kind: 'fast' }>;
      expect(fast.pi).not.toBe(fast.pj);
      const tri = buildEngine('tri') as Extract<PreviewEngine, { kind: 'tri' }>;
      expect(tri.triplets.length).toBe(5);
      expect(tri.cent.length).toBe(3);
      for (const [a, b, c] of tri.triplets) {
        expect(tri.pts[a].g).toBe(tri.pts[b].g);
        expect(tri.pts[a].g).not.toBe(tri.pts[c].g);
      }
      const topo = buildEngine('topo') as Extract<PreviewEngine, { kind: 'topo' }>;
      expect(topo.edges.length).toBe(topo.pts.length - 1);
      const lle = buildEngine('lle') as Extract<PreviewEngine, { kind: 'lle' }>;
      expect(lle.samples.every(s => s >= 0 && s < lle.pts.length)).toBe(true);
    });

    it('projects onto coinciding FastMap pivots without dividing by zero', () => {
      const pivot = { x: 10, y: 20 };
      const projected = projectOntoPivotAxis([pivot, { x: 30, y: 40 }], pivot, { ...pivot });
      expect(numbersIn(projected).every(Number.isFinite)).toBe(true);
      expect(projected[1].px).toBe(10);
      expect(projected[1].py).toBe(20);
    });
  });

  describe('rendering', () => {
    it('renders every phase of every method and keeps positions finite', () => {
      const ctx = newContext();
      for (const key of ALL_KEYS) {
        const engine = buildEngine(key);
        const buffer = engine.pos;
        const steps = PREVIEW_CAPTIONS[key];
        for (let idx = 0; idx < steps.length; idx++) {
          for (const local of [0, 0.5, 1]) {
            renderFrame(ctx, engine, { idx, local, clock: 1.3 }, gridLayer(1));
            expect(numbersIn(engine.pos).every(Number.isFinite), `${key} phase ${idx}`).toBe(true);
            expect(paintedPixels(ctx), `${key} phase ${idx}`).toBeGreaterThan(0);
          }
        }
        expect(engine.pos, 'scratch buffer is reused').toBe(buffer);
      }
    });

    it('draws the background grid from one cached layer per pixel ratio', () => {
      const layer = gridLayer(2);
      expect(gridLayer(2)).toBe(layer);
      expect(layer.width).toBe(PREVIEW_WIDTH * 2);
      expect(layer.height).toBe(PREVIEW_HEIGHT * 2);
      const ctx = newContext();
      const drawImage = vi.spyOn(ctx, 'drawImage');
      const fillRect = vi.spyOn(ctx, 'fillRect');
      renderFrame(ctx, buildEngine('pca'), { idx: 2, local: 0, clock: 0 }, gridLayer(1));
      expect(drawImage).toHaveBeenCalledTimes(1);
      expect(drawImage.mock.calls[0] as unknown[]).toEqual([gridLayer(1), 0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT]);
      expect(fillRect).not.toHaveBeenCalled();
    });
  });

  describe('preview data', () => {
    it('has metadata and captions for every method', () => {
      for (const key of ALL_KEYS) {
        expect(PREVIEW_META[key].name).toBeTruthy();
        expect(PREVIEW_CAPTIONS[key].length).toBeGreaterThan(0);
      }
    });

    it('falls back to PCA for unknown keys', () => {
      expect(resolvePreviewKey('tri')).toBe('tri');
      expect(resolvePreviewKey('nope')).toBe('pca');
      expect(isPreviewKey('toString')).toBe(false);
    });
  });
});
