/**
 * Focus helpers for the wizard dialog (WCAG 2.4.3): a Tab/Shift+Tab trap that
 * keeps keyboard focus inside the dialog, and focusing of deep-link anchors.
 */

/** Candidates for keyboard focus; negative tabindex / disabled / hidden are filtered by isTabbable(). */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  'iframe',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',');

/** An unchecked radio is skipped by Tab when another radio of its group is checked. */
function isSkippedRadio(el: HTMLElement): boolean {
  if (!(el instanceof HTMLInputElement) || el.type !== 'radio' || el.checked || !el.name) {
    return false;
  }
  const group = `input[type="radio"][name="${CSS.escape(el.name)}"]:checked`;
  return el.ownerDocument.querySelector(group) !== null;
}

/** Whether Tab can currently land on `el`. */
export function isTabbable(el: HTMLElement): boolean {
  if (el.tabIndex < 0 || el.matches(':disabled') || el.closest('[inert]') || isSkippedRadio(el)) {
    return false;
  }
  // display:none (also a closed <dialog>) leaves no boxes; visibility:hidden keeps them.
  return el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
}

/** First and last element inside `root` that Tab can reach, or null when there is none. */
export function tabbableEdges(root: HTMLElement): { first: HTMLElement; last: HTMLElement } | null {
  const candidates = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  const first = candidates.find(isTabbable);
  const last = [...candidates].reverse().find(isTabbable);
  return first && last ? { first, last } : null;
}

/** True when `a` comes before `b` in document order. */
function isBefore(a: Node, b: Node): boolean {
  return (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
}

/**
 * Keeps Tab / Shift+Tab inside `root`: wraps from the last to the first
 * tabbable element (and back), and pulls focus that sits outside `root` (e.g.
 * on <body> after the focused element was removed) back in. Returns true when
 * it moved focus itself; otherwise the browser's default Tab handling applies.
 */
export function wrapTabFocus(event: KeyboardEvent, root: HTMLElement): boolean {
  const edges = tabbableEdges(root);
  if (!edges) {
    return false;
  }
  const active = root.ownerDocument.activeElement;
  const inside = active instanceof Node && root.contains(active);
  const wrapBackward = !inside || active === edges.first || isBefore(active, edges.first);
  const wrapForward = !inside || active === edges.last || isBefore(edges.last, active);
  const target = event.shiftKey ? (wrapBackward ? edges.last : null) : wrapForward ? edges.first : null;
  if (!target) {
    return false;
  }
  event.preventDefault();
  target.focus();
  return true;
}

/**
 * Moves focus to a deep-link target (e.g. an empty `.scroll-anchor` span) and
 * scrolls it into view. Non-focusable targets get tabindex="-1" so they can
 * take programmatic focus without becoming a Tab stop.
 */
export function focusAnchor(anchor: HTMLElement, smooth: boolean): void {
  if (!anchor.matches(FOCUSABLE_SELECTOR)) {
    anchor.setAttribute('tabindex', '-1');
  }
  anchor.focus({ preventScroll: true });
  anchor.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
}
