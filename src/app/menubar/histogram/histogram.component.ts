import { Component, Input, OnInit, ElementRef, ViewChild, AfterViewInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as d3 from 'd3';
import { ItemFilter } from '../../shared/filter/item-filter';
import { FeatureFilter } from '../../shared/filter/feature-filter';
import { FilterMode } from '../../shared/enum/filter-mode';

export type Histogram = {
    [binIndex: string]: number; // binIndex: "0" to "49"
};

@Component({
    selector: 'app-histogram',
    templateUrl: './histogram.component.html',
    styleUrls: ['./histogram.component.scss']
})
export class HistogramComponent implements OnInit, AfterViewInit, OnChanges {

    @Input() histogramData!: Histogram;
    @Input() label!: string;
    @Input() property!: string;

    @Input() configuration: any;
    @Input() dataProvider: any;

    @Output() selectionChanged = new EventEmitter<{ property: string, minBin: number, maxBin: number }>();

    @ViewChild('histogramContainer', { static: true }) histogramContainer!: ElementRef<HTMLDivElement>;

    private filter!: ItemFilter;
    private dataSteps: number = 0;

    private svg: any;
    private margin = { top: 0, right: 18, bottom: 8, left: 8 };
    private width = 300;
    private height = 60;
    private innerHeight = 60;

    private xScale: any;
    private yScale: any;
    private brush: any;
    private minSelectedBin = -1;
    private maxSelectedBin = -1;

    private defaultBarColor = '#333'; // dark gray
    private highlightColor = '#1e88e5'; // blue highlight

    constructor() { }

    ngOnInit(): void {
        this.filter = new FeatureFilter(this.property);
        this.filter.filterMode = FilterMode.And;
    }

    ngAfterViewInit(): void {
        this.createHistogram();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['histogramData'] && !changes['histogramData'].firstChange) {
            this.updateHistogram();
        }
    }

    private createHistogram(): void {
        const container = this.histogramContainer.nativeElement;
        this.width = container.clientWidth - this.margin.left - this.margin.right;
        this.innerHeight = this.height - this.margin.top - this.margin.bottom;

        this.svg = d3.select(container)
            .append('svg')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height)
            .append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        this.updateHistogram();
    }

    private updateHistogram(): void {
        if (!this.histogramData || !this.svg) return;

        const container = this.histogramContainer.nativeElement;

        const bins = Object.keys(this.histogramData)
            .map(k => ({ bin: +k, value: this.histogramData[k] }));

        this.xScale = d3.scaleLinear()
            .domain([0, bins.length - 1])
            .range([0, this.width]);

        const maxVal = d3.max(bins, d => d.value) || 1;
        this.yScale = d3.scaleLinear()
            .domain([0, maxVal])
            .range([this.innerHeight, 0]);

        this.svg.selectAll('*').remove();

        // Remove any previous tooltip
        d3.select(container).selectAll('.hist-tooltip').remove();

        // Append tooltip div
        const tooltip = d3.select(container)
            .append('div')
            .attr('class', 'hist-tooltip')
            .style('position', 'absolute')
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .style('background', 'rgba(0,0,0,0.7)')
            .style('color', 'white')
            .style('padding', '2px 6px')
            .style('border-radius', '4px')
            .style('font-size', '12px')
            .style('z-index', '950'); // ensure it's above the SVG

        const bars = this.svg.selectAll('rect')
            .data(bins)
            .join('rect')
            .attr('x', (d: { bin: any; }) => this.xScale(d.bin))
            .attr('y', (d: { value: any; }) => this.yScale(d.value))
            .attr('width', this.xScale(1) - this.xScale(0) - 1)
            .attr('height', (d: { value: any; }) => this.innerHeight - this.yScale(d.value))
            .attr('fill', this.defaultBarColor)
            .attr('rx', 3)  // horizontal corner radius
            .attr('ry', 3)

        this.brush = d3.brushX()
            .extent([[0, 0], [this.width, this.innerHeight]])
            .on('end', ({ selection }: { selection: [number, number] | null }) => {
                if (!selection) {
                    bars.attr('fill', this.defaultBarColor);
                    this.removeFilter();
                    return;
                }
                const [x0, x1] = selection;
                const minBin = Math.round(this.xScale.invert(x0));
                const maxBin = Math.round(this.xScale.invert(x1));
                this.minSelectedBin = minBin;
                this.maxSelectedBin = maxBin;

                bars.attr('fill', (d: { bin: number; }) => (d.bin >= minBin && d.bin <= maxBin ? this.highlightColor : this.defaultBarColor));

                this.filtering(selection);
            });

        this.svg.append('g')
            .attr('class', 'brush')
            .call(this.brush)
            .on('mousemove', (event: MouseEvent) => {
                const [x, y] = d3.pointer(event, this.svg.node());
                const bin = Math.floor(this.xScale.invert(x));
                const binData = bins.find(b => b.bin === bin);
                if (!binData) return;

                tooltip.style('opacity', 1)
                    .text(`Bin ${binData.bin}: ${binData.value.toPrecision(4)}`)
                    .style('left', `${x + this.margin.left + 10}px`)
                    .style('top', `${y + this.margin.top - 10}px`);
            })
            .on('mouseout', (event: MouseEvent, d: any) => {
                tooltip.style('opacity', 0);
            });
    }

    private filtering(selection: any): void {
        if (selection === null || selection === undefined) {
            return;
        }

        const filters = this.dataProvider.getFilters();
        if (!filters.includes(this.filter)) {
            this.dataProvider.getFilters().push(this.filter);
        }

        const absoluteMinValue: number = +d3.min(selection)!;
        const absoluteMaxValue: number = +d3.max(selection)!;

        const relativeMinValue: number = absoluteMinValue / this.width;
        const relativeMaxValue: number = absoluteMaxValue / this.width;

        // TODO: Workaround because data is not bound to actual bars in chart

        const steps = 1 / Object.keys(this.histogramData).length;
        let minValue = Math.floor(relativeMinValue / steps) * steps;
        let maxValue = (Math.floor(relativeMaxValue / steps) + 1) * steps;

        (this.filter as FeatureFilter).minValue = minValue;
        (this.filter as FeatureFilter).maxValue = Math.min(maxValue, 1.0);

        this.dataProvider.refreshFilters();
        this.configuration.redraw();
    }

    public removeFilter() {
        this.minSelectedBin = -1;
        this.maxSelectedBin = -1;
        this.filter.clear();
        const pos = this.dataProvider.getFilters().indexOf(this.filter);
        if (pos >= 0) this.dataProvider.getFilters().splice(pos, 1);
        this.dataProvider.refreshFilters();
        this.configuration.redraw();
    }

}
