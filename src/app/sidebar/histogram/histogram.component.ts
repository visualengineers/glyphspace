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
} from '@angular/core';
import * as d3 from 'd3';
import { ItemFilter } from '../../shared/filter/item-filter';
import { FeatureFilter } from '../../shared/filter/feature-filter';
import { IdFilter } from '../../shared/filter/id-filter';
import { FilterMode } from '../../shared/enum/filter-mode';
import { Subscription } from 'rxjs';
import { COLOR_SCALES, ColorScale } from '../../shared/interfaces/color-scale';
import { CategoryFilter } from '../../shared/filter/category-filter';
import { InteractionCommand } from '../../shared/enum/interaction-command';
import { Histogram, StackedBin } from '../../shared/types/histogram.types';
import {
  prepareStackedBinsFromObject,
  getEffectiveHistogramType,
  formatBinTooltip,
} from '../../shared/utils/histogram.utils';

@Component({
  selector: 'app-histogram',
  templateUrl: './histogram.component.html',
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

  private filter!: ItemFilter;
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
  private brushSelection: [number, number] | null = null;
  private selectedBins = new Set<number>();
  private cachedStackedBins: StackedBin[] | null = null;
  private binToCategory = new Map<number, string>();

  private selectionCounts: Map<number, number> | null = null;
  private totalCounts: Map<number, number> | null = null;
  private selectionHighlightColor = 'rgba(59, 130, 246, 0.85)';
  private isOwnRedraw = false;
  private suppressBrushEvent = false;

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
        this.colorScale = COLOR_SCALES.find(cs => cs.id === this.configuration.colorRange) || COLOR_SCALES[0];
        this.updateChart();
      })
    );
    this.configSub.add(
      this.configuration.loadedDataSubject$.subscribe(() => {
        this.brushSelection = null;
        this.selectedBins.clear();
        this.selectionCounts = null;
        this.totalCounts = null;
      })
    );
    this.configSub.add(
      this.configuration.commandSubject$.subscribe((command: InteractionCommand) => {
        if (command === InteractionCommand.clearselection) {
          this.brushSelection = null;
          this.selectedBins.clear();
          this.selectionCounts = null;
          this.updateChart();
        } else if (command === InteractionCommand.redraw && !this.isOwnRedraw) {
          // Clear brush/selection visuals if filter was externally cleared
          if (this.filter.empty() && this.brushSelection) {
            this.brushSelection = null;
          }
          if (this.categoryFilter.empty() && this.selectedBins.size > 0) {
            this.selectedBins.clear();
          }
          this.computeSelectionOverlay();
          this.updateChart();
        }
      })
    );
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
    this.width = container.clientWidth - this.margin.left - this.margin.right;
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
    if (!this.svg || !this.histogramData) return;

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
    this.brushSelection = null;

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
      .attr('width', (d: { x1: number; x0: number }) => d.x1 - d.x0)
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
        .attr('width', (d: StackedBin) => d.x1 - d.x0)
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
    if (!this.categories?.length) return;

    const nonZeroBins = Object.entries(this.histogramData)
      .filter(([, v]) => v !== 0)
      .map(([k]) => +k);

    // Optional safety check
    if (nonZeroBins.length !== this.categories.length) {
      console.warn('Histogram/category length mismatch', nonZeroBins.length, this.categories.length);
    }

    nonZeroBins.forEach((bin, i) => {
      if (this.categories && this.categories[i] !== undefined) {
        this.binToCategory.set(bin, this.categories[i]);
      }
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
      .attr('width', this.xScale(1) - this.xScale(0) - 1)
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
        .attr('width', this.xScale(1) - this.xScale(0) - 1)
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
        // save the current selection
        this.brushSelection = selection;

        if (!selection) {
          bars.attr('fill', (d: { bin: number }) => (hasSelection ? '#d4d4d4' : this.getBarColor(d.bin, bins.length)));

          this.removeFilter();
          return;
        }
        const [x0, x1] = selection;
        const minBin = Math.round(this.xScale.invert(x0));
        const maxBin = Math.round(this.xScale.invert(x1));

        bars.attr('fill', (d: { bin: number }) =>
          d.bin >= minBin && d.bin <= maxBin
            ? hasSelection
              ? '#d4d4d4'
              : this.getBarColor(d.bin, bins.length)
            : '#bdbdbd'
        );

        this.filtering(selection);
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

    // restore previous selection if it exists (suppress event to avoid cascade)
    if (this.brushSelection) {
      this.suppressBrushEvent = true;
      brushG.call(this.brush.move, this.brushSelection);
      this.suppressBrushEvent = false;

      // Re-apply outside-range greying since the brush 'end' handler was suppressed
      const [x0, x1] = this.brushSelection;
      const minBin = Math.round(this.xScale.invert(x0));
      const maxBin = Math.round(this.xScale.invert(x1));
      bars.attr('fill', (d: { bin: number }) =>
        d.bin >= minBin && d.bin <= maxBin
          ? hasSelection
            ? '#d4d4d4'
            : this.getBarColor(d.bin, bins.length)
          : '#bdbdbd'
      );
    }
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

  private getBarColor(bin: number, binCount: number): string {
    if (!this.colorScale || this.configuration.colorFeature !== this.property) {
      return this.defaultBarColor;
    }

    const t = binCount > 1 ? bin / (binCount - 1) : 0;
    return this.colorScale.scale(t);
  }

  private filteringFromBins(selectedBins: number[]): void {
    this.dataProvider.ensureFilter(this.filter);
    this.dataProvider.ensureFilter(this.categoryFilter);

    if (!selectedBins || selectedBins.length === 0) {
      this.categoryFilter.clear();
      this.filter.clear();
      this.refreshAndRedraw();
      return;
    }

    const effectiveType = this.getEffectiveType();
    const totalBins = Object.keys(this.histogramData).length;

    // Clear both filters upfront so the unused one doesn't interfere
    // (FeatureFilter defaults minValue=0/maxValue=0 which is NOT empty)
    this.categoryFilter.clear();
    this.filter.clear();

    if (effectiveType === 'categorical') {
      // Glyph feature values are ALWAYS stored in normalized [0,1] space (both
      // process.py and the wizard normalize before storing). Histogram bins are
      // uniformly distributed across the bin index range, so bin n corresponds to
      // normalized value range [n/totalBins, (n+1)/totalBins].
      //
      // This works for:
      //   - process.py output (20 fixed bins, multiple categories may share a bin)
      //   - wizard uploads (one bin per category, N bins for N categories)
      //   - any future normalized-data binning scheme
      const binWidth = 1 / totalBins;
      const epsilon = binWidth * 1e-6;

      selectedBins.forEach(bin => {
        const filterMin = bin * binWidth - epsilon;
        const filterMax = (bin + 1) * binWidth + epsilon;
        this.categoryFilter.addRange(filterMin, filterMax);
      });
    } else {
      // For numeric: Filter by continuous range
      // Bins represent ranges of continuous values
      const steps = 1 / totalBins;

      selectedBins.forEach(bin => {
        (this.filter as FeatureFilter).minValue = bin * steps;
        (this.filter as FeatureFilter).maxValue = Math.min((bin + 1) * steps, 1.0);
      });
    }

    this.refreshAndRedraw();
  }

  private filtering(selection: [number, number]): void {
    if (selection === null || selection === undefined) {
      return;
    }

    this.dataProvider.ensureFilter(this.filter);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- selection is a non-empty [number, number] tuple at this point
    const absoluteMinValue: number = +d3.min(selection)!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- selection is a non-empty [number, number] tuple at this point
    const absoluteMaxValue: number = +d3.max(selection)!;

    const relativeMinValue: number = absoluteMinValue / this.width;
    const relativeMaxValue: number = absoluteMaxValue / this.width;

    // TODO: Workaround because data is not bound to actual bars in chart

    const steps = 1 / Object.keys(this.histogramData).length;
    const minValue = Math.floor(relativeMinValue / steps) * steps;
    const maxValue = (Math.floor(relativeMaxValue / steps) + 1) * steps;

    (this.filter as FeatureFilter).minValue = minValue;
    (this.filter as FeatureFilter).maxValue = Math.min(maxValue, 1.0);

    this.refreshAndRedraw();
  }

  /** Refresh filters and trigger a redraw, flagging it as own to prevent cascading. */
  private refreshAndRedraw(): void {
    this.dataProvider.refreshFilters();
    this.isOwnRedraw = true;
    this.configuration.redraw();
    this.isOwnRedraw = false;
  }

  public removeFilter() {
    this.filter.clear();
    const pos = this.dataProvider.getFilters().indexOf(this.filter);
    if (pos >= 0) this.dataProvider.getFilters().splice(pos, 1);
    this.refreshAndRedraw();
  }

  private computeSelectionOverlay(): void {
    const glyphMap = this.dataProvider.getGlyphDataSync?.();
    if (!glyphMap || !this.histogramData) {
      this.selectionCounts = null;
      this.totalCounts = null;
      return;
    }

    const idFilter = this.dataProvider.getFilters().find((f: ItemFilter) => f instanceof IdFilter && !f.empty()) as
      | IdFilter
      | undefined;

    if (!idFilter) {
      this.selectionCounts = null;
      this.totalCounts = null;
      return;
    }

    const totalBins = Object.keys(this.histogramData).length;
    const selCounts = new Map<number, number>();
    const totCounts = new Map<number, number>();

    const effectiveType = this.getEffectiveType();

    // Detect value range (shared by both categorical and numeric paths)
    let vMin = Infinity,
      vMax = -Infinity;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    glyphMap.forEach((glyph: any) => {
      const v = glyph.features?.['1']?.[this.property];
      if (v != null && !isNaN(v)) {
        if (v < vMin) vMin = v;
        if (v > vMax) vMax = v;
      }
    });
    const vRange = vMax - vMin || 1;

    // Categorical-only: precompute non-zero bin mapping
    let nonZeroBins: number[] = [];
    let numCategories = 0;
    if (effectiveType === 'categorical') {
      nonZeroBins = Object.entries(this.histogramData)
        .filter(([, v]) => v !== 0)
        .map(([k]) => +k)
        .sort((a, b) => a - b);
      numCategories = nonZeroBins.length;
    }

    // Single pass: assign each glyph to a bin and tally counts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    glyphMap.forEach((glyph: any) => {
      const featureValue = glyph.features?.['1']?.[this.property];
      if (featureValue == null || isNaN(featureValue)) return;

      const normalized = (featureValue - vMin) / vRange;
      let bin: number;

      if (effectiveType === 'categorical') {
        const catIdx = numCategories <= 1 ? 0 : Math.round(normalized * (numCategories - 1));
        if (catIdx < 0 || catIdx >= nonZeroBins.length) return;
        bin = nonZeroBins[catIdx];
      } else {
        bin = Math.min(Math.floor(normalized * totalBins), totalBins - 1);
      }

      totCounts.set(bin, (totCounts.get(bin) || 0) + 1);
      if (idFilter.inFilter(glyph)) {
        selCounts.set(bin, (selCounts.get(bin) || 0) + 1);
      }
    });

    this.selectionCounts = selCounts.size > 0 ? selCounts : null;
    this.totalCounts = totCounts.size > 0 ? totCounts : null;
  }
}
