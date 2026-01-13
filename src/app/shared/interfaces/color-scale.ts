import * as d3 from 'd3';

type ColorScaleType = 'categorical' | 'continuous';

export interface ColorScale {
    id: number;                  // unique numeric ID
    name: string;                // friendly name
    type: ColorScaleType;
    scale: any;   // D3 color scale
}

export const COLOR_SCALES: ColorScale[] = [
    {
        id: 0,
        name: 'Range',
        type: 'continuous',
        scale: d3
            .scaleLinear<string>()
            .domain([0.0, 0.5, 1.0])
            .range(['#198FBD', '#F7D529', '#F7295B'])
    },
    {
        id: 1,
        name: 'Range',
        type: 'continuous',
        scale: d3
            .scaleLinear<string>()
            .domain([0.0, 1.0])
            .range(['#F1F6FE', '#3762E3'])
    },
    {
        id: 2,
        name: 'Range',
        type: 'continuous',
        scale: d3
            .scaleLinear<string>()
            .domain([0.0, 1.0])
            .range(['#FCF4CC', '#986523'])
    },
    {
        id: 3,
        name: 'Category',
        type: 'categorical',
        scale: d3
            .scaleQuantize<string>()
            .domain([0.0, 1.0])
            .range([
                '#4f366d',
                '#933765',
                '#d08f51',
                '#286367',
                '#8BC34A'
            ])
    },
    {
        id: 4,
        name: 'Category',
        type: 'categorical',
        scale: d3
            .scaleQuantize<string>()
            .domain([0.0, 1.0])
            .range([
                '#FFC107',
                '#2196F3',
                '#FF5722',
                '#607D8B',
                '#BF3330'
            ])
    }
];

export function getColorScaleById(id: number): ColorScale | undefined {
    return COLOR_SCALES.find(scale => scale.id === id);
}