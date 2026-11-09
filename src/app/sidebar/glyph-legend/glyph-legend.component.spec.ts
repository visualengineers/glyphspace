import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlyphLegendComponent } from './glyph-legend.component';
import { GlyphType } from '../../shared/enum/glyph-type';
import { MAX_GLYPH_AXES, MIN_GLYPH_AXES } from '../../glyph/glyph-axes';

const FEATURES = Array.from({ length: 10 }, (_, i) => `${i + 1}`);
const LABELS = Object.fromEntries(FEATURES.map(id => [id, `feature ${id}`]));

describe('GlyphLegendComponent', () => {
  let fixture: ComponentFixture<GlyphLegendComponent>;
  let component: GlyphLegendComponent;
  let el: HTMLElement;
  let added: string[];
  let removed: string[];

  function show(axes: string[], glyphType = GlyphType.Flower): void {
    fixture.componentRef.setInput('glyphType', glyphType);
    fixture.componentRef.setInput('axes', axes);
    fixture.componentRef.setInput(
      'axisLengths',
      axes.map(() => 0.5)
    );
    fixture.detectChanges();
  }

  const labelButtons = () => Array.from(el.querySelectorAll<HTMLButtonElement>('.axis-name'));
  const removeButton = () => el.querySelector<HTMLButtonElement>('.axis-remove');
  const addButton = () => el.querySelector<HTMLButtonElement>('.add-axis')!; // eslint-disable-line @typescript-eslint/no-non-null-assertion

  beforeEach(() => {
    fixture = TestBed.createComponent(GlyphLegendComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.componentRef.setInput('featureIds', FEATURES);
    fixture.componentRef.setInput('labels', LABELS);
    added = [];
    removed = [];
    component.axisAdded.subscribe(id => added.push(id));
    component.axisRemoved.subscribe(id => removed.push(id));
  });

  it('labels the axes in drawing order, numbered from 1', () => {
    show(['3', '1', '2', '5']);

    expect(labelButtons().map(b => b.textContent?.replace(/\s+/g, ' ').trim())).toEqual([
      '1 feature 3',
      '2 feature 1',
      '3 feature 2',
      '4 feature 5',
    ]);
  });

  it('draws one petal per axis for the flower glyph', () => {
    show(['1', '2', '3', '4']);

    expect(el.querySelectorAll('.petal').length).toBe(4);
    expect(el.querySelector('.star')).toBeNull();
  });

  it('draws a polygon for the star glyph', () => {
    show(['1', '2', '3'], GlyphType.Star);

    expect(el.querySelector('.star')?.getAttribute('d')).toMatch(/^M.*Z$/);
  });

  it('shows the remove button of a clicked label and reports the removal', () => {
    show(['1', '2', '3', '4']);

    labelButtons()[1].click();
    fixture.detectChanges();
    expect(labelButtons()[1].getAttribute('aria-pressed')).toBe('true');

    removeButton()?.click();
    expect(removed).toEqual(['2']);
  });

  it('keeps the minimum number of axes: the remove button is disabled and explains why', () => {
    show(['1', '2', '3']);

    labelButtons()[0].click();
    fixture.detectChanges();
    const remove = removeButton()!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    expect(remove.getAttribute('aria-disabled')).toBe('true');
    expect(remove.title).toContain(`at least ${MIN_GLYPH_AXES}`);

    remove.click();
    expect(removed).toEqual([]);
  });

  it('lists the remaining features in the add panel, filtered by the search', () => {
    show(['1', '2', '3']);

    addButton().click();
    fixture.detectChanges();
    expect(el.querySelectorAll('.candidate').length).toBe(FEATURES.length - 3);

    const search = el.querySelector<HTMLInputElement>('.search')!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    search.value = 'feature 10';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const candidates = el.querySelectorAll<HTMLButtonElement>('.candidate');
    expect(candidates.length).toBe(1);

    candidates[0].click();
    expect(added).toEqual(['10']);
  });

  it('disables "Add axis" at the maximum and says why', () => {
    show(FEATURES.slice(0, MAX_GLYPH_AXES));

    expect(addButton().getAttribute('aria-disabled')).toBe('true');
    expect(el.querySelector('.hint')?.textContent).toContain(`Limit of ${MAX_GLYPH_AXES} axes reached`);

    addButton().click();
    fixture.detectChanges();
    expect(el.querySelector('.add-panel')).toBeNull();
  });

  it('closes the add panel with Escape', () => {
    show(['1', '2', '3']);
    addButton().click();
    fixture.detectChanges();

    el.querySelector('.search')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(el.querySelector('.add-panel')).toBeNull();
    expect(document.activeElement).toBe(addButton());
  });

  it('says the legend does not apply to image glyphs', () => {
    show(['1', '2', '3'], GlyphType.Thumb);

    expect(el.querySelector('.not-applicable')?.textContent).toContain('no axes');
    expect(el.querySelector('svg')).toBeNull();
    expect(el.querySelector('.add-axis')).toBeNull();
  });
});
