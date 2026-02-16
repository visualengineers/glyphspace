import { Component, Input, OnInit, OnChanges, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';
import { HistogramData } from '../../models/column-statistics';

@Component({
  selector: 'app-histogram-chart',
  standalone: true,
  imports: [],
  templateUrl: './histogram-chart.component.html',
  styleUrl: './histogram-chart.component.scss'
})
export class HistogramChartComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild('chart', { static: false }) chartContainer!: ElementRef;

  @Input() data!: HistogramData;
  @Input() width: number = 300;
  @Input() height: number = 150;
  @Input() showAxes: boolean = true;
  @Input() color: string = '#2196F3';

  private svg: any;
  private initialized = false;

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initialized = true;
    if (this.data) {
      this.createChart();
    }
  }

  ngOnChanges(): void {
    if (this.initialized && this.data) {
      this.createChart();
    }
  }

  private createChart(): void {
    if (!this.chartContainer || !this.data) return;

    // Clear previous chart
    d3.select(this.chartContainer.nativeElement).selectAll('*').remove();

    const margin = this.showAxes
      ? { top: 10, right: 10, bottom: 30, left: 40 }
      : { top: 5, right: 5, bottom: 5, left: 5 };

    const width = this.width - margin.left - margin.right;
    const height = this.height - margin.top - margin.bottom;

    // Create SVG
    this.svg = d3.select(this.chartContainer.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, this.data.counts.length])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.data.counts) || 1])
      .range([height, 0]);

    // Bars
    const barWidth = width / this.data.counts.length;

    this.svg.selectAll('.bar')
      .data(this.data.counts)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d: number, i: number) => xScale(i))
      .attr('y', (d: number) => yScale(d))
      .attr('width', barWidth - 1)
      .attr('height', (d: number) => height - yScale(d))
      .attr('fill', this.color)
      .attr('opacity', 0.8)
      .on('mouseover', function(this: SVGRectElement) {
        d3.select(this).attr('opacity', 1);
      })
      .on('mouseout', function(this: SVGRectElement) {
        d3.select(this).attr('opacity', 0.8);
      });

    if (this.showAxes) {
      // X Axis
      const xAxis = d3.axisBottom(xScale)
        .ticks(5)
        .tickFormat((d: any) => {
          const index = Math.floor(d);
          if (index >= 0 && index < this.data.binEdges.length) {
            return this.data.binEdges[index].toFixed(1);
          }
          return '';
        });

      this.svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis)
        .selectAll('text')
        .style('font-size', '10px');

      // Y Axis
      const yAxis = d3.axisLeft(yScale)
        .ticks(5);

      this.svg.append('g')
        .call(yAxis)
        .selectAll('text')
        .style('font-size', '10px');
    }
  }
}
