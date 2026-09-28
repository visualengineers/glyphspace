import type { Mock } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Step2ColumnSelectionComponent } from './step2-column-selection.component';
import { PreprocessingService } from '../../services/preprocessing.service';
import { ColumnStatistics, DataProfile } from '../../models/column-statistics';
import { ColumnConfig } from '../../models/column-config';
import { PreprocessingState } from '../../models/preprocessing-state';
import { DataType } from '../../models/data-type.enum';
import { createTestPreprocessingService } from '../../testing/preprocessing-test-helpers';

/**
 * Step 2 shift-click range selection. The anchor of a range is the last clicked
 * column; it must stay correct even when the search/type filter changes between
 * the anchor click and the shift-click (the visible list is re-indexed then).
 */
describe('Step2ColumnSelectionComponent – shift-click range selection', () => {
  let component: Step2ColumnSelectionComponent;
  let service: PreprocessingService;
  let setEnabled: Mock;

  function column(name: string, dataType: DataType): ColumnStatistics {
    return { name, dataType, count: 10, missingCount: 0, missingPercentage: 0, uniqueCount: 10 };
  }

  /** Simulate a checkbox click (records Shift) followed by the native change event. */
  function clickRow(name: string, checked: boolean, shiftKey = false): void {
    const index = component.filteredColumns.findIndex(col => col.name === name);
    component.onCheckboxClick({ shiftKey } as MouseEvent);
    component.onCheckboxChange(index, name, { target: { checked } } as unknown as Event);
  }

  beforeEach(() => {
    localStorage.clear();
    service = createTestPreprocessingService();
    component = new Step2ColumnSelectionComponent(service);
    component.columns = [
      column('n1', DataType.Numeric),
      column('t1', DataType.Text),
      column('n2', DataType.Numeric),
      column('t2', DataType.Text),
      column('n3', DataType.Numeric),
    ];
    setEnabled = vi.spyOn(service, 'setColumnsEnabled').mockImplementation(() => undefined);
  });

  afterEach(() => localStorage.clear());

  it('applies the new state to the inclusive range between anchor and shift-click', () => {
    clickRow('t1', false);
    clickRow('n3', false, true);

    expect(setEnabled.mock.lastCall).toEqual([['t1', 'n2', 't2', 'n3'], false]);
  });

  it('resolves the anchor in the re-filtered list when the filter changes between clicks', () => {
    clickRow('n2', true); // anchor at index 2 of the unfiltered list
    component.filterType = DataType.Numeric; // n2 is now at index 1 (n1, n2, n3)

    clickRow('n3', true, true);

    expect(setEnabled.mock.lastCall).toEqual([['n2', 'n3'], true]);
  });

  it('treats the shift-click as a plain click when the anchor is filtered out', () => {
    clickRow('t1', false);
    component.filterType = DataType.Numeric; // t1 is no longer visible

    clickRow('n3', false, true);

    expect(setEnabled.mock.lastCall).toEqual([['n3'], false]);
  });
});

/**
 * Rendered Step 2: accessible names of the row checkboxes and the search
 * controls, the visible Shift-click hint, and the "/" shortcut that is only
 * active while focus is inside the step (WCAG 2.1.4).
 */
describe('Step2ColumnSelectionComponent – accessibility (rendered)', () => {
  let fixture: ComponentFixture<Step2ColumnSelectionComponent>;
  let el: HTMLElement;
  let outside: HTMLButtonElement;

  function column(name: string): ColumnStatistics {
    return { name, dataType: DataType.Numeric, count: 10, missingCount: 0, missingPercentage: 0, uniqueCount: 10 };
  }

  function query<T extends HTMLElement>(selector: string): T {
    const found = el.querySelector<T>(selector);
    if (!found) throw new Error(`${selector} not rendered`);
    return found;
  }

  function pressSlash(target: EventTarget): KeyboardEvent {
    const event = new KeyboardEvent('keydown', { key: '/', bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    return event;
  }

  beforeEach(async () => {
    localStorage.clear();
    const service = createTestPreprocessingService();
    const columns = [column('alcohol'), column('pH')];
    const dataProfile = {
      fileName: 'wine.csv',
      fileSize: 10,
      totalRows: 10,
      totalColumns: 2,
      columns,
      qualityScore: 100,
      duplicateCount: 0,
      previewRows: [],
    } as DataProfile;
    const columnConfigs = new Map(columns.map(c => [c.name, { name: c.name, enabled: true } as ColumnConfig]));
    (service as unknown as { updateState(u: Partial<PreprocessingState>): void }).updateState({
      dataProfile,
      columnConfigs,
    });

    await TestBed.configureTestingModule({
      imports: [Step2ColumnSelectionComponent],
      providers: [{ provide: PreprocessingService, useValue: service }],
    }).compileComponents();
    fixture = TestBed.createComponent(Step2ColumnSelectionComponent);
    el = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();

    outside = document.createElement('button');
    document.body.appendChild(outside);
  });

  afterEach(() => {
    outside.remove();
    localStorage.clear();
  });

  it('names every row checkbox after its column', () => {
    const labels = Array.from(el.querySelectorAll('tbody input[type="checkbox"]')).map(cb =>
      cb.getAttribute('aria-label')
    );
    expect(labels).toEqual(['Include alcohol', 'Include pH']);
  });

  it('shows the Shift-click hint as visible text instead of a checkbox title', () => {
    expect(query('.selection-tip').textContent?.trim()).toBe('Tip: Shift-click to select a range');
    expect(el.querySelector('tbody input[type="checkbox"][title]')).toBeNull();
  });

  it('labels the search field, the type filter and the clear-search button', () => {
    const search = query<HTMLInputElement>('.search-input');
    expect(search.getAttribute('aria-label')).toBe('Search columns');
    expect(query('.filter-select').getAttribute('aria-label')).toBe('Filter by data type');

    fixture.componentInstance.searchTerm = 'alc';
    fixture.detectChanges();
    const clear = query<HTMLButtonElement>('.clear-search');
    expect(clear.getAttribute('aria-label')).toBe('Clear search');

    clear.click();
    expect(fixture.componentInstance.searchTerm).toBe('');
    expect(document.activeElement).toBe(search);
  });

  it('marks the table headers as column headers', () => {
    const headers = Array.from(el.querySelectorAll('thead th'));
    expect(headers.length).toBeGreaterThan(0);
    headers.forEach(th => expect(th.getAttribute('scope')).toBe('col'));
  });

  it('focuses the search field on "/" pressed inside the step (e.g. on a row checkbox)', () => {
    const checkbox = query<HTMLInputElement>('tbody input[type="checkbox"]');
    checkbox.focus();

    const event = pressSlash(checkbox);

    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(query('.search-input'));
  });

  it('ignores "/" pressed outside the step (no document-wide single-key shortcut)', () => {
    outside.focus();

    const event = pressSlash(outside);

    expect(event.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(outside);
  });

  it('lets "/" be typed into a text field', () => {
    const search = query<HTMLInputElement>('.search-input');
    search.focus();

    const event = pressSlash(search);

    expect(event.defaultPrevented).toBe(false);
  });
});
