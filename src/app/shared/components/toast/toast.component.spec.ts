import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastComponent } from './toast.component';
import { ToastService } from '../../../services/toast.service';

describe('ToastComponent', () => {
  let fixture: ComponentFixture<ToastComponent>;
  let service: ToastService;
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ToastComponent] });
    service = TestBed.inject(ToastService);
    fixture = TestBed.createComponent(ToastComponent);
    el = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  afterEach(() => service.clear());

  function render(): void {
    fixture.detectChanges();
  }

  function toastEl(): HTMLElement {
    const toast = el.querySelector<HTMLElement>('.toast');
    if (!toast) throw new Error('no toast rendered');
    return toast;
  }

  it('renders two always-present live regions (assertive and polite)', () => {
    const regions = Array.from(el.querySelectorAll('.toast-region')).map(r => r.getAttribute('aria-live'));
    expect(regions).toEqual(['assertive', 'polite']);
  });

  it('announces info/success politely and warning/error assertively', () => {
    service.info('Saved', 0);
    service.error('Broken', 0);
    render();

    const polite = el.querySelector('[aria-live="polite"]');
    const assertive = el.querySelector('[aria-live="assertive"]');
    expect(polite?.textContent).toContain('Saved');
    expect(polite?.textContent).not.toContain('Broken');
    expect(assertive?.textContent).toContain('Error: Broken');
  });

  it('does not make the toast itself focusable or an alert', () => {
    service.info('Saved', 0);
    render();

    expect(toastEl().hasAttribute('tabindex')).toBe(false);
    expect(toastEl().getAttribute('role')).toBeNull();
  });

  it('labels the dismiss button and hides the × glyph', () => {
    service.info('Saved', 0);
    render();

    const close = toastEl().querySelector<HTMLButtonElement>('.toast-close');
    expect(close?.getAttribute('aria-label')).toBe('Dismiss notification');
    expect(close?.querySelector('[aria-hidden="true"]')?.textContent).toBe('×');
  });

  it('runs the action when Enter is pressed on its button (Enter no longer dismisses first)', () => {
    const handler = vi.fn();
    service.show('File replaced', 'info', 0, { label: 'Undo', handler });
    render();

    const action = toastEl().querySelector<HTMLButtonElement>('.toast-action');
    if (!action) throw new Error('no action button');
    // Keyboard activation = keydown (bubbles through the toast) followed by click.
    action.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    render();
    action.click();
    render();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(el.querySelector('.toast')).toBeNull();
  });

  it('pauses the countdown on hover and resumes it on leave', () => {
    const pause = vi.spyOn(service, 'pause');
    const resume = vi.spyOn(service, 'resume');
    service.info('Saved');
    render();

    toastEl().dispatchEvent(new MouseEvent('mouseenter'));
    expect(pause).toHaveBeenCalledTimes(1);
    toastEl().dispatchEvent(new MouseEvent('mouseleave'));
    expect(resume).toHaveBeenCalledTimes(1);
  });

  it('keeps the toast paused while focus is still inside after the pointer left', () => {
    const resume = vi.spyOn(service, 'resume');
    service.show('File replaced', 'info', 10000, { label: 'Undo', handler: () => undefined });
    render();

    toastEl().dispatchEvent(new MouseEvent('mouseenter'));
    toastEl().dispatchEvent(new FocusEvent('focusin'));
    toastEl().dispatchEvent(new MouseEvent('mouseleave'));
    expect(resume).not.toHaveBeenCalled();

    toastEl().dispatchEvent(new FocusEvent('focusout'));
    expect(resume).toHaveBeenCalledTimes(1);
  });

  it('does not auto-dismiss a hovered toast', () => {
    vi.useFakeTimers();
    try {
      service.info('Saved', 1000);
      render();
      toastEl().dispatchEvent(new MouseEvent('mouseenter'));

      vi.advanceTimersByTime(5000);
      render();
      expect(el.querySelector('.toast')).not.toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});
