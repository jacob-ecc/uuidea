/** ULID und Nano ID zum Vergleich mit UUIDs. */
import { cryptoRandom, type RandomFn } from './generate';

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

/** ULID: 48 Bit Unix-ms + 80 Bit Zufall, 26 Zeichen Crockford-Base32. */
export function ulid(ms: number = Date.now(), random: RandomFn = cryptoRandom): string {
  let time = '';
  let t = ms;
  for (let i = 0; i < 10; i++) {
    time = CROCKFORD[t % 32]! + time;
    t = Math.floor(t / 32);
  }
  const r = random(10);
  let n = 0n;
  for (const x of r) n = (n << 8n) | BigInt(x);
  let rand = '';
  for (let i = 0; i < 16; i++) {
    rand = CROCKFORD[Number(n & 31n)]! + rand;
    n >>= 5n;
  }
  return time + rand;
}

/** Zeitstempel (Unix-ms) einer ULID, oder null bei ungültiger Eingabe. */
export function ulidTime(id: string): number | null {
  const s = id.trim().toUpperCase();
  if (!/^[0-7][0-9A-HJKMNP-TV-Z]{25}$/.test(s)) return null;
  let ms = 0;
  for (const ch of s.slice(0, 10)) ms = ms * 32 + CROCKFORD.indexOf(ch);
  return ms;
}

/** ULID → 16 Bytes (eine ULID ist bitgleich als UUID darstellbar). */
export function ulidToBytes(id: string): Uint8Array | null {
  const s = id.trim().toUpperCase();
  if (ulidTime(s) === null) return null;
  let n = 0n;
  for (const ch of s) n = (n << 5n) | BigInt(CROCKFORD.indexOf(ch));
  const out = new Uint8Array(16);
  for (let i = 15; i >= 0; i--) {
    out[i] = Number(n & 0xffn);
    n >>= 8n;
  }
  return out;
}

const NANO_ALPHABET = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';

/** Nano ID: 21 URL-sichere Zeichen (≈ 126 Bit). Alphabet hat 64 Zeichen → kein Bias. */
export function nanoid(size = 21, random: RandomFn = cryptoRandom): string {
  const r = random(size);
  let id = '';
  for (let i = 0; i < size; i++) id += NANO_ALPHABET[r[i]! & 63];
  return id;
}

/** 16 Bytes → ULID-Schreibweise (26 Zeichen Crockford-Base32, bitgleich). */
export function bytesToUlid(b: Uint8Array): string {
  let n = 0n;
  for (const x of b) n = (n << 8n) | BigInt(x);
  let out = '';
  for (let i = 0; i < 26; i++) {
    out = CROCKFORD[Number(n & 31n)]! + out;
    n >>= 5n;
  }
  return out;
}
