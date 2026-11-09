import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistogramComponent } from './histogram.component';
import { ConfigService } from '../../services/config.service';
import { FilterService } from '../../services/filter.service';

/** 20 numeric bins, as the sidebar gets them from the dataset meta. */
const HISTOGRAM = Object.fromEntries(Array.from({ length: 20 }, (_, i) => [String(i), (i % 7) + 1]));

describe('HistogramComponent', () => {
  let fixture: ComponentFixture<HistogramComponent>;
  let host: HTMLElement;

  const bars = () => Array.from(host.querySelectorAll<SVGRectElement>('rect.bar'));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistogramComponent);
    host = fixture.nativeElement;
    host.style.width = '300px';
    fixture.componentRef.setInput('configuration', TestBed.inject(ConfigService));
    fixture.componentRef.setInput('dataProvider', TestBed.inject(FilterService));
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
});
