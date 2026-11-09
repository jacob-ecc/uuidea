/** Validator & Decoder: erkennt Eingabeformat, Version, Variante und eingebettete Zeit. */
import {
  base58ToBytes,
  base64UrlToBytes,
  bytesToBase58,
  bytesToBase64Url,
  fromBytes,
  toBytes,
  toHex,
  v7Timestamp,
} from './bytes';
import { GREGORIAN_OFFSET } from './generate';

export type InputFormat = 'standard' | 'compact' | 'braces' | 'urn' | 'base64url' | 'base58';
export type Variant = 'ncs' | 'rfc9562' | 'microsoft' | 'future';

export interface Decoded {
  uuid: string;
  bytes: Uint8Array;
  inputFormat: InputFormat;
  /** 0 bei Nil, 15 bei Max – sonst 1–8 bzw. die rohe Nibble. */
  version: number;
  variant: Variant;
  isNil: boolean;
  isMax: boolean;
  /** Eingebettete Zeit (v1, v6, v7) als Unix-ms. */
  timeMs?: number;
  /** Restliche 100-ns-Ticks unterhalb der Millisekunde (v1, v6). */
  subMsTicks?: number;
  clockSeq?: number;
  node?: string;
  /** Andere gültige Lesart derselben Eingabe (Base64URL ↔ Base58). */
  alternative?: { uuid: string; format: InputFormat };
}

export type DecodeResult = { ok: true; value: Decoded } | { ok: false; error: string };

interface Candidate {
  bytes: Uint8Array;
  format: InputFormat;
}

/** Plausibel = Variante RFC 9562 und Version 1–8 (oder Nil/Max). */
function plausible(b: Uint8Array): boolean {
  if (b.every((x) => x === 0) || b.every((x) => x === 0xff)) return true;
  const v = b[6]! >> 4;
  return (b[8]! & 0xc0) === 0x80 && v >= 1 && v <= 8;
}

function detect(raw: string): { best: Candidate; alt?: Candidate | undefined } | null {
  const s = raw.trim();
  if (!s) return null;
  const hex = toHex(s);
  if (hex) {
    const lower = s.toLowerCase();
    const format: InputFormat = lower.startsWith('urn:uuid:')
      ? 'urn'
      : s.startsWith('{')
        ? 'braces'
        : s.includes('-')
          ? 'standard'
          : 'compact';
    // Bindestriche nur an den kanonischen Stellen akzeptieren
    if (format !== 'compact') {
      const core = lower.replace(/^urn:uuid:/, '').replace(/^\{|\}$/g, '');
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(core)) return null;
      if (s.startsWith('{') !== s.endsWith('}')) return null;
    }
    return { best: { bytes: toBytes(hex)!, format } };
  }
  // 22 Zeichen können Base64URL UND Base58 sein → beide prüfen, die plausiblere gewinnt
  const cands: Candidate[] = [];
  if (/^[A-Za-z0-9_-]{22}$/.test(s)) {
    const b = base64UrlToBytes(s);
    // kanonisch: die 4 ungenutzten Bits des letzten Zeichens sind 0
    if (b && b.length === 16 && bytesToBase64Url(b) === s)
      cands.push({ bytes: b, format: 'base64url' });
  }
  if (/^[1-9A-HJ-NP-Za-km-z]{16,22}$/.test(s)) {
    const b = base58ToBytes(s);
    if (b && bytesToBase58(b) === s) cands.push({ bytes: b, format: 'base58' });
  }
  if (cands.length === 0) return null;
  cands.sort((a, b) => Number(plausible(b.bytes)) - Number(plausible(a.bytes)));
  return { best: cands[0]!, alt: cands[1] };
}

export function variantOf(b: Uint8Array): Variant {
  const x = b[8]!;
  if ((x & 0x80) === 0) return 'ncs';
  if ((x & 0xc0) === 0x80) return 'rfc9562';
  if ((x & 0xe0) === 0xc0) return 'microsoft';
  return 'future';
}

function gregorianTicks(b: Uint8Array, version: 1 | 6): bigint {
  const B = (i: number) => BigInt(b[i]!);
  if (version === 1) {
    const low = (B(0) << 24n) | (B(1) << 16n) | (B(2) << 8n) | B(3);
    const mid = (B(4) << 8n) | B(5);
    const hi = ((B(6) & 0x0fn) << 8n) | B(7);
    return (hi << 48n) | (mid << 32n) | low;
  }
  let high = 0n;
  for (let i = 0; i < 6; i++) high = (high << 8n) | B(i);
  const low = ((B(6) & 0x0fn) << 8n) | B(7);
  return (high << 12n) | low;
}

export function decode(input: string): DecodeResult {
  const found = detect(input);
  if (!found) {
    return {
      ok: false,
      error:
        'Das ist keine UUID. Erwartet: 32 Hex-Zeichen (gern mit Bindestrichen 8-4-4-4-12, {Klammern} oder urn:uuid:), Base64URL (22 Zeichen) oder Base58.',
    };
  }
  const d = found.best;
  const b = d.bytes;
  const isNil = b.every((x) => x === 0);
  const isMax = b.every((x) => x === 0xff);
  const version = b[6]! >> 4;
  const out: Decoded = {
    uuid: fromBytes(b),
    bytes: b,
    inputFormat: d.format,
    version,
    variant: variantOf(b),
    isNil,
    isMax,
  };
  if (found.alt) out.alternative = { uuid: fromBytes(found.alt.bytes), format: found.alt.format };
  if (!isNil && !isMax && out.variant === 'rfc9562') {
    if (version === 1 || version === 6) {
      const ticks = gregorianTicks(b, version) - GREGORIAN_OFFSET;
      out.timeMs = Number(ticks / 10000n);
      out.subMsTicks = Number(ticks % 10000n);
      out.clockSeq = ((b[8]! & 0x3f) << 8) | b[9]!;
      out.node = [...b.slice(10)].map((x) => x.toString(16).padStart(2, '0')).join(':');
    } else if (version === 7) {
      out.timeMs = v7Timestamp(b);
    }
  }
  return { ok: true, value: out };
}

export const VERSION_INFO: Record<number, { name: string; detail: string }> = {
  1: {
    name: 'Zeit + Knoten',
    detail: 'Gregorianische Zeit in 100 ns, Clock-Sequenz und Knoten-ID.',
  },
  2: { name: 'DCE Security', detail: 'Selten genutzt; enthält eine lokale ID (z. B. POSIX-UID).' },
  3: { name: 'Name (MD5)', detail: 'Deterministisch aus Namespace und Name, Hash: MD5.' },
  4: { name: 'Zufall', detail: '122 Bit aus einem kryptografischen Zufallsgenerator.' },
  5: { name: 'Name (SHA-1)', detail: 'Deterministisch aus Namespace und Name, Hash: SHA-1.' },
  6: {
    name: 'Zeit, sortierbar',
    detail: 'Wie v1, aber die Zeit steht vorne – sortiert sich chronologisch.',
  },
  7: {
    name: 'Unix-Zeit',
    detail: '48 Bit Unix-Millisekunden, danach Zufall. Sortierbar, ideal für Datenbanken.',
  },
  8: {
    name: 'Benutzerdefiniert',
    detail: 'Herstellerspezifisches Format; nur Version und Variante sind festgelegt.',
  },
};

export const VARIANT_INFO: Record<Variant, string> = {
  ncs: 'NCS (reserviert, historisch)',
  rfc9562: 'RFC 9562 (Standard)',
  microsoft: 'Microsoft (reserviert, historisch)',
  future: 'Reserviert für die Zukunft',
};
