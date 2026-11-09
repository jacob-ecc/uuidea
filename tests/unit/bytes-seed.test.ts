import { describe, expect, it } from 'vitest';
import {
  toBytes,
  fromBytes,
  bytesToBase64Url,
  base64UrlToBytes,
  bytesToBase58,
  base58ToBytes,
  versionOf,
  v7Timestamp,
} from '@/lib/uuid/bytes';
import { rngFor } from '@/lib/seed/prng';

const U = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

describe('bytes & Formate', () => {
  it('Roundtrip über alle Schreibweisen', () => {
    for (const s of [U, U.toUpperCase(), `{${U}}`, `urn:uuid:${U}`, U.replace(/-/g, '')])
      expect(fromBytes(toBytes(s)!)).toBe(U);
    expect(toBytes('nope')).toBeNull();
  });

  it('Base64URL (22 Zeichen) und Base58 roundtrippen', () => {
    const b = toBytes(U)!;
    const b64 = bytesToBase64Url(b);
    expect(b64).toHaveLength(22);
    expect(b64).toBe(Buffer.from(b).toString('base64url'));
    expect(fromBytes(base64UrlToBytes(b64)!)).toBe(U);
    expect(fromBytes(base58ToBytes(bytesToBase58(b))!)).toBe(U);
    expect(bytesToBase58(new Uint8Array(16))).toBe('1'.repeat(16));
    expect(base58ToBytes('0OIl')).toBeNull();
  });

  it('liest Version und v7-Zeitstempel (RFC-9562-Beispiel)', () => {
    const v7 = toBytes('017f22e2-79b0-7cc3-98c4-dc0c0c07398f')!;
    expect(versionOf(v7)).toBe(7);
    expect(new Date(v7Timestamp(v7)).toISOString()).toBe('2022-02-22T19:22:22.000Z');
  });
});

describe('Seed-PRNG', () => {
  it('gleiche UUID → identische Folge, unabhängig von Groß-/Kleinschreibung', () => {
    const a = rngFor(U, 'memory');
    const b = rngFor(U.toUpperCase(), 'memory');
    const xs = Array.from({ length: 50 }, () => a.next());
    expect(Array.from({ length: 50 }, () => b.next())).toEqual(xs);
    expect(xs.every((x) => x >= 0 && x < 1)).toBe(true);
  });

  it('andere UUID oder anderes Spiel → andere Folge', () => {
    const first = (u: string, g: string) => rngFor(u, g).next();
    expect(first(U, 'memory')).not.toBe(first(U, 'sort'));
    expect(first(U, 'memory')).not.toBe(first('00000000-0000-4000-8000-000000000000', 'memory'));
  });

  it('ist plattformstabil (feste Werte)', () => {
    const r = rngFor(U, 'memory');
    expect(Array.from({ length: 4 }, () => r.int(0, 999))).toMatchInlineSnapshot(`
      [
        440,
        460,
        849,
        828,
      ]
    `);
  });
});
