import { describe, expect, it } from 'vitest';
import {
  v1,
  v4,
  v5,
  v6,
  v7,
  NIL,
  MAX,
  NAMESPACES,
  newTimeState,
  type RandomFn,
} from '@/lib/uuid/generate';
import { decode } from '@/lib/uuid/decode';
import { formatUuid, allFormats } from '@/lib/uuid/formats';
import { ulid, ulidTime, ulidToBytes, nanoid, bytesToUlid } from '@/lib/uuid/alt-ids';
import { bytesToBase58, bytesToBase64Url, fromBytes, toBytes } from '@/lib/uuid/bytes';

const fixed =
  (...bytes: number[]): RandomFn =>
  (n) =>
    Uint8Array.from(bytes.slice(0, n));
const hexBytes = (hex: string) => Uint8Array.from(hex.match(/../g)!.map((h) => parseInt(h, 16)));

// RFC 9562, Anhang A: Zeitpunkt 2022-02-22 14:22:22-05:00
const RFC_MS = Date.UTC(2022, 1, 22, 19, 22, 22);
const RFC_NODE = hexBytes('9f6bdeced846');

describe('RFC-9562-Testvektoren', () => {
  it('v1 (A.1)', () => {
    expect(v1({ ms: RFC_MS, clockSeq: 0x33c8, node: RFC_NODE })).toBe(
      'c232ab00-9414-11ec-b3c8-9f6bdeced846',
    );
  });
  it('v4 (A.3)', () => {
    const bytes = hexBytes('919108f752d133205bacf847db4148a8');
    expect(v4(() => bytes.slice())).toBe('919108f7-52d1-4320-9bac-f847db4148a8');
  });
  it('v5 (A.4)', async () => {
    expect(await v5(NAMESPACES.DNS, 'www.example.com')).toBe(
      '2ed6657d-e927-568b-95e1-2665a8aea6a2',
    );
  });
  it('v6 (A.5)', () => {
    expect(v6({ ms: RFC_MS, clockSeq: 0x33c8, node: RFC_NODE })).toBe(
      '1ec9414c-232a-6b00-b3c8-9f6bdeced846',
    );
  });
  it('v7 (A.6)', () => {
    const random = fixed(0x18, 0xc4, 0xdc, 0x0c, 0x0c, 0x07, 0x39, 0x8f);
    expect(v7({ ms: 0x017f22e279b0, randA: 0xcc3, random })).toBe(
      '017f22e2-79b0-7cc3-98c4-dc0c0c07398f',
    );
  });
  it('Nil und Max', () => {
    expect(NIL).toBe('00000000-0000-0000-0000-000000000000');
    expect(MAX).toBe('ffffffff-ffff-ffff-ffff-ffffffffffff');
  });
});

describe('Generatoren (echter Zufall)', () => {
  const RE = (v: number) =>
    new RegExp(`^[0-9a-f]{8}-[0-9a-f]{4}-${v}[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`);
  it('setzen Version und Variante', () => {
    expect(v4()).toMatch(RE(4));
    expect(v7()).toMatch(RE(7));
    expect(v1()).toMatch(RE(1));
    expect(v6()).toMatch(RE(6));
  });
  it('v4: 1000 Stück, alle verschieden', () => {
    expect(new Set(Array.from({ length: 1000 }, () => v4())).size).toBe(1000);
  });
  it('v7: Bulk in derselben Millisekunde bleibt streng sortiert', () => {
    const st = { lastMs: 0, counter: 0 };
    const list = Array.from({ length: 1000 }, () => v7({ ms: 1_700_000_000_000, state: st }));
    expect([...list].sort()).toEqual(list);
    expect(new Set(list).size).toBe(1000);
  });
  it('v1/v6: Bulk mit gemeinsamem Zustand ist eindeutig, v6 sortierbar', () => {
    const s1 = newTimeState();
    const s6 = newTimeState();
    const a = Array.from({ length: 1000 }, () => v1({ ms: RFC_MS, state: s1 }));
    const b = Array.from({ length: 1000 }, () => v6({ ms: RFC_MS, state: s6 }));
    expect(new Set(a).size).toBe(1000);
    expect([...b].sort()).toEqual(b);
    // zufälliger Knoten hat das Multicast-Bit gesetzt
    expect(toBytes(a[0]!)![10]! & 1).toBe(1);
  });
  it('v5 ist deterministisch und namensabhängig', async () => {
    expect(await v5(NAMESPACES.URL, 'https://uuidea.de')).toBe(
      await v5(NAMESPACES.URL, 'https://uuidea.de'),
    );
    expect(await v5(NAMESPACES.URL, 'a')).not.toBe(await v5(NAMESPACES.URL, 'b'));
    await expect(v5('kaputt', 'x')).rejects.toThrow();
  });
});

describe('Decoder', () => {
  it('liest v1/v6/v7-Zeit, Clock-Sequenz und Knoten', () => {
    const d1 = decode('C232AB00-9414-11EC-B3C8-9F6BDECED846');
    expect(d1.ok && d1.value.version).toBe(1);
    if (!d1.ok) throw new Error();
    expect(d1.value.timeMs).toBe(RFC_MS);
    expect(d1.value.clockSeq).toBe(0x33c8);
    expect(d1.value.node).toBe('9f:6b:de:ce:d8:46');
    const d6 = decode('1ec9414c-232a-6b00-b3c8-9f6bdeced846');
    expect(d6.ok && d6.value.timeMs).toBe(RFC_MS);
    const d7 = decode('017f22e2-79b0-7cc3-98c4-dc0c0c07398f');
    expect(d7.ok && d7.value.timeMs).toBe(0x017f22e279b0);
  });
  it('erkennt Eingabeformate', () => {
    const u = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const b = toBytes(u)!;
    const cases: [string, string][] = [
      [u, 'standard'],
      [u.replace(/-/g, ''), 'compact'],
      [`{${u.toUpperCase()}}`, 'braces'],
      [`urn:uuid:${u}`, 'urn'],
      [bytesToBase64Url(b), 'base64url'],
      [bytesToBase58(b), 'base58'],
    ];
    for (const [input, fmt] of cases) {
      const d = decode(input);
      expect(d.ok, input).toBe(true);
      if (d.ok) {
        expect(d.value.uuid).toBe(u);
        expect(d.value.inputFormat).toBe(fmt);
        expect(d.value.version).toBe(4);
        expect(d.value.variant).toBe('rfc9562');
      }
    }
  });
  it('Base64URL/Base58: richtige UUID ist immer dabei, erste Wahl in > 99 %', () => {
    let total = 0;
    let firstWrong = 0;
    for (let i = 0; i < 1000; i++) {
      for (const u of [v4(), v7()]) {
        const b = toBytes(u)!;
        for (const enc of [bytesToBase64Url(b), bytesToBase58(b)]) {
          const d = decode(enc);
          expect(d.ok).toBe(true);
          if (!d.ok) continue;
          total++;
          if (d.value.uuid !== u) {
            firstWrong++;
            expect(d.value.alternative?.uuid, enc).toBe(u);
          }
        }
      }
    }
    expect(firstWrong / total).toBeLessThan(0.01);
  });
  it('Nil, Max und Varianten', () => {
    const nil = decode(NIL);
    expect(nil.ok && nil.value.isNil).toBe(true);
    const max = decode(MAX);
    expect(max.ok && max.value.isMax).toBe(true);
    const ms = decode('00000000-0000-0000-c000-000000000000');
    expect(ms.ok && ms.value.variant).toBe('microsoft');
    const ncs = decode('00000000-0000-0000-0000-000000000001');
    expect(ncs.ok && ncs.value.variant).toBe('ncs');
  });
  it('lehnt kaputte Eingaben ab', () => {
    for (const bad of [
      '',
      '   ',
      'hallo welt',
      'f47ac10b-58cc-4372-a567-0e02b2c3d47', // zu kurz
      'f47ac10b-58cc-4372-a567-0e02b2c3d4799', // zu lang
      'f47ac10b58cc-4372-a567-0e02-b2c3d479', // Bindestriche falsch
      '{f47ac10b-58cc-4372-a567-0e02b2c3d479', // Klammer fehlt
      'g47ac10b-58cc-4372-a567-0e02b2c3d479', // kein Hex
    ]) {
      expect(decode(bad).ok, JSON.stringify(bad)).toBe(false);
    }
  });
});

describe('Formate', () => {
  const u = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
  it('formatUuid', () => {
    const base = { encoding: 'hex' as const, upper: false, hyphens: true, braces: false };
    expect(formatUuid(u, base)).toBe(u);
    expect(formatUuid(u, { ...base, upper: true, hyphens: false, braces: true })).toBe(
      '{F47AC10B58CC4372A5670E02B2C3D479}',
    );
    expect(formatUuid(u, { ...base, encoding: 'base64url' })).toHaveLength(22);
  });
  it('allFormats liefert dekodierbare Darstellungen', () => {
    for (const f of allFormats(u).filter((x) => x.key !== 'bytes')) {
      const d = decode(f.value);
      expect(d.ok && d.value.uuid, f.key).toBe(u);
    }
  });
});

describe('ULID & Nano ID', () => {
  it('ULID: 26 Zeichen, Zeit lesbar, bitgleich als UUID', () => {
    const ms = 1_762_709_467_412;
    const id = ulid(ms, () => new Uint8Array(10).fill(0xff));
    expect(id).toHaveLength(26);
    expect(id.endsWith('ZZZZZZZZZZZZZZZZ')).toBe(true);
    expect(ulidTime(id)).toBe(ms);
    const b = ulidToBytes(id)!;
    expect(fromBytes(b).startsWith(ms.toString(16).padStart(12, '0').slice(0, 8))).toBe(true);
    expect(ulidTime('nope')).toBeNull();
    expect(bytesToUlid(b)).toBe(id);
  });
  it('ULID-Spezifikationsbeispiel ↔ UUID', () => {
    const b = ulidToBytes('01ARZ3NDEKTSV4RRFFQ69G5FAV')!;
    expect(fromBytes(b)).toBe('01563e3a-b5d3-d676-4c61-efb99302bd5b');
    expect(bytesToUlid(b)).toBe('01ARZ3NDEKTSV4RRFFQ69G5FAV');
  });
  it('Nano ID: 21 URL-sichere Zeichen', () => {
    const id = nanoid();
    expect(id).toMatch(/^[A-Za-z0-9_-]{21}$/);
    expect(new Set(Array.from({ length: 500 }, () => nanoid())).size).toBe(500);
  });
});
