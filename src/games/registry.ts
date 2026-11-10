/**
 * Alle Spiele. Ein Spiel = ein Ordner mit logic.ts (rein), meta.ts und Game.tsx (UI).
 * `id` landet im Share-Code und darf sich nie ändern.
 */
import type { GameDef } from './types';
import { reaction } from './reaction/meta';
import { memory } from './memory/meta';
import { sort } from './sort/meta';
import { sequence } from './sequence/meta';
import { hexcolor } from './hexcolor/meta';

export const games: readonly GameDef[] = [
  { ...reaction, load: () => import('./reaction/Game') },
  { ...memory, load: () => import('./memory/Game') },
  { ...sort, load: () => import('./sort/Game') },
  { ...sequence, load: () => import('./sequence/Game') },
  { ...hexcolor, load: () => import('./hexcolor/Game') },
];

export const liveGames = games.filter((g) => g.status === 'live');

export function gameBySlug(slug: string): GameDef | undefined {
  return games.find((g) => g.slug === slug);
}

export function gameById(id: number): GameDef | undefined {
  return games.find((g) => g.id === id);
}
