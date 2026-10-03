// Window events the shell uses to open its overlays from anywhere: a button in
// the sidebar, the status bar, a page, or a keyboard shortcut.

export const SEARCH_OPEN_EVENT = 'studyex:search';
export const ASK_OPEN_EVENT = 'studyex:ask';
export const SHORTCUTS_OPEN_EVENT = 'studyex:shortcuts';

export function openSearch(): void {
  window.dispatchEvent(new CustomEvent(SEARCH_OPEN_EVENT));
}

export function openAsk(): void {
  window.dispatchEvent(new CustomEvent(ASK_OPEN_EVENT));
}

export function openShortcuts(): void {
  window.dispatchEvent(new CustomEvent(SHORTCUTS_OPEN_EVENT));
}

/** True while the reader is typing, so single-key shortcuts stay out of the way. */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (tag !== 'INPUT') return false;
  const type = (target as HTMLInputElement).type;
  return !['button', 'checkbox', 'radio', 'submit', 'reset', 'range', 'color', 'file'].includes(type);
}
