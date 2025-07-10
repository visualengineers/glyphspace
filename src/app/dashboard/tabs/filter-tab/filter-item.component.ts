import { Component, Input, ElementRef, ViewChild, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';
import { Histogram } from '../../../shared/interfaces/glyph-meta';
import { FeatureFilter } from '../../../shared/filter/feature-filter';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../../../services/config.service';
import { ItemFilter } from '../../../shared/filter/item-filter';
import { DataProviderService } from '../../../services/dataprovider.service';
import { FilterMode } from '../../../shared/enum/filter-mode';
import { InteractionCommand } from '../../../shared/enum/interaction-command';
import { Subscription } from 'rxjs';

const histogramSmallWidth = 106;
const histogramLargeWidth = 330;
const histogramHeight = 50;

@Component({
    selector: 'app-filter-item',
    imports: [CommonModule],
    templateUrl: './filter-item.component.html',
    styleUrl: './filter-item.component.scss'
})
export class FilterItemComponent {
    @ViewChild('chart') chartContainer!: ElementRef;
    @Input() configuration!: ConfigService;
    @Input() dataProvider!: DataProviderService
    @Input() histogramData!: Histogram;
    @Input() property!: string;
    @Input() small = true;
    @Input() label: string = "";

    private configSub = new Subscription();
    active = false;
    private data: number[][] = [];
    private dataSteps: number = 0;
    private margin: any = { top: 0, bottom: 0, left: 0, right: 0 };
    private chart: any;
    private svg: any;
    private width: number = 0;
    private height: number = 0;
    private xScale: any;
    private yScale: any;
    private brushMin = -1;
    private brushMax = -1;
    public colorSteps: any;
    private filter!: ItemFilter;

    private brush = d3.brushX()
        .on('end', (event: any, d: any) => {
            this.brushed(event);
            FilterItemComponent.filtering(this, event);
        });

    ngOnInit() {
        this.width = histogramSmallWidth;
        this.height = histogramHeight;
        this.filter = new FeatureFilter(this.property);
        this.filter.filterMode = FilterMode.And;

        this.colorSteps = [
            '#4f366d',
            '#933765',
            '#d08f51',
            '#286367',
            '#8BC34A',
            '#FFC107',
            '#2196F3',
            '#FF5722',
            '#607D8B',
            '#BF3330'
        ];

        this.active = this.configuration.activeFeatures.indexOf(this.property) >= 0;
    }

    ngAfterViewInit() {
        this.configSub.add(
            this.configuration.commandSubject$.subscribe(command => {
                if (command == InteractionCommand.clearselection) {
                    if (!this.small) this.resize();
                }
            }));
        this.updateData();
        this.createChart();
        this.updateChart();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['histogramData'] && this.chartContainer) {
            d3.select(this.chartContainer!.nativeElement).select('svg').remove();
            this.updateData();
            this.createChart();
            this.updateChart();
        }
    }

    ngOnDestroy(): void {
        if (this.svg) {
            this.svg.remove(); // removes the appended <svg> element
            this.svg = null;
        }
        d3.select(this.chartContainer!.nativeElement).select('svg').remove();
        this.configSub.unsubscribe();
    }

    updateData() {
        this.data = Object.entries(this.histogramData).map(([bin, value]) => [Number(bin), value]);
        this.dataSteps = this.data.length;
    }

    public changed(): void {
        this.active = !this.active;
        this.updateColoring();
        const index = this.configuration.activeFeatures.indexOf(this.property);
        if (this.active && index < 0) {
            this.configuration?.activeFeatures.push(this.property);
        } else if (index >= 0) {
            this.configuration?.activeFeatures.splice(index, 1);
        }

        this.configuration?.updateConfiguration();
    }

    public resize(): void {
        if (this.small) {
            this.width = histogramLargeWidth;
        } else {
            this.width = histogramSmallWidth;
            this.removeFilter();

            this.brushMax = -1;
            this.brushMin = -1;
        }

        d3.select(this.chartContainer!.nativeElement).selectAll('*').remove();

        this.small = !this.small;

        this.createChart();
        if (this.data) {
            this.updateChart();
        }

        this.applyFilters();

        // if(!this.small) {
        //     this.chartContainer.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });
        // }
    }

    public selectColor(): void {
        this.configuration.colorFeature = this.property;
        this.configuration.updateConfiguration();
    }

    private brushed(event: any) {
        if (event === undefined || event.selection === undefined || event.selection === null) {
            return;
        }

        const x = d3.scaleLinear()
            .domain(this.data.map((d: any) => d[0]))
            .range([0, this.width])
        const selection: any[] = event.selection.map(x.invert, x);
        this.brushMin = +d3.min(selection) * this.dataSteps;
        this.brushMax = Math.floor(+d3.max(selection) * this.dataSteps);
        this.updateColoring();
    }

    private static filtering(component: FilterItemComponent, event: any): void {
        if (event.selection === null || event.selection === undefined) {
            return;
        }

        const filters = component.dataProvider.getFilters();
        if (!filters.includes(component.filter)) {
            component.dataProvider.getFilters().push(component.filter);
        }

        const absoluteMinValue: number = +d3.min(event.selection)!;
        const absoluteMaxValue: number = +d3.max(event.selection)!;

        const relativeMinValue: number = absoluteMinValue / component.width;
        const relativeMaxValue: number = absoluteMaxValue / component.width;

        // TODO: Workaround because data is not bound to actual bars in chart

        const steps = 1 / component.dataSteps;
        let minValue = Math.floor(relativeMinValue / steps) * steps;
        let maxValue = (Math.floor(relativeMaxValue / steps) + 1) * steps;

        (component.filter as FeatureFilter).minValue = minValue;
        (component.filter as FeatureFilter).maxValue = Math.min(maxValue, 1.0);

        component.updateColoring();
        component.dataProvider.refreshFilters();
        component.configuration.redraw();
    }

    private colorDecision(d: any) {
        if (this.brushMin <= d[0] + 1 && d[0] <= this.brushMax) {
            return '#0093d6';
        } else {
            if (this.active) {
                return '#1a1a1a';
            } else {
                return '#989898';
            }
        }
    }

    private sanitizeString(str: string): string {
        return str.replace(/[^a-zA-Z0-9_-]/g, '');
    }

    private updateColoring() {
        this.chart.selectAll('.bar').style('fill', (d: any) => this.colorDecision(d));
    }

    public removeFilter() {
        this.brushMin = -1;
        this.brushMax = -1;
        this.filter.clear();
        const pos = this.dataProvider.getFilters().indexOf(this.filter);
        if (pos >= 0) this.dataProvider.getFilters().splice(pos, 1);
        this.chart.select('#overlay-wrap').call(this.brush.move, null);
        this.updateColoring();
    }

    public clearFilter() {
        this.removeFilter();
        this.applyFilters();
    }

    private applyFilters() {
        this.dataProvider.refreshFilters();
        this.configuration.redraw();
    }

    private createChart() {
        const element = this.chartContainer!.nativeElement;

        this.svg = d3.select(element).append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('id', this.sanitizeString(this.label));

        // chart plot area
        this.chart = this.svg.append('g')
            .attr('class', 'bars')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

        // define X & Y domains
        const xDomain = this.data.map((d: any) => d[0]);
        const yDomain = this.data.map((d: any) => d[1]);

        // create scales
        this.xScale = d3.scaleBand().padding(0).domain(xDomain).range([0, this.width]);
        this.yScale = d3.scaleLinear().domain(yDomain).range([this.height, 0]);
    }

    private updateChart() {
        // update scales
        this.xScale.domain(this.data.map((d: any) => d[0]));
        this.yScale.domain([0, d3.max(this.data, (d: any) => d[1])]);

        const that = this;
        const update = this.chart.selectAll('.bar').data(this.data);

        // remove existing bars
        update.exit().remove();

        // add new bars
        update.enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', (d: any) => this.xScale(d[0]))
            .attr('y', (d: any) => this.yScale(0))
            .attr('width', (d: any) => this.xScale.bandwidth())
            .attr('height', 0)
            .attr('display', 'block')
            .style('fill', (d: any) => this.colorDecision(d))
            .transition()
            .attr('y', (d: any) => this.yScale(d[1]))
            .attr('height', (d: any) => this.height - this.yScale(d[1]));

        if (!this.small && this.chart.selectAll('#overlay-wrap').empty()) {

            this.chart.append('g')
                .attr('id', 'overlay-wrap').call(this.brush);

            const tooltip = d3.select('#' + this.sanitizeString(this.label)).append('g')
                .attr('class', 'tooltip')
                .attr('id', this.property)
                .style('display', 'none');

            tooltip.append('rect')
                .attr('width', 60)
                .attr('height', 20)
                .attr('fill', 'white')
                .style('opacity', 0.0);

            tooltip.append('text')
                .attr('x', 2)
                .attr('dy', '1.2em')
                .style('text-anchor', 'right')
                .attr('font-size', '12px');

            this.chart.selectAll('.selection')
                .style('fill', '#0093d6')
                .on('mouseover', function () { tooltip.style('display', 'block'); })
                .on('mousemove', function (event: any, d: any) {
                    tooltip
                        .select('text')
                        .text(
                            Math.round((Math.floor(d3.pointer(event)[0] / (that.width / that.dataSteps)) / that.dataSteps) * 100) / 100
                            + '-'
                            + Math.round(((Math.floor(d3.pointer(event)[0] / (that.width / that.dataSteps)) + 1) / that.dataSteps) * 100) / 100);
                })
                .on('mouseout', function () {
                    tooltip.style('display', 'none');
                });

            this.chart.selectAll('.overlay')
                .on('mouseover', function () { tooltip.style('display', 'block'); })
                .on('mousemove', function (event: any, d: any) {
                    tooltip
                        .select('text')
                        .text(
                            Math.round((Math.floor(d3.pointer(event)[0] / (that.width / that.dataSteps)) / that.dataSteps) * 100) / 100
                            + '-'
                            + Math.round(((Math.floor(d3.pointer(event)[0] / (that.width / that.dataSteps)) + 1) / that.dataSteps) * 100) / 100);
                })
                .on('mouseout', function () {
                    tooltip.style('display', 'none');
                });

            this.chart.selectAll('.handle')
                .on('mousemove', function (event: any, d: any) {
                    tooltip
                        .select('text')
                        .text(
                            Math.round((Math.floor(d3.pointer(event)[0] / (that.width / that.dataSteps)) / that.dataSteps) * 100) / 100
                            + '-'
                            + Math.round(((Math.floor(d3.pointer(event)[0] / (that.width / that.dataSteps)) + 1) / that.dataSteps) * 100) / 100);
                });
        }
    };
}
