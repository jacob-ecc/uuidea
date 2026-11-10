/**
 * Memory – reine Logik. 16 Karten, acht Paare aus Hex-Ziffern.
 * Welche acht der 16 Ziffern im Spiel sind und wo sie liegen, bestimmt die UUID.
 */
import { rngFor, type Rng } from '@/lib/seed/prng';

export const GAME = 'memory';
export const PAIRS = 8;
export const CARDS = PAIRS * 2;
export const COLS = 4;
const HEX = '0123456789abcdef';

export interface Deck {
  /** Ziffernwert (0–15) jeder Karte, Zeile für Zeile */
  cards: number[];
  /** die acht Ziffern im Spiel, in Ziehungsreihenfolge */
  digits: number[];
}

export function makeDeck(
  uuid: string,
  rng: (stream: string) => Rng = (s) => rngFor(uuid, GAME, s),
): Deck {
  const r = rng('main');
  const digits = r.shuffle(Array.from({ length: 16 }, (_, i) => i)).slice(0, PAIRS);
  return { digits, cards: r.shuffle([...digits, ...digits]) };
}

export const hexDigit = (d: number) => HEX[d]!;
/** Segmentfarbe 1–5 einer Ziffer (zusätzlich zur Ziffer, nie allein) */
export const colorOf = (d: number) => (d % 5) + 1;

export interface State {
  /** aufgedeckte, noch nicht gefundene Karten (0–2) */
  open: number[];
  matched: boolean[];
  moves: number;
}

export const initialState = (): State => ({
  open: [],
  matched: Array<boolean>(CARDS).fill(false),
  moves: 0,
});

export type FlipEvent = 'none' | 'open' | 'match' | 'miss';

/** Deckt Karte `i` auf. Zwei offene, ungleiche Karten werden dabei zuerst zugedeckt. */
export function flip(deck: Deck, s: State, i: number): { state: State; event: FlipEvent } {
  if (i < 0 || i >= CARDS || s.matched[i]) return { state: s, event: 'none' };
  const open = s.open.length === 2 ? [] : s.open;
  if (open.includes(i)) return { state: s, event: 'none' };
  if (open.length === 0) return { state: { ...s, open: [i] }, event: 'open' };

  const a = open[0]!;
  const moves = s.moves + 1;
  if (deck.cards[a] === deck.cards[i]) {
    const matched = [...s.matched];
    matched[a] = matched[i] = true;
    return { state: { open: [], matched, moves }, event: 'match' };
  }
  return { state: { ...s, open: [a, i], moves }, event: 'miss' };
}

export const isDone = (s: State) => s.matched.every(Boolean);
export const pairsFound = (s: State) => s.matched.filter(Boolean).length / 2;

/** Felder: [Züge, Zeit in ms] */
export function isValid(f: readonly number[]): boolean {
  return f.length === 2 && f[0]! >= PAIRS && f[0]! <= 999 && f[1]! >= 2000 && f[1]! <= 3_600_000;
}
