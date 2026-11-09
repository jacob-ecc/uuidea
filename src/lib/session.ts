/**
 * Session-UUID.
 * - Auf der Startseite entsteht bei jedem Seitenaufruf eine neue v4-UUID.
 * - Unterseiten verwenden die UUID aus sessionStorage weiter (Spieler-ID der Spiele).
 */
const KEY = 'uuidea:session';
export const SESSION_EVENT = 'uuidea:session';

function read(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function write(v: string): void {
  try {
    sessionStorage.setItem(KEY, v);
  } catch {
    /* privater Modus – dann nur im Speicher */
  }
}

let current: string | null = null;

/** Erzeugt eine neue Session-UUID und informiert alle Listener. */
export function newSessionUuid(): string {
  current = crypto.randomUUID();
  write(current);
  document.dispatchEvent(new CustomEvent<string>(SESSION_EVENT, { detail: current }));
  return current;
}

/** Idempotent pro Seitenaufruf. */
export function ensureSession(): string {
  if (current) return current;
  const isHome = location.pathname === '/' || location.pathname === '/index.html';
  const stored = isHome ? null : read();
  if (stored) {
    current = stored;
    return current;
  }
  current = crypto.randomUUID();
  write(current);
  return current;
}

export function onSessionChange(cb: (uuid: string) => void): void {
  document.addEventListener(SESSION_EVENT, (e) => cb((e as CustomEvent<string>).detail));
}
