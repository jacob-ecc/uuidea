/**
 * Alle Spiele. Ein Spiel = ein Ordner mit logic.ts (rein), meta.ts und Game.tsx (UI).
 * `id` landet im Share-Code und darf sich nie ändern.
 */
import { t } from '@/i18n';
import type { GameDef, GameMeta } from './types';
import { reaction } from './reaction/meta';

/** Platzhalter für Spiele aus Meilenstein 4. */
function soon(id: number, slug: keyof typeof t.games.list): GameMeta {
  return {
    id,
    slug,
    status: 'soon',
    name: t.games.list[slug].name,
    tagline: t.games.list[slug].tagline,
    rules: [],
    valid: () => false,
    compare: () => 0,
    headline: () => ({ label: '', value: '' }),
    stats: () => [],
    verdict: () => '',
    trace: () => [],
  };
}

export const games: readonly GameDef[] = [
  { ...reaction, load: () => import('./reaction/Game') },
  soon(2, 'memory'),
  soon(3, 'sort'),
  soon(4, 'sequence'),
  soon(5, 'hexcolor'),
];

export const liveGames = games.filter((g) => g.status === 'live');

export function gameBySlug(slug: string): GameDef | undefined {
  return games.find((g) => g.slug === slug);
}

export function gameById(id: number): GameDef | undefined {
  return games.find((g) => g.id === id);
}
