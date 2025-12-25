import * as d3 from 'd3';

type ColorScaleType = 'categorical' | 'continuous';

export interface ColorScale {
    id: number;                  // unique numeric ID
    name: string;                // friendly name
    type: ColorScaleType;
    representativeColors: string[]; // array of 5 hex colors
    scale: any;   // D3 color scale
}

export const COLOR_SCALES: ColorScale[] = [
    {
        id: 0,
        name: 'Range',
        type: 'continuous',
        representativeColors: ['#198FBD', '#4FA9C8', '#F7D529', '#F7924D', '#F7295B'],
        scale: d3
            .scaleLinear<string>()
            .domain([0.0, 0.5, 1.0])
            .range(['#198FBD', '#F7D529', '#F7295B'])
    },
    {
        id: 1,
        name: 'Range',
        type: 'continuous',
        representativeColors: ['#F1F6FE', '#C5DAFB', '#71A4F4', '#3762E3', '#3762E3'],
        scale: d3
            .scaleLinear<string>()
            .domain([0.0, 1.0])
            .range(['#F1F6FE', '#3762E3'])
    },
    {
        id: 2,
        name: 'Range',
        type: 'continuous',
        representativeColors: ['#FCF4CC', '#F8E164', '#F3CE49', '#F3CE49', '#986523'],
        scale: d3
            .scaleLinear<string>()
            .domain([0.0, 1.0])
            .range(['#FCF4CC', '#986523'])
    },
    {
        id: 3,
        name: 'Category',
        type: 'categorical',
        representativeColors: ['#4f366d', '#933765', '#d08f51', '#286367', '#8BC34A'],
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
        representativeColors: ['#FFC107', '#2196F3', '#FF5722', '#607D8B', '#BF3330'],
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