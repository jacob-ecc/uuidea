import { t } from '@/i18n';
import type { GameMeta } from '../types';
import { clock, diffSec } from '../format';
import { GAME, ROUNDS, isValid, makeRounds } from './logic';

const L = t.games.hexcolor;

export const hexcolor: GameMeta = {
  id: 5,
  slug: GAME,
  status: 'live',
  name: t.games.list.hexcolor.name,
  tagline: t.games.list.hexcolor.tagline,
  rules: L.rules,
  valid: isValid,
  // mehr Treffer gewinnen, dann die kürzere Zeit
  compare: (a, b) => b[0]! - a[0]! || a[1]! - b[1]!,
  headline: (f) => ({ label: L.hits, value: L.hitsValue(f[0]!, ROUNDS) }),
  stats: (f) => [{ key: 'time', label: L.time, value: clock(f[1]!) }],
  verdict(mine, theirs, nick) {
    const dh = mine[0]! - theirs[0]!;
    if (dh > 0) return L.more(nick, dh);
    if (dh < 0) return L.fewer(nick, -dh);
    const dt = mine[1]! - theirs[1]!;
    if (dt === 0) return L.tie(nick);
    return dt < 0 ? L.faster(nick, diffSec(-dt)) : L.slower(nick, diffSec(dt));
  },
  trace: (uuid) => [
    {
      label: L.colors,
      value: makeRounds(uuid)
        .map((r) => r.target)
        .join(' '),
    },
  ],
};
