/**
 * Ergebnis-Codec für Share-Links: `/games/<slug>?id=<uuid>#r=<base64url>`.
 *
 * Binärformat (alle Zahlen als ULEB128-Varint):
 *
 *   [formatVersion u8][gameId u8][n varint][n × Feld varint][nickLen u8][nick UTF-8 ≤ 12 B][CRC-16 BE]
 *
 * Die Runden-UUID steht nicht im Hash (sie steckt in `?id=`), fließt aber in die
 * CRC ein: CRC-16/CCITT-FALSE über `uuidBytes ‖ payload`. Ein Link, dessen `?id=`
 * vertauscht wurde, wird dadurch als beschädigt erkannt.
 *
 * Reines TS ohne DOM.
 */
import { base64UrlToBytes, bytesToBase64Url, toBytes } from '@/lib/uuid/bytes';

export const FORMAT_VERSION = 1;
export const NICK_MAX_BYTES = 12;
/** Obergrenze pro Feld (≙ 5 Varint-Bytes); reicht für Millisekunden über Wochen. */
export const FIELD_MAX = 2 ** 32 - 1;
const MAX_FIELDS = 32;

export interface SharedResult {
  gameId: number;
  fields: number[];
  nick: string;
}

export type DecodeError = 'format' | 'version' | 'crc' | 'uuid';
export type DecodeOutcome = { ok: true; value: SharedResult } | { ok: false; error: DecodeError };

// ---------- Varint (ULEB128) ----------

export function writeVarint(out: number[], value: number): void {
  if (!Number.isInteger(value) || value < 0 || value > FIELD_MAX)
    throw new RangeError(`Varint außerhalb von 0…${FIELD_MAX}: ${value}`);
  let v = value;
  while (v >= 0x80) {
    out.push((v % 0x80) | 0x80);
    v = Math.floor(v / 0x80);
  }
  out.push(v);
}

/** Liest einen Varint ab `pos`; `null` bei Abbruch oder Überlauf. */
export function readVarint(b: Uint8Array, pos: number): { value: number; next: number } | null {
  let value = 0;
  let mul = 1;
  for (let i = 0; i < 5; i++) {
    const byte = b[pos + i];
    if (byte === undefined) return null;
    value += (byte & 0x7f) * mul;
    if ((byte & 0x80) === 0) return value > FIELD_MAX ? null : { value, next: pos + i + 1 };
    mul *= 0x80;
  }
  return null;
}

// ---------- CRC-16/CCITT-FALSE (Poly 0x1021, Init 0xFFFF) ----------

export function crc16(data: Uint8Array, crc = 0xffff): number {
  for (const byte of data) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i++)
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc;
}

// ---------- Kürzel ----------

/** Kürzt auf höchstens `NICK_MAX_BYTES` UTF-8-Bytes, ohne ein Zeichen zu zerschneiden. */
export function clampNick(nick: string): string {
  const enc = new TextEncoder();
  // eslint-disable-next-line no-control-regex
  const clean = nick.replace(/[\u0000-\u001f\u007f]/g, '').trim();
  let out = '';
  for (const ch of clean) {
    if (enc.encode(out + ch).length > NICK_MAX_BYTES) break;
    out += ch;
  }
  return out;
}

// ---------- Encode / Decode ----------

function withUuid(uuidBytes: Uint8Array, payload: number[]): Uint8Array {
  const all = new Uint8Array(16 + payload.length);
  all.set(uuidBytes, 0);
  all.set(payload, 16);
  return all;
}

export function encodeResult(uuid: string, r: SharedResult): string {
  const ub = toBytes(uuid);
  if (!ub) throw new Error('Ungültige UUID');
  if (r.gameId < 0 || r.gameId > 255) throw new RangeError('gameId muss in ein Byte passen');
  if (r.fields.length > MAX_FIELDS) throw new RangeError('Zu viele Felder');
  const out: number[] = [FORMAT_VERSION, r.gameId];
  writeVarint(out, r.fields.length);
  for (const f of r.fields) writeVarint(out, f);
  const nick = new TextEncoder().encode(clampNick(r.nick));
  out.push(nick.length, ...nick);
  const crc = crc16(withUuid(ub, out));
  out.push(crc >> 8, crc & 0xff);
  return bytesToBase64Url(Uint8Array.from(out));
}

export function decodeResult(uuid: string, code: string): DecodeOutcome {
  const ub = toBytes(uuid);
  if (!ub) return { ok: false, error: 'uuid' };
  const b = base64UrlToBytes(code.trim());
  if (!b || b.length < 6) return { ok: false, error: 'format' };

  const body = b.subarray(0, b.length - 2);
  const crc = (b[b.length - 2]! << 8) | b[b.length - 1]!;
  if (crc16(withUuid(ub, [...body])) !== crc) return { ok: false, error: 'crc' };
  if (body[0] !== FORMAT_VERSION) return { ok: false, error: 'version' };

  const gameId = body[1]!;
  const count = readVarint(body, 2);
  if (!count || count.value > MAX_FIELDS) return { ok: false, error: 'format' };
  let pos = count.next;
  const fields: number[] = [];
  for (let i = 0; i < count.value; i++) {
    const f = readVarint(body, pos);
    if (!f) return { ok: false, error: 'format' };
    fields.push(f.value);
    pos = f.next;
  }
  const nickLen = body[pos];
  if (nickLen === undefined || nickLen > NICK_MAX_BYTES || pos + 1 + nickLen !== body.length)
    return { ok: false, error: 'format' };
  let nick: string;
  try {
    nick = new TextDecoder('utf-8', { fatal: true }).decode(body.subarray(pos + 1));
  } catch {
    return { ok: false, error: 'format' };
  }
  return { ok: true, value: { gameId, fields, nick } };
}

// ---------- URL-Teile ----------

/** Liest `?id=` und `#r=` aus einer URL (oder `location`). */
export function parseChallengeUrl(url: { search: string; hash: string }): {
  id: string | null;
  code: string | null;
} {
  const id = new URLSearchParams(url.search).get('id');
  const code = new URLSearchParams(url.hash.replace(/^#/, '')).get('r');
  return { id: id?.trim() || null, code: code?.trim() || null };
}

export function buildShareUrl(origin: string, slug: string, uuid: string, code?: string): string {
  const u = new URL(`/games/${slug}`, origin);
  u.searchParams.set('id', uuid);
  if (code) u.hash = `r=${code}`;
  return u.toString();
}
