import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { t } from '@/i18n';
import type { GameProps } from '../types';
import { MAX_LEVEL, PADS, check, makeSequence, timing } from './logic';

const L = t.games.sequence;
const LEAD_IN = 700;
const NEXT_LEVEL = 700;

type Phase = 'watch' | 'input' | 'pause' | 'wrong' | 'win';

export default function SequenceGame({ uuid, rng, onDone }: GameProps) {
  const seq = useMemo(() => makeSequence(uuid, rng), [uuid, rng]);
  const [level, setLevel] = useState(1);
  const [phase, setPhase] = useState<Phase>('watch');
  const [lit, setLit] = useState<number | null>(null);
  const [pos, setPos] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));
  const clearAll = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clearAll, []);

  // Vorspielen der Stufe
  useEffect(() => {
    if (phase !== 'watch') return;
    const { on, gap } = timing(level);
    let at = LEAD_IN;
    for (let k = 0; k < level; k++) {
      const pad = seq[k]!;
      later(() => setLit(pad), at);
      later(() => setLit(null), at + on);
      at += on + gap;
    }
    later(() => {
      setPos(0);
      setPhase('input');
    }, at - gap);
  }, [phase, level, seq]);

  function press(pad: number) {
    if (phase !== 'input') return;
    setLit(pad);
    later(() => setLit((l) => (l === pad ? null : l)), 180);
    const res = check(seq, level, pos, pad);
    if (res === 'ok') return setPos(pos + 1);
    if (res === 'wrong') {
      setPhase('wrong');
      later(() => onDone([level - 1]), 900);
      return;
    }
    if (res === 'win') {
      setPhase('win');
      later(() => onDone([MAX_LEVEL]), 900);
      return;
    }
    // Stufe geschafft: kurze Pause, dann die nächste vorspielen
    setPhase('pause');
    later(() => {
      setLevel(level + 1);
      setPhase('watch');
    }, NEXT_LEVEL);
  }

  // Tasten 1–4
  const pressRef = useRef(press);
  pressRef.current = press;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (e.repeat || !Number.isInteger(n) || n < 1 || n > PADS) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) return;
      e.preventDefault();
      pressRef.current(n);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const status =
    phase === 'input'
      ? L.yourTurn
      : phase === 'wrong'
        ? L.wrong
        : phase === 'win'
          ? L.done
          : L.watch;

  return (
    <div class="gm">
      <p class="gm-bar">
        <span>
          {L.level}{' '}
          <b class="font-mono tabular">
            {level}/{MAX_LEVEL}
          </b>
        </span>
        <span class="seq-status" data-phase={phase}>
          {status}
        </span>
        <span class="font-mono tabular" aria-hidden="true">
          {phase === 'input' ? `${pos}/${level}` : ''}
        </span>
      </p>
      <div class="seq-board" role="group" aria-label={L.board} data-phase={phase}>
        {Array.from({ length: PADS }, (_, k) => (
          <button
            type="button"
            class={`seq-pad ${lit === k + 1 ? 'is-lit' : ''}`}
            data-c={k + 1}
            aria-label={L.pad(k + 1)}
            disabled={phase !== 'input'}
            onClick={() => press(k + 1)}
          >
            <span class="seq-key font-mono" aria-hidden="true">
              {k + 1}
            </span>
          </button>
        ))}
      </div>
      <p class="sr-only" aria-live="assertive">
        {status}
      </p>
    </div>
  );
}
