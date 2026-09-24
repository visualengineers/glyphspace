import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorScaleSelectorComponent } from './color-scale-selector.component';
import { COLOR_SCALES, ColorScale, buildGroupedColorScales, getColorScaleById } from '../../interfaces/color-scale';

@Component({
  standalone: true,
  imports: [ColorScaleSelectorComponent],
  template: `
    <span id="host-scale-label">Color scale</span>
    <app-color-scale-selector
      [ariaLabelledby]="labelledby"
      [groupedColorScales]="groups"
      [selectedScale]="selected"
      (scaleSelected)="pick($event)"
    ></app-color-scale-selector>
    <button type="button" id="host-outside">Outside</button>
  `,
})
class HostComponent {
  labelledby: string | null = 'host-scale-label';
  groups = buildGroupedColorScales();
  selected: ColorScale = getColorScaleById(0);
  picked: number[] = [];

  pick(id: number): void {
    this.picked = [...this.picked, id];
    this.selected = getColorScaleById(id);
  }
}

/** The picker must be nameable and fully keyboard-operable (WCAG 2.1.1, 4.1.2). */
describe('ColorScaleSelectorComponent – accessibility', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    el = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  const trigger = (): HTMLButtonElement => {
    const button = el.querySelector<HTMLButtonElement>('button.selected-scale');
    if (!button) throw new Error('trigger not rendered');
    return button;
  };
  const listbox = (): HTMLElement | null => el.querySelector<HTMLElement>('[role="listbox"]');
  const options = (): HTMLElement[] => Array.from(el.querySelectorAll<HTMLElement>('[role="option"]'));
  const focusedName = (): string => (document.activeElement?.textContent ?? '').trim();

  function key(target: Element, name: string): void {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));
    fixture.detectChanges();
  }

  it('is named by the given label plus the current scale', () => {
    const ids = (trigger().getAttribute('aria-labelledby') ?? '').split(' ');

    expect(ids[0]).toBe('host-scale-label');
    expect(document.getElementById(ids[1])?.textContent?.trim()).toBe(COLOR_SCALES[0].name);
    expect(trigger().hasAttribute('aria-label')).toBe(false);
  });

  it('falls back to "Color scale: <scale>" without a label element', () => {
    host.labelledby = null;
    fixture.detectChanges();

    expect(trigger().getAttribute('aria-label')).toBe(`Color scale: ${COLOR_SCALES[0].name}`);
    expect(trigger().hasAttribute('aria-labelledby')).toBe(false);
  });

  it('exposes a collapsed listbox popup that expands on click', () => {
    expect(trigger().getAttribute('aria-haspopup')).toBe('listbox');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(listbox()).toBeNull();

    trigger().click();
    fixture.detectChanges();

    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(listbox()?.id).toBe(trigger().getAttribute('aria-controls') ?? 'missing');
  });

  it('groups named options and marks the selected one', () => {
    trigger().click();
    fixture.detectChanges();

    expect(el.querySelectorAll('[role="listbox"] > [role="group"]').length).toBe(host.groups.length);
    expect(options().map(o => o.textContent?.trim())).toEqual(host.groups.flatMap(g => g.scales.map(s => s.name)));
    const selected = options().filter(o => o.getAttribute('aria-selected') === 'true');
    expect(selected.map(o => o.textContent?.trim())).toEqual([COLOR_SCALES[0].name]);
  });

  it('opens with ArrowDown on the selected scale, moves with the arrow keys and picks with Enter', () => {
    key(trigger(), 'ArrowDown');
    expect(focusedName()).toBe(COLOR_SCALES[0].name);

    key(document.activeElement as Element, 'ArrowDown');
    key(document.activeElement as Element, 'ArrowDown');
    expect(focusedName()).toBe(options()[2].textContent?.trim());

    key(document.activeElement as Element, 'Enter');

    expect(host.picked).toEqual([host.groups.flatMap(g => g.scales)[2].id]);
    expect(listbox()).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it('supports Home, End and Space', () => {
    key(trigger(), 'ArrowDown');
    key(document.activeElement as Element, 'End');
    expect(focusedName()).toBe(options()[options().length - 1].textContent?.trim());

    key(document.activeElement as Element, 'Home');
    expect(focusedName()).toBe(options()[0].textContent?.trim());

    key(document.activeElement as Element, ' ');
    expect(host.picked).toEqual([host.groups.flatMap(g => g.scales)[0].id]);
  });

  it('closes on Escape without picking and returns focus to the button', () => {
    key(trigger(), 'ArrowDown');
    key(document.activeElement as Element, 'Escape');

    expect(listbox()).toBeNull();
    expect(host.picked).toEqual([]);
    expect(document.activeElement).toBe(trigger());
  });

  it('closes when focus leaves the picker', () => {
    key(trigger(), 'ArrowDown');

    el.querySelector<HTMLButtonElement>('#host-outside')?.focus();
    fixture.detectChanges();

    expect(listbox()).toBeNull();
  });
});
