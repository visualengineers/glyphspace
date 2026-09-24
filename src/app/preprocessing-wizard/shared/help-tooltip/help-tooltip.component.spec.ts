import { ComponentFixture, TestBed } from '@angular/core/testing';
import { POPUP_HIDE_DELAY_MS } from '../popup-coordinator';
import { HelpTooltipComponent } from './help-tooltip.component';

describe('HelpTooltipComponent', () => {
  let fixture: ComponentFixture<HelpTooltipComponent>;
  let component: HelpTooltipComponent;

  function button(): HTMLButtonElement {
    return (fixture.nativeElement as HTMLElement).querySelector('button.help-icon') as HTMLButtonElement;
  }

  function tooltip(): HTMLElement {
    return (fixture.nativeElement as HTMLElement).querySelector('.tooltip-content') as HTMLElement;
  }

  function isShown(): boolean {
    fixture.detectChanges();
    return tooltip().classList.contains('visible') && button().getAttribute('aria-expanded') === 'true';
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HelpTooltipComponent] }).compileComponents();
    fixture = TestBed.createComponent(HelpTooltipComponent);
    component = fixture.componentInstance;
    component.helpText = '<strong>CSV Format:</strong> first row = column headers';
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    vi.useRealTimers();
  });

  it('uses a plain-text accessible name without leaking the HTML help text', () => {
    expect(button().getAttribute('aria-label')).toBe('More information');
    fixture.componentRef.setInput('topic', 'File requirements');
    fixture.detectChanges();
    expect(button().getAttribute('aria-label')).toBe('Help: File requirements');
    expect(button().getAttribute('aria-label')).not.toContain('<');
  });

  it('describes the button by the tooltip, which exists in the DOM while closed', () => {
    const describedBy = button().getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    const target = document.getElementById(describedBy as string);
    expect(target).toBe(tooltip());
    expect(target?.getAttribute('role')).toBe('tooltip');
    expect(target?.textContent).toContain('CSV Format:');
    expect(isShown()).toBe(false);
  });

  it('gives every instance a unique tooltip id', () => {
    const other = TestBed.createComponent(HelpTooltipComponent);
    expect(other.componentInstance.tooltipId).not.toBe(component.tooltipId);
    other.destroy();
  });

  it('opens on keyboard focus and closes after blur', () => {
    vi.useFakeTimers();
    button().dispatchEvent(new FocusEvent('focus'));
    expect(isShown()).toBe(true);
    button().dispatchEvent(new FocusEvent('blur'));
    vi.advanceTimersByTime(POPUP_HIDE_DELAY_MS);
    expect(isShown()).toBe(false);
  });

  it('closes on Escape even when focus is elsewhere', () => {
    button().click();
    expect(isShown()).toBe(true);
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(isShown()).toBe(false);
  });

  it('opens with a single activation: keydown alone does not toggle it', () => {
    button().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    button().dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(isShown()).toBe(false);
    // Enter / Space on a native button fire exactly one click.
    button().click();
    expect(isShown()).toBe(true);
    button().click();
    expect(isShown()).toBe(false);
  });

  it('stays open while the pointer moves from the icon into the tooltip', () => {
    vi.useFakeTimers();
    button().dispatchEvent(new MouseEvent('mouseenter'));
    expect(isShown()).toBe(true);
    button().dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(POPUP_HIDE_DELAY_MS / 2);
    tooltip().dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(POPUP_HIDE_DELAY_MS);
    expect(isShown()).toBe(true);
    tooltip().dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(POPUP_HIDE_DELAY_MS);
    expect(isShown()).toBe(false);
  });

  it('closes on a click outside the component', () => {
    button().click();
    document.body.click();
    expect(isShown()).toBe(false);
  });

  it('positions the open tooltip inside the viewport', () => {
    button().click();
    fixture.detectChanges();
    const top = parseFloat(tooltip().style.top);
    const left = parseFloat(tooltip().style.left);
    expect(top).toBeGreaterThanOrEqual(10);
    expect(left).toBeGreaterThanOrEqual(10);
  });
});
