import * as d3 from 'd3';

type ColorScaleType = 'categorical' | 'numeric';

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
  {
    id: 4,
    name: 'Observable10', // https://observablehq.com/@observablehq/categorical-palette-tool
    type: 'categorical',
    group: 'Categorical color scales',
    scale: d3.scaleQuantize<string>().domain([0.0, 1.0]).range([
      '#4269d0', // blue
      '#efb118', // orange
      '#ff725c', // red
      '#6cc5b0', // cyan
      '#3ca951', // green
      '#ff8ab7', // pink
      '#a463f2', // purple
      '#97bbf5', // light blue
      '#9c6b4e', // brown
      '#9498a0', // gray
    ]),
  },
  {
    id: 5,
    name: 'Tableau20',
    type: 'categorical',
    group: 'Categorical color scales',
    scale: d3
      .scaleQuantize<string>()
      .domain([0.0, 1.0])
      .range([
        '#1F77B4',
        '#AEC7E8',
        '#FF7F0E',
        '#FFBB78',
        '#2CA02C',
        '#98DF8A',
        '#D62728',
        '#FF9896',
        '#9467BD',
        '#C5B0D5',
        '#8C564B',
        '#C49C94',
        '#E377C2',
        '#F7B6D2',
        '#7F7F7F',
        '#C7C7C7',
        '#BCBD22',
        '#DBDB8D',
        '#17BECF',
        '#9EDAE5',
      ]),
  },
];

export function getColorScaleById(id: number): ColorScale | undefined {
  return COLOR_SCALES.find(scale => scale.id === id);
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
