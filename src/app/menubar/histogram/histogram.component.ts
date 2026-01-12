import { Component, Input, OnInit, ElementRef, ViewChild, AfterViewInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as d3 from 'd3';
import { ItemFilter } from '../../shared/filter/item-filter';
import { FeatureFilter } from '../../shared/filter/feature-filter';
import { FilterMode } from '../../shared/enum/filter-mode';
import { Subscription } from 'rxjs';
import { COLOR_SCALES, ColorScale } from '../../shared/interfaces/color-scale';

export type Histogram = {
    [binIndex: string]: number; // binIndex: "0" to "49"
};

type StackedBin = {
    bin: number;
    value: number;
    x0: number;
    x1: number;
};

@Component({
    selector: 'app-histogram',
    templateUrl: './histogram.component.html',
    styleUrls: ['./histogram.component.scss']
})
export class HistogramComponent implements OnInit, AfterViewInit, OnChanges {
    @Input() histogramData!: Histogram;
    @Input() label!: string;
    @Input() type!: string;
    @Input() property!: string;

    @Input() configuration: any;
    @Input() dataProvider: any;

    @Output() selectionChanged = new EventEmitter<{ property: string, minBin: number, maxBin: number }>();

    @ViewChild('histogramContainer', { static: true }) histogramContainer!: ElementRef<HTMLDivElement>;

    private configSub = new Subscription();

    private filter!: ItemFilter;

    active = false;

    private svg: any;
    private margin = { top: 6, right: 6, bottom: 6, left: 6 };
    private width = 300;
    private height = 60;
    private innerHeight = 60;

    private xScale: any;
    private yScale: any;
    private brush: any;
    private brushSelection: [number, number] | null = null;
    private selectedBins = new Set<number>();

    private defaultBarColor = '#333'; // dark gray
    private colorScale: ColorScale = COLOR_SCALES[0];

    constructor() { }

    ngOnInit(): void {
        this.filter = new FeatureFilter(this.property);
        this.filter.filterMode = FilterMode.And;
        this.active = this.configuration.activeFeatures.indexOf(this.property) >= 0;
    }

    ngAfterViewInit(): void {
        this.createHistogram();

        this.configSub.add(
            this.configuration.glyphConfigSubject$.subscribe(() => {
                this.colorScale = COLOR_SCALES.find(cs => cs.id === this.configuration.colorRange) || COLOR_SCALES[0];
                this.updateChart();
            })
        );
    }

    ngOnDestroy(): void {
        if (this.svg) {
            this.svg.remove(); // removes the appended <svg> element
            this.svg = null;
        }
        d3.select(this.histogramContainer!.nativeElement).select('svg').remove();
        this.configSub.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['histogramData'] && !changes['histogramData'].firstChange) {
            this.updateChart();
        }
    }

    public changed(): void {
        this.active = !this.active;
        const index = this.configuration.activeFeatures.indexOf(this.property);
        if (this.active && index < 0) {
            this.configuration?.activeFeatures.push(this.property);
        } else if (index >= 0) {
            this.configuration?.activeFeatures.splice(index, 1);
        }

        this.configuration?.updateConfiguration();
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

        this.updateChart();
    }

    private updateChart(): void {
        if (!this.svg || !this.histogramData) return;

        this.svg.selectAll('*').remove();

        // Validate and infer effective type based on data characteristics
        const effectiveType = this.getEffectiveType();

        if (effectiveType === 'numeric') {
            this.drawNumericHistogram();
        } else {
            this.drawCategoricalStack();
        }
    }

    /**
     * Determine the effective rendering type based on declared type and data characteristics.
     * If categorical type has too many bins, fall back to numeric histogram.
     */
    private getEffectiveType(): string {
        const binCount = Object.keys(this.histogramData).length;
        const MAX_CATEGORICAL_BINS = 20;

        // If declared as categorical but has too many bins, treat as numeric
        if (this.type === 'categorical' && binCount > MAX_CATEGORICAL_BINS) {
            console.warn(
                `Feature "${this.property}" has ${binCount} categories (>${MAX_CATEGORICAL_BINS}), rendering as numeric histogram`
            );
            return 'numeric';
        }

        // If no type specified, infer from bin count
        if (!this.type || this.type === 'unknown') {
            return binCount <= 10 ? 'categorical' : 'numeric';
        }

        return this.type;
    }

    // private prepareStackedBins(): StackedBin[] {
    //     const rawBins = Object.keys(this.histogramData)
    //         .map(k => ({ bin: +k, value: this.histogramData[k] }))
    //         .filter(d => d.value > 0)              // remove zero bins
    //         .sort((a, b) => a.bin - b.bin);

    //     const GAP = 2;
    //     const MIN_WIDTH = 4;

    //     const total = rawBins.reduce((sum, d) => sum + d.value, 0);

    //     const xScale = d3.scaleLinear()
    //         .domain([0, total])
    //         .range([0, this.width]);

    //     let cursor = 0;

    //     const binsWithCoords: StackedBin[] = [];

    //     rawBins.map((d, i) => {
    //         const desiredWidth = xScale(d.value) - xScale(0);
    //         let width = Math.max(desiredWidth, MIN_WIDTH);

    //         if (i === rawBins.length - 1 && cursor + width > this.width) {
    //             width = Math.max(Math.min(width, this.width - cursor), 0);
    //         }

    //         const x0 = cursor;
    //         const x1 = x0 + width;

    //         binsWithCoords.push({
    //             ...d,
    //             x0,
    //             x1
    //         });

    //         cursor = x1 + GAP;
    //     });
    //     return binsWithCoords;
    // }

    private prepareStackedBins(): StackedBin[] {
        const GAP = 1;
        const MIN_WIDTH = 6;

        // Filter non-zero bins and sort
        const rawBins = Object.keys(this.histogramData)
            .map(k => ({ bin: +k, value: this.histogramData[k] }))
            .filter(d => d.value > 0)
            .sort((a, b) => a.bin - b.bin);

        const nBars = rawBins.length;
        const totalValue = rawBins.reduce((sum, d) => sum + d.value, 0);
        const totalGapWidth = GAP * (nBars - 1);
        const availableWidth = this.width - totalGapWidth;

        // First pass: proportional widths
        let widths = rawBins.map(d => Math.max((d.value / totalValue) * availableWidth, MIN_WIDTH));

        // Adjust widths if sum exceeds availableWidth
        const totalWidth = widths.reduce((sum, w) => sum + w, 0);
        if (totalWidth > availableWidth) {
            const scaleDown = availableWidth / totalWidth;
            widths = widths.map(w => w * scaleDown);
        }

        // Build x0/x1 cumulatively
        let cursor = 0;
        return rawBins.map((d, i) => {
            const x0 = cursor;
            const x1 = x0 + widths[i];
            cursor = x1 + GAP;
            return {
                ...d,
                x0,
                x1
            };
        });
    }

    private updateCategoricalSelection(
        bars: d3.Selection<SVGRectElement, any, any, any>,
        totalBins: number
    ): void {
        if (this.selectedBins.size === 0) {
            bars.attr('fill', (d: { bin: number }) =>
                this.getBarColor(d.bin, totalBins)
            );
        } else {
            bars.attr('fill', (d: { bin: number }) =>
                this.selectedBins.has(d.bin)
                    ? this.getBarColor(d.bin, totalBins)
                    : '#bdbdbd'
            );
        }

        this.filteringFromBins(Array.from(this.selectedBins));
    }

    private drawCategoricalStack(): void {
        if (!this.histogramData || !this.svg) return;

        // Clear brush selection when switching to categorical mode
        this.brushSelection = null;

        const bins = this.prepareStackedBins();
        const tooltip = this.createTooltip();

        this.svg.selectAll('*').remove();

        const originalBinCount = Object.keys(this.histogramData).length;

        const bars = this.svg
            .selectAll('rect')
            .data(bins)
            .enter()
            .append('rect')
            .attr('x', (d: { x0: number; }) => d.x0)
            .attr('y', 0)
            .attr('width', (d: { x1: number; x0: number; }) => (d.x1 - d.x0))
            .attr('height', this.innerHeight)
            .attr('rx', 3)
            .attr('ry', 3)
            .attr('fill', (d: { bin: number; }) => this.getBarColor(d.bin, originalBinCount))
            .style('cursor', 'pointer')
            .on('mousemove', (event: MouseEvent) => {
                const rect = event.currentTarget as SVGRectElement;
                const d = d3.select<SVGRectElement, StackedBin>(rect).datum();

                const [x, y] = d3.pointer(event, this.histogramContainer.nativeElement);

                tooltip
                    .style('opacity', 1)
                    .text(`Bin ${d.bin}: ${d.value}`)
                    .style('left', `${x + 10}px`)
                    .style('top', `${y - 8}px`);
            })
            .on('mouseleave', () => {
                tooltip.style('opacity', 0);
            })
            .on('click', (event: MouseEvent, d: { bin: number }) => {
                event.stopPropagation();

                if (this.selectedBins.has(d.bin)) {
                    // Deselect
                    this.selectedBins.delete(d.bin);
                } else {
                    // Select
                    this.selectedBins.add(d.bin);
                }

                this.updateCategoricalSelection(bars, originalBinCount);
            });

        this.updateCategoricalSelection(bars, originalBinCount);
    }

    private drawNumericHistogram(): void {
        if (!this.histogramData || !this.svg) return;

        // Clear categorical selection when switching to numeric mode
        this.selectedBins.clear();

        const bins = Object.keys(this.histogramData)
            .map(k => ({ bin: +k, value: this.histogramData[k] }));

        this.xScale = d3.scaleLinear()
            .domain([0, bins.length - 1])
            .range([0, this.width]);

        const maxVal = d3.max(bins, d => d.value) || 1;

        this.yScale = d3.scaleLinear()
            .domain([0, maxVal])
            .range([this.innerHeight, 0]);

        const tooltip = this.createTooltip();

        const bars = this.svg.selectAll('rect')
            .data(bins)
            .join('rect')
            .attr('x', (d: { bin: any; }) => this.xScale(d.bin))
            .attr('y', (d: { value: any; }) => this.yScale(d.value))
            .attr('width', this.xScale(1) - this.xScale(0) - 1)
            .attr('height', (d: { value: any; }) => this.innerHeight - this.yScale(d.value))
            .attr('fill', (d: { bin: number }) => this.getBarColor(d.bin, bins.length))
            .attr('rx', 3)  // horizontal corner radius
            .attr('ry', 3)

        this.brush = d3.brushX()
            .extent([[0, 0], [this.width, this.innerHeight]])
            .on('end', ({ selection }: { selection: [number, number] | null }) => {
                // save the current selection
                this.brushSelection = selection;

                if (!selection) {
                    bars.attr('fill', (d: { bin: number }) =>
                        this.getBarColor(d.bin, bins.length)
                    );

                    this.removeFilter();
                    return;
                }
                const [x0, x1] = selection;
                const minBin = Math.round(this.xScale.invert(x0));
                const maxBin = Math.round(this.xScale.invert(x1));

                bars.attr('fill', (d: { bin: number }) =>
                    d.bin >= minBin && d.bin <= maxBin
                        ? this.getBarColor(d.bin, bins.length)
                        : '#bdbdbd'
                );

                this.filtering(selection);
            });

        const brushG = this.svg.append('g')
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
            .on('mouseout', (_event: MouseEvent) => {
                tooltip.style('opacity', 0);
            });

        // restore previous selection if it exists
        if (this.brushSelection) {
            brushG.call(this.brush.move, this.brushSelection);
        }
    }

    private createTooltip(): d3.Selection<HTMLDivElement, unknown, null, undefined> {
        const container = this.histogramContainer.nativeElement;
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

        return tooltip
    }

    private getBarColor(bin: number, binCount: number): string {
        if (!this.colorScale || this.configuration.colorFeature !== this.property) {
            return this.defaultBarColor;
        }

        const t = binCount > 1 ? bin / (binCount - 1) : 0;
        return this.colorScale.scale(t);
    }

    private filteringFromBins(selectedBins: number[]): void {
        this.clearFeatureFilters();

        if (!selectedBins || selectedBins.length === 0) {
            this.dataProvider.refreshFilters();
            this.configuration.redraw();
            return;
        }

        const effectiveType = this.getEffectiveType();
        const totalBins = Object.keys(this.histogramData).length;

        if (effectiveType === 'categorical') {
            // For categorical: Filter by discrete bin indices
            // Each bin represents a distinct category, not a continuous range
            selectedBins.forEach(bin => {
                const filter = new FeatureFilter(this.property);

                // Calculate the exact normalized range for this specific bin
                const binWidth = 1 / totalBins;
                filter.minValue = bin * binWidth;
                filter.maxValue = (bin + 1) * binWidth;
                filter.filterMode = FilterMode.Or;

                this.dataProvider.getFilters().push(filter);
            });
        } else {
            // For numeric: Filter by continuous range
            // Bins represent ranges of continuous values
            const steps = 1 / totalBins;

            selectedBins.forEach(bin => {
                const filter = new FeatureFilter(this.property);

                filter.minValue = bin * steps;
                filter.maxValue = Math.min((bin + 1) * steps, 1.0);
                filter.filterMode = FilterMode.Or;

                this.dataProvider.getFilters().push(filter);
            });
        }

        this.dataProvider.refreshFilters();
        this.configuration.redraw();
    }


    private clearFeatureFilters(): void {
        const filters = this.dataProvider.getFilters();

        for (let i = filters.length - 1; i >= 0; i--) {
            const f = filters[i];

            if (f instanceof FeatureFilter && f.featureName === this.property) {
                filters.splice(i, 1);
            }
        }
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
        this.filter.clear();
        const pos = this.dataProvider.getFilters().indexOf(this.filter);
        if (pos >= 0) this.dataProvider.getFilters().splice(pos, 1);
        this.dataProvider.refreshFilters();
        this.configuration.redraw();
    }
}
