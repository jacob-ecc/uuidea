import { t } from '@/i18n';
import type { GameMeta } from '../types';
import { clock, diffSec, int } from '../format';
import { GAME, N, isValid, makeBoard, optimalMoves } from './logic';

const L = t.games.sort;

export const sort: GameMeta = {
  id: 3,
  slug: GAME,
  status: 'live',
  name: t.games.list.sort.name,
  tagline: t.games.list.sort.tagline,
  rules: L.rules,
  valid: isValid,
  compare: (a, b) => a[0]! - b[0]! || a[1]! - b[1]!,
  headline: (f) => ({ label: L.solved, value: `${int(f[0]!)} ${L.moves}` }),
  stats: (f) => [{ key: 'time', label: L.time, value: clock(f[1]!) }],
  verdict(mine, theirs, nick) {
    const dm = mine[0]! - theirs[0]!;
    if (dm < 0) return L.fewer(nick, -dm);
    if (dm > 0) return L.more(nick, dm);
    const dt = mine[1]! - theirs[1]!;
    if (dt === 0) return L.tie(nick);
    return dt < 0 ? L.faster(nick, diffSec(-dt)) : L.slower(nick, diffSec(dt));
  },
  trace(uuid) {
    const b = makeBoard(uuid);
    const rows = Array.from({ length: N }, (_, r) =>
      b
        .slice(r * N, r * N + N)
        .map((v) => (v === 0 ? '·' : String(v)))
        .join(' '),
    );
    return [
      { label: L.start, value: rows.join(' / ') },
      { label: L.optimal, value: `${optimalMoves(uuid)} ${L.moves}` },
    ];
  },
};
