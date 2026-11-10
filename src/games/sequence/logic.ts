/**
 * Sequenz – Merkspiel, reine Logik. Die ganze Folge (20 Schritte, Felder 1–4) steckt in der UUID.
 */
import { rngFor, type Rng } from '@/lib/seed/prng';

export const GAME = 'sequence';
export const MAX_LEVEL = 20;
export const PADS = 4;

export function makeSequence(
  uuid: string,
  rng: (stream: string) => Rng = (s) => rngFor(uuid, GAME, s),
): number[] {
  const r = rng('main');
  return Array.from({ length: MAX_LEVEL }, () => r.int(1, PADS));
}

/** Leuchtdauer und Pause (ms) beim Vorspielen; Stufe 1 gemächlich, dann schneller. */
export function timing(level: number): { on: number; gap: number } {
  return { on: Math.max(260, 620 - (level - 1) * 20), gap: Math.max(120, 220 - (level - 1) * 5) };
}

/** Dauer des Vorspielens einer Stufe ohne Vorlauf (ms). */
export function playbackMs(level: number): number {
  const { on, gap } = timing(level);
  return level * on + (level - 1) * gap;
}

export type InputResult = 'ok' | 'level' | 'win' | 'wrong';

/** Prüft die `pos`-te Eingabe (0-basiert) auf Stufe `level` (1-basiert). */
export function check(
  seq: readonly number[],
  level: number,
  pos: number,
  pad: number,
): InputResult {
  if (seq[pos] !== pad) return 'wrong';
  if (pos < level - 1) return 'ok';
  return level >= MAX_LEVEL ? 'win' : 'level';
}

/** Felder: [geschaffte Stufen 0–20] */
export const isValid = (f: readonly number[]) =>
  f.length === 1 && Number.isInteger(f[0]) && f[0]! >= 0 && f[0]! <= MAX_LEVEL;
