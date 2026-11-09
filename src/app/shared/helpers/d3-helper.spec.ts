import type { Mocked } from 'vitest';
import { createSpyObj } from '../../../testing/create-spy-obj';
import { GlyphConfiguration } from '../../glyph/glyph-configuration';
import { GlyphObject } from '../../glyph/glyph-object';
import { drawFlowerGlyph, drawRadarChart, drawWhiskerGlyph } from './d3-helper';

type GlyphDrawFn = typeof drawRadarChart;

const CONTEXT_METHODS: (keyof CanvasRenderingContext2D)[] = [
  'arc',
  'beginPath',
  'closePath',
  'fill',
  'fillRect',
  'fillText',
  'lineTo',
  'moveTo',
  'restore',
  'rotate',
  'save',
  'stroke',
  'translate',
];

const RADIUS = 50;
// Mirrors computeCenterCoordinates(RADIUS) with the default width of 350
const CENTER_X = 350 / 2 - RADIUS / 2 + 20;
const CENTER_Y = RADIUS + 40;
const COLOR = 'rgb(10, 20, 30)';
const DOT_RADIUS = 4;

function createContextStub(): Mocked<CanvasRenderingContext2D> {
  return createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', CONTEXT_METHODS);
}

function createGlyph(values: Record<string, number>): GlyphObject {
  const glyph = new GlyphObject('g1');
  glyph.features = { [String(glyph.currentContext)]: values };
  return glyph;
}

/** Disable background, axes and labels so only the glyph body touches the context. */
function createBareConfig(): GlyphConfiguration {
  const config = new GlyphConfiguration();
  config.useBackground = false;
  config.useCoordinateSystem = false;
  config.useLabels = false;
  return config;
}

function draw(fn: GlyphDrawFn, context: CanvasRenderingContext2D, values: Record<string, number>): void {
  fn(context, RADIUS, COLOR, createGlyph(values), Object.keys(values), {}, createBareConfig());
}

const GLYPHS: [string, GlyphDrawFn][] = [
  ['drawRadarChart', drawRadarChart],
  ['drawFlowerGlyph', drawFlowerGlyph],
  ['drawWhiskerGlyph', drawWhiskerGlyph],
];

describe('d3-helper glyph drawing', () => {
  GLYPHS.forEach(([name, drawFn]) => {
    describe(name, () => {
      it('draws a small center dot in the glyph color when all values are ~0', () => {
        const context = createContextStub();
        let fillStyleAtFill: unknown;
        context.fill.mockImplementation(() => {
          fillStyleAtFill = context.fillStyle;
        });

        draw(drawFn, context, { a: 0, b: 0.005, c: 0 });

        expect(context.arc).toHaveBeenCalledExactlyOnceWith(CENTER_X, CENTER_Y, DOT_RADIUS, 0, 2 * Math.PI);
        expect(context.fill).toHaveBeenCalledTimes(1);
        expect(fillStyleAtFill).toBe(COLOR);
      });

      it('does not draw the center dot when some value is non-zero', () => {
        const context = createContextStub();

        draw(drawFn, context, { a: 0, b: 0.8, c: 0.3 });

        expect(context.arc).not.toHaveBeenCalled();
      });
    });
  });
});
