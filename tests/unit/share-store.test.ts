import { describe, expect, it } from 'vitest';
import {
  FIELD_MAX,
  buildShareUrl,
  clampNick,
  crc16,
  decodeResult,
  encodeResult,
  parseChallengeUrl,
  readVarint,
  writeVarint,
} from '@/lib/share/codec';
import { createLocalStore, memoryKV, STORE_KEY } from '@/lib/store/results';
import { initialState } from '@/games/shell/challenge';
import { reaction } from '@/games/reaction/meta';

const U = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const U2 = '017f22e2-79b0-7cc3-98c4-dc0c0c07398f';

describe('Varint', () => {
  it('roundtrippt Grenzwerte', () => {
    for (const v of [0, 1, 127, 128, 255, 16383, 16384, 2 ** 21, 2 ** 28 - 1, FIELD_MAX]) {
      const out: number[] = [];
      writeVarint(out, v);
      expect(readVarint(Uint8Array.from(out), 0)).toEqual({ value: v, next: out.length });
    }
  });
  it('lehnt Unsinn ab', () => {
    expect(() => writeVarint([], -1)).toThrow();
    expect(() => writeVarint([], 1.5)).toThrow();
    expect(() => writeVarint([], FIELD_MAX + 1)).toThrow();
    expect(readVarint(Uint8Array.from([0x80, 0x80]), 0)).toBeNull();
    expect(readVarint(Uint8Array.from([0xff, 0xff, 0xff, 0xff, 0xff, 0x01]), 0)).toBeNull();
  });
});

describe('CRC-16/CCITT-FALSE', () => {
  it('Prüfwert für "123456789" ist 0x29B1', () => {
    expect(crc16(new TextEncoder().encode('123456789'))).toBe(0x29b1);
  });
});

describe('Kürzel', () => {
  it('kürzt auf 12 UTF-8-Bytes ohne Zeichen zu zerschneiden', () => {
    expect(clampNick('  ada  ')).toBe('ada');
    expect(clampNick('abcdefghijklmnop')).toBe('abcdefghijkl');
    expect(clampNick('ääääääää')).toBe('ääääää'); // 2 Byte pro ä
    expect(clampNick('🦊🦊🦊🦊')).toBe('🦊🦊🦊'); // 4 Byte pro Emoji
    expect(clampNick('a\u0000b\nc')).toBe('abc');
  });
});

describe('Ergebnis-Codec', () => {
  const r = { gameId: 1, fields: [243, 201, 1, 201, 250, 233, 280, 251], nick: 'Jörg' };

  it('roundtrippt', () => {
    const code = encodeResult(U, r);
    expect(code).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decodeResult(U, code)).toEqual({ ok: true, value: r });
    // Groß-/Kleinschreibung und Schreibweise der UUID egal
    expect(decodeResult(U.toUpperCase(), code).ok).toBe(true);
    expect(decodeResult(`{${U}}`, code).ok).toBe(true);
  });

  it('ist stabil (festes Format)', () => {
    expect(encodeResult(U, r)).toMatchInlineSnapshot(`"AQEI8wHJAQHJAfoB6QGYAvsBBUrDtnJn7uA"`);
  });

  it('erkennt eine vertauschte UUID über die CRC', () => {
    expect(decodeResult(U2, encodeResult(U, r))).toEqual({ ok: false, error: 'crc' });
  });

  it('erkennt manipulierte Bytes', () => {
    const code = encodeResult(U, r);
    const flipped = code.slice(0, 5) + (code[5] === 'A' ? 'B' : 'A') + code.slice(6);
    expect(decodeResult(U, flipped).ok).toBe(false);
    expect(decodeResult(U, 'x')).toEqual({ ok: false, error: 'format' });
    expect(decodeResult(U, 'ä!')).toEqual({ ok: false, error: 'format' });
    expect(decodeResult('nope', code)).toEqual({ ok: false, error: 'uuid' });
  });

  it('leeres Kürzel und keine Felder sind erlaubt', () => {
    const e = { gameId: 9, fields: [], nick: '' };
    expect(decodeResult(U, encodeResult(U, e))).toEqual({ ok: true, value: e });
  });

  it('baut und liest Links', () => {
    const url = buildShareUrl('https://uuidea.de', 'reaction', U, 'abc');
    expect(url).toBe(`https://uuidea.de/games/reaction?id=${U}#r=abc`);
    const u = new URL(url);
    expect(parseChallengeUrl(u)).toEqual({ id: U, code: 'abc' });
    expect(parseChallengeUrl({ search: '', hash: '' })).toEqual({ id: null, code: null });
  });
});

describe('ResultStore (localStorage)', () => {
  const entry = (at: number, game = 'reaction', uuid = U) => ({
    game,
    uuid,
    fields: [300, 250, 0, 250, 300, 310, 320, 320],
    at,
  });

  it('speichert, listet (neueste zuerst) und löscht pro Spiel', () => {
    const s = createLocalStore(memoryKV());
    s.add(entry(1));
    s.add(entry(3));
    s.add(entry(2, 'memory'));
    expect(s.list('reaction').map((r) => r.at)).toEqual([3, 1]);
    expect(s.list()).toHaveLength(3);
    s.clear('reaction');
    expect(s.list().map((r) => r.game)).toEqual(['memory']);
  });

  it('übersteht kaputten Speicher', () => {
    const kv = memoryKV();
    kv.setItem(STORE_KEY, '{kaputt');
    expect(createLocalStore(kv).list()).toEqual([]);
    kv.setItem(STORE_KEY, JSON.stringify([entry(1), { game: 'x' }, null]));
    expect(createLocalStore(kv).list()).toHaveLength(1);
  });

  it('Export/Import ohne Dubletten', () => {
    const a = createLocalStore(memoryKV());
    a.add(entry(1));
    a.add(entry(2));
    const b = createLocalStore(memoryKV());
    b.add(entry(2));
    expect(b.import(a.export())).toBe(1);
    expect(b.list().map((r) => r.at)).toEqual([2, 1]);
    expect(b.import(a.export())).toBe(0);
    expect(() => b.import('[]')).toThrow();
    expect(() => b.import('nope')).toThrow();
  });
});

describe('Startzustand aus dem Link', () => {
  const fields = [343, 201, 1, 201, 250, 233, 280, 251];
  const fallback = () => U2;
  const link = (id: string, code?: string) => ({
    search: `?id=${id}`,
    hash: code ? `#r=${code}` : '',
  });

  it('ohne Link: Fallback-UUID', () => {
    expect(initialState(reaction, { search: '', hash: '' }, fallback)).toMatchObject({
      uuid: U2,
      fromLink: false,
      challenge: null,
      error: null,
    });
  });

  it('mit gültiger Herausforderung', () => {
    const code = encodeResult(U, { gameId: 1, fields, nick: 'ada' });
    expect(initialState(reaction, link(U.toUpperCase(), code), fallback)).toEqual({
      uuid: U,
      fromLink: true,
      challenge: { nick: 'ada', fields },
      error: null,
    });
  });

  it('beschädigt, anderes Spiel oder unplausible Werte', () => {
    const code = encodeResult(U, { gameId: 1, fields, nick: 'ada' });
    expect(initialState(reaction, link(U2, code), fallback).error).toBe('broken');
    expect(initialState(reaction, link('quatsch', code), fallback)).toMatchObject({
      uuid: U2,
      error: 'broken',
    });
    const other = encodeResult(U, { gameId: 2, fields, nick: '' });
    expect(initialState(reaction, link(U, other), fallback).error).toBe('game');
    const cheat = encodeResult(U, { gameId: 1, fields: [1, 1, 0, 1, 1, 1, 1, 1], nick: '' });
    expect(initialState(reaction, link(U, cheat), fallback).error).toBe('broken');
  });
});
