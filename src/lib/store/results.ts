/**
 * ResultStore: eigene Spielergebnisse lokal merken.
 * v1 = localStorage. Eine spätere RemoteLeaderboard-Implementierung erfüllt dasselbe
 * Interface, ohne dass Spiele oder Shell sich ändern.
 */

export interface StoredResult {
  /** Spiel-Slug, z. B. "reaction" */
  game: string;
  /** Runden-UUID (kleingeschrieben) */
  uuid: string;
  fields: number[];
  /** Zeitpunkt (Unix-ms) */
  at: number;
  /** Kürzel des Herausforderers, falls die Runde eine Herausforderung war */
  vs?: string;
  /** Felder des Herausforderers */
  vsFields?: number[];
}

export interface ResultStore {
  add(r: StoredResult): void;
  list(game?: string): StoredResult[];
  clear(game?: string): void;
  export(): string;
  /** Liefert die Anzahl neu übernommener Einträge; wirft bei kaputtem JSON. */
  import(json: string): number;
}

/** Minimales Storage-Interface (localStorage oder ein Test-Double). */
export interface KV {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const STORE_KEY = 'uuidea:results:v1';
const EXPORT_KIND = 'uuidea-results';
const MAX_ENTRIES = 500;

function isResult(x: unknown): x is StoredResult {
  if (!x || typeof x !== 'object') return false;
  const r = x as Record<string, unknown>;
  return (
    typeof r.game === 'string' &&
    /^[a-z0-9-]{1,32}$/.test(r.game) &&
    typeof r.uuid === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(r.uuid) &&
    Array.isArray(r.fields) &&
    r.fields.length <= 32 &&
    r.fields.every((f) => Number.isInteger(f) && f >= 0) &&
    typeof r.at === 'number' &&
    Number.isFinite(r.at) &&
    (r.vs === undefined || (typeof r.vs === 'string' && r.vs.length <= 24)) &&
    (r.vsFields === undefined ||
      (Array.isArray(r.vsFields) && r.vsFields.every((f) => Number.isInteger(f) && f >= 0)))
  );
}

const keyOf = (r: StoredResult) => `${r.game}|${r.uuid}|${r.at}`;

/** Speicher im Arbeitsspeicher – Fallback, wenn localStorage gesperrt ist. */
export function memoryKV(): KV {
  const m = new Map<string, string>();
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, v),
    removeItem: (k) => void m.delete(k),
  };
}

export function createLocalStore(kv: KV): ResultStore {
  const read = (): StoredResult[] => {
    try {
      const raw = kv.getItem(STORE_KEY);
      const data: unknown = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data.filter(isResult) : [];
    } catch {
      return [];
    }
  };
  const write = (all: StoredResult[]) => {
    try {
      kv.setItem(STORE_KEY, JSON.stringify(all.slice(-MAX_ENTRIES)));
    } catch {
      /* voll oder gesperrt – Ergebnis gilt dann nur für diese Seite */
    }
  };

  return {
    add(r) {
      write([...read(), { ...r, uuid: r.uuid.toLowerCase() }]);
    },
    list(game) {
      const all = read();
      return (game ? all.filter((r) => r.game === game) : all).sort((a, b) => b.at - a.at);
    },
    clear(game) {
      if (!game) kv.removeItem(STORE_KEY);
      else write(read().filter((r) => r.game !== game));
    },
    export() {
      return JSON.stringify({ kind: EXPORT_KIND, version: 1, results: read() }, null, 2);
    },
    import(json) {
      const data = JSON.parse(json) as unknown;
      const list =
        data && typeof data === 'object' && (data as { kind?: unknown }).kind === EXPORT_KIND
          ? (data as { results?: unknown }).results
          : null;
      if (!Array.isArray(list)) throw new Error('Keine uuidea-Ergebnisdatei');
      const current = read();
      const seen = new Set(current.map(keyOf));
      const fresh = list.filter(isResult).filter((r) => !seen.has(keyOf(r)));
      write([...current, ...fresh].sort((a, b) => a.at - b.at));
      return fresh.length;
    },
  };
}

let shared: ResultStore | null = null;

/** Store des Browsers (localStorage, sonst flüchtig). */
export function resultStore(): ResultStore {
  if (shared) return shared;
  let kv: KV;
  try {
    kv = window.localStorage;
    kv.getItem(STORE_KEY);
  } catch {
    kv = memoryKV();
  }
  shared = createLocalStore(kv);
  return shared;
}

// ---------- Kürzel des Spielers ----------

const NICK_KEY = 'uuidea:nick';

export function loadNick(): string {
  try {
    return localStorage.getItem(NICK_KEY) ?? '';
  } catch {
    return '';
  }
}

export function saveNick(nick: string): void {
  try {
    if (nick) localStorage.setItem(NICK_KEY, nick);
    else localStorage.removeItem(NICK_KEY);
  } catch {
    /* egal */
  }
}
