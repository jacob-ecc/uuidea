import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { t } from '@/i18n';
import type { GameProps } from '../types';
import { OPTIONS, ROUNDS, makeRounds } from './logic';

const L = t.games.hexcolor;
const FEEDBACK = 800;

export default function HexGame({ uuid, rng, onDone }: GameProps) {
  const rounds = useMemo(() => makeRounds(uuid, rng), [uuid, rng]);
  const [i, setI] = useState(0);
  const [hits, setHits] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  // Bedenkzeit: von „Farbe steht“ bis zum Tipp, summiert über alle Runden
  const shownAt = useRef<number | null>(null);
  const thinking = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const swatch = useRef<HTMLDivElement>(null);
  const round = rounds[i]!;

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    shownAt.current ??= performance.now();
  }, []);
  // Farbe per CSSOM setzen (CSP: keine Style-Attribute im HTML)
  useEffect(() => {
    swatch.current?.style.setProperty('--hex', round.target);
  }, [round.target]);

  function choose(k: number) {
    if (picked !== null) return;
    const now = performance.now();
    thinking.current += now - (shownAt.current ?? now);
    const hit = k === round.answer;
    const total = hits + (hit ? 1 : 0);
    setPicked(k);
    setHits(total);
    timer.current = setTimeout(() => {
      if (i + 1 >= ROUNDS) {
        onDone([total, Math.round(thinking.current)]);
        return;
      }
      setI(i + 1);
      setPicked(null);
      shownAt.current = performance.now();
    }, FEEDBACK);
  }

  const chooseRef = useRef(choose);
  chooseRef.current = choose;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (e.repeat || !Number.isInteger(n) || n < 1 || n > OPTIONS) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) return;
      e.preventDefault();
      chooseRef.current(n - 1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const feedback =
    picked === null ? '' : picked === round.answer ? L.right : L.wrongWas(round.target);

  return (
    <div class="gm">
      <p class="gm-bar">
        <span>
          {L.hits}{' '}
          <b class="font-mono tabular">
            {hits}/{ROUNDS}
          </b>
        </span>
        <span>{L.swatch(i + 1, ROUNDS)}</span>
      </p>
      <div class="hx-stage">
        <div ref={swatch} class="hx-big" role="img" aria-label={L.swatch(i + 1, ROUNDS)} />
        <div class="hx-choices" role="group" aria-label={L.options}>
          {round.options.map((hex, k) => (
            <button
              type="button"
              class={`hx-choice ${
                picked === null
                  ? ''
                  : k === round.answer
                    ? 'is-right'
                    : k === picked
                      ? 'is-wrong'
                      : 'is-off'
              }`}
              aria-pressed={picked === k}
              onClick={() => choose(k)}
            >
              <span class="hx-key font-mono" aria-hidden="true">
                {k + 1}
              </span>
              <span class="font-mono">{hex}</span>
            </button>
          ))}
        </div>
      </div>
      <p class="hx-feedback" aria-live="assertive">
        {feedback}
      </p>
    </div>
  );
}
