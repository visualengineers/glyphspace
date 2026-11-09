import * as d3 from 'd3';

export type ColorScaleType = 'categorical' | 'numeric';

export interface ColorScale {
  id: number; // unique numeric ID
  name: string; // friendly name
  type: ColorScaleType;
  group: string;
  scale: d3.ScaleLinear<string, string> | d3.ScaleQuantize<string>;
}

export const COLOR_SCALES: ColorScale[] = [
  {
    id: 0,
    name: 'Diverge',
    type: 'numeric',
    group: 'Diverging color scales',
    scale: d3.scaleLinear<string>().domain([0.0, 0.5, 1.0]).range(['#198FBD', '#F7D529', '#F7295B']),
  },
  {
    id: 1,
    name: 'Spectral', // https://colorbrewer2.org/#type=diverging&scheme=Spectral&n=11
    type: 'numeric',
    group: 'Diverging color scales',
    scale: d3
      .scaleLinear<string>()
      .domain([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0])
      .range([
        '#9e0142',
        '#d53e4f',
        '#f46d43',
        '#fdae61',
        '#fee08b',
        '#ffffbf',
        '#e6f598',
        '#abdda4',
        '#66c2a5',
        '#3288bd',
        '#5e4fa2',
      ]),
  },
  {
    id: 2,
    name: 'Viridis', // https://hauselin.github.io/colorpalettejs/
    type: 'numeric',
    group: 'Sequential color scales',
    scale: d3
      .scaleLinear<string>()
      .domain([0.0, 0.2, 0.4, 0.6, 0.8, 1.0])
      .range(['#440154', '#3b528b', '#21918c', '#5ec962', '#fde725']),
  },
  {
    id: 3,
    name: 'Plasma', // https://hauselin.github.io/colorpalettejs/
    type: 'numeric',
    group: 'Sequential color scales',
    scale: d3
      .scaleLinear<string>()
      .domain([0.0, 0.2, 0.4, 0.6, 0.8, 1.0])
      .range(['#0d0887', '#7e03a8', '#cc4778', '#f89540', '#f0f921']),
  },
  // Categorical palettes: at most 12 colors, since more are hard to tell apart,
  // and no grey, which marks filtered-out items. Categories take the colors in
  // order (see paletteColor), so the first colors are the most distinct.
  {
    id: 4,
    name: 'Glasbey',
    type: 'categorical',
    group: 'Categorical color scales',
    // Glasbey for light backgrounds (colorcet), first 12 colors
    scale: categoricalPalette([
      '#D60000', // red
      '#8C3BFF', // violet
      '#018700', // green
      '#00ACC6', // cyan
      '#E6A500', // amber
      '#FF7ED1', // pink
      '#6B004F', // plum
      '#573B00', // dark brown
      '#005659', // dark teal
      '#15E18C', // mint
      '#0000DD', // blue
      '#A17569', // taupe
    ]),
  },
  {
    id: 5,
    name: 'Tableau 10',
    type: 'categorical',
    group: 'Categorical color scales',
    // Tableau 10 with its grey replaced by a dark olive
    scale: categoricalPalette([
      '#4E79A7', // blue
      '#F28E2C', // orange
      '#E15759', // red
      '#76B7B2', // teal
      '#59A14F', // green
      '#EDC949', // yellow
      '#AF7AA1', // purple
      '#FF9DA7', // pink
      '#9C755F', // brown
      '#576D07', // olive
    ]),
  },
  {
    id: 6,
    name: 'Colorblind',
    type: 'categorical',
    group: 'Categorical color scales',
    // seaborn "colorblind" without its grey and yellow
    scale: categoricalPalette([
      '#0173B2', // blue
      '#DE8F05', // orange
      '#029E73', // green
      '#D55E00', // vermilion
      '#CC78BC', // mauve
      '#CA9161', // tan
      '#56B4E9', // sky blue
      '#FBAFE4', // light pink
    ]),
  },
];

/** Palette scale for values in [0,1]; categories use paletteColor instead (ordinal). */
function categoricalPalette(colors: string[]): d3.ScaleQuantize<string> {
  return d3.scaleQuantize<string>().domain([0.0, 1.0]).range(colors);
}

/** Scale type that suits a feature: a palette for features with categories, a gradient otherwise. */
export function scaleTypeForFeature(
  featureType: string | undefined,
  categoryCount: number | undefined
): ColorScaleType {
  return categoryCount || featureType === 'categorical' ? 'categorical' : 'numeric';
}

/** Look up a color scale by id, falling back to the first (default) scale for unknown ids. */
export function getColorScaleById(id: number): ColorScale {
  return COLOR_SCALES.find(scale => scale.id === id) ?? COLOR_SCALES[0];
}

export function getContinuousGradient(scale: ColorScale, steps = 10): string {
  const domain = scale.scale.domain();
  const min = domain[0];
  const max = domain[domain.length - 1];
  const colors: string[] = [];
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const value = min + t * (max - min);
    colors.push(scale.scale(value));
  }
  return `linear-gradient(to right, ${colors.join(', ')})`;
}

export function getCategoricalColors(scale: ColorScale): string[] {
  if (typeof scale.scale.range === 'function') {
    return scale.scale.range();
  }
  return [];
}

/**
 * Color of category `index` in a categorical palette. Categories take the
 * colors in order and start over once the palette is used up.
 */
export function paletteColor(scale: ColorScale, index: number): string {
  const colors = getCategoricalColors(scale);
  const count = colors.length;
  return colors[((Math.round(index) % count) + count) % count];
}

export function buildGroupedColorScales(
  scales: ColorScale[] = COLOR_SCALES
): { group: string; scales: ColorScale[] }[] {
  const map = new Map<string, ColorScale[]>();
  for (const s of scales) {
    if (!map.has(s.group)) {
      map.set(s.group, []);
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- key is guaranteed by the map.set() just above
    map.get(s.group)!.push(s);
  }
  return Array.from(map.entries()).map(([group, scales]) => ({ group, scales }));
}
