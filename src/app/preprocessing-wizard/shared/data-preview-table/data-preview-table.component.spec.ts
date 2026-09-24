import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataPreviewTableComponent } from './data-preview-table.component';

describe('DataPreviewTableComponent', () => {
  let fixture: ComponentFixture<DataPreviewTableComponent>;
  let component: DataPreviewTableComponent;
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [DataPreviewTableComponent] });
    fixture = TestBed.createComponent(DataPreviewTableComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement as HTMLElement;
    component.data = [
      { name: 'a', value: 1.23456 },
      { name: 'b', value: null },
    ];
  });

  it('marks every header cell as a column header', () => {
    fixture.detectChanges();
    const headers = Array.from(el.querySelectorAll('th'));
    expect(headers.map(th => th.textContent?.trim())).toEqual(['name', 'value']);
    headers.forEach(th => expect(th.getAttribute('scope')).toBe('col'));
  });

  it('formats each cell once per render and reuses it for text and title', () => {
    const spy = vi.spyOn(component, 'getCellValue');
    fixture.detectChanges(false); // one pass, without the dev-mode checkNoChanges re-run

    expect(spy).toHaveBeenCalledTimes(4); // 2 rows x 2 columns
    const cells = Array.from(el.querySelectorAll('td'));
    expect(cells.map(td => td.textContent?.trim())).toEqual(['a', '1.235', 'b', '-']);
    expect(cells.map(td => td.title)).toEqual(['a', '1.235', 'b', '-']);
  });
});
