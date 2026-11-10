import { describe, expect, it } from 'vitest';
import * as mem from '@/games/memory/logic';
import * as srt from '@/games/sort/logic';
import * as seq from '@/games/sequence/logic';
import * as hex from '@/games/hexcolor/logic';
import { memory } from '@/games/memory/meta';
import { sort } from '@/games/sort/meta';
import { sequence } from '@/games/sequence/meta';
import { hexcolor } from '@/games/hexcolor/meta';
import { games } from '@/games/registry';
import { decodeResult, encodeResult } from '@/lib/share/codec';
import { initialState } from '@/games/shell/challenge';

const U = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const V = '00000000-0000-4000-8000-000000000000';
const V7a = '019a6b2c-3d4e-7000-8000-000000000001';
const V7b = '019a6b2c-3d4e-7000-8000-000000000002';

describe('Memory', () => {
  it('Determinismus: gleiche UUID → gleiche Kartenlage, andere UUID → andere', () => {
    expect(mem.makeDeck(U.toUpperCase())).toEqual(mem.makeDeck(U));
    expect(mem.makeDeck(V).cards).not.toEqual(mem.makeDeck(U).cards);
    expect(mem.makeDeck(V7a).cards).not.toEqual(mem.makeDeck(V7b).cards);
    expect(mem.makeDeck(U).cards.map(mem.hexDigit).join('')).toMatchInlineSnapshot(
      `"592d49e2e43fd35f"`,
    );
  });

  it('acht verschiedene Ziffern, jede genau zweimal', () => {
    const d = mem.makeDeck(U);
    expect(new Set(d.digits).size).toBe(mem.PAIRS);
    for (const x of d.digits) expect(d.cards.filter((c) => c === x)).toHaveLength(2);
  });

  it('Züge: Paar bleibt offen, Fehlgriff wird beim nächsten Tipp zugedeckt', () => {
    const d = mem.makeDeck(U);
    const a = 0;
    const twin = d.cards.findIndex((c, j) => j !== a && c === d.cards[a]);
    const other = d.cards.findIndex((c) => c !== d.cards[a]);
    let s = mem.initialState();
    s = mem.flip(d, s, a).state;
    const miss = mem.flip(d, s, other);
    expect(miss.event).toBe('miss');
    expect(miss.state.moves).toBe(1);
    const next = mem.flip(d, miss.state, a);
    expect(next.state.open).toEqual([a]);
    const hit = mem.flip(d, next.state, twin);
    expect(hit.event).toBe('match');
    expect(hit.state.matched[a] && hit.state.matched[twin]).toBe(true);
    expect(mem.flip(d, hit.state, a).event).toBe('none');
  });

  it('perfektes Spiel = 8 Züge', () => {
    const d = mem.makeDeck(U);
    let s = mem.initialState();
    for (const x of d.digits) {
      const [i, j] = d.cards.flatMap((c, k) => (c === x ? [k] : []));
      s = mem.flip(d, mem.flip(d, s, i!).state, j!).state;
    }
    expect(mem.isDone(s)).toBe(true);
    expect(s.moves).toBe(8);
  });

  it('Wertung und Plausibilität', () => {
    expect(memory.compare([10, 50_000], [12, 20_000])).toBeLessThan(0);
    expect(memory.compare([10, 30_000], [10, 40_000])).toBeLessThan(0);
    expect(memory.verdict([10, 30_000], [12, 20_000], 'ada')).toContain('2 Züge weniger');
    expect(memory.verdict([10, 30_000], [10, 32_500], 'ada')).toContain('2,5 s schneller');
    expect(mem.isValid([7, 10_000])).toBe(false);
    expect(mem.isValid([8, 10_000])).toBe(true);
  });
});

describe('Sortieren', () => {
  it('Determinismus und Lösbarkeit', () => {
    expect(srt.makeBoard(U.toUpperCase())).toEqual(srt.makeBoard(U));
    expect(srt.makeBoard(V)).not.toEqual(srt.makeBoard(U));
    expect(srt.makeBoard(V7a)).not.toEqual(srt.makeBoard(V7b));
    expect(srt.makeBoard(U)).toMatchInlineSnapshot(`
      [
        8,
        1,
        0,
        3,
        4,
        7,
        6,
        2,
        5,
      ]
    `);
    for (const u of [U, V, V7a, V7b]) {
      const b = srt.makeBoard(u);
      expect(srt.isSolvable(b)).toBe(true);
      expect(srt.isSolved(b)).toBe(false);
      expect([...b].sort()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    }
  });

  it('Schieben: Nachbar, ganze Zeile und Spalte; diagonal geht nicht', () => {
    const b = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    expect(srt.slide(b, 7)).toEqual({ board: [1, 2, 3, 4, 5, 6, 7, 0, 8], moved: 1 });
    expect(srt.slide(b, 6)).toEqual({ board: [1, 2, 3, 4, 5, 6, 0, 7, 8], moved: 2 });
    expect(srt.slide(b, 2)).toEqual({ board: [1, 2, 0, 4, 5, 3, 7, 8, 6], moved: 2 });
    expect(srt.slide(b, 4)).toBeNull();
    expect(srt.arrowTarget(b, 'ArrowRight')).toBe(7);
    expect(srt.arrowTarget(b, 'ArrowDown')).toBe(5);
    expect(srt.arrowTarget(b, 'ArrowLeft')).toBeNull();
  });

  it('die berechnete kürzeste Lösung löst das Feld wirklich', () => {
    for (const u of [U, V]) {
      const path = srt.solve(srt.makeBoard(u));
      let b = srt.makeBoard(u);
      for (const i of path) b = srt.slide(b, i)!.board;
      expect(srt.isSolved(b)).toBe(true);
      expect(path.length).toBeGreaterThanOrEqual(srt.manhattan(srt.makeBoard(u)));
    }
  });

  it('weniger Züge als die kürzeste Lösung sind ungültig', () => {
    const opt = srt.optimalMoves(U);
    expect(sort.valid([opt, 20_000], U)).toBe(true);
    expect(sort.valid([opt - 1, 20_000], U)).toBe(false);
    expect(sort.trace(U)[1]!.value).toBe(`${opt} Züge`);
  });
});

describe('Sequenz', () => {
  it('Determinismus: 20 Schritte aus 1–4', () => {
    expect(seq.makeSequence(U.toUpperCase())).toEqual(seq.makeSequence(U));
    expect(seq.makeSequence(V)).not.toEqual(seq.makeSequence(U));
    expect(seq.makeSequence(V7a)).not.toEqual(seq.makeSequence(V7b));
    expect(seq.makeSequence(U).join('')).toMatchInlineSnapshot(`"12142132421421211344"`);
    const s = seq.makeSequence(U);
    expect(s).toHaveLength(seq.MAX_LEVEL);
    expect(s.every((x) => x >= 1 && x <= 4)).toBe(true);
  });

  it('Eingaben prüfen', () => {
    const s = [2, 4, 1, ...Array(17).fill(3)];
    expect(seq.check(s, 3, 0, 2)).toBe('ok');
    expect(seq.check(s, 3, 1, 1)).toBe('wrong');
    expect(seq.check(s, 3, 2, 1)).toBe('level');
    expect(seq.check(s, 20, 19, 3)).toBe('win');
  });

  it('Tempo zieht an, bleibt aber spielbar', () => {
    expect(seq.timing(1).on).toBeGreaterThan(seq.timing(10).on);
    expect(seq.timing(20).on).toBeGreaterThanOrEqual(260);
  });

  it('Wertung', () => {
    expect(sequence.compare([9], [7])).toBeLessThan(0);
    expect(sequence.verdict([9], [7], 'ada')).toBe('Du bist 2 Stufen weiter gekommen als ada.');
    expect(seq.isValid([21])).toBe(false);
    expect(seq.isValid([0])).toBe(true);
  });
});

describe('Hex-Farben', () => {
  it('Determinismus: zehn Runden, gleiche UUID → gleiche Farben und Antworten', () => {
    expect(hex.makeRounds(U.toUpperCase())).toEqual(hex.makeRounds(U));
    expect(hex.makeRounds(V)).not.toEqual(hex.makeRounds(U));
    expect(hex.makeRounds(V7a)).not.toEqual(hex.makeRounds(V7b));
    expect(hex.makeRounds(U).map((r) => r.target)).toMatchInlineSnapshot(`
      [
        "#a54f8a",
        "#6a8f1f",
        "#211c92",
        "#8f65b8",
        "#1dbc4d",
        "#d42985",
        "#afbb30",
        "#63c19c",
        "#879a26",
        "#8ad47e",
      ]
    `);
  });

  it('vier verschiedene Optionen, genau eine richtig, enger werdend', () => {
    for (const u of [U, V, V7a]) {
      for (const r of hex.makeRounds(u)) {
        expect(r.options).toHaveLength(hex.OPTIONS);
        expect(new Set(r.options).size).toBe(hex.OPTIONS);
        expect(r.options[r.answer]).toBe(r.target);
        for (const o of r.options) expect(o).toMatch(/^#[0-9a-f]{6}$/);
      }
    }
    expect(hex.spreadOf(0)).toBeGreaterThan(hex.spreadOf(9));
  });

  it('Wertung: mehr Treffer, dann Zeit', () => {
    expect(hexcolor.compare([8, 30_000], [7, 10_000])).toBeLessThan(0);
    expect(hexcolor.compare([8, 30_000], [8, 20_000])).toBeGreaterThan(0);
    expect(hexcolor.headline([8, 1]).value).toBe('8 von 10');
  });
});

describe('Alle Spiele', () => {
  it('fünf Spiele live, IDs fest', () => {
    expect(games.map((g) => [g.slug, g.id, g.status])).toEqual([
      ['reaction', 1, 'live'],
      ['memory', 2, 'live'],
      ['sort', 3, 'live'],
      ['sequence', 4, 'live'],
      ['hexcolor', 5, 'live'],
    ]);
  });

  it('jeder Ergebnis-Link roundtrippt durch Codec und Startzustand', () => {
    const samples: Record<string, number[]> = {
      memory: [12, 41_300],
      sort: [srt.optimalMoves(U) + 4, 52_100],
      sequence: [9],
      hexcolor: [7, 18_400],
    };
    for (const g of games.filter((x) => samples[x.slug])) {
      const fields = samples[g.slug]!;
      const code = encodeResult(U, { gameId: g.id, fields, nick: 'ada' });
      expect(decodeResult(U, code)).toMatchObject({ ok: true });
      const st = initialState(g, { search: `?id=${U}`, hash: `#r=${code}` }, () => V);
      expect(st.challenge).toEqual({ nick: 'ada', fields });
    }
  });
});
