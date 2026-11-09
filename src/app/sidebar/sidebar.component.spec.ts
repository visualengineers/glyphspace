import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { ConfigService } from '../services/config.service';
import { DataLoaderService } from '../services/data-loader.service';
import { GlyphType } from '../shared/enum/glyph-type';
import { MAX_GLYPH_AXES } from '../glyph/glyph-axes';

describe('SidebarComponent', () => {
  let fixture: ComponentFixture<SidebarComponent>;
  let el: HTMLElement;
  let config: ConfigService;

  const tab = (id: string) => el.querySelector<HTMLButtonElement>(`#sidebar-tab-${id}`)!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
  const panel = (id: string) => el.querySelector<HTMLElement>(`#sidebar-tabpanel-${id}`)!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
  const title = () => el.querySelector('.title')?.textContent?.replace(/\s+/g, ' ').trim();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [{ provide: DataLoaderService, useValue: {} }],
    }).compileComponents();
    config = TestBed.inject(ConfigService);
    config.replaceActiveFeatures(['1', '2', '3']);
    config.getConfiguration().glyphType = GlyphType.Star;
    fixture = TestBed.createComponent(SidebarComponent);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('opens on the Filters tab', () => {
    expect(tab('filters').getAttribute('aria-selected')).toBe('true');
    expect(panel('filters').hidden).toBe(false);
    expect(panel('encoding').hidden).toBe(true);
  });

  it('moves between the tabs with the arrow keys', () => {
    tab('filters').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();

    expect(tab('encoding').getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(tab('encoding'));
    expect(panel('encoding').hidden).toBe(false);
  });

  it('counts the glyph axes in the legend title', () => {
    expect(title()).toBe(`Glyph legend · 3 / ${MAX_GLYPH_AXES}`);

    config.addGlyphAxis('4');
    fixture.detectChanges();
    expect(title()).toBe(`Glyph legend · 4 / ${MAX_GLYPH_AXES}`);

    config.getConfiguration().glyphType = GlyphType.Thumb;
    config.updateConfiguration();
    fixture.detectChanges();
    expect(title()).toBe('Glyph legend · n/a');
  });

  it('is open by default, hides with the chevron and comes back from the edge handle', async () => {
    const collapse = el.querySelector<HTMLButtonElement>('.collapse')!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    const handle = el.querySelector<HTMLButtonElement>('.edge-handle')!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    expect(el.classList.contains('collapsed')).toBe(false);

    collapse.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(el.classList.contains('collapsed')).toBe(true);
    expect(handle.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(handle);

    handle.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(el.classList.contains('collapsed')).toBe(false);
    expect(document.activeElement).toBe(collapse);
  });
});
