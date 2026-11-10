/**
 * Gemeinsame Hülle aller Spiele: Runden-UUID, Herausforderung aus dem Link,
 * Start → Spiel → Ergebnis, Vergleich, Teilen und lokaler Verlauf.
 */
import type { ComponentType } from 'preact';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { t } from '@/i18n';
import { rngFor } from '@/lib/seed/prng';
import { ensureSession } from '@/lib/session';
import { resultStore } from '@/lib/store/results';
import { v4 } from '@/lib/uuid/generate';
import { gameBySlug } from '../registry';
import type { GameDef, GameProps } from '../types';
import { initialState, type Challenge } from './challenge';
import { History } from './History';
import { ResultView } from './ResultView';
import { SeedPicker } from './SeedPicker';
import { SharePanel } from './SharePanel';

const L = t.games.shell;

type Phase = 'ready' | 'loading' | 'play' | 'done';

export default function GameShell({ slug }: { slug: string }) {
  const game = gameBySlug(slug)!;
  return <Shell game={game} />;
}

function Shell({ game }: { game: GameDef }) {
  const init = useMemo(() => initialState(game, location, ensureSession), [game]);
  const store = useMemo(resultStore, []);

  const [uuid, setUuid] = useState(init.uuid);
  const [challenge, setChallenge] = useState<Challenge | null>(init.challenge);
  const [notice, setNotice] = useState<string | null>(
    init.error === 'game' ? L.challengeOtherGame : init.error ? L.challengeBroken : null,
  );
  const [phase, setPhase] = useState<Phase>('ready');
  const [Comp, setComp] = useState<ComponentType<GameProps> | null>(null);
  const [fields, setFields] = useState<number[] | null>(null);
  const [isBest, setIsBest] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [runs, setRuns] = useState(() => store.list(game.slug));
  const stage = useRef<HTMLDivElement>(null);

  // Spiel-Code schon vorladen, damit „Starten“ sofort reagiert
  useEffect(() => {
    void game.load?.().then((m) => setComp(() => m.default));
  }, [game]);

  // Adresse spiegelt immer die aktuelle Runde (Reload = gleiche Runde)
  useEffect(() => {
    const u = new URL(location.href);
    u.searchParams.set('id', uuid);
    if (!challenge) u.hash = '';
    history.replaceState(null, '', u.pathname + u.search + u.hash);
  }, [uuid, challenge]);

  const rng = useCallback((stream: string) => rngFor(uuid, game.slug, stream), [uuid, game.slug]);
  const bestHere = useMemo(() => {
    const mine = runs.filter((r) => r.uuid === uuid);
    return mine.length
      ? mine.reduce((a, b) => (game.compare(b.fields, a.fields) < 0 ? b : a))
      : null;
  }, [runs, uuid, game]);

  function changeUuid(next: string) {
    const n = next.toLowerCase();
    if (n === uuid) return;
    if (challenge) setNotice(L.challengeDropped);
    else setNotice(null);
    setChallenge(null);
    setUuid(n);
    setPhase('ready');
    setFields(null);
  }

  function start() {
    setFields(null);
    setAttempt((a) => a + 1);
    if (Comp) setPhase('play');
    else {
      setPhase('loading');
      void game.load?.().then((m) => {
        setComp(() => m.default);
        setPhase('play');
      });
    }
  }

  function done(f: number[]) {
    const prev = bestHere;
    store.add({
      game: game.slug,
      uuid,
      fields: f,
      at: Date.now(),
      ...(challenge ? { vs: challenge.nick, vsFields: challenge.fields } : {}),
    });
    setIsBest(prev !== null && game.compare(f, prev.fields) < 0);
    setRuns(store.list(game.slug));
    setFields(f);
    setPhase('done');
  }

  // Ergebnis ansagen und in den Blick holen
  useEffect(() => {
    if (phase !== 'done') return;
    document.getElementById('res-score')?.focus({ preventScroll: true });
    const top = stage.current?.getBoundingClientRect().top ?? 0;
    if (top < 64 || top > innerHeight * 0.6)
      stage.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [phase]);

  const playing = phase === 'play' || phase === 'loading';
  const sessionNick = ensureSession().slice(0, 4);

  return (
    <div class="gs">
      {challenge && (
        <div class="gs-challenge" role="status">
          <span class="badge badge-accent-2">
            {L.challengeFrom} {challenge.nick}
          </span>
          <p>{L.challengeLead(challenge.nick, game.headline(challenge.fields).value)}</p>
        </div>
      )}
      {notice && (
        <p class="notice gs-notice" role="status">
          {notice}
        </p>
      )}

      <div class="gs-panel">
        <div class="gs-seed">
          <SeedPicker
            uuid={uuid}
            disabled={playing}
            onNew={() => changeUuid(v4())}
            onSession={() => changeUuid(ensureSession())}
            onCustom={changeUuid}
          />
        </div>

        <div class="gs-rules">
          <p class="ctl-label">{L.rules}</p>
          <ul>
            {game.rules.map((r) => (
              <li>{r}</li>
            ))}
          </ul>
          {bestHere && (
            <p class="gs-best">
              <span class="text-ink-muted">{L.bestHere}</span>
              <span class="font-mono tabular text-ink">{game.headline(bestHere.fields).value}</span>
            </p>
          )}
        </div>

        <div class="gs-stage" ref={stage}>
          {phase === 'ready' && (
            <div class="gs-ready">
              <p class="eyebrow">{game.name}</p>
              <p class="gs-ready-title">{game.tagline}</p>
              {challenge && (
                <p class="gs-target">
                  <span class="text-ink-muted">
                    {L.vs} {challenge.nick}
                  </span>
                  <span class="font-mono tabular text-accent-2">
                    {game.headline(challenge.fields).value}
                  </span>
                </p>
              )}
              <button type="button" class="btn btn-primary btn-lg" onClick={start}>
                {L.start}
              </button>
            </div>
          )}

          {phase === 'loading' && <p class="gs-ready text-ink-muted">{L.loading}</p>}

          {phase === 'play' && Comp && (
            <div class="gs-play">
              <Comp key={`${uuid}:${attempt}`} uuid={uuid} rng={rng} onDone={done} />
              <button
                type="button"
                class="btn btn-ghost gs-abort"
                onClick={() => setPhase('ready')}
              >
                {L.abort}
              </button>
            </div>
          )}

          {phase === 'done' && fields && (
            <div class="gs-done">
              <ResultView game={game} fields={fields} challenge={challenge} isBest={isBest} />
              <div class="gs-again">
                <button type="button" class="btn btn-secondary" onClick={start}>
                  {L.again}
                </button>
                <button type="button" class="btn btn-ghost" onClick={() => changeUuid(v4())}>
                  {L.fresh}
                </button>
              </div>
              <SharePanel game={game} uuid={uuid} fields={fields} defaultNick={sessionNick} />
              <details class="gs-trace">
                <summary>{L.trace}</summary>
                <p class="ctl-hint mt-2">{L.traceLead}</p>
                <dl class="kv">
                  {game.trace(uuid).map((row) => (
                    <div>
                      <dt>{row.label}</dt>
                      <dd class="font-mono">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            </div>
          )}
        </div>
      </div>

      <History
        game={game}
        items={runs}
        store={store}
        current={uuid}
        disabled={playing}
        onLoad={changeUuid}
        onChange={() => setRuns(store.list(game.slug))}
      />
    </div>
  );
}
