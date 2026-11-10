import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { t } from '@/i18n';
import type { GameProps } from '../types';
import { clock } from '../format';
import { useStopwatch } from '../shell/useStopwatch';
import {
  CARDS,
  PAIRS,
  colorOf,
  flip,
  hexDigit,
  initialState,
  isDone,
  makeDeck,
  pairsFound,
} from './logic';

const L = t.games.memory;

export default function MemoryGame({ uuid, rng, onDone }: GameProps) {
  const deck = useMemo(() => makeDeck(uuid, rng), [uuid, rng]);
  const [s, setS] = useState(initialState);
  const sRef = useRef(s);
  sRef.current = s;
  const sw = useStopwatch();
  const closer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const finished = useRef(false);
  const board = useRef<HTMLDivElement>(null);

  useEffect(() => () => clearTimeout(closer.current), []);
  useEffect(
    () => board.current?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true }),
    [],
  );

  function pick(i: number) {
    if (finished.current) return;
    clearTimeout(closer.current);
    const { state, event } = flip(deck, sRef.current, i);
    if (event === 'none') return;
    sw.begin();
    sRef.current = state;
    setS(state);
    if (event === 'miss') {
      // ungleiche Karten nach kurzer Zeit wieder zudecken (oder beim nächsten Tipp)
      closer.current = setTimeout(() => {
        const cur = sRef.current;
        if (cur.open.length === 2) setS((sRef.current = { ...cur, open: [] }));
      }, 900);
    }
    if (event === 'match' && isDone(state)) {
      finished.current = true;
      const ms = sw.end();
      setTimeout(() => onDone([state.moves, ms]), 600);
    }
  }

  return (
    <div class="gm">
      <p class="gm-bar">
        <span>
          {L.moves} <b class="font-mono tabular">{s.moves}</b>
        </span>
        <span>
          {L.pairs}{' '}
          <b class="font-mono tabular">
            {pairsFound(s)}/{PAIRS}
          </b>
        </span>
        <span>
          {L.time} <b class="font-mono tabular">{clock(sw.elapsed)}</b>
        </span>
      </p>
      <div ref={board} class="mem-board" role="group" aria-label={L.board}>
        {Array.from({ length: CARDS }, (_, i) => {
          const d = deck.cards[i]!;
          const open = s.open.includes(i);
          const matched = s.matched[i]!;
          const face = hexDigit(d);
          return (
            <button
              type="button"
              class="mem-card"
              data-state={matched ? 'matched' : open ? 'open' : 'hidden'}
              data-c={colorOf(d)}
              aria-label={
                matched ? L.matched(i + 1, face) : open ? L.shown(i + 1, face) : L.hidden(i + 1)
              }
              onClick={() => pick(i)}
            >
              <span class="mem-face font-mono" aria-hidden="true">
                {open || matched ? face : ''}
              </span>
            </button>
          );
        })}
      </div>
      <p class="sr-only" aria-live="polite">
        {L.pairs} {pairsFound(s)}/{PAIRS}
      </p>
    </div>
  );
}
