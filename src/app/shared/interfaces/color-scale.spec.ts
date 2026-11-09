import { COLOR_SCALES, getCategoricalColors, paletteColor } from './color-scale';

const categorical = COLOR_SCALES.filter(scale => scale.type === 'categorical');

/** Spread between the strongest and weakest RGB channel; greys have (almost) none. */
function chroma(hex: string): number {
  const channels = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  return Math.max(...channels) - Math.min(...channels);
}

describe('categorical color scales', () => {
  it('offers three palettes', () => {
    expect(categorical.map(scale => getCategoricalColors(scale).length)).toEqual([12, 10, 8]);
  });

  it.each(categorical.map(scale => [scale.name, scale] as const))('%s has at most 12 distinct colors', (_, scale) => {
    const colors = getCategoricalColors(scale);
    expect(colors.length).toBeLessThanOrEqual(12);
    expect(new Set(colors.map(c => c.toLowerCase())).size).toBe(colors.length);
  });

  it.each(categorical.map(scale => [scale.name, scale] as const))(
    '%s has no grey, which is reserved for filtered-out items',
    (_, scale) => {
      for (const color of getCategoricalColors(scale)) {
        expect(chroma(color), color).toBeGreaterThanOrEqual(40);
      }
    }
  );

  it('keeps unique ids', () => {
    expect(new Set(COLOR_SCALES.map(scale => scale.id)).size).toBe(COLOR_SCALES.length);
  });
});

describe('paletteColor', () => {
  const scale = categorical[0];
  const colors = getCategoricalColors(scale);

  it('takes the colors in order and starts over at the end', () => {
    expect(paletteColor(scale, 0)).toBe(colors[0]);
    expect(paletteColor(scale, colors.length - 1)).toBe(colors[colors.length - 1]);
    expect(paletteColor(scale, colors.length)).toBe(colors[0]);
  });
});
