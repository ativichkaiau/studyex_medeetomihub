// Shared between ShellRuntime (which measures the scroll) and every mounted
// ScrollProgress rule (which shows it). Progress is written only on these few
// elements — never on <html>, where an inherited property would restyle the
// whole document every frame.

const bars = new Set<HTMLElement>();
let current = '0';

export function registerProgressBar(el: HTMLElement): () => void {
  bars.add(el);
  el.style.setProperty('--scroll-progress', current);
  return () => {
    bars.delete(el);
  };
}

export function setScrollProgress(value: string): void {
  if (value === current) return;
  current = value;
  for (const bar of bars) bar.style.setProperty('--scroll-progress', value);
}
