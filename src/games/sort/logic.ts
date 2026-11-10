/**
 * Sortieren – 3×3-Schiebepuzzle, reine Logik.
 * Die UUID mischt das Feld (garantiert lösbar); die kürzeste Lösung wird per Breitensuche berechnet.
 */
import { rngFor, type Rng } from '@/lib/seed/prng';

export const GAME = 'sort';
export const N = 3;
export const SIZE = N * N;
/** Ziel: 1 … 8, die Lücke (0) unten rechts */
export const GOAL: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8, 0];
/** Mindestabstand (Manhattan) des Startfelds, damit es nicht fast fertig beginnt */
const MIN_MANHATTAN = 12;

export function isSolvable(b: readonly number[]): boolean {
  const t = b.filter((x) => x !== 0);
  let inv = 0;
  for (let i = 0; i < t.length; i++)
    for (let j = i + 1; j < t.length; j++) if (t[i]! > t[j]!) inv++;
  return inv % 2 === 0;
}

export function manhattan(b: readonly number[]): number {
  let d = 0;
  b.forEach((v, i) => {
    if (v === 0) return;
    const g = v - 1;
    d += Math.abs(Math.floor(i / N) - Math.floor(g / N)) + Math.abs((i % N) - (g % N));
  });
  return d;
}

export const isSolved = (b: readonly number[]) => b.every((v, i) => v === GOAL[i]);

export function makeBoard(
  uuid: string,
  rng: (stream: string) => Rng = (s) => rngFor(uuid, GAME, s),
): number[] {
  const r = rng('main');
  let last: number[] = [...GOAL];
  for (let k = 0; k < 200; k++) {
    const b = r.shuffle(GOAL);
    if (!isSolvable(b) || isSolved(b)) continue;
    last = b;
    if (manhattan(b) >= MIN_MANHATTAN) return b;
  }
  return last;
}

/**
 * Schiebt Kachel an Position `i` Richtung Lücke. Liegt sie in derselben Zeile oder Spalte,
 * rutschen alle Kacheln dazwischen mit. Liefert das neue Feld und die Zahl bewegter Kacheln.
 */
export function slide(b: readonly number[], i: number): { board: number[]; moved: number } | null {
  const z = b.indexOf(0);
  if (i === z || i < 0 || i >= SIZE) return null;
  const [ri, ci, rz, cz] = [Math.floor(i / N), i % N, Math.floor(z / N), z % N];
  if (ri !== rz && ci !== cz) return null;
  // die Lücke wandert Schritt für Schritt zur angetippten Kachel
  const stride = ri === rz ? (ci < cz ? -1 : 1) : ri < rz ? -N : N;
  const board = [...b];
  let pos = z;
  let moved = 0;
  while (pos !== i) {
    const next = pos + stride;
    board[pos] = board[next]!;
    board[next] = 0;
    pos = next;
    moved++;
  }
  return { board, moved };
}

/** Index der Kachel, die eine Pfeiltaste in die Lücke schiebt (die Kachel bewegt sich in Pfeilrichtung). */
export function arrowTarget(b: readonly number[], key: string): number | null {
  const z = b.indexOf(0);
  const [r, c] = [Math.floor(z / N), z % N];
  switch (key) {
    case 'ArrowUp':
      return r < N - 1 ? z + N : null;
    case 'ArrowDown':
      return r > 0 ? z - N : null;
    case 'ArrowLeft':
      return c < N - 1 ? z + 1 : null;
    case 'ArrowRight':
      return c > 0 ? z - 1 : null;
    default:
      return null;
  }
}

const solveCache = new Map<string, number[]>();

/** Kürzeste Lösung als Folge von Positionen, die nacheinander angetippt werden (je ein Zug). */
export function solve(start: readonly number[]): number[] {
  const key = start.join('');
  const hit = solveCache.get(key);
  if (hit) return hit;
  const goal = GOAL.join('');
  const prev = new Map<string, [string, number] | null>([[key, null]]);
  let frontier = [key];
  outer: while (frontier.length) {
    const next: string[] = [];
    for (const s of frontier) {
      if (s === goal) break outer;
      const z = s.indexOf('0');
      const [r, c] = [Math.floor(z / N), z % N];
      for (const [dr, dc] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ] as const) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= N || nc < 0 || nc >= N) continue;
        const i = nr * N + nc;
        const a = s.split('');
        [a[z], a[i]] = [a[i]!, a[z]!];
        const t = a.join('');
        if (prev.has(t)) continue;
        prev.set(t, [s, i]);
        next.push(t);
      }
    }
    frontier = next;
  }
  const path: number[] = [];
  for (let s = goal, p = prev.get(s); p; s = p[0], p = prev.get(s)) path.unshift(p[1]);
  solveCache.set(key, path);
  return path;
}

export const optimalMoves = (uuid: string) => solve(makeBoard(uuid)).length;

/** Felder: [Züge, Zeit in ms]; weniger Züge als die kürzeste Lösung sind unmöglich. */
export function isValid(f: readonly number[], uuid?: string): boolean {
  if (f.length !== 2 || f[0]! > 9999 || f[1]! < 1000 || f[1]! > 3_600_000) return false;
  return uuid ? f[0]! >= optimalMoves(uuid) : f[0]! >= 1;
}
