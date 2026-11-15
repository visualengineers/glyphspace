import {
  Component,
  Input,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import * as d3 from 'd3';
import { ItemFilter } from '../../shared/filter/item-filter';
import { FeatureFilter } from '../../shared/filter/feature-filter';
import { IdFilter } from '../../shared/filter/id-filter';
import { FilterMode } from '../../shared/enum/filter-mode';
import { Subscription } from 'rxjs';
import { COLOR_SCALES, ColorScale, getColorScaleById, paletteColor } from '../../shared/interfaces/color-scale';
import { CategoryFilter } from '../../shared/filter/category-filter';
import { Histogram, StackedBin } from '../../shared/types/histogram.types';
import {
  prepareStackedBinsFromObject,
  getEffectiveHistogramType,
  formatBinTooltip,
  binOfValue,
  categoryCodesByBin,
  binCategoryLabel,
} from '../../shared/utils/histogram.utils';

/** Tolerance for a brush edge that lies on a bar edge (pixel → bin rounding). */
const EDGE_TOLERANCE = 1e-6;

@Component({
  selector: 'app-histogram',
  templateUrl: './histogram.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./histogram.component.scss'],
})
export class HistogramComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() histogramData!: Histogram;
  @Input() categories: string[] | undefined;
  @Input() label!: string;
  @Input() type!: string;
  @Input() property!: string;
  @Input() featureMin = 0;
  @Input() featureMax = 1;
  @Input() originalMin?: number;
  @Input() originalMax?: number;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() configuration: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() dataProvider: any;

  @Output() selectionChanged = new EventEmitter<{ property: string; minBin: number; maxBin: number }>();

  @ViewChild('histogramContainer', { static: true }) histogramContainer!: ElementRef<HTMLDivElement>;

  private configSub = new Subscription();

  private filter!: FeatureFilter;
  private categoryFilter!: CategoryFilter;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private svg: any;
  private margin = { top: 6, right: 6, bottom: 6, left: 6 };
  private width = 300;
  private height = 60;
  private innerHeight = 60;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private xScale: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private yScale: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private brush: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private brushGroup: any;
  /** Brushed bins (first and last, inclusive); kept as bins so the brush survives a resize. */
  private brushBins: [number, number] | null = null;
  private selectedBins = new Set<number>();
  private cachedStackedBins: StackedBin[] | null = null;
  private binToCategory = new Map<number, string>();
  /** Lowest category code per bin: its palette colour is the bar's, as in the glyphs. */
  private binToFirstCode = new Map<number, number>();

  private selectionCounts: Map<number, number> | null = null;
  private totalCounts: Map<number, number> | null = null;
  private selectionHighlightColor = 'rgba(59, 130, 246, 0.85)';
  private isOwnRefresh = false;
  private suppressBrushEvent = false;
  /** Colour scale and colour feature the bars were drawn with; other configuration changes don't redraw. */
  private colorKey = '';

  private defaultBarColor = '#333'; // dark gray
  private colorScale: ColorScale = COLOR_SCALES[0];
  private resizeObserver?: ResizeObserver;

  ngOnInit(): void {
    this.filter = new FeatureFilter(this.property);
    this.categoryFilter = new CategoryFilter(this.property);
    this.categoryFilter.filterMode = FilterMode.And;
    this.filter.filterMode = FilterMode.And;
    this.createHistogram();
  }

  ngAfterViewInit(): void {
    // Observe container resize (e.g. sidebar collapse/expand transition)
    const container = this.histogramContainer.nativeElement;
    this.resizeObserver = new ResizeObserver(() => {
      const newWidth = container.clientWidth - this.margin.left - this.margin.right;
      if (newWidth > 0 && newWidth !== this.width) {
        this.width = newWidth;
        this.cachedStackedBins = null;
        d3.select(container)
          .select('svg')
          .attr('width', this.width + this.margin.left + this.margin.right);
        this.updateChart();
      }
    });
    this.resizeObserver.observe(container);

    this.configSub.add(
      this.configuration.glyphConfigSubject$.subscribe(() => {
        // Only the colours depend on the configuration; sizes, axes or the glyph
        // type change often (the size slider, every frame) and must not redraw.
        const colorKey = `${this.configuration.colorRange}|${this.configuration.colorFeature}`;
        if (colorKey === this.colorKey) return;
        this.colorKey = colorKey;
        this.colorScale = getColorScaleById(this.configuration.colorRange);
        this.updateChart();
      })
    );
    this.configSub.add(
      this.configuration.loadedDataSubject$.subscribe(() => {
        this.brushBins = null;
        this.selectedBins.clear();
        this.selectionCounts = null;
        this.totalCounts = null;
      })
    );
    this.configSub.add(this.dataProvider.filterChanged$.subscribe(() => this.onFiltersChanged()));
  }

  /**
   * Another part changed the filters (a canvas selection, the filter summary,
   * clearing all): show this histogram's own filter state and the selection.
   */
  private onFiltersChanged(): void {
    if (this.isOwnRefresh) return;
    let changed = false;
    if (this.filter.empty() && this.brushBins) {
      this.brushBins = null;
      changed = true;
    }
    if (this.categoryFilter.empty() && this.selectedBins.size > 0) {
      this.selectedBins.clear();
      changed = true;
    }
    const hadOverlay = this.selectionCounts !== null;
    this.computeSelectionOverlay();
    if (changed || hadOverlay || this.selectionCounts !== null) this.updateChart();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    if (this.svg) {
      this.svg.remove();
      this.svg = null;
    }
    d3.select(this.histogramContainer?.nativeElement).select('svg').remove();
    this.configSub.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['histogramData'] && !changes['histogramData'].firstChange) {
      this.updateChart();
    }
  }

  private createHistogram(): void {
    const container = this.histogramContainer.nativeElement;
    // 0 while the histogram is hidden (e.g. in an inactive sidebar tab); the
    // resize observer draws it once it gets a width.
    this.width = Math.max(0, container.clientWidth - this.margin.left - this.margin.right);
    this.innerHeight = this.height - this.margin.top - this.margin.bottom;

    this.svg = d3
      .select(container)
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height)
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    this.updateChart();
  }

  private updateChart(): void {
    // Without a width every bar would get a negative width (invalid SVG).
    if (!this.svg || !this.histogramData || this.width <= 0) return;

    // Clear cached bins when data changes
    this.cachedStackedBins = null;

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
   * Uses cached stacked bins to avoid duplicating prepareStackedBins logic.
   */
  private getEffectiveType(): string {
    // Prepare stacked bins once and cache for reuse
    if (!this.cachedStackedBins) {
      this.cachedStackedBins = this.prepareStackedBins();
    }

    const nonZeroBinCount = this.cachedStackedBins.length;
    const effectiveType = getEffectiveHistogramType(this.type, nonZeroBinCount);

    if (this.type === 'categorical' && effectiveType === 'numeric') {
      console.warn(
        `Feature "${this.property}" has ${nonZeroBinCount} categories (>40), rendering as numeric histogram`
      );
    }

    return effectiveType;
  }

  private prepareStackedBins(): StackedBin[] {
    return prepareStackedBinsFromObject(this.histogramData, { availableWidth: this.width });
  }

  /** Visual-only: update bar fill colors based on selectedBins and selectionCounts. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private applyCategoricalFill(bars: d3.Selection<SVGRectElement, any, any, any>, totalBins: number): void {
    const hasSelection = this.selectionCounts != null && this.selectionCounts.size > 0;

    if (this.selectedBins.size === 0) {
      bars.attr('fill', (d: { bin: number }) => (hasSelection ? '#d4d4d4' : this.getBarColor(d.bin, totalBins)));
    } else {
      bars.attr('fill', (d: { bin: number }) =>
        this.selectedBins.has(d.bin) ? (hasSelection ? '#d4d4d4' : this.getBarColor(d.bin, totalBins)) : '#bdbdbd'
      );
    }
  }

  private drawCategoricalStack(): void {
    if (!this.histogramData || !this.svg) return;

    // Clear brush selection when switching to categorical mode
    this.brushBins = null;

    // Use cached bins if available, otherwise prepare them
    const bins = this.cachedStackedBins || this.prepareStackedBins();
    this.buildBinCategoryMap();
    const tooltip = this.createTooltip();

    this.svg.selectAll('*').remove();

    const originalBinCount = Object.keys(this.histogramData).length;
    const hasSelection = this.selectionCounts != null && this.selectionCounts.size > 0;

    const bars = this.svg
      .selectAll('rect.bar')
      .data(bins)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d: { x0: number }) => d.x0)
      .attr('y', 0)
      .attr('width', (d: { x1: number; x0: number }) => Math.max(0, d.x1 - d.x0))
      .attr('height', this.innerHeight)
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('fill', (d: { bin: number }) => (hasSelection ? '#d4d4d4' : this.getBarColor(d.bin, originalBinCount)))
      .style('cursor', 'pointer')
      .on('mousemove', (event: MouseEvent) => {
        const rect = event.currentTarget as SVGRectElement;
        const d = d3.select<SVGRectElement, StackedBin>(rect).datum();

        const [x, y] = d3.pointer(event, this.histogramContainer.nativeElement);

        tooltip
          .style('opacity', 1)
          .text(this.getCategoricalValue(d.bin))
          .style('left', `${x + 10}px`)
          .style('top', `${y - 8}px`);
      })
      .on('mouseleave', () => {
        tooltip.style('opacity', 0);
      })
      .on('click', (event: MouseEvent, d: { bin: number }) => {
        event.stopPropagation();

        if (this.selectedBins.has(d.bin)) {
          this.selectedBins.delete(d.bin);
        } else {
          this.selectedBins.add(d.bin);
        }

        this.applyCategoricalFill(bars, originalBinCount);
        this.filteringFromBins(Array.from(this.selectedBins));
      });

    // Draw selection overlay for categorical bars (proportional to bin total)
    if (hasSelection) {
      this.svg
        .selectAll('rect.selection-overlay')
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- guarded by `if (hasSelection)` which checks selectionCounts != null
        .data(bins.filter((d: StackedBin) => this.selectionCounts!.has(d.bin)))
        .enter()
        .append('rect')
        .attr('class', 'selection-overlay')
        .attr('x', (d: StackedBin) => d.x0)
        .attr('y', (d: StackedBin) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- guarded by `if (hasSelection)` and filtered to bins present in selectionCounts
          const sel = this.selectionCounts!.get(d.bin) || 0;
          const tot = this.totalCounts?.get(d.bin) || 1;
          return this.innerHeight * (1 - sel / tot);
        })
        .attr('width', (d: StackedBin) => Math.max(0, d.x1 - d.x0))
        .attr('height', (d: StackedBin) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- guarded by `if (hasSelection)` and filtered to bins present in selectionCounts
          const sel = this.selectionCounts!.get(d.bin) || 0;
          const tot = this.totalCounts?.get(d.bin) || 1;
          return this.innerHeight * (sel / tot);
        })
        .attr('rx', 3)
        .attr('ry', 3)
        .attr('fill', this.selectionHighlightColor)
        .attr('pointer-events', 'none');
    }

    this.applyCategoricalFill(bars, originalBinCount);
  }

  private buildBinCategoryMap() {
    this.binToCategory.clear();
    this.binToFirstCode.clear();
    const categories = this.categories;
    if (!categories?.length) return;
    const binCount = Object.keys(this.histogramData).length;
    categoryCodesByBin(binCount, categories.length).forEach((codes, bin) => {
      this.binToCategory.set(bin, binCategoryLabel(codes.map(code => categories[code])));
      this.binToFirstCode.set(bin, codes[0]);
    });
  }

  private getCategoricalValue(bin: number): string {
    return this.binToCategory.get(bin) ?? `Category ${bin}`;
  }

  private drawNumericHistogram(): void {
    if (!this.histogramData || !this.svg) return;

    // Clear categorical selection when switching to numeric mode
    this.selectedBins.clear();

    // Build category map for categorical columns that fell back to numeric rendering (>40 categories)
    this.buildBinCategoryMap();

    const bins = Object.keys(this.histogramData).map(k => ({ bin: +k, value: this.histogramData[k] }));

    this.xScale = d3.scaleLinear().domain([0, bins.length]).range([0, this.width]);

    const maxVal = d3.max(bins, d => d.value) || 1;

    this.yScale = d3.scaleLinear().domain([0, maxVal]).range([this.innerHeight, 0]);

    const tooltip = this.createTooltip();

    const hasSelection = this.selectionCounts != null && this.selectionCounts.size > 0;

    const bars = this.svg
      .selectAll('rect.bar')
      .data(bins)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', (d: { bin: number }) => this.xScale(d.bin))
      .attr('y', (d: { value: number }) => this.yScale(d.value))
      .attr('width', this.barWidth())
      .attr('height', (d: { value: number }) => this.innerHeight - this.yScale(d.value))
      .attr('fill', (d: { bin: number }) => (hasSelection ? '#d4d4d4' : this.getBarColor(d.bin, bins.length)))
      .attr('rx', 3)
      .attr('ry', 3);

    // Draw selection overlay bars (proportional to each bin's bar height)
    if (hasSelection) {
      const overlayData = bins
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- guarded by `if (hasSelection)` which checks selectionCounts != null
        .filter((d: { bin: number; value: number }) => this.selectionCounts!.has(d.bin))
        .map((d: { bin: number; value: number }) => ({
          bin: d.bin,
          binValue: d.value,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- filtered to bins that exist in selectionCounts
          sel: this.selectionCounts!.get(d.bin)!,
          tot: this.totalCounts?.get(d.bin) || 1,
        }));

      this.svg
        .selectAll('rect.selection-overlay')
        .data(overlayData)
        .join('rect')
        .attr('class', 'selection-overlay')
        .attr('x', (d: { bin: number; binValue: number; sel: number; tot: number }) => this.xScale(d.bin))
        .attr('y', (d: { bin: number; binValue: number; sel: number; tot: number }) => {
          const barHeight = this.innerHeight - this.yScale(d.binValue);
          const overlayHeight = barHeight * (d.sel / d.tot);
          return this.innerHeight - overlayHeight;
        })
        .attr('width', this.barWidth())
        .attr('height', (d: { bin: number; binValue: number; sel: number; tot: number }) => {
          const barHeight = this.innerHeight - this.yScale(d.binValue);
          return barHeight * (d.sel / d.tot);
        })
        .attr('fill', this.selectionHighlightColor)
        .attr('rx', 3)
        .attr('ry', 3)
        .attr('pointer-events', 'none');
    }

    this.brush = d3
      .brushX()
      .extent([
        [0, 0],
        [this.width, this.innerHeight],
      ])
      .on('end', ({ selection }: { selection: [number, number] | null }) => {
        if (this.suppressBrushEvent) return;

        if (!selection) {
          this.brushBins = null;
          bars.attr('fill', (d: { bin: number }) => (hasSelection ? '#d4d4d4' : this.getBarColor(d.bin, bins.length)));

          this.removeFilter();
          return;
        }
        // The brush selects whole bars: every bar it touches, and it snaps to their edges.
        this.brushBins = this.brushedBins(selection, bins.length);
        this.moveBrushToBins();
        this.applyBrushFill(bars, this.brushBins, bins.length, hasSelection);

        this.filterBins(this.brushBins, bins.length);
      });

    const brushG = this.svg
      .append('g')
      .attr('class', 'brush')
      .call(this.brush)
      .on('mousemove', (event: MouseEvent) => {
        const [x, y] = d3.pointer(event, this.svg.node());
        const bin = Math.floor(this.xScale.invert(x));
        const binData = bins.find(b => b.bin === bin);
        if (!binData) return;

        // Use category name if available (categorical column rendered as numeric due to >40 categories)
        const label =
          this.binToCategory.size > 0
            ? this.getCategoricalValue(binData.bin)
            : formatBinTooltip(
                binData.bin,
                bins.length,
                this.originalMin ?? this.featureMin,
                this.originalMax ?? this.featureMax,
                this.type
              );

        tooltip
          .style('opacity', 1)
          .text(label)
          .style('left', `${x + this.margin.left + 10}px`)
          .style('top', `${y + this.margin.top - 10}px`);
      })
      .on('mouseout', (_event: MouseEvent) => {
        tooltip.style('opacity', 0);
      });

    this.brushGroup = brushG;

    // Restore the brushed bins at this width (suppress the event to avoid a cascade)
    if (this.brushBins) {
      this.moveBrushToBins();
      // Re-apply outside-range greying since the brush 'end' handler was suppressed
      this.applyBrushFill(bars, this.brushBins, bins.length, hasSelection);
    }
  }

  /** The bars a brushed pixel range touches: [first, last]. */
  private brushedBins([x0, x1]: [number, number], binCount: number): [number, number] {
    const start = this.xScale.invert(Math.min(x0, x1));
    const end = this.xScale.invert(Math.max(x0, x1));
    const minBin = Math.min(binCount - 1, Math.max(0, Math.floor(start + EDGE_TOLERANCE)));
    const maxBin = Math.min(binCount - 1, Math.max(minBin, Math.ceil(end - EDGE_TOLERANCE) - 1));
    return [minBin, maxBin];
  }

  /** Put the brush rectangle on the edges of the brushed bars. */
  private moveBrushToBins(): void {
    if (!this.brushBins || !this.brushGroup) return;
    const [minBin, maxBin] = this.brushBins;
    this.suppressBrushEvent = true;
    this.brushGroup.call(this.brush.move, [this.xScale(minBin), this.xScale(maxBin + 1)]);
    this.suppressBrushEvent = false;
  }

  /** Visual-only: grey out the numeric bars outside the brushed bins. */
  private applyBrushFill(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bars: d3.Selection<SVGRectElement, any, any, any>,
    [minBin, maxBin]: [number, number],
    binCount: number,
    hasSelection: boolean
  ): void {
    bars.attr('fill', (d: { bin: number }) =>
      d.bin >= minBin && d.bin <= maxBin ? (hasSelection ? '#d4d4d4' : this.getBarColor(d.bin, binCount)) : '#bdbdbd'
    );
  }

  private createTooltip(): d3.Selection<HTMLDivElement, unknown, null, undefined> {
    const container = this.histogramContainer.nativeElement;
    // Remove any previous tooltip
    d3.select(container).selectAll('.hist-tooltip').remove();

    // Append tooltip div
    const tooltip = d3
      .select(container)
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

    return tooltip;
  }

  /** Width of a numeric histogram bar: its bin less a 1 px gap, never negative. */
  private barWidth(): number {
    return Math.max(0, this.xScale(1) - this.xScale(0) - 1);
  }

  private getBarColor(bin: number, binCount: number): string {
    if (!this.colorScale || this.configuration.colorFeature !== this.property) {
      return this.defaultBarColor;
    }

    // Palettes colour the category codes in order, like the glyphs; a bar shared
    // by several categories (CLI datasets) takes the colour of its first one.
    if (this.colorScale.type === 'categorical' && this.categories?.length) {
      return paletteColor(this.colorScale, this.binToFirstCode.get(bin) ?? bin);
    }

    const t = binCount > 1 ? bin / (binCount - 1) : 0;
    return this.colorScale.scale(t);
  }

  /** Filter by the clicked bars of a categorical histogram: exactly the items counted in them. */
  private filteringFromBins(selectedBins: number[]): void {
    this.dataProvider.ensureFilter(this.categoryFilter);
    if (selectedBins.length === 0) this.categoryFilter.clear();
    else this.categoryFilter.setBins(selectedBins, Object.keys(this.histogramData).length);
    this.refreshAndRedraw();
  }

  /** Filter by the brushed bars of a numeric histogram: exactly the items counted in them. */
  private filterBins([minBin, maxBin]: [number, number], binCount: number): void {
    this.dataProvider.ensureFilter(this.filter);
    this.filter.setBinRange(minBin, maxBin, binCount);
    this.refreshAndRedraw();
  }

  /** Refresh filters and trigger a redraw, flagging it as own so this histogram doesn't react to it. */
  private refreshAndRedraw(): void {
    this.isOwnRefresh = true;
    try {
      this.dataProvider.refreshFilters();
      this.configuration.redraw();
    } finally {
      this.isOwnRefresh = false;
    }
  }

  public removeFilter() {
    this.filter.clear();
    this.isOwnRefresh = true;
    try {
      this.dataProvider.removeFilter(this.filter);
      this.configuration.redraw();
    } finally {
      this.isOwnRefresh = false;
    }
  }

  /** Per bin, how many items of the canvas selections it counts, and how many items in all. */
  private computeSelectionOverlay(): void {
    const glyphMap = this.dataProvider.getGlyphDataSync?.();
    const selections = (this.dataProvider.getFilters() as readonly ItemFilter[]).filter(
      (f): f is IdFilter => f instanceof IdFilter && !f.empty()
    );
    if (!glyphMap || !this.histogramData || selections.length === 0) {
      this.selectionCounts = null;
      this.totalCounts = null;
      return;
    }

    const binCount = Object.keys(this.histogramData).length;
    const selCounts = new Map<number, number>();
    const totCounts = new Map<number, number>();

    // Each item is counted in the bin of its normalised value, as in the histogram itself.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    glyphMap.forEach((glyph: any) => {
      const featureValue = glyph.features?.['1']?.[this.property];
      if (typeof featureValue !== 'number' || Number.isNaN(featureValue)) return;

      const bin = binOfValue(featureValue, binCount);
      totCounts.set(bin, (totCounts.get(bin) || 0) + 1);
      // Selections of several canvases add up, like in the filters.
      if (selections.some(selection => selection.inFilter(glyph))) {
        selCounts.set(bin, (selCounts.get(bin) || 0) + 1);
      }
    });

    this.selectionCounts = selCounts.size > 0 ? selCounts : null;
    this.totalCounts = totCounts.size > 0 ? totCounts : null;
  }
}
