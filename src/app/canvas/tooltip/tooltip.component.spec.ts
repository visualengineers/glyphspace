import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TooltipComponent, buildTooltipRows } from './tooltip.component';
import { ConfigService } from '../../services/config.service';

describe('buildTooltipRows', () => {
  it('labels each value and marks missing ones', () => {
    const rows = buildTooltipRows({ '1': '7.4', '2': '', '3': 'nan', '4': '0' }, { '1': 'acidity', '2': 'sugar' });

    expect(rows).toEqual([
      { key: '1', label: 'acidity', value: '7.4' },
      { key: '2', label: 'sugar', value: null },
      { key: '3', label: '3', value: null },
      { key: '4', label: '4', value: '0' },
    ]);
  });
});

describe('TooltipComponent', () => {
  let fixture: ComponentFixture<TooltipComponent>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TooltipComponent],
      providers: [
        { provide: ConfigService, useValue: { modalOpen: false, featureLabels: {}, modalOpenSubject$: of(false) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(TooltipComponent);
    host = fixture.nativeElement as HTMLElement;
  });

  // Regression: values, labels and ids come from uploaded CSV files and were
  // interpolated into HTML trusted via bypassSecurityTrustHtml (stored XSS).
  it('renders CSV content as text, never as markup', () => {
    const payload = '<img src=x onerror="window.__xss = true">';
    fixture.componentInstance.tooltipInfo = {
      id: payload,
      rows: [{ key: '1', label: payload, value: payload }],
      metadataRows: [{ key: '1', label: payload, value: payload }],
    };
    fixture.componentInstance.tooltipVisible = true;
    fixture.detectChanges();

    expect(host.querySelector('img')).toBeNull();
    expect(host.textContent).toContain(payload);
  });

  it('shows "missing" instead of a value for missing entries', () => {
    fixture.componentInstance.tooltipInfo = {
      id: 'a',
      rows: [{ key: '1', label: 'sugar', value: null }],
      metadataRows: [],
    };
    fixture.componentInstance.tooltipVisible = true;
    fixture.detectChanges();

    const cell = host.querySelector('td');
    expect(cell?.textContent?.trim()).toBe('missing');
    expect(cell?.classList).toContain('missing');
  });

  it('lists the metadata columns after the features, in their own group', () => {
    fixture.componentInstance.tooltipInfo = {
      id: 'brie',
      rows: [{ key: '1', label: 'fat', value: '45' }],
      metadataRows: [
        { key: '1', label: 'flavor', value: 'buttery, nutty' },
        { key: '2', label: 'producer', value: null },
      ],
    };
    fixture.componentInstance.tooltipVisible = true;
    fixture.detectChanges();

    const groups = Array.from(host.querySelectorAll('tbody'));
    expect(groups.length).toBe(2);
    expect(groups[1].classList).toContain('metadata');
    const metadata = Array.from(groups[1].querySelectorAll('tr')).map(row => row.textContent?.trim());
    expect(metadata).toEqual(['flavorbuttery, nutty', 'producermissing']);
  });

  it('has no metadata group when the item has no metadata', () => {
    fixture.componentInstance.tooltipInfo = {
      id: 'a',
      rows: [{ key: '1', label: 'fat', value: '45' }],
      metadataRows: [],
    };
    fixture.componentInstance.tooltipVisible = true;
    fixture.detectChanges();

    expect(host.querySelector('tbody.metadata')).toBeNull();
  });
});
