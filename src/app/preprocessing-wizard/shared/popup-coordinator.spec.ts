import type { Mocked } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { createSpyObj } from '../../../testing/create-spy-obj';
import {
  CoordinatedPopup,
  POPUP_HIDE_DELAY_MS,
  PopupCoordinator,
  PopupTrigger,
  PopupTriggerHost,
  computePopupPosition,
} from './popup-coordinator';

describe('computePopupPosition', () => {
  const viewport = { width: 1000, height: 800 };
  const anchor = { top: 400, left: 500, bottom: 420, right: 520, width: 20, height: 20 };
  const popup = { width: 200, height: 100 };

  it('places the popup on the requested side of the anchor', () => {
    expect(computePopupPosition(anchor, popup, 'top', 8, viewport)).toEqual({ top: 292, left: 410 });
    expect(computePopupPosition(anchor, popup, 'bottom', 8, viewport)).toEqual({ top: 428, left: 410 });
    expect(computePopupPosition(anchor, popup, 'left', 10, viewport)).toEqual({ top: 360, left: 290 });
    expect(computePopupPosition(anchor, popup, 'right', 10, viewport)).toEqual({ top: 360, left: 530 });
  });

  it('clamps the popup into the viewport with a 10px margin', () => {
    const topLeft = { top: 0, left: 0, bottom: 20, right: 20, width: 20, height: 20 };
    expect(computePopupPosition(topLeft, popup, 'left', 10, viewport)).toEqual({ top: 10, left: 10 });
    const bottomRight = { top: 790, left: 990, bottom: 810, right: 1010, width: 20, height: 20 };
    expect(computePopupPosition(bottomRight, popup, 'right', 10, viewport)).toEqual({ top: 690, left: 790 });
  });
});

describe('PopupCoordinator', () => {
  let coordinator: PopupCoordinator;

  function popupSpy(): Mocked<CoordinatedPopup> {
    return createSpyObj<CoordinatedPopup>('popup', ['close']);
  }

  beforeEach(() => {
    coordinator = TestBed.inject(PopupCoordinator);
  });

  it('closes the previously open popup when another one opens', () => {
    const first = popupSpy();
    const second = popupSpy();
    coordinator.activate(first);
    coordinator.activate(second);
    expect(first.close).toHaveBeenCalledTimes(1);
    expect(second.close).not.toHaveBeenCalled();
  });

  it('does not close a popup that re-activates itself or was released', () => {
    const first = popupSpy();
    const second = popupSpy();
    coordinator.activate(first);
    coordinator.activate(first);
    coordinator.release(first);
    coordinator.activate(second);
    expect(first.close).not.toHaveBeenCalled();
  });
});

describe('PopupTrigger', () => {
  let host: Mocked<PopupTriggerHost>;
  let trigger: PopupTrigger;
  let other: PopupTrigger;

  beforeEach(() => {
    host = createSpyObj<PopupTriggerHost>('host', ['contains', 'opened', 'closed', 'reposition']);
    host.contains.mockReturnValue(false);
    const coordinator = TestBed.inject(PopupCoordinator);
    trigger = coordinator.createTrigger(host);
    other = coordinator.createTrigger(
      createSpyObj<PopupTriggerHost>('otherHost', ['contains', 'opened', 'closed', 'reposition'])
    );
  });

  afterEach(() => {
    trigger.destroy();
    other.destroy();
    vi.useRealTimers();
  });

  it('opens on click and closes on a second click (one toggle per activation)', () => {
    trigger.onClick();
    expect(trigger.isOpen).toBe(true);
    expect(host.opened).toHaveBeenCalledTimes(1);
    trigger.onClick();
    expect(trigger.isOpen).toBe(false);
    expect(host.closed).toHaveBeenCalledTimes(1);
  });

  it('keeps a focus-opened popup open when the focused trigger is clicked', () => {
    trigger.onFocus();
    trigger.onClick();
    expect(trigger.isOpen).toBe(true);
  });

  it('hides a hover popup after the grace delay unless the pointer reaches the popup', () => {
    vi.useFakeTimers();
    trigger.onTriggerEnter();
    trigger.onPointerLeave();
    vi.advanceTimersByTime(POPUP_HIDE_DELAY_MS - 10);
    trigger.onPopupEnter();
    vi.advanceTimersByTime(POPUP_HIDE_DELAY_MS);
    expect(trigger.isOpen).toBe(true);
    trigger.onPointerLeave();
    vi.advanceTimersByTime(POPUP_HIDE_DELAY_MS);
    expect(trigger.isOpen).toBe(false);
  });

  it('stays open while focused and hides after blur', () => {
    vi.useFakeTimers();
    trigger.onFocus();
    trigger.onTriggerEnter();
    trigger.onPointerLeave();
    vi.advanceTimersByTime(POPUP_HIDE_DELAY_MS);
    expect(trigger.isOpen).toBe(true);
    trigger.onBlur();
    vi.advanceTimersByTime(POPUP_HIDE_DELAY_MS);
    expect(trigger.isOpen).toBe(false);
  });

  it('keeps a pinned popup open after the pointer leaves, until focus leaves', () => {
    vi.useFakeTimers();
    trigger.onTriggerEnter();
    trigger.onFocus();
    trigger.onClick();
    trigger.onPointerLeave();
    vi.advanceTimersByTime(POPUP_HIDE_DELAY_MS);
    expect(trigger.isOpen).toBe(true);
    trigger.onBlur();
    vi.advanceTimersByTime(POPUP_HIDE_DELAY_MS);
    expect(trigger.isOpen).toBe(false);
  });

  it('closes on Escape anywhere in the document', () => {
    trigger.onClick();
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(trigger.isOpen).toBe(false);
  });

  it('closes on a click outside, but not on a click inside the component', () => {
    trigger.onClick();
    host.contains.mockReturnValue(true);
    document.body.click();
    expect(trigger.isOpen).toBe(true);
    host.contains.mockReturnValue(false);
    document.body.click();
    expect(trigger.isOpen).toBe(false);
  });

  it('closes when another popup opens', () => {
    trigger.onClick();
    other.onClick();
    expect(trigger.isOpen).toBe(false);
    expect(other.isOpen).toBe(true);
  });

  it('attaches document and viewport listeners only while open', () => {
    const addDoc = vi.spyOn(document, 'addEventListener');
    const removeDoc = vi.spyOn(document, 'removeEventListener');
    const addWin = vi.spyOn(window, 'addEventListener');
    const removeWin = vi.spyOn(window, 'removeEventListener');
    trigger.onClick();
    expect(addDoc.mock.calls.map(a => a[0])).toEqual(['click', 'keydown']);
    expect(addWin.mock.calls.map(a => a[0])).toEqual(['scroll', 'resize']);
    window.dispatchEvent(new Event('resize'));
    expect(host.reposition).toHaveBeenCalledTimes(1);
    trigger.onClick();
    expect(removeDoc.mock.calls.map(a => a[0])).toEqual(['click', 'keydown']);
    expect(removeWin.mock.calls.map(a => a[0])).toEqual(['scroll', 'resize']);
    window.dispatchEvent(new Event('resize'));
    expect(host.reposition).toHaveBeenCalledTimes(1);
  });

  it('tears down on destroy without calling back into the host', () => {
    trigger.onClick();
    trigger.destroy();
    expect(trigger.isOpen).toBe(false);
    expect(host.closed).not.toHaveBeenCalled();
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(host.closed).not.toHaveBeenCalled();
  });
});
