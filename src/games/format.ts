/** Zahlen- und Zeitformate für Spiele (de-DE). */
const nf = new Intl.NumberFormat('de-DE');
const nf2 = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const ms = (v: number) => `${nf.format(v)} ms`;
export const sec = (v: number) => `${nf2.format(v / 1000)} s`;
export const int = (v: number) => nf.format(v);

/** Spielzeit als m:ss,t (Zehntel), z. B. „0:48,3“. */
export function clock(v: number): string {
  const tenths = Math.floor(v / 100);
  const m = Math.floor(tenths / 600);
  const s = Math.floor((tenths % 600) / 10);
  return `${m}:${String(s).padStart(2, '0')},${tenths % 10}`;
}

/** Zeitdifferenz in Sekunden mit einer Nachkommastelle, z. B. „2,4 s“. */
export function diffSec(v: number): string {
  return `${new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(v / 1000)} s`;
}
