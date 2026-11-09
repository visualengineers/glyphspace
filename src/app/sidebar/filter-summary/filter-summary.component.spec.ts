import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterSummaryComponent } from './filter-summary.component';
import { FilterService } from '../../services/filter.service';
import { ConfigService } from '../../services/config.service';
import { CategoryFilter } from '../../shared/filter/category-filter';
import { FeatureFilter } from '../../shared/filter/feature-filter';
import { IdFilter } from '../../shared/filter/id-filter';
import { TextFilter } from '../../shared/filter/text-filter';

describe('FilterSummaryComponent', () => {
  let fixture: ComponentFixture<FilterSummaryComponent>;
  let el: HTMLElement;
  let filters: FilterService;
  let config: ConfigService;

  const trigger = () => el.querySelector<HTMLButtonElement>('.trigger')!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
  const labels = () => Array.from(el.querySelectorAll('.filter-label')).map(l => l.textContent?.trim());

  function open(): void {
    trigger().click();
    fixture.detectChanges();
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterSummaryComponent);
    el = fixture.nativeElement;
    filters = TestBed.inject(FilterService);
    config = TestBed.inject(ConfigService);
    filters.clearFilters();
    fixture.componentRef.setInput('labels', { '1': 'alcohol', '2': 'quality' });
  });

  it('shows how many items match the filters', () => {
    filters.totalItems = 3000;
    filters.filteredItems = 898;
    fixture.detectChanges();

    expect(el.querySelector('.match-count')?.textContent?.replace(/\s+/g, ' ').trim()).toBe('898 / 3,000');
  });

  it('lists search terms, feature filters and the selection with their count', () => {
    const range = new FeatureFilter('1');
    range.minValue = 0.2;
    range.maxValue = 0.6;
    const text = new TextFilter(['merlot']);
    const selection = new IdFilter(['a', 'b']);
    [range, text, selection, new CategoryFilter('2')].forEach(f => filters.ensureFilter(f));
    fixture.detectChanges();

    expect(el.querySelector('.count-badge')?.textContent?.trim()).toBe('3');
    open();
    expect(labels()).toEqual(['alcohol', '“merlot”', '2 selected']);
  });

  it('removes a single filter', () => {
    const text = new TextFilter(['merlot', 'rose']);
    filters.ensureFilter(text);
    const redraw = vi.spyOn(config, 'redraw');
    fixture.detectChanges();
    open();

    el.querySelector<HTMLButtonElement>('.remove')?.click();
    fixture.detectChanges();

    expect(text.acceptableStrings).toEqual(['rose']);
    expect(redraw).toHaveBeenCalled();
    expect(labels()).toEqual(['“rose”']);
  });

  it('clears all filters, including their state', () => {
    const text = new TextFilter(['merlot']);
    filters.ensureFilter(text);
    const clearSelection = vi.spyOn(config, 'clearSelection');
    fixture.detectChanges();
    open();

    el.querySelector<HTMLButtonElement>('.clear-all')?.click();
    fixture.detectChanges();

    expect(text.empty()).toBe(true);
    expect(filters.getFilters()).toEqual([]);
    expect(clearSelection).toHaveBeenCalled();
    expect(el.querySelector('.popover')).toBeNull();
  });

  it('says when no filter is active', () => {
    fixture.detectChanges();
    open();

    expect(el.querySelector('.empty')?.textContent).toContain('No filter active');
    expect(el.querySelector<HTMLButtonElement>('.clear-all')?.disabled).toBe(true);
  });

  it('closes with Escape and returns focus to the trigger', () => {
    fixture.detectChanges();
    open();

    el.querySelector('.popover')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(el.querySelector('.popover')).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });
});
