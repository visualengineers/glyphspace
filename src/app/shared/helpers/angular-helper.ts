export function checkTextInput(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement;

  const isEditable =
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable;

  if (isEditable) {
    return true; // Skip hotkey handling while typing
  }

  return false;
}