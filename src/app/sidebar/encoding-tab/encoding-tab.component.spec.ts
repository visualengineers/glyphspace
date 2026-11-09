import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EncodingTabComponent } from './encoding-tab.component';
import { ConfigService } from '../../services/config.service';
import { GlyphType } from '../../shared/enum/glyph-type';
import { COLOR_SCALES } from '../../shared/interfaces/color-scale';
import { ITEM_SIZE_PX } from '../../glyph/glyph-size-info';

describe('EncodingTabComponent', () => {
  let fixture: ComponentFixture<EncodingTabComponent>;
  let el: HTMLElement;
  let config: ConfigService;

  const glyphTypeButtons = () => Array.from(el.querySelectorAll<HTMLButtonElement>('.segmented button'));
  const slider = (id: string) => el.querySelector<HTMLInputElement>(`#${id}`)!; // eslint-disable-line @typescript-eslint/no-non-null-assertion

  beforeEach(() => {
    config = TestBed.inject(ConfigService);
    config.getConfiguration().glyphType = GlyphType.Star;
    config.getConfiguration().itemSize = ITEM_SIZE_PX.default;
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
    expect(glyphTypeButtons().map(b => b.querySelector('.type-label')?.textContent?.trim())).toEqual([
      'Star',
      'Flower',
      'Image',
    ]);
    expect(glyphTypeButtons()[0].getAttribute('aria-pressed')).toBe('true');
  });

  it('shows a small glyph next to each glyph type', () => {
    const [star, flower, image] = glyphTypeButtons();

    expect(star.querySelector('app-glyph-icon path.shape')).not.toBeNull();
    expect(flower.querySelector('app-glyph-icon path.shape')).not.toBeNull();
    expect(image.querySelector('.material-icons')?.textContent?.trim()).toBe('image');
    expect(image.querySelector('.material-icons')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('keeps Image off for a dataset without item images and says why', () => {
    fixture.componentRef.setInput('imagesAvailable', false);
    fixture.detectChanges();
    const image = glyphTypeButtons()[2];

    image.click();

    expect(config.getConfiguration().glyphType).toBe(GlyphType.Star);
    expect(image.getAttribute('aria-disabled')).toBe('true');
    expect(image.title).toContain('no item images');
    expect(el.querySelector(`#${image.getAttribute('aria-describedby')}`)?.textContent).toContain('no item images');
    expect(glyphTypeButtons()[1].getAttribute('aria-disabled')).toBeNull();
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

  it('has one size slider for points and glyphs, applied once per frame', async () => {
    const update = vi.spyOn(config, 'updateConfiguration');
    const size = slider('encoding-size');
    expect(el.querySelectorAll('input[type=range]').length).toBe(1);

    size.value = '9';
    size.dispatchEvent(new Event('input'));
    size.value = '12';
    size.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(config.getConfiguration().itemSize).toBe(12);
    expect(Array.from(el.querySelectorAll('output')).map(o => o.textContent?.trim())).toEqual(['12 px']);

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
