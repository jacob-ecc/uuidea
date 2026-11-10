import { t } from '@/i18n';
import type { GameMeta } from '../types';
import { ms, sec } from '../format';
import { GAME, ROUNDS, isValid, makePlan } from './logic';

const L = t.games.reaction;

export const reaction: GameMeta = {
  id: 1,
  slug: GAME,
  status: 'live',
  name: t.games.list.reaction.name,
  tagline: t.games.list.reaction.tagline,
  rules: L.rules,
  valid: isValid,
  // Niedriger Schnitt gewinnt, dann weniger Frühstarts, dann der bessere Einzelwert
  compare: (a, b) => a[0]! - b[0]! || a[2]! - b[2]! || a[1]! - b[1]!,
  headline: (f) => ({ label: L.avg, value: ms(f[0]!) }),
  stats: (f) => [
    { key: 'best', label: L.best, value: ms(f[1]!) },
    { key: 'fouls', label: L.fouls, value: String(f[2]!) },
  ],
  rounds: (f) => ({ label: t.games.shell.perRound, values: f.slice(3, 3 + ROUNDS), format: ms }),
  verdict(mine, theirs, nick) {
    const d = mine[0]! - theirs[0]!;
    if (d === 0) return L.tie(nick);
    return d < 0 ? L.faster(nick, ms(-d)) : L.slower(nick, ms(d));
  },
  trace(uuid) {
    const p = makePlan(uuid);
    return [
      { label: L.waits, value: p.waits.map(sec).join(' · ') },
      { label: L.colors, value: p.colors.map((c) => L.colorNames[c - 1]).join(' · ') },
    ];
  },
};
