import { describe, expect, it } from 'vitest';
import {
  MISS,
  PENALTY,
  ROUNDS,
  SPARES,
  WAIT_MAX,
  WAIT_MIN,
  isValid,
  judge,
  makePlan,
  toFields,
  waitFor,
} from '@/games/reaction/logic';
import { reaction } from '@/games/reaction/meta';
import { games } from '@/games/registry';

const U = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

describe('Reaktionstest – Determinismus', () => {
  it('gleiche UUID → identischer Plan (auch in Großbuchstaben)', () => {
    expect(makePlan(U.toUpperCase())).toEqual(makePlan(U));
  });

  it('fester Plan für eine bekannte UUID (plattformstabil)', () => {
    const p = makePlan(U);
    expect({ waits: p.waits, colors: p.colors, spares: p.spares.slice(0, 3) })
      .toMatchInlineSnapshot(`
        {
          "colors": [
            3,
            4,
            2,
            2,
            1,
          ],
          "spares": [
            2400,
            3060,
            2080,
          ],
          "waits": [
            3640,
            1850,
            4120,
            4060,
            3460,
          ],
        }
      `);
  });

  it('andere UUID → anderer Plan; Werte im erlaubten Bereich', () => {
    expect(makePlan('00000000-0000-4000-8000-000000000000').waits).not.toEqual(makePlan(U).waits);
    const p = makePlan(U);
    expect(p.waits).toHaveLength(ROUNDS);
    expect(p.spares).toHaveLength(SPARES);
    for (const w of [...p.waits, ...p.spares]) {
      expect(w).toBeGreaterThanOrEqual(WAIT_MIN);
      expect(w).toBeLessThanOrEqual(WAIT_MAX);
      expect(w % 10).toBe(0);
    }
    expect(p.colors.every((c) => c >= 1 && c <= 5)).toBe(true);
  });

  it('streut auch bei v7-UUIDs mit gleichem Zeitstempel', () => {
    const a = makePlan('019a6b2c-3d4e-7000-8000-000000000001').waits;
    const b = makePlan('019a6b2c-3d4e-7000-8000-000000000002').waits;
    expect(a).not.toEqual(b);
  });

  it('Frühstarts ziehen Ersatz-Wartezeiten in fester Reihenfolge', () => {
    const p = makePlan(U);
    expect(waitFor(p, 2, 0, false)).toBe(p.waits[2]);
    expect(waitFor(p, 2, 1, true)).toBe(p.spares[0]);
    expect(waitFor(p, 4, 3, true)).toBe(p.spares[2]);
    expect(waitFor(p, 0, SPARES + 1, true)).toBe(p.spares[0]);
  });
});

describe('Reaktionstest – Wertung', () => {
  it('Felder: Schnitt + Strafe, Bestwert, Frühstarts, Einzelzeiten', () => {
    expect(toFields([200, 250, 300, 220, 230], 0)).toEqual([240, 200, 0, 200, 250, 300, 220, 230]);
    expect(toFields([200, 250, 300, 220, 230], 2)[0]).toBe(240 + 2 * PENALTY);
    expect(toFields([5000, 200, 200, 200, 200], 0)[3]).toBe(MISS);
  });

  it('unter 100 ms gilt als Frühstart', () => {
    expect(judge(-5)).toBe('foul');
    expect(judge(99)).toBe('foul');
    expect(judge(100)).toBe('hit');
  });

  it('prüft Felder auf Plausibilität', () => {
    expect(isValid(toFields([200, 250, 300, 220, 230], 1))).toBe(true);
    expect(isValid([1, 1, 0, 1, 1, 1, 1, 1])).toBe(false);
    expect(isValid([240, 200, 0, 200, 250])).toBe(false);
    const f = toFields([200, 250, 300, 220, 230], 0);
    f[0] = 100;
    expect(isValid(f)).toBe(false);
  });

  it('Vergleich und Urteil', () => {
    const fast = toFields([200, 200, 200, 200, 200], 0);
    const slow = toFields([223, 223, 223, 223, 223], 0);
    expect(reaction.compare(fast, slow)).toBeLessThan(0);
    expect(reaction.verdict(fast, slow, 'ada')).toBe('Du warst 23 ms schneller als ada.');
    expect(reaction.verdict(slow, fast, 'ada')).toBe('ada war 23 ms schneller.');
    expect(reaction.verdict(fast, fast, 'ada')).toContain('Gleichstand');
  });
});

describe('Registry', () => {
  it('IDs und Slugs sind eindeutig, IDs passen in ein Byte', () => {
    expect(new Set(games.map((g) => g.id)).size).toBe(games.length);
    expect(new Set(games.map((g) => g.slug)).size).toBe(games.length);
    expect(games.every((g) => g.id > 0 && g.id < 256)).toBe(true);
    expect(games.filter((g) => g.status === 'live').every((g) => g.load)).toBe(true);
  });
});
