/** Input types that take no typed text. */
const NON_TEXT_INPUT_TYPES: ReadonlySet<string> = new Set([
  'checkbox',
  'radio',
  'button',
  'submit',
  'reset',
  'range',
  'color',
  'file',
]);

/**
 * Whether `target` is a field the user types text into, with the browser's own
 * undo (Ctrl+Z) for what was typed: text-like inputs, textareas and editable
 * content. Checkboxes, radios, sliders and selects are not; they have no undo
 * of their own.
 */
export function isTextField(target: EventTarget | null): boolean {
  if (target instanceof HTMLInputElement) return !NON_TEXT_INPUT_TYPES.has(target.type);
  if (target instanceof HTMLTextAreaElement) return true;
  return target instanceof HTMLElement && target.isContentEditable;
}
