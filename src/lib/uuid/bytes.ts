/** UUID ↔ Bytes und kompakte Darstellungen (Base64URL, Base58). Reines TS, ohne DOM. */
const HEX_RE = /^[0-9a-f]{32}$/;

/** Normalisiert gängige Schreibweisen ({…}, urn:uuid:, ohne Bindestriche, Großbuchstaben) auf 32 Hex-Zeichen. */
export function toHex(input: string): string | null {
  const hex = input
    .trim()
    .toLowerCase()
    .replace(/^urn:uuid:/, '')
    .replace(/^\{|\}$/g, '')
    .replace(/-/g, '');
  return HEX_RE.test(hex) ? hex : null;
}

export function toBytes(uuid: string): Uint8Array | null {
  const hex = toHex(uuid);
  if (!hex) return null;
  const out = new Uint8Array(16);
  for (let i = 0; i < 16; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

export function fromBytes(b: Uint8Array): string {
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/** Base64URL ohne Padding (22 Zeichen für 16 Bytes). */
export function bytesToBase64Url(b: Uint8Array): string {
  let out = '';
  let acc = 0;
  let n = 0;
  for (const x of b) {
    acc = ((acc << 8) | x) & 0xffffff;
    n += 8;
    while (n >= 6) {
      n -= 6;
      out += B64[(acc >> n) & 63]!;
    }
  }
  if (n > 0) out += B64[(acc << (6 - n)) & 63]!;
  return out;
}

export function base64UrlToBytes(s: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]*$/.test(s)) return null;
  const out: number[] = [];
  let acc = 0;
  let n = 0;
  for (const ch of s) {
    acc = ((acc << 6) | B64.indexOf(ch)) & 0xffffff;
    n += 6;
    if (n >= 8) {
      n -= 8;
      out.push((acc >> n) & 0xff);
    }
  }
  return Uint8Array.from(out);
}

const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

/** Base58 (Bitcoin-Alphabet), führende Null-Bytes als '1'. */
export function bytesToBase58(b: Uint8Array): string {
  let n = 0n;
  for (const x of b) n = (n << 8n) | BigInt(x);
  let out = '';
  while (n > 0n) {
    out = B58[Number(n % 58n)]! + out;
    n /= 58n;
  }
  for (const x of b) {
    if (x !== 0) break;
    out = '1' + out;
  }
  return out;
}

export function base58ToBytes(s: string, length = 16): Uint8Array | null {
  let n = 0n;
  for (const ch of s) {
    const v = B58.indexOf(ch);
    if (v < 0) return null;
    n = n * 58n + BigInt(v);
  }
  const out = new Uint8Array(length);
  for (let i = length - 1; i >= 0; i--) {
    out[i] = Number(n & 0xffn);
    n >>= 8n;
  }
  return n === 0n ? out : null;
}

/** Version (oberes Nibble von Byte 6). */
export function versionOf(b: Uint8Array): number {
  return b[6]! >> 4;
}

/** Unix-Millisekunden einer v7-UUID (48 Bit). */
export function v7Timestamp(b: Uint8Array): number {
  let ms = 0;
  for (let i = 0; i < 6; i++) ms = ms * 256 + b[i]!;
  return ms;
}
