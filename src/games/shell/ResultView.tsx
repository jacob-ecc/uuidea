import { t } from '@/i18n';
import type { GameMeta } from '../types';
import type { Challenge } from './challenge';

const L = t.games.shell;

export function ResultView({
  game,
  fields,
  challenge,
  isBest,
}: {
  game: GameMeta;
  fields: number[];
  challenge: Challenge | null;
  isBest: boolean;
}) {
  const head = game.headline(fields);
  const stats = game.stats(fields);
  const mine = game.rounds?.(fields);
  const theirs = challenge ? game.rounds?.(challenge.fields) : undefined;
  const cmp = challenge ? game.compare(fields, challenge.fields) : 0;
  const max = Math.max(1, ...(mine?.values ?? []), ...(theirs?.values ?? []));

  return (
    <div class="res">
      <div class="res-head">
        <div>
          <p class="eyebrow">{L.result}</p>
          <p class="res-score tabular" id="res-score" tabIndex={-1}>
            {head.value}
          </p>
          <p class="text-ink-muted">{head.label}</p>
        </div>
        {isBest && <span class="badge badge-ok">★ {L.newBest}</span>}
      </div>

      {challenge && (
        <p class={`res-verdict ${cmp < 0 ? 'is-win' : cmp > 0 ? 'is-loss' : ''}`} role="status">
          {game.verdict(fields, challenge.fields, challenge.nick)}
        </p>
      )}

      <dl class="res-stats">
        {stats.map((s) => (
          <div key={s.key}>
            <dt>{s.label}</dt>
            <dd class="font-mono tabular">{s.value}</dd>
          </div>
        ))}
        {challenge && (
          <div>
            <dt>
              {L.vs} {challenge.nick}
            </dt>
            <dd class="font-mono tabular text-accent-2">{game.headline(challenge.fields).value}</dd>
          </div>
        )}
      </dl>

      {mine && (
        <div class="res-rounds">
          <div class="res-rounds-head">
            <p class="ctl-label">{mine.label}</p>
            {theirs && (
              <p class="res-legend">
                <span class="is-me">{L.you}</span>
                <span class="is-them">{challenge!.nick}</span>
              </p>
            )}
          </div>
          <ol>
            {mine.values.map((v, i) => {
              const o = theirs?.values[i];
              return (
                <li>
                  <span class="res-n font-mono">{i + 1}</span>
                  <span class="res-bars">
                    <span class="res-bar is-me" style={{ '--w': v / max }}>
                      <span class="font-mono tabular">{mine.format(v)}</span>
                    </span>
                    {o !== undefined && (
                      <span class="res-bar is-them" style={{ '--w': o / max }}>
                        <span class="font-mono tabular">{mine.format(o)}</span>
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
