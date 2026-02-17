import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
  SimpleChanges,
} from '@angular/core';
import * as d3 from 'd3';
import { HistogramData } from '../../../preprocessing-wizard/models/column-statistics';
import { DataType } from '../../../preprocessing-wizard/models/data-type.enum';
import { StackedBin } from '../../types/histogram.types';
import { prepareStackedBinsFromArray, rebinHistogramData } from '../../utils/histogram.utils';

@Component({
  selector: 'app-mini-histogram',
  standalone: true,
  imports: [],
  templateUrl: './mini-histogram.component.html',
  styleUrl: './mini-histogram.component.scss',
})
export class MiniHistogramComponent implements OnChanges, AfterViewInit, OnDestroy {
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;

  @Input() data!: HistogramData;
  @Input() dataType!: DataType;
  @Input() color = '#2196F3';
  @Input() hoverColor: string | null = null;
  @Input() colorScale: ((value: number) => string) | null = null;
  @Input() width = 0; // 0 = auto (fill container)
  @Input() height = 40;
  @Input() enabled = true;
  @Input() showLabel = true;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private svg: any;
  private initialized = false;
  private cachedStackedBins: StackedBin[] | null = null;
  private resizeObserver?: ResizeObserver;

  hoverLabel = '';
  showHoverLabel = false;
  private lastHoveredBar: SVGRectElement | null = null;
  private hoverLabelElement: HTMLElement | null = null;

  private readonly MAX_CATEGORICAL_BINS = 40;
  private readonly MAX_NUMERIC_BINS = 20;
  private readonly margin = { top: 2, right: 2, bottom: 2, left: 2 };

  ngAfterViewInit(): void {
    this.initialized = true;
    if (this.chartContainer) {
      const parent = this.chartContainer.nativeElement.parentElement;
      if (parent) {
        this.hoverLabelElement = parent.querySelector('.hover-label');
      }

      // Observe container resize for responsive width
      this.resizeObserver = new ResizeObserver(() => {
        this.cachedStackedBins = null;
        this.createChart();
      });
      this.resizeObserver.observe(this.chartContainer.nativeElement);
    }
    if (this.data) {
      this.createChart();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.initialized && this.data) {
      if (changes['enabled'] || changes['data'] || changes['color'] || changes['hoverColor'] || changes['colorScale']) {
        this.cachedStackedBins = null;
        this.createChart();
      }
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  private getEffectiveWidth(): number {
    if (this.width > 0) return this.width;
    if (this.chartContainer) {
      const containerWidth = this.chartContainer.nativeElement.clientWidth;
      if (containerWidth > 0) return containerWidth;
    }
    return 120; // fallback
  }

  private createChart(): void {
    if (!this.chartContainer || !this.data) return;

    d3.select(this.chartContainer.nativeElement).selectAll('*').remove();
    this.lastHoveredBar = null;
    this.showHoverLabel = false;

    const effectiveWidth = this.getEffectiveWidth();
    const width = effectiveWidth - this.margin.left - this.margin.right;
    const height = this.height - this.margin.top - this.margin.bottom;

    this.svg = d3
      .select(this.chartContainer.nativeElement)
      .append('svg')
      .attr('width', effectiveWidth)
      .attr('height', this.height)
      .style('display', 'block')
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

    if (
      (this.dataType === DataType.Categorical || this.dataType === DataType.Boolean) &&
      nonZeroBinCount > this.MAX_CATEGORICAL_BINS
    ) {
      return 'numeric';
    }

    if (
      this.dataType === DataType.Categorical ||
      this.dataType === DataType.Boolean ||
      this.dataType === DataType.Text
    ) {
      return 'categorical';
    }

    return 'numeric';
  }

  private prepareStackedBins(): StackedBin[] {
    const effectiveWidth = this.getEffectiveWidth();
    return prepareStackedBinsFromArray(this.data.counts, this.data.labels, {
      availableWidth: effectiveWidth - this.margin.left - this.margin.right,
    });
  }

  private getBarColor(index: number, total: number): string {
    if (!this.enabled) return '#ccc';
    if (this.colorScale && total > 1) {
      return this.colorScale(index / (total - 1));
    }
    if (this.colorScale && total === 1) {
      return this.colorScale(0.5);
    }
    return this.color;
  }

  private getBarHoverColor(index: number, total: number): string {
    if (this.hoverColor) return this.hoverColor;
    return this.getBarColor(index, total);
  }

  private get defaultOpacity(): number {
    if (!this.enabled) return 0.3;
    return this.hoverColor ? 1 : 0.7;
  }

  private setHoverText(text: string): void {
    if (!this.showLabel) return;
    if (this.hoverLabelElement) {
      this.hoverLabelElement.textContent = text;
      this.hoverLabelElement.classList.add('visible');
    }
  }

  private drawCategoricalHistogram(width: number, height: number): void {
    if (!this.data || !this.svg) return;

    const bins = this.cachedStackedBins || this.prepareStackedBins();
    if (bins.length === 0) return;

    const colorFn = (_d: StackedBin, i: number) => this.getBarColor(i, bins.length);

    const bars = this.svg
      .selectAll('rect')
      .data(bins)
      .enter()
      .append('rect')
      .attr('class', 'histogram-bar')
      .attr('x', (d: StackedBin) => d.x0)
      .attr('y', 0)
      .attr('width', (d: StackedBin) => d.x1 - d.x0)
      .attr('height', height)
      .attr('fill', colorFn)
      .attr('rx', 2)
      .attr('ry', 2)
      .attr('opacity', this.defaultOpacity)
      .style('cursor', this.enabled ? 'pointer' : 'default')
      .style('pointer-events', 'all');

    if (this.enabled) {
      bars.on('mouseenter', (event: MouseEvent, d: StackedBin) => {
        const currentBar = event.currentTarget as SVGRectElement;
        const idx = bins.indexOf(d);

        if (this.lastHoveredBar) {
          const prevIdx = Number(this.lastHoveredBar.dataset['idx'] ?? 0);
          d3.select(this.lastHoveredBar)
            .attr('fill', this.getBarColor(prevIdx, bins.length))
            .attr('opacity', this.defaultOpacity);
        }

        d3.select(currentBar).attr('fill', this.getBarHoverColor(idx, bins.length)).attr('opacity', 1);
        currentBar.dataset['idx'] = String(idx);

        this.lastHoveredBar = currentBar;
        this.setHoverText(d.label || `Bin ${d.bin}`);
      });
    }
  }

  private drawNumericHistogram(width: number, height: number): void {
    if (!this.data || !this.svg) return;
    const counts = rebinHistogramData(this.data.counts, this.MAX_NUMERIC_BINS);
    const bins = counts.map((value: number, index: number) => ({ bin: index, value }));

    const colorFn = (_d: { bin: number; value: number }, i: number) => this.getBarColor(i, bins.length);

    const xScale = d3.scaleLinear().domain([0, bins.length]).range([0, width]);

    const maxVal = d3.max(bins, d => d.value) || 1;

    const yScale = d3.scaleLinear().domain([0, maxVal]).range([height, 0]);

    const barWidth = width / bins.length;

    const bars = this.svg
      .selectAll('rect')
      .data(bins)
      .enter()
      .append('rect')
      .attr('class', 'histogram-bar')
      .attr('x', (d: { bin: number; value: number }) => xScale(d.bin))
      .attr('y', (d: { bin: number; value: number }) => yScale(d.value))
      .attr('width', Math.max(barWidth - 1, 1))
      .attr('height', (d: { bin: number; value: number }) => height - yScale(d.value))
      .attr('fill', colorFn)
      .attr('rx', 2)
      .attr('ry', 2)
      .attr('opacity', this.defaultOpacity)
      .style('cursor', this.enabled ? 'pointer' : 'default')
      .style('pointer-events', 'all');

    if (this.enabled) {
      bars.on('mouseenter', (event: MouseEvent, d: { bin: number; value: number }) => {
        const currentBar = event.currentTarget as SVGRectElement;

        if (this.lastHoveredBar) {
          const prevIdx = Number(this.lastHoveredBar.dataset['idx'] ?? 0);
          d3.select(this.lastHoveredBar)
            .attr('fill', this.getBarColor(prevIdx, bins.length))
            .attr('opacity', this.defaultOpacity);
        }

        d3.select(currentBar).attr('fill', this.getBarHoverColor(d.bin, bins.length)).attr('opacity', 1);
        currentBar.dataset['idx'] = String(d.bin);

        this.lastHoveredBar = currentBar;

        // Use pre-formatted labels if available (e.g. date bins)
        if (this.data.labels && this.data.labels[d.bin]) {
          this.setHoverText(this.data.labels[d.bin]);
        } else {
          const binStart =
            this.data.binEdges && this.data.binEdges[d.bin] !== undefined
              ? this.data.binEdges[d.bin].toFixed(2)
              : d.bin;
          const binEnd =
            this.data.binEdges && this.data.binEdges[d.bin + 1] !== undefined
              ? this.data.binEdges[d.bin + 1].toFixed(2)
              : d.bin + 1;
          this.setHoverText(`${binStart} – ${binEnd}`);
        }
      });
    }
  }
}
