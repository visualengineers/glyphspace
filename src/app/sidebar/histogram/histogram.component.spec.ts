import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as d3 from 'd3';
import { HistogramComponent } from './histogram.component';
import { ConfigService } from '../../services/config.service';
import { FilterService } from '../../services/filter.service';
import { GlyphObject } from '../../glyph/glyph-object';
import { FeatureFilter } from '../../shared/filter/feature-filter';
import { CategoryFilter } from '../../shared/filter/category-filter';
import { IdFilter } from '../../shared/filter/id-filter';
import { FilterMode } from '../../shared/enum/filter-mode';
import { StackedBin } from '../../shared/types/histogram.types';

/** 20 numeric bins, as the sidebar gets them from the dataset meta. */
const HISTOGRAM = Object.fromEntries(Array.from({ length: 20 }, (_, i) => [String(i), (i % 7) + 1]));

/** 25 food groups as in the bundled nutrients dataset, whose CLI histogram has 20 bins. */
const FOOD_GROUPS = [
  'Baby Foods',
  'Baked Products',
  'Beef Products',
  'Beverages',
  'Breakfast Cereals',
  'Cereal Grains and Pasta',
  'Dairy and Egg Products',
  'Ethnic Foods',
  ...Array.from({ length: 17 }, (_, i) => `Group ${i + 8}`),
];

interface BrushAccess {
  brush: d3.BrushBehavior<unknown>;
  brushGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
}

function glyph(id: string, value: number): GlyphObject {
  const item = new GlyphObject(id);
  item.features = { '1': { '1': value } };
  return item;
}

describe('HistogramComponent', () => {
  let fixture: ComponentFixture<HistogramComponent>;
  let host: HTMLElement;
  let filters: FilterService;
  let config: ConfigService;

  const bars = () => Array.from(host.querySelectorAll<SVGRectElement>('rect.bar'));
  const barOf = (bin: number) =>
    bars().find(bar => d3.select<SVGRectElement, StackedBin>(bar).datum().bin === bin) as SVGRectElement;
  const featureFilter = () => filters.getFilters().find(f => f instanceof FeatureFilter) as FeatureFilter | undefined;
  const brushOf = () => fixture.componentInstance as unknown as BrushAccess;
  const brushShown = () => host.querySelector<SVGRectElement>('.brush .selection')?.style.display !== 'none';

  beforeEach(() => {
    fixture = TestBed.createComponent(HistogramComponent);
    host = fixture.nativeElement;
    host.style.width = '300px';
    filters = TestBed.inject(FilterService);
    config = TestBed.inject(ConfigService);
    fixture.componentRef.setInput('configuration', config);
    fixture.componentRef.setInput('dataProvider', filters);
    fixture.componentRef.setInput('histogramData', HISTOGRAM);
    fixture.componentRef.setInput('type', 'numeric');
    fixture.componentRef.setInput('property', '1');
    fixture.componentRef.setInput('label', 'alcohol');
  });

  it('draws one bar per bin with a positive width', () => {
    fixture.detectChanges();

    expect(bars().length).toBe(20);
    expect(bars().every(bar => Number(bar.getAttribute('width')) > 0)).toBe(true);
  });

  // Histograms of an inactive sidebar tab are created without a width; their
  // bars got negative widths, which the browser reports as invalid SVG.
  it('draws nothing while hidden and the bars once it is shown', async () => {
    host.style.display = 'none';
    fixture.detectChanges();

    expect(bars()).toEqual([]);

    host.style.display = 'block';
    await vi.waitFor(() => expect(bars().length).toBe(20));
    expect(bars().every(bar => Number(bar.getAttribute('width')) > 0)).toBe(true);
  });

  describe('brush', () => {
    // 288 px for 20 bins: 14.4 px per bar.
    const BAR = 14.4;

    beforeEach(() => {
      filters.setActiveGlyphData(new Map([0.17, 0.2, 0.35, 0.39, 0.4].map((v, i) => [String(i), glyph(String(i), v)])));
      fixture.detectChanges();
    });

    // Regression: the bars were greyed by rounding the brush ends, the filter by
    // flooring them, and the filter's range was closed: brushing from the middle
    // of bar 3 to the middle of bar 7 coloured bars 4–8 and filtered bars 3–7
    // plus the items on bar 8's lower edge.
    it('selects every bar it touches, snaps to them and filters exactly their items', () => {
      const { brush, brushGroup } = brushOf();

      brushGroup.call(brush.move, [3.5 * BAR, 7.5 * BAR]);

      expect([featureFilter()?.minBin, featureFilter()?.maxBin]).toEqual([3, 7]);
      const coloured = bars()
        .filter(bar => bar.getAttribute('fill') !== '#bdbdbd')
        .map(bar => d3.select<SVGRectElement, { bin: number }>(bar).datum().bin);
      expect(coloured).toEqual([3, 4, 5, 6, 7]);
      const selection = host.querySelector('.brush .selection');
      expect(Number(selection?.getAttribute('x'))).toBeCloseTo(3 * BAR);
      expect(Number(selection?.getAttribute('width'))).toBeCloseTo(5 * BAR);
      // 0.4 is the first value of bin 8; 0.17 lies in bin 3, 0.39 in bin 7.
      expect(filters.filteredItems).toBe(4);
    });

    it('keeps the brushed bars when the histogram is resized', async () => {
      const { brush, brushGroup } = brushOf();
      brushGroup.call(brush.move, [3.5 * BAR, 7.5 * BAR]);

      host.style.width = '160px'; // 148 px: 7.4 px per bar

      await vi.waitFor(() =>
        expect(Number(host.querySelector('.brush .selection')?.getAttribute('x'))).toBeCloseTo(3 * 7.4)
      );
      expect(Number(host.querySelector('.brush .selection')?.getAttribute('width'))).toBeCloseTo(5 * 7.4);
    });

    // Regression: removing a canvas selection sent clearSelection, which made the
    // brush vanish while its filter kept applying.
    it('keeps the brush while its filter is active, and drops it when the filter is cleared elsewhere', () => {
      const { brush, brushGroup } = brushOf();
      brushGroup.call(brush.move, [3.5 * BAR, 7.5 * BAR]);

      config.clearSelection();
      expect(brushShown()).toBe(true);

      filters.clearFilters();
      expect(featureFilter()).toBeUndefined();
      expect(brushShown()).toBe(false);
    });
  });

  describe('categorical, with categories sharing the fixed bins', () => {
    beforeEach(() => {
      const allBins = Object.fromEntries(Array.from({ length: 20 }, (_, i) => [String(i), 1]));
      fixture.componentRef.setInput('histogramData', allBins);
      fixture.componentRef.setInput('type', 'categorical');
      fixture.componentRef.setInput('categories', FOOD_GROUPS);
      // Category code c of 25 is the normalised value c / 24.
      const items = [5, 6, 7].map(code => glyph(FOOD_GROUPS[code], code / 24));
      filters.setActiveGlyphData(new Map(items.map(item => [item.id, item])));
      fixture.detectChanges();
    });

    // Regression: bar n was labelled with the n-th category ("Baked Products" on
    // the bar of "Beef Products").
    it('names the categories of each bar in its tooltip', () => {
      barOf(5).dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));

      expect(host.querySelector('.hist-tooltip')?.textContent).toBe('Dairy and Egg Products, Ethnic Foods');
    });

    // Regression: a click also selected the category on the bar's upper edge,
    // which belongs to the next bar.
    it('selects exactly the items of the clicked bar', () => {
      barOf(4).dispatchEvent(new MouseEvent('click', { bubbles: true }));

      const filter = filters.getFilters().find(f => f instanceof CategoryFilter) as CategoryFilter;
      expect([...filter.selectedBins]).toEqual([4]);
      expect(filters.filteredItems).toBe(1);
      expect(filters.getGlyphDataSync()?.get('Cereal Grains and Pasta')?.passive).toBe(false);
      expect(filters.getGlyphDataSync()?.get('Dairy and Egg Products')?.passive).toBe(true);
    });

    // Regression: the overlay mapped items through the order of the non-empty
    // bins and put them on the wrong bars.
    it('marks the selected items on the bars that count them', () => {
      const selection = new IdFilter(['Dairy and Egg Products', 'Ethnic Foods']);
      selection.filterMode = FilterMode.Or;
      filters.ensureFilter(selection);
      filters.refreshFilters();

      const overlays = Array.from(host.querySelectorAll<SVGRectElement>('rect.selection-overlay'));
      expect(overlays.map(o => d3.select<SVGRectElement, StackedBin>(o).datum().bin)).toEqual([5]);
    });
  });

  // Regression: every configuration change rebuilt every histogram, once per
  // animation frame while the size slider was dragged.
  it('redraws on configuration changes only when the colours change', () => {
    fixture.detectChanges();
    const before = bars()[0];

    config.getConfiguration().itemSize = 12;
    config.updateConfiguration();
    expect(before.isConnected).toBe(true);

    config.colorFeature = '1';
    config.updateConfiguration();
    expect(before.isConnected).toBe(false);
    expect(bars().length).toBe(20);
  });
});
