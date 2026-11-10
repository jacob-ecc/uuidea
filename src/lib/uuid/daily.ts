/**
 * UUID des Tages: für alle gleich, wechselt um Mitternacht (Europe/Berlin).
 *
 * Kein Server nötig – die UUID ist eine v5 aus einer festen Namespace-UUID und dem
 * Datum. Jeder kann sie im Generator nachrechnen:
 *   Namespace = v5(DNS, "uuidea.de") = ad9c0a59-4242-5f10-a2a9-c02b313ae1af
 *   UUID      = v5(Namespace, "2026-11-10")
 */
import { v5 } from './generate';

/** v5(NAMESPACES.DNS, 'uuidea.de') – im Unit-Test nachgerechnet. */
export const DAILY_NAMESPACE = 'ad9c0a59-4242-5f10-a2a9-c02b313ae1af';
export const DAILY_TZ = 'Europe/Berlin';

const keyFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: DAILY_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Kalendertag in Berlin als `YYYY-MM-DD`. */
export function dayKey(ms: number = Date.now()): string {
  const p = Object.fromEntries(keyFmt.formatToParts(ms).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}`;
}

/** Die UUID zu einem Tag (`YYYY-MM-DD`). */
export function dailyUuid(key: string): Promise<string> {
  return v5(DAILY_NAMESPACE, key);
}

/** Die UUID von heute. */
export function todayUuid(ms: number = Date.now()): Promise<string> {
  return dailyUuid(dayKey(ms));
}

/**
 * Erste Millisekunde des nächsten Berliner Tages. Binärsuche statt fester 24 h,
 * damit Sommer-/Winterzeit-Tage (23 h bzw. 25 h) stimmen.
 */
export function nextDayStart(ms: number = Date.now()): number {
  const key = dayKey(ms);
  let lo = ms;
  let hi = ms + 26 * 3_600_000;
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (dayKey(mid) === key) lo = mid;
    else hi = mid;
  }
  return hi;
}
