/**
 * Reaktionstest – reine Logik, ohne DOM.
 * Fünf Signale. Wartezeit und Signalfarbe jedes Durchgangs kommen aus der UUID.
 */
import { rngFor, type Rng } from '@/lib/seed/prng';

export const GAME = 'reaction';
export const ROUNDS = 5;
/** Wartezeit vor dem Signal: 1,2 – 4,2 s in 10-ms-Schritten */
export const WAIT_MIN = 1200;
export const WAIT_MAX = 4200;
/** Reaktionen darunter gelten als geraten → Frühstart */
export const TOO_FAST = 100;
/** Ohne Reaktion endet ein Durchgang nach dieser Zeit (zählt mit diesem Wert) */
export const MISS = 2000;
/** Strafe pro Frühstart, auf den Schnitt aufgeschlagen */
export const PENALTY = 100;
/** Ersatz-Wartezeiten nach Frühstarts (danach wiederholt sich die Liste) */
export const SPARES = 24;

export interface Plan {
  /** Wartezeit (ms) der fünf Durchgänge */
  waits: number[];
  /** Signalfarbe 1–5 (Segment-Spektrum) */
  colors: number[];
  /** Wartezeiten nach Frühstarts, in fester Reihenfolge */
  spares: number[];
}

const wait = (r: Rng) => r.int(WAIT_MIN / 10, WAIT_MAX / 10) * 10;

export function makePlan(
  uuid: string,
  rng: (stream: string) => Rng = (s) => rngFor(uuid, GAME, s),
): Plan {
  const main = rng('main');
  const waits: number[] = [];
  const colors: number[] = [];
  for (let i = 0; i < ROUNDS; i++) {
    waits.push(wait(main));
    colors.push(main.int(1, 5));
  }
  const retry = rng('retry');
  return { waits, colors, spares: Array.from({ length: SPARES }, () => wait(retry)) };
}

/** Wartezeit für Durchgang `round`, nachdem insgesamt `fouls` Frühstarts passiert sind. */
export function waitFor(plan: Plan, round: number, fouls: number, foulInRound: boolean): number {
  return foulInRound ? plan.spares[(fouls - 1) % plan.spares.length]! : plan.waits[round]!;
}

/** Klassifiziert eine Reaktion (ms ab Signal; negativ = vor dem Signal). */
export function judge(ms: number): 'foul' | 'hit' {
  return ms < TOO_FAST ? 'foul' : 'hit';
}

/**
 * Felder des Ergebnisses (Reihenfolge = Share-Code):
 * [score, best, fouls, t1 … t5]; score = gerundeter Schnitt + 100 ms je Frühstart.
 */
export function toFields(times: readonly number[], fouls: number): number[] {
  const t = times.map((x) => Math.min(MISS, Math.max(0, Math.round(x))));
  const mean = t.reduce((a, b) => a + b, 0) / t.length;
  return [Math.round(mean) + fouls * PENALTY, Math.min(...t), fouls, ...t];
}

export function isValid(f: readonly number[]): boolean {
  if (f.length !== 3 + ROUNDS) return false;
  const times = f.slice(3);
  if (times.some((x) => x < TOO_FAST || x > MISS)) return false;
  const ref = toFields(times, f[2]!);
  return ref.every((x, i) => x === f[i]);
}
