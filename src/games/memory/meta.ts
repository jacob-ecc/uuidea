import { t } from '@/i18n';
import type { GameMeta } from '../types';
import { clock, diffSec, int } from '../format';
import { COLS, GAME, hexDigit, isValid, makeDeck } from './logic';

const L = t.games.memory;

export const memory: GameMeta = {
  id: 2,
  slug: GAME,
  status: 'live',
  name: t.games.list.memory.name,
  tagline: t.games.list.memory.tagline,
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
    const d = makeDeck(uuid);
    const rows = Array.from({ length: d.cards.length / COLS }, (_, r) =>
      d.cards
        .slice(r * COLS, r * COLS + COLS)
        .map(hexDigit)
        .join(''),
    );
    return [
      { label: L.digits, value: d.digits.map(hexDigit).join(' ') },
      { label: L.layout, value: rows.join(' / ') },
    ];
  },
};
