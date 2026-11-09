import type { MockInstance } from 'vitest';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HelpTooltipComponent } from '../help-tooltip/help-tooltip.component';
import { POPUP_HIDE_DELAY_MS } from '../popup-coordinator';
import { ProjectionPreviewComponent } from './projection-preview.component';
import { PREVIEW_CAPTIONS } from './projection-preview.data';

@Component({
  standalone: true,
  imports: [ProjectionPreviewComponent, HelpTooltipComponent],
  template: `
    <app-projection-preview methodKey="tri"></app-projection-preview>
    <app-projection-preview methodKey="umap" position="bottom"></app-projection-preview>
    <app-help-tooltip helpText="Some help" topic="Projection"></app-help-tooltip>
  `,
})
class HostComponent {}

describe('ProjectionPreviewComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let rafCallbacks: FrameRequestCallback[];
  let requestFrame: MockInstance<typeof requestAnimationFrame>;
  let cancelFrame: MockInstance<typeof cancelAnimationFrame>;
  let reducedMotion: boolean;

  const root = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const previews = (): HTMLElement[] => Array.from(root().querySelectorAll('app-projection-preview'));
  const triggerOf = (i: number): HTMLButtonElement => previews()[i].querySelector('button') as HTMLButtonElement;
  const popupOf = (i: number): HTMLElement => previews()[i].querySelector('.projection-preview') as HTMLElement;
  const isOpen = (i: number): boolean => {
    fixture.detectChanges();
    return popupOf(i).classList.contains('visible') && triggerOf(i).getAttribute('aria-expanded') === 'true';
  };
  const escape = (): boolean =>
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  /** Id handed out by the latest requestAnimationFrame call. */
  const lastFrameId = (): number | undefined => requestFrame.mock.results.at(-1)?.value;
  /** Runs the pending animation frame, as the browser would. */
  const runFrame = (): void => {
    const pending = rafCallbacks.splice(0);
    pending.forEach(cb => cb(performance.now()));
  };

  beforeEach(async () => {
    rafCallbacks = [];
    reducedMotion = false;
    let nextFrameId = 0;
    requestFrame = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      rafCallbacks.push(cb);
      return ++nextFrameId;
    });
    cancelFrame = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) => ({ matches: reducedMotion && query.includes('reduce') }) as MediaQueryList
    );
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    vi.useRealTimers();
  });

  /** Fakes only the popup hide timer; animation frames stay on the requestAnimationFrame spy. */
  const fakeHideTimer = (): void => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  };

  it('names the trigger with the readable method name and links the description', () => {
    expect(triggerOf(0).getAttribute('aria-label')).toBe('Preview: TriMap animation');
    expect(triggerOf(1).getAttribute('aria-label')).toBe('Preview: UMAP animation');
    const describedBy = triggerOf(0).getAttribute('aria-describedby') as string;
    const description = document.getElementById(describedBy);
    expect(description).toBe(popupOf(0));
    expect(description?.getAttribute('role')).toBe('tooltip');
    expect(description?.textContent).toContain('Learns from point triplets');
    expect(triggerOf(1).getAttribute('aria-describedby')).not.toBe(describedBy);
  });

  it('opens with a single click; keydown does not toggle it (no double toggle)', () => {
    triggerOf(0).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    triggerOf(0).dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(isOpen(0)).toBe(false);
    triggerOf(0).click();
    expect(isOpen(0)).toBe(true);
    expect(popupOf(0).querySelector('canvas')).not.toBeNull();
    triggerOf(0).click();
    expect(isOpen(0)).toBe(false);
    expect(popupOf(0).querySelector('canvas')).toBeNull();
  });

  it('opens on keyboard focus and closes after blur', () => {
    fakeHideTimer();
    triggerOf(0).dispatchEvent(new FocusEvent('focus'));
    expect(isOpen(0)).toBe(true);
    triggerOf(0).dispatchEvent(new FocusEvent('blur'));
    vi.advanceTimersByTime(POPUP_HIDE_DELAY_MS);
    expect(isOpen(0)).toBe(false);
  });

  it('closes on Escape even when focus is outside the component', () => {
    triggerOf(0).click();
    expect(isOpen(0)).toBe(true);
    escape();
    expect(isOpen(0)).toBe(false);
  });

  it('closes on a click outside, even if a parent stops propagation', () => {
    triggerOf(0).click();
    const outside = document.createElement('button');
    outside.addEventListener('click', e => e.stopPropagation());
    document.body.appendChild(outside);
    outside.click();
    outside.remove();
    expect(isOpen(0)).toBe(false);
  });

  it('keeps only one popup open at a time', () => {
    triggerOf(0).click();
    triggerOf(1).click();
    expect(isOpen(0)).toBe(false);
    expect(isOpen(1)).toBe(true);
    const help = root().querySelector('app-help-tooltip button') as HTMLButtonElement;
    help.click();
    expect(isOpen(1)).toBe(false);
  });

  it('runs one animation loop while open and stops it on close', () => {
    triggerOf(0).click();
    expect(requestFrame).toHaveBeenCalledTimes(1);
    runFrame();
    expect(requestFrame).toHaveBeenCalledTimes(2);
    const lastId = lastFrameId();
    const staleFrame = rafCallbacks[0];
    escape();
    expect(cancelFrame).toHaveBeenCalledWith(lastId);
    staleFrame(performance.now());
    expect(requestFrame).toHaveBeenCalledTimes(2);
  });

  it('stops the animation loop of the popup that another popup closed', () => {
    triggerOf(0).click();
    const firstId = lastFrameId();
    triggerOf(1).click();
    expect(cancelFrame).toHaveBeenCalledWith(firstId);
    expect(rafCallbacks.length).toBe(2);
  });

  it('stops the animation loop on destroy', () => {
    triggerOf(0).click();
    const id = lastFrameId();
    fixture.destroy();
    expect(cancelFrame).toHaveBeenCalledWith(id);
  });

  it('renders a single still frame without a loop when reduced motion is preferred', () => {
    reducedMotion = true;
    triggerOf(0).click();
    fixture.detectChanges();
    expect(requestFrame).not.toHaveBeenCalled();
    const steps = PREVIEW_CAPTIONS.tri;
    const caption = popupOf(0).querySelector('.preview-cap-text')?.textContent?.trim();
    expect(caption).toBe(steps[steps.length - 1].cap);
    const canvas = popupOf(0).querySelector('canvas') as HTMLCanvasElement;
    const pixels = canvas.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height).data ?? [];
    expect(
      Array.from(pixels).some(v => v > 0),
      'still frame is painted'
    ).toBe(true);
  });

  it('advances the caption with the animation phase', () => {
    let now = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => (now += 50));
    triggerOf(0).click();
    // 50 ms per frame at half speed: 60 frames = 1.5 s, inside phase 1 (1.1 s .. 3.3 s).
    for (let i = 0; i < 60; i++) runFrame();
    fixture.detectChanges();
    const caption = popupOf(0).querySelector('.preview-cap-text')?.textContent?.trim();
    expect(caption).toBe(PREVIEW_CAPTIONS.tri[1].cap);
  });

  it('repositions on scroll while open and stops listening after close', () => {
    triggerOf(1).click();
    const rect = vi.spyOn(triggerOf(1), 'getBoundingClientRect').mockReturnValue(new DOMRect(300, 0, 20, 20));
    const halfWidth = popupOf(1).getBoundingClientRect().width / 2;
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(popupOf(1).style.left).toBe(`${300 + 10 - halfWidth}px`);
    rect.mockReturnValue(new DOMRect(320, 0, 20, 20));
    window.dispatchEvent(new Event('resize'));
    fixture.detectChanges();
    expect(popupOf(1).style.left).toBe(`${320 + 10 - halfWidth}px`);
    escape();
    fixture.detectChanges();
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(popupOf(1).style.top).toBe('-9999px');
  });

  it('stays open while the pointer moves from the icon into the popup', () => {
    fakeHideTimer();
    triggerOf(0).dispatchEvent(new MouseEvent('mouseenter'));
    expect(isOpen(0)).toBe(true);
    triggerOf(0).dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(POPUP_HIDE_DELAY_MS / 2);
    popupOf(0).dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(POPUP_HIDE_DELAY_MS);
    expect(isOpen(0)).toBe(true);
    popupOf(0).dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(POPUP_HIDE_DELAY_MS);
    expect(isOpen(0)).toBe(false);
  });
});
