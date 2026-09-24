import type { Mock } from 'vitest';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Step3ConfigureDataFeaturesComponent } from './step3-configure-data-features.component';
import { ConsequenceHintComponent } from './consequence-hint.component';
import { PreprocessingService } from '../../services/preprocessing.service';
import { PreprocessingState } from '../../models/preprocessing-state';
import { ColumnConfig } from '../../models/column-config';
import { ColumnStatistics, DataProfile } from '../../models/column-statistics';
import {
  DataType,
  EncodingMethod,
  MissingValueStrategy,
  OutlierMethod,
  OutlierStrategy,
  ScalingMethod,
} from '../../models/data-type.enum';
import { ToastService } from '../../../services/toast.service';
import { WizardAnnouncer } from '../../shared/wizard-announcer.service';
import { createTestPreprocessingService, createToastServiceSpy } from '../../testing/preprocessing-test-helpers';

const NAMES = ['alpha', 'beta', 'gamma'];

function makeColumn(name: string): ColumnStatistics {
  return {
    name,
    dataType: DataType.Numeric,
    count: 200,
    missingCount: 10,
    missingPercentage: 5,
    uniqueCount: 150,
    min: 12.4,
    max: 98.1,
    mean: 55.2,
    median: 50,
    q1: 40,
    q3: 60,
    stdDev: 12.1,
  };
}

function makeConfig(name: string): ColumnConfig {
  return {
    name,
    originalType: DataType.Numeric,
    targetType: DataType.Numeric,
    encodingMethod: EncodingMethod.Normalize,
    scalingMethod: ScalingMethod.MinMax,
    includeInProjection: true,
    isColorFeature: false,
    missingValueStrategy: MissingValueStrategy.RemoveRows,
    outlierMethod: OutlierMethod.IQR_1_5,
    outlierStrategy: OutlierStrategy.Remove,
    enabled: true,
    hasIssues: false,
  };
}

function makeProfile(): DataProfile {
  return {
    totalRows: 200,
    totalColumns: NAMES.length,
    fileSize: 1000,
    fileName: 'test.csv',
    columns: NAMES.map(makeColumn),
    qualityScore: 90,
    duplicateCount: 2,
    previewRows: [],
  };
}

/**
 * Step 3 template: keyboard and screen-reader semantics (WCAG 4.1.2, 1.3.1,
 * 2.1.1, 2.1.4) and the "show the consequence" helper texts. Child components
 * other than the consequence hint are stubbed so only this template is tested.
 */
describe('Step3ConfigureDataFeaturesComponent – accessibility', () => {
  let fixture: ComponentFixture<Step3ConfigureDataFeaturesComponent>;
  let host: HTMLElement;
  let announce: Mock;

  beforeEach(async () => {
    localStorage.clear();
    const service = createTestPreprocessingService({
      detectOutliers: () => Promise.resolve({ outlier_count: 4, outlier_indices: [0, 1, 2, 3] }),
      detectDuplicates: () =>
        Promise.resolve({ duplicateCount: 2, duplicateIndices: [3, 4], percentage: 1, sampleDuplicates: [{ a: 1 }] }),
    });
    (service as unknown as { updateState(u: Partial<PreprocessingState>): void }).updateState({
      rawFileName: 'test.csv',
      dataProfile: makeProfile(),
      columnConfigs: new Map(NAMES.map(name => [name, makeConfig(name)])),
    });
    const announcer = new WizardAnnouncer();
    announce = vi.spyOn(announcer, 'announce').mockImplementation(() => undefined);

    await TestBed.configureTestingModule({
      imports: [Step3ConfigureDataFeaturesComponent],
      providers: [
        { provide: PreprocessingService, useValue: service },
        { provide: ToastService, useValue: createToastServiceSpy() },
        { provide: WizardAnnouncer, useValue: announcer },
      ],
    })
      .overrideComponent(Step3ConfigureDataFeaturesComponent, {
        set: { imports: [FormsModule, ConsequenceHintComponent], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(Step3ConfigureDataFeaturesComponent);
    host = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    // Outlier and duplicate detection resolve through stubbed promises.
    await new Promise(resolve => setTimeout(resolve));
    fixture.detectChanges();
  });

  afterEach(() => localStorage.clear());

  function columnButtons(): HTMLButtonElement[] {
    return Array.from(host.querySelectorAll<HTMLButtonElement>('.column-list button.column-item'));
  }

  function byId<T extends HTMLElement>(id: string): T {
    const el = host.querySelector<T>(`#${id}`);
    if (!el) throw new Error(`#${id} not rendered`);
    return el;
  }

  /** Text a screen reader gets from aria-describedby (all referenced elements, spoken copy). */
  function description(el: HTMLElement): string {
    const ids = (el.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean);
    return ids.map(id => byId(id).querySelector('.visually-hidden')?.textContent ?? byId(id).textContent).join(' ');
  }

  it('renders every column as a real button and marks the selected one with aria-current', () => {
    const buttons = columnButtons();
    expect(buttons.map(b => b.getAttribute('type'))).toEqual(['button', 'button', 'button']);
    expect(buttons.map(b => b.getAttribute('aria-current'))).toEqual(['true', null, null]);

    buttons[1].click();
    fixture.detectChanges();

    expect(columnButtons().map(b => b.getAttribute('aria-current'))).toEqual([null, 'true', null]);
    expect(byId('step3-detail-title').textContent?.trim()).toBe('beta');
  });

  it('spells out the missing-value badge of a column button', () => {
    expect(columnButtons()[0].textContent?.replace(/\s+/g, ' ')).toContain('10 missing');
  });

  it('gives every form control an accessible name', () => {
    const controls = Array.from(host.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input, select'));
    expect(controls.length).toBeGreaterThan(5);
    for (const control of controls) {
      const name = control.getAttribute('aria-label') ?? control.labels?.[0]?.textContent?.trim() ?? '';
      expect(name, control.outerHTML.slice(0, 80)).not.toBe('');
    }
  });

  it('keeps help tooltips out of labels and gives each a topic', () => {
    const tooltips = Array.from(host.querySelectorAll('app-help-tooltip'));
    expect(tooltips.length).toBeGreaterThan(0);
    expect(host.querySelectorAll('label app-help-tooltip').length).toBe(0);
    tooltips.forEach(tooltip => expect(tooltip.getAttribute('topic')).not.toBeNull());
  });

  it('hides every Material icon ligature from assistive technology', () => {
    const icons = Array.from(host.querySelectorAll('.material-icons'));
    expect(icons.length).toBeGreaterThan(0);
    icons.forEach(icon => expect(icon.getAttribute('aria-hidden'), icon.outerHTML).toBe('true'));
  });

  it('links the scaling and encoding consequences to their selects', () => {
    expect(byId('step3-scaling-consequence').textContent).toContain('12.4 – 98.1 → 0.00 – 1.00');
    expect(description(byId('step3-scaling'))).toBe('12.4 to 98.1, becomes 0.00 to 1.00');
    expect(description(byId('step3-encoding'))).toBe('12.4 to 98.1, becomes 0.00 to 1.00');
  });

  it('states how many rows the missing-value and outlier strategies drop', () => {
    expect(description(byId('step3-missing'))).toContain('Drops 10 of 200 rows (5%) with a missing value');
    expect(description(byId('step3-outlier-strategy'))).toBe('Drops 4 rows (2%)');
  });

  it('updates the consequence when the setting changes', () => {
    const scaling = byId<HTMLSelectElement>('step3-scaling');
    scaling.value = ScalingMethod.None;
    scaling.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(host.querySelector('#step3-scaling-consequence')).toBeNull();
    expect(byId('step3-scaling').getAttribute('aria-describedby')).toBeNull();
  });

  describe('"/" shortcut', () => {
    function pressSlash(target: EventTarget): KeyboardEvent {
      const event = new KeyboardEvent('keydown', { key: '/', bubbles: true, cancelable: true });
      target.dispatchEvent(event);
      return event;
    }

    it('focuses the search field when pressed inside the step', () => {
      const event = pressSlash(columnButtons()[0]);
      expect(event.defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(host.querySelector('.search-input'));
    });

    it('is not a document-wide shortcut', () => {
      const event = pressSlash(document.body);
      expect(event.defaultPrevented).toBe(false);
      expect(document.activeElement).not.toBe(host.querySelector('.search-input'));
    });

    it('lets "/" be typed into a text field', () => {
      const search = host.querySelector('.search-input');
      if (!search) throw new Error('search input not rendered');
      expect(pressSlash(search).defaultPrevented).toBe(false);
    });
  });

  it('announces a bulk apply through the wizard announcer, not a conditional live region', () => {
    host.querySelector<HTMLButtonElement>('.btn-bulk-apply')?.click();
    fixture.detectChanges();

    expect(announce).toHaveBeenCalledExactlyOnceWith('Settings of alpha applied to 2 Numeric columns: beta, gamma');
    expect(host.querySelector('.bulk-result')).not.toBeNull();
    expect(host.querySelector('.bulk-result[role="status"]')).toBeNull();
  });

  it('exposes the expanded state of the disclosure buttons', () => {
    const toggle = host.querySelector<HTMLButtonElement>('.duplicates-section .btn-text');
    const bulk = host.querySelector<HTMLButtonElement>('.btn-bulk-toggle');
    if (!toggle || !bulk) throw new Error('disclosure buttons not rendered');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');

    toggle.click();
    bulk.click();
    fixture.detectChanges();

    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(byId(toggle.getAttribute('aria-controls') ?? '')).toBeTruthy();
    expect(bulk.getAttribute('aria-expanded')).toBe('true');
    expect(byId(bulk.getAttribute('aria-controls') ?? '')).toBeTruthy();
  });

  it('labels the clear-search button and returns focus to the field', () => {
    const search = host.querySelector<HTMLInputElement>('.search-input');
    if (!search) throw new Error('search input not rendered');
    search.value = 'al';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const clear = host.querySelector<HTMLButtonElement>('.clear-search');
    expect(clear?.getAttribute('aria-label')).toBe('Clear search');
    clear?.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.filterText).toBe('');
    expect(document.activeElement).toBe(search);
  });

  // Regression: `[value]` on a <select> is applied before its @for options exist,
  // so the browser fell back to the first option ("None") while the stored
  // setting was e.g. Normalize — the dropdown showed a setting that wasn't in effect.
  it('shows the stored setting in every per-column dropdown', () => {
    const shown = (id: string) => (host.querySelector(`#${id}`) as HTMLSelectElement).value;

    expect(shown('step3-encoding')).toBe(EncodingMethod.Normalize);
    expect(shown('step3-scaling')).toBe(ScalingMethod.MinMax);
    expect(shown('step3-missing')).toBe(MissingValueStrategy.RemoveRows);
    expect(shown('step3-outlier-method')).toBe(OutlierMethod.IQR_1_5);
    expect(shown('step3-outlier-strategy')).toBe(OutlierStrategy.Remove);
  });
});
