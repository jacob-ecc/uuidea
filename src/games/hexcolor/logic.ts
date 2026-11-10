/**
 * Hex-Farben – reine Logik. Zehn Farben, je vier Hex-Codes; die Ablenker liegen
 * mit jeder Runde näher an der gesuchten Farbe. Alles aus der UUID.
 */
import { rngFor, type Rng } from '@/lib/seed/prng';

export const GAME = 'hexcolor';
export const ROUNDS = 10;
export const OPTIONS = 4;

export interface Round {
  target: string;
  options: string[];
  /** Index der richtigen Antwort in `options` */
  answer: number;
}

const hex2 = (n: number) => n.toString(16).padStart(2, '0');
export const toHex = (rgb: readonly number[]) => '#' + rgb.map(hex2).join('');
const clamp = (n: number) => Math.min(255, Math.max(0, n));
/** größte Kanal-Differenz zweier Farben */
const dist = (a: readonly number[], b: readonly number[]) =>
  Math.max(...a.map((x, i) => Math.abs(x - b[i]!)));

/** Streuung der Ablenker in Runde i (0-basiert): 96 → 42 */
export const spreadOf = (i: number) => 96 - i * 6;

export function makeRounds(
  uuid: string,
  rng: (stream: string) => Rng = (s) => rngFor(uuid, GAME, s),
): Round[] {
  const r = rng('main');
  return Array.from({ length: ROUNDS }, (_, i) => {
    const spread = spreadOf(i);
    const target = [r.int(24, 231), r.int(24, 231), r.int(24, 231)];
    const picks: number[][] = [target];
    for (let tries = 0; picks.length < OPTIONS && tries < 500; tries++) {
      const c = target.map((x) => clamp(x + r.int(-spread, spread)));
      if (picks.every((p) => dist(p, c) >= Math.max(16, spread / 2))) picks.push(c);
    }
    const options = r.shuffle(picks.map(toHex));
    const t = toHex(target);
    return { target: t, options, answer: options.indexOf(t) };
  });
}

/** Felder: [Treffer 0–10, Zeit in ms] */
export const isValid = (f: readonly number[]) =>
  f.length === 2 && f[0]! >= 0 && f[0]! <= ROUNDS && f[1]! >= 500 && f[1]! <= 3_600_000;
