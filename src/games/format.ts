/** Zahlen- und Zeitformate für Spiele (de-DE). */
const nf = new Intl.NumberFormat('de-DE');
const nf2 = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const ms = (v: number) => `${nf.format(v)} ms`;
export const sec = (v: number) => `${nf2.format(v / 1000)} s`;
export const int = (v: number) => nf.format(v);
