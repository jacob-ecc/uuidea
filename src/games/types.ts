import type { ComponentType } from 'preact';
import type { Rng } from '@/lib/seed/prng';

/** Eine Kennzahl im Ergebnis (bereits formatiert). */
export interface Stat {
  key: string;
  label: string;
  value: string;
}

/** Eine Zeile „So entstand diese Runde“: Werte, die aus der UUID berechnet wurden. */
export interface TraceRow {
  label: string;
  value: string;
}

/** Reine Spiel-Metadaten – ohne UI, in Astro-Seiten und Tests nutzbar. */
export interface GameMeta {
  /** Byte im Share-Code – niemals ändern, sonst brechen alte Links. */
  id: number;
  slug: string;
  status: 'live' | 'soon';
  name: string;
  tagline: string;
  /** Prüft, ob Felder (z. B. aus einem Link) plausibel sind. */
  valid(fields: readonly number[]): boolean;
  /** < 0: a ist besser · 0: gleich · > 0: b ist besser */
  compare(a: readonly number[], b: readonly number[]): number;
  /** Hauptwert, groß dargestellt (z. B. „243 ms“). */
  headline(fields: readonly number[]): { label: string; value: string };
  stats(fields: readonly number[]): Stat[];
  /** Werte pro Durchgang für den Vergleich (optional). */
  rounds?(fields: readonly number[]): {
    label: string;
    values: number[];
    format(v: number): string;
  };
  /** Satz zum Vergleich, z. B. „Du warst 23 ms schneller als 4f2a.“ */
  verdict(mine: readonly number[], theirs: readonly number[], nick: string): string;
  trace(uuid: string): TraceRow[];
  rules: readonly string[];
}

export interface GameProps {
  uuid: string;
  /** Seeded Rng pro Zweck (`rngFor(uuid, slug, stream)`) */
  rng(stream: string): Rng;
  onDone(fields: number[]): void;
}

export interface GameDef extends GameMeta {
  load?: () => Promise<{ default: ComponentType<GameProps> }>;
}
