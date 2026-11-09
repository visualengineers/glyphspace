import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FiltersTabComponent } from './filters-tab.component';
import { HistogramComponent } from '../histogram/histogram.component';
import { FilterService } from '../../services/filter.service';
import { GlyphType } from '../../shared/enum/glyph-type';
import { TextFilter } from '../../shared/filter/text-filter';
import { FeaturesData } from '../../shared/interfaces/glyph-meta';
import { MAX_GLYPH_AXES } from '../../glyph/glyph-axes';

const IDS = Array.from({ length: 10 }, (_, i) => `${i + 1}`);
const FEATURES: FeaturesData = Object.fromEntries(
  IDS.map(id => [id, { type: 'numeric', histogram: {}, max: 1, min: 0, median: 0.5, variance: 0, deviation: 0 }])
);
const LABELS = Object.fromEntries(IDS.map(id => [id, `feature ${id}`]));

describe('FiltersTabComponent', () => {
  let fixture: ComponentFixture<FiltersTabComponent>;
  let el: HTMLElement;
  let added: string[];
  let removed: string[];

  function show(axes: string[], glyphType = GlyphType.Flower): void {
    fixture.componentRef.setInput('axes', axes);
    fixture.componentRef.setInput('glyphType', glyphType);
    fixture.detectChanges();
  }

  /** Glyph icon button of the card of a feature. */
  function icon(featureId: string): HTMLButtonElement | null {
    const card = Array.from(el.querySelectorAll('.filter-card')).find(
      c => c.getAttribute('aria-label') === LABELS[featureId]
    );
    return card?.querySelector<HTMLButtonElement>('.glyph-toggle') ?? null;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FiltersTabComponent] })
      .overrideComponent(FiltersTabComponent, {
        remove: { imports: [HistogramComponent] },
        add: { schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
    fixture = TestBed.createComponent(FiltersTabComponent);
    el = fixture.nativeElement;
    fixture.componentRef.setInput('features', FEATURES);
    fixture.componentRef.setInput('featureIds', IDS);
    fixture.componentRef.setInput('labels', LABELS);
    added = [];
    removed = [];
    fixture.componentInstance.axisAdded.subscribe(id => added.push(id));
    fixture.componentInstance.axisRemoved.subscribe(id => removed.push(id));
  });

  it('marks glyph features with a pressed icon and their axis number', () => {
    show(['3', '1', '2', '5']);

    expect(icon('1')?.getAttribute('aria-pressed')).toBe('true');
    expect(icon('1')?.querySelector('.axis-number')?.textContent).toBe('2');
    expect(icon('4')?.getAttribute('aria-pressed')).toBe('false');
    expect(icon('4')?.querySelector('.axis-number')).toBeNull();
  });

  it('draws the icon of the selected glyph type', () => {
    show(['1', '2', '3'], GlyphType.Star);
    const starIcon = icon('1')?.querySelector('.shape')?.getAttribute('d');

    show(['1', '2', '3'], GlyphType.Flower);
    const flowerIcon = icon('1')?.querySelector('.shape')?.getAttribute('d');

    expect(starIcon).toBeTruthy();
    expect(flowerIcon).not.toBe(starIcon);
  });

  it('shows no glyph icons for image glyphs', () => {
    show(['1', '2', '3'], GlyphType.Thumb);

    expect(el.querySelectorAll('.glyph-toggle').length).toBe(0);
    expect(el.querySelectorAll('.filter-card').length).toBe(IDS.length);
  });

  it('removes a glyph feature or adds another one from its icon', () => {
    show(['1', '2', '3', '4']);

    icon('2')?.click();
    icon('7')?.click();

    expect(removed).toEqual(['2']);
    expect(added).toEqual(['7']);
  });

  it('keeps the axis limits and explains them', () => {
    show(['1', '2', '3']);
    expect(icon('1')?.getAttribute('aria-disabled')).toBe('true');
    icon('1')?.click();

    show(IDS.slice(0, MAX_GLYPH_AXES));
    expect(icon('10')?.title).toContain(`at most ${MAX_GLYPH_AXES} axes`);
    icon('10')?.click();

    expect(removed).toEqual([]);
    expect(added).toEqual([]);
  });

  it('adds a search term as text filter', () => {
    show(['1', '2', '3']);
    const input = el.querySelector<HTMLInputElement>('.search input')!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    input.value = 'Merlot';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    const textFilter = TestBed.inject(FilterService)
      .getFilters()
      .find(f => f instanceof TextFilter) as TextFilter | undefined;
    expect(textFilter?.acceptableStrings).toEqual(['merlot']);
  });
});
