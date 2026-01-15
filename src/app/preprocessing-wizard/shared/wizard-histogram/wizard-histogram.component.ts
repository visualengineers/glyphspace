import { Component, Input, OnInit, OnChanges, ElementRef, ViewChild, AfterViewInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { HistogramData } from '../../models/column-statistics';
import { DataType } from '../../models/data-type.enum';

type StackedBin = {
  bin: number;
  value: number;
  x0: number;
  x1: number;
  label?: string;
};

@Component({
  selector: 'app-wizard-histogram',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wizard-histogram.component.html',
  styleUrl: './wizard-histogram.component.scss'
})
export class WizardHistogramComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;

  @Input() data!: HistogramData;
  @Input() dataType!: DataType;
  @Input() color: string = '#2196F3';
  @Input() width: number = 120;
  @Input() height: number = 40;
  @Input() enabled: boolean = true;

  private svg: any;
  private initialized = false;
  private cachedStackedBins: StackedBin[] | null = null;

  hoverLabel: string = '';
  showHoverLabel: boolean = false;
  private lastHoveredBar: any = null;
  private hoverLabelElement: HTMLElement | null = null;

  private readonly MAX_CATEGORICAL_BINS = 40;
  private readonly MAX_NUMERIC_BINS = 20;
  private readonly margin = { top: 2, right: 2, bottom: 2, left: 2 };

  private darkenColor(color: string, amount: number = 0.3): string {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Darken by reducing each component
    const newR = Math.floor(r * (1 - amount));
    const newG = Math.floor(g * (1 - amount));
    const newB = Math.floor(b * (1 - amount));

    // Convert back to hex
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initialized = true;
    // Cache the hover label element
    if (this.chartContainer) {
      const parent = this.chartContainer.nativeElement.parentElement;
      if (parent) {
        this.hoverLabelElement = parent.querySelector('.hover-label');
      }
    }
    if (this.data) {
      this.createChart();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.initialized && this.data) {
      if (changes['enabled'] || changes['data'] || changes['color']) {
        this.cachedStackedBins = null;
        this.createChart();
      }
    }
  }

  private createChart(): void {
    if (!this.chartContainer || !this.data) return;

    // Clear previous chart
    d3.select(this.chartContainer.nativeElement).selectAll('*').remove();
    this.lastHoveredBar = null;
    this.showHoverLabel = false;

    const width = this.width - this.margin.left - this.margin.right;
    const height = this.height - this.margin.top - this.margin.bottom;

    // Create SVG
    this.svg = d3.select(this.chartContainer.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    const effectiveType = this.getEffectiveType();

    if (effectiveType === 'categorical') {
      this.drawCategoricalHistogram(width, height);
    } else {
      this.drawNumericHistogram(width, height);
    }
  }

  private getEffectiveType(): string {
    if (!this.cachedStackedBins) {
      this.cachedStackedBins = this.prepareStackedBins();
    }

    const nonZeroBinCount = this.cachedStackedBins.length;

    // If declared as categorical but has too many non-zero bins, treat as numeric
    if ((this.dataType === DataType.Categorical || this.dataType === DataType.Boolean)
        && nonZeroBinCount > this.MAX_CATEGORICAL_BINS) {
      return 'numeric';
    }

    // If categorical, boolean, or text type with reasonable bins
    if (this.dataType === DataType.Categorical ||
        this.dataType === DataType.Boolean ||
        this.dataType === DataType.Text) {
      return 'categorical';
    }

    // Default to numeric for numeric and date types
    return 'numeric';
  }

  private prepareStackedBins(): StackedBin[] {
    const GAP = 1;
    const MIN_WIDTH = 3;

    // Filter non-zero bins and sort
    const rawBins = this.data.counts
      .map((value, index) => ({
        bin: index,
        value,
        label: this.data.labels && this.data.labels[index] ? this.data.labels[index] : `Bin ${index}`
      }))
      .filter(d => d.value > 0)
      .sort((a, b) => a.bin - b.bin);

    const nBars = rawBins.length;
    if (nBars === 0) return [];

    const totalValue = rawBins.reduce((sum, d) => sum + d.value, 0);
    const totalGapWidth = GAP * (nBars - 1);
    const availableWidth = this.width - this.margin.left - this.margin.right - totalGapWidth;

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

  private rebinData(originalCounts: number[], targetBins: number): number[] {
    const originalBins = originalCounts.length;
    if (originalBins <= targetBins) {
      return originalCounts;
    }

    const newCounts: number[] = new Array(targetBins).fill(0);
    const binSize = originalBins / targetBins;

    for (let i = 0; i < originalBins; i++) {
      const targetBin = Math.floor(i / binSize);
      if (targetBin < targetBins) {
        newCounts[targetBin] += originalCounts[i];
      }
    }

    return newCounts;
  }

  private drawCategoricalHistogram(width: number, height: number): void {
    if (!this.data || !this.svg) return;

    const bins = this.cachedStackedBins || this.prepareStackedBins();
    if (bins.length === 0) return;

    const displayColor = this.enabled ? this.color : '#ccc';
    const darkerColor = this.darkenColor(displayColor);

    const bars = this.svg.selectAll('rect')
      .data(bins)
      .enter()
      .append('rect')
      .attr('class', 'histogram-bar')
      .attr('x', (d: StackedBin) => d.x0)
      .attr('y', 0)
      .attr('width', (d: StackedBin) => d.x1 - d.x0)
      .attr('height', height)
      .attr('fill', displayColor)
      .attr('rx', 2)
      .attr('ry', 2)
      .attr('opacity', this.enabled ? 0.8 : 0.5)
      .style('cursor', this.enabled ? 'pointer' : 'default')
      .style('pointer-events', 'all');

    if (this.enabled) {
      bars
        .on('mouseenter', (event: MouseEvent, d: StackedBin) => {
          const currentBar = event.currentTarget as SVGRectElement;

          // Reset previous bar if it exists
          if (this.lastHoveredBar) {
            d3.select(this.lastHoveredBar)
              .attr('fill', displayColor)
              .attr('opacity', 0.8);
          }

          // Highlight current bar with darker version of original color
          d3.select(currentBar)
            .attr('fill', darkerColor)
            .attr('opacity', 1);

          this.lastHoveredBar = currentBar;

          // Update hover label directly in DOM without triggering change detection
          if (this.hoverLabelElement) {
            this.hoverLabelElement.textContent = d.label || `Bin ${d.bin}`;
            this.hoverLabelElement.classList.add('visible');
          }
        });
    }
  }

  private drawNumericHistogram(width: number, height: number): void {
    if (!this.data || !this.svg) return;
    // Rebin data if necessary
    const counts = this.rebinData(this.data.counts, this.MAX_NUMERIC_BINS);
    const bins = counts.map((value, index) => ({ bin: index, value }));
    const displayColor = this.enabled ? this.color : '#ccc';
    const darkerColor = this.darkenColor(displayColor);

    const xScale = d3.scaleLinear()
      .domain([0, bins.length])
      .range([0, width]);

    const maxVal = d3.max(bins, d => d.value) || 1;

    const yScale = d3.scaleLinear()
      .domain([0, maxVal])
      .range([height, 0]);

    const barWidth = width / bins.length;

    const bars = this.svg.selectAll('rect')
      .data(bins)
      .enter()
      .append('rect')
      .attr('class', 'histogram-bar')
      .attr('x', (d: any) => xScale(d.bin))
      .attr('y', (d: any) => yScale(d.value))
      .attr('width', Math.max(barWidth - 1, 1))
      .attr('height', (d: any) => height - yScale(d.value))
      .attr('fill', displayColor)
      .attr('rx', 2)
      .attr('ry', 2)
      .attr('opacity', this.enabled ? 0.8 : 0.5)
      .style('cursor', this.enabled ? 'pointer' : 'default')
      .style('pointer-events', 'all');

    if (this.enabled) {
      bars
        .on('mouseenter', (event: MouseEvent, d: any) => {
          const currentBar = event.currentTarget as SVGRectElement;

          // Reset previous bar if it exists
          if (this.lastHoveredBar) {
            d3.select(this.lastHoveredBar)
              .attr('fill', displayColor)
              .attr('opacity', 0.8);
          }

          // Highlight current bar with darker version of original color
          d3.select(currentBar)
            .attr('fill', darkerColor)
            .attr('opacity', 1);

          this.lastHoveredBar = currentBar;

          const binStart = this.data.binEdges && this.data.binEdges[d.bin] !== undefined
            ? this.data.binEdges[d.bin].toFixed(2)
            : d.bin;
          const binEnd = this.data.binEdges && this.data.binEdges[d.bin + 1] !== undefined
            ? this.data.binEdges[d.bin + 1].toFixed(2)
            : d.bin + 1;

          // Update hover label directly in DOM without triggering change detection
          if (this.hoverLabelElement) {
            this.hoverLabelElement.textContent = `${binStart} - ${binEnd}: ${d.value}`;
            this.hoverLabelElement.classList.add('visible');
          }
        });
    }
  }
}
