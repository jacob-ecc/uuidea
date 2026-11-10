import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { t } from '@/i18n';
import type { GameProps } from '../types';
import { clock } from '../format';
import { useStopwatch } from '../shell/useStopwatch';
import { N, SIZE, arrowTarget, isSolved, makeBoard, slide } from './logic';

const L = t.games.sort;

export default function SortGame({ uuid, rng, onDone }: GameProps) {
  const start = useMemo(() => makeBoard(uuid, rng), [uuid, rng]);
  const [board, setBoard] = useState(start);
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);
  const sw = useStopwatch();
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => box.current?.focus({ preventScroll: true }), []);

  function tap(i: number) {
    if (solved) return;
    const r = slide(board, i);
    if (!r) return;
    sw.begin();
    const m = moves + r.moved;
    setBoard(r.board);
    setMoves(m);
    if (isSolved(r.board)) {
      setSolved(true);
      const ms = sw.end();
      setTimeout(() => onDone([m, ms]), 700);
    }
  }

  // Kachelwert → aktuelle Position (für stabile Keys und Transform-Animation)
  const pos = new Map(board.map((v, i) => [v, i]));

  return (
    <div class="gm">
      <p class="gm-bar">
        <span>
          {L.moves} <b class="font-mono tabular">{moves}</b>
        </span>
        <span>
          {L.time} <b class="font-mono tabular">{clock(sw.elapsed)}</b>
        </span>
      </p>
      <div
        ref={box}
        class={`srt-board ${solved ? 'is-solved' : ''}`}
        role="group"
        aria-label={L.board}
        tabIndex={0}
        onKeyDown={(e) => {
          const target = arrowTarget(board, e.key);
          if (target === null) return;
          e.preventDefault();
          tap(target);
        }}
      >
        {Array.from({ length: SIZE - 1 }, (_, k) => {
          const v = k + 1;
          const i = pos.get(v)!;
          const [r, c] = [Math.floor(i / N), i % N];
          return (
            <button
              key={v}
              type="button"
              tabIndex={-1}
              class={`srt-tile ${i === v - 1 ? 'is-home' : ''}`}
              style={{ '--x': c, '--y': r }}
              data-pos={i}
              aria-label={L.tile(v, r + 1, c + 1)}
              onClick={() => tap(i)}
            >
              <span class="font-mono">{v}</span>
            </button>
          );
        })}
      </div>
      <p class="sr-only" aria-live="polite">
        {solved ? L.solved : `${L.moves}: ${moves}`}
      </p>
    </div>
  );
}
