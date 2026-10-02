// Timestamps as the shell prints them. Local time, 24-hour, ISO-ish.

const two = (n: number) => String(n).padStart(2, '0');

/** "2026-10-02" in local time. */
export function isoDay(d: Date): string {
  return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
}

/** "20:14" in local time. */
export function clock(d: Date): string {
  return `${two(d.getHours())}:${two(d.getMinutes())}`;
}

/** "2026-10-02 20:14". */
export function stamp(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : `${isoDay(d)} ${clock(d)}`;
}

/** Compact age: "now", "12m", "3h", "4d", then the date. */
export function ago(iso: string, now = new Date()): string {
  const then = new Date(iso);
  const s = (now.getTime() - then.getTime()) / 1000;
  if (Number.isNaN(s)) return iso;
  if (s < 60) return 'now';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 86400 * 14) return `${Math.floor(s / 86400)}d`;
  return isoDay(then);
}

/** Elapsed seconds as "03:18" (or "1:03:18"). */
export function elapsed(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}:${two(m)}:${two(s % 60)}` : `${two(m)}:${two(s % 60)}`;
}
