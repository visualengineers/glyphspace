import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { ConfigService } from '../services/config.service';
import { DataLoaderService } from '../services/data-loader.service';
import { ThumbnailService } from '../services/thumbnail.service';
import { GlyphType } from '../shared/enum/glyph-type';
import { MAX_GLYPH_AXES } from '../glyph/glyph-axes';

describe('SidebarComponent', () => {
  let fixture: ComponentFixture<SidebarComponent>;
  let el: HTMLElement;
  let config: ConfigService;
  let hasImages: ReturnType<typeof vi.fn>;

  const tab = (id: string) => el.querySelector<HTMLButtonElement>(`#sidebar-tab-${id}`)!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
  const panel = (id: string) => el.querySelector<HTMLElement>(`#sidebar-tabpanel-${id}`)!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
  const title = () => el.querySelector('.title')?.textContent?.replace(/\s+/g, ' ').trim();

  beforeEach(async () => {
    hasImages = vi.fn().mockResolvedValue(true);
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        {
          provide: DataLoaderService,
          useValue: {
            getMetaData: async () => ({ features: {} }),
            getSchema: async () => undefined,
            getGlyphData: async () => [],
          },
        },
        { provide: ThumbnailService, useValue: { hasImages } },
      ],
    }).compileComponents();
    config = TestBed.inject(ConfigService);
    config.replaceActiveFeatures(['1', '2', '3']);
    config.getConfiguration().glyphType = GlyphType.Star;
    fixture = TestBed.createComponent(SidebarComponent);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('switches from Image to Star when the loaded dataset has no item images', async () => {
    hasImages.mockResolvedValue(false);
    config.getConfiguration().glyphType = GlyphType.Thumb;

    config.loadData('plain');

    await vi.waitFor(() => expect(config.getConfiguration().glyphType).toBe(GlyphType.Star));
    expect(hasImages).toHaveBeenCalledWith('plain');
    expect(fixture.componentInstance.imagesAvailable).toBe(false);
  });

  it('keeps Image for a dataset with item images', async () => {
    config.getConfiguration().glyphType = GlyphType.Thumb;

    config.loadData('wineqr');

    await vi.waitFor(() => expect(hasImages).toHaveBeenCalledWith('wineqr'));
    await fixture.whenStable();
    expect(config.getConfiguration().glyphType).toBe(GlyphType.Thumb);
    expect(fixture.componentInstance.imagesAvailable).toBe(true);
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
