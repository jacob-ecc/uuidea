import { t } from '@/i18n';
import type { GameMeta } from '../types';
import { GAME, isValid, makeSequence } from './logic';

const L = t.games.sequence;

export const sequence: GameMeta = {
  id: 4,
  slug: GAME,
  status: 'live',
  name: t.games.list.sequence.name,
  tagline: t.games.list.sequence.tagline,
  rules: L.rules,
  valid: isValid,
  // mehr Stufen gewinnen
  compare: (a, b) => b[0]! - a[0]!,
  headline: (f) => ({ label: L.reached, value: L.levelValue(f[0]!) }),
  stats: () => [],
  verdict(mine, theirs, nick) {
    const d = mine[0]! - theirs[0]!;
    if (d === 0) return L.tie(nick);
    return d > 0 ? L.better(nick, d) : L.worse(nick, -d);
  },
  trace: (uuid) => [{ label: L.steps, value: makeSequence(uuid).join(' ') }],
};
