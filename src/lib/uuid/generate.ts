/**
 * UUID-Generatoren nach RFC 9562: v1, v4, v5, v6, v7, Nil, Max.
 * Reines TS; Zufall und Zeit sind injizierbar (Tests mit RFC-Testvektoren).
 */
import { fromBytes, toBytes } from './bytes';

export type RandomFn = (n: number) => Uint8Array;

export const cryptoRandom: RandomFn = (n) => crypto.getRandomValues(new Uint8Array(n));

export const NIL = '00000000-0000-0000-0000-000000000000';
export const MAX = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

/** Namespaces aus RFC 9562, Anhang A. */
export const NAMESPACES = {
  DNS: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  URL: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
  OID: '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
  X500: '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
} as const;
export type NamespaceName = keyof typeof NAMESPACES;

function setVersion(b: Uint8Array, v: number): void {
  b[6] = (b[6]! & 0x0f) | (v << 4);
  b[8] = (b[8]! & 0x3f) | 0x80; // Variante 10xx (RFC 9562)
}

// ---------- v4 ----------
export function v4(random: RandomFn = cryptoRandom): string {
  const b = random(16);
  setVersion(b, 4);
  return fromBytes(b);
}

// ---------- v7 (Unix-ms + Zufall, monoton innerhalb eines Generators) ----------
export interface V7State {
  lastMs: number;
  counter: number;
}

/**
 * v7 mit 12-Bit-Zähler in rand_a (RFC 9562, Methode 1): innerhalb derselben Millisekunde
 * steigt der Zähler, sodass Bulk-Listen sortierbar bleiben.
 */
export function v7(
  opts: { ms?: number; random?: RandomFn; state?: V7State; randA?: number } = {},
): string {
  const random = opts.random ?? cryptoRandom;
  let ms = opts.ms ?? Date.now();
  const st = opts.state;
  let randA: number;
  if (opts.randA !== undefined) randA = opts.randA & 0xfff;
  else if (st && ms <= st.lastMs) {
    ms = st.lastMs;
    st.counter++;
    if (st.counter > 0xfff) {
      ms = ++st.lastMs;
      st.counter = 0;
    }
    randA = st.counter;
  } else {
    const r = random(2);
    randA = ((r[0]! << 8) | r[1]!) & 0x7ff; // oberstes Bit frei für Zähler-Überlauf
    if (st) {
      st.lastMs = ms;
      st.counter = randA;
    }
  }
  const b = new Uint8Array(16);
  let t = ms;
  for (let i = 5; i >= 0; i--) {
    b[i] = t % 256;
    t = Math.floor(t / 256);
  }
  b[6] = (randA >> 8) & 0x0f;
  b[7] = randA & 0xff;
  b.set(random(8), 8);
  setVersion(b, 7);
  return fromBytes(b);
}

// ---------- v1 / v6 (Gregorianische 100-ns-Zeit) ----------
/** 100-ns-Intervalle zwischen 1582-10-15 und 1970-01-01. */
export const GREGORIAN_OFFSET = 0x01b21dd213814000n;

/** Zustand eines Bulk-Laufs: Knoten und clock_seq bleiben gleich, die Zeit steigt streng. */
export interface TimeState {
  lastTicks: bigint;
  clockSeq?: number;
  node?: Uint8Array;
}

export interface TimeOpts {
  /** Unix-Millisekunden (Standard: jetzt). */
  ms?: number;
  /** Zusätzliche 100-ns-Ticks (für Testvektoren). */
  extraTicks?: number;
  clockSeq?: number;
  node?: Uint8Array;
  random?: RandomFn;
  state?: TimeState;
}

function timeParts(opts: TimeOpts): { ticks: bigint; clockSeq: number; node: Uint8Array } {
  const random = opts.random ?? cryptoRandom;
  let ticks =
    BigInt(opts.ms ?? Date.now()) * 10000n + BigInt(opts.extraTicks ?? 0) + GREGORIAN_OFFSET;
  const st = opts.state;
  let node = opts.node ?? st?.node;
  if (!node) {
    node = random(6);
    node[0] = node[0]! | 0x01; // Multicast-Bit: zufälliger Knoten, keine MAC-Adresse
  }
  let clockSeq = opts.clockSeq ?? st?.clockSeq;
  if (clockSeq === undefined) {
    const r = random(2);
    clockSeq = ((r[0]! << 8) | r[1]!) & 0x3fff;
  }
  if (st) {
    if (ticks <= st.lastTicks) ticks = st.lastTicks + 1n; // eindeutig auch im Bulk
    st.lastTicks = ticks;
    st.clockSeq = clockSeq;
    st.node = node;
  }
  return { ticks, clockSeq, node };
}

export function newTimeState(): TimeState {
  return { lastTicks: 0n };
}

export function v1(opts: TimeOpts = {}): string {
  const { ticks, clockSeq, node } = timeParts(opts);
  const timeLow = ticks & 0xffffffffn;
  const timeMid = (ticks >> 32n) & 0xffffn;
  const timeHi = (ticks >> 48n) & 0x0fffn;
  const b = new Uint8Array(16);
  b[0] = Number((timeLow >> 24n) & 0xffn);
  b[1] = Number((timeLow >> 16n) & 0xffn);
  b[2] = Number((timeLow >> 8n) & 0xffn);
  b[3] = Number(timeLow & 0xffn);
  b[4] = Number((timeMid >> 8n) & 0xffn);
  b[5] = Number(timeMid & 0xffn);
  b[6] = Number((timeHi >> 8n) & 0x0fn);
  b[7] = Number(timeHi & 0xffn);
  b[8] = (clockSeq >> 8) & 0x3f;
  b[9] = clockSeq & 0xff;
  b.set(node, 10);
  setVersion(b, 1);
  return fromBytes(b);
}

export function v6(opts: TimeOpts = {}): string {
  const { ticks, clockSeq, node } = timeParts(opts);
  // 60-Bit-Zeit big-endian: 48 Bit oben, dann Version, dann 12 Bit unten
  const high = ticks >> 12n;
  const low = ticks & 0xfffn;
  const b = new Uint8Array(16);
  for (let i = 5; i >= 0; i--) b[5 - i] = Number((high >> BigInt(i * 8)) & 0xffn);
  b[6] = Number((low >> 8n) & 0x0fn);
  b[7] = Number(low & 0xffn);
  b[8] = (clockSeq >> 8) & 0x3f;
  b[9] = clockSeq & 0xff;
  b.set(node, 10);
  setVersion(b, 6);
  return fromBytes(b);
}

// ---------- v5 (SHA-1 über Namespace + Name) ----------
export async function v5(namespace: string, name: string): Promise<string> {
  const ns = toBytes(namespace);
  if (!ns) throw new Error('Ungültige Namespace-UUID');
  const nameBytes = new TextEncoder().encode(name);
  const data = new Uint8Array(16 + nameBytes.length);
  data.set(ns, 0);
  data.set(nameBytes, 16);
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-1', data));
  const b = hash.slice(0, 16);
  setVersion(b, 5);
  return fromBytes(b);
}
