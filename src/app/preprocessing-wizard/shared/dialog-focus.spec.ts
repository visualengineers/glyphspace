import { focusAnchor, isTabbable, tabbableEdges, wrapTabFocus } from './dialog-focus';

describe('dialog focus helpers', () => {
  let outside: HTMLButtonElement;
  let root: HTMLElement;

  function button(id: string): HTMLButtonElement {
    const el = root.querySelector<HTMLButtonElement>(`#${id}`);
    if (!el) throw new Error(`#${id} missing`);
    return el;
  }

  function tab(shiftKey = false): KeyboardEvent {
    return new KeyboardEvent('keydown', { key: 'Tab', shiftKey, cancelable: true });
  }

  beforeEach(() => {
    outside = document.createElement('button');
    outside.textContent = 'outside';
    document.body.appendChild(outside);
    root = document.createElement('div');
    root.innerHTML = `
      <h1 id="title" tabindex="-1">Title</h1>
      <button id="disabled" disabled>disabled</button>
      <button id="first">first</button>
      <span id="minus" tabindex="-1">not a tab stop</span>
      <button id="middle">middle</button>
      <button id="hidden" style="display:none">hidden</button>
      <button id="invisible" style="visibility:hidden">invisible</button>
      <div inert><button id="inert">inert</button></div>
      <button id="last">last</button>
      <dialog><button id="in-closed-dialog">closed dialog</button></dialog>`;
    document.body.appendChild(root);
  });

  afterEach(() => {
    root.remove();
    outside.remove();
  });

  it('skips disabled, hidden, inert and tabindex="-1" elements', () => {
    ['disabled', 'minus', 'hidden', 'invisible', 'inert', 'in-closed-dialog', 'title'].forEach(id =>
      expect(isTabbable(button(id)), id).toBe(false)
    );
    expect(isTabbable(button('middle'))).toBe(true);
  });

  it('finds the first and last tabbable element', () => {
    expect(tabbableEdges(root)).toEqual({ first: button('first'), last: button('last') });
  });

  it('returns null when nothing inside can take focus', () => {
    const empty = document.createElement('div');
    expect(tabbableEdges(empty)).toBeNull();
  });

  it('wraps Tab from the last element to the first', () => {
    button('last').focus();
    const event = tab();

    expect(wrapTabFocus(event, root)).toBe(true);
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(button('first'));
  });

  it('wraps Shift+Tab from the first element to the last', () => {
    button('first').focus();
    expect(wrapTabFocus(tab(true), root)).toBe(true);
    expect(document.activeElement).toBe(button('last'));
  });

  it('wraps Shift+Tab from a focused title before the first tabbable element', () => {
    button('title').focus();
    expect(wrapTabFocus(tab(true), root)).toBe(true);
    expect(document.activeElement).toBe(button('last'));
  });

  it('leaves Tab between inner elements to the browser', () => {
    button('middle').focus();
    const event = tab();

    expect(wrapTabFocus(event, root)).toBe(false);
    expect(event.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(button('middle'));
  });

  it('pulls focus from outside back into the dialog', () => {
    outside.focus();
    expect(wrapTabFocus(tab(), root)).toBe(true);
    expect(document.activeElement).toBe(button('first'));

    outside.focus();
    expect(wrapTabFocus(tab(true), root)).toBe(true);
    expect(document.activeElement).toBe(button('last'));
  });

  it('focuses a non-focusable anchor via tabindex="-1" without making it a Tab stop', () => {
    const anchor = document.createElement('span');
    anchor.id = 'anchor';
    anchor.style.display = 'block';
    root.appendChild(anchor);
    const scroll = vi.spyOn(anchor, 'scrollIntoView').mockImplementation(() => undefined);

    focusAnchor(anchor, false);

    expect(anchor.getAttribute('tabindex')).toBe('-1');
    expect(document.activeElement).toBe(anchor);
    expect(scroll).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' });
    expect(isTabbable(anchor)).toBe(false);
  });

  it('keeps the tabindex of an anchor that is focusable already', () => {
    const anchorButton = button('middle');
    vi.spyOn(anchorButton, 'scrollIntoView').mockImplementation(() => undefined);

    focusAnchor(anchorButton, true);

    expect(anchorButton.hasAttribute('tabindex')).toBe(false);
    expect(document.activeElement).toBe(anchorButton);
  });
});
