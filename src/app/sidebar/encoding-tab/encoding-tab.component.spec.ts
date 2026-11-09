import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EncodingTabComponent } from './encoding-tab.component';
import { ConfigService } from '../../services/config.service';
import { GlyphType } from '../../shared/enum/glyph-type';
import { COLOR_SCALES } from '../../shared/interfaces/color-scale';
import { GLYPH_SIZE_PX, POINT_SIZE_PX } from '../../glyph/glyph-size-info';

describe('EncodingTabComponent', () => {
  let fixture: ComponentFixture<EncodingTabComponent>;
  let el: HTMLElement;
  let config: ConfigService;

  const glyphTypeButtons = () => Array.from(el.querySelectorAll<HTMLButtonElement>('.segmented button'));
  const slider = (id: string) => el.querySelector<HTMLInputElement>(`#${id}`)!; // eslint-disable-line @typescript-eslint/no-non-null-assertion

  beforeEach(() => {
    config = TestBed.inject(ConfigService);
    config.getConfiguration().glyphType = GlyphType.Star;
    config.getConfiguration().pointSize = POINT_SIZE_PX.default;
    config.getConfiguration().glyphSize = GLYPH_SIZE_PX.default;
    config.colorFeature = '1';
    config.colorRange = 2;
    fixture = TestBed.createComponent(EncodingTabComponent);
    el = fixture.nativeElement;
    fixture.componentRef.setInput('featureIds', ['1', '2']);
    fixture.componentRef.setInput('labels', { '1': 'alcohol', '2': 'quality' });
    fixture.componentRef.setInput('types', { '1': 'numeric', '2': 'categorical' });
    fixture.componentRef.setInput('categoryCounts', { '2': 14 });
    fixture.componentRef.setInput('glyphConfig', config.getConfiguration());
    fixture.detectChanges();
  });

  it('offers the glyph types Star, Flower and Image', () => {
    expect(glyphTypeButtons().map(b => b.textContent?.trim())).toEqual(['Star', 'Flower', 'Image']);
    expect(glyphTypeButtons()[0].getAttribute('aria-pressed')).toBe('true');
  });

  it('switches the glyph type', () => {
    const update = vi.spyOn(config, 'updateConfiguration');

    glyphTypeButtons()[1].click();

    expect(config.getConfiguration().glyphType).toBe(GlyphType.Flower);
    expect(update).toHaveBeenCalled();
  });

  it('names the type or category count of each color feature', () => {
    const options = Array.from(el.querySelectorAll('option')).map(o => o.textContent?.trim());
    expect(options).toEqual(['alcohol (numeric)', 'quality (14 categories)']);
  });

  it('switches to a palette for a feature with categories and says when colors repeat', () => {
    fixture.componentInstance.selectColorFeature('2');
    fixture.detectChanges();

    expect(config.colorScale?.type).toBe('categorical');
    expect(config.colorRange).toBe(COLOR_SCALES.find(s => s.type === 'categorical')?.id);
    expect(el.querySelector('.hint')?.textContent).toContain('This feature has 14 categories, so colors repeat.');
  });

  it('shows the size values and applies slider changes once per frame', async () => {
    const update = vi.spyOn(config, 'updateConfiguration');
    const points = slider('encoding-point-size');
    const glyphs = slider('encoding-glyph-size');

    points.value = '12';
    points.dispatchEvent(new Event('input'));
    glyphs.value = '80';
    glyphs.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(config.getConfiguration().pointSize).toBe(12);
    expect(config.getConfiguration().glyphSize).toBe(80);
    expect(Array.from(el.querySelectorAll('output')).map(o => o.textContent?.trim())).toEqual(['12 px', '80 px']);

    await new Promise(resolve => requestAnimationFrame(resolve));
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('toggles the appearance options', () => {
    const contour = Array.from(el.querySelectorAll<HTMLLabelElement>('.check')).find(l =>
      l.textContent?.includes('Contour')
    );
    const before = config.getConfiguration().useContour;

    contour?.querySelector('input')?.click();

    expect(config.getConfiguration().useContour).toBe(!before);
  });
});
