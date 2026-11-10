/**
 * Reaktionstest – UI. Zeitmessung über performance.now(); das Signal wird direkt
 * am DOM gesetzt und der Startpunkt im nächsten Frame verfeinert, damit Preacts
 * Render-Takt nicht in die Messung fällt.
 */
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { t } from '@/i18n';
import type { GameProps } from '../types';
import { ms } from '../format';
import { MISS, PENALTY, ROUNDS, judge, makePlan, toFields, waitFor } from './logic';

const L = t.games.reaction;

type Phase = 'idle' | 'wait' | 'go' | 'foul' | 'shown';

export default function ReactionGame({ uuid, rng, onDone }: GameProps) {
  const plan = useMemo(() => makePlan(uuid, rng), [uuid, rng]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [round, setRound] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const [fouls, setFouls] = useState(0);
  const [foulInRound, setFoulInRound] = useState(false);
  const [last, setLast] = useState<number | null>(null);

  const pad = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const goAt = useRef(0);
  const phaseRef = useRef<Phase>('idle');
  phaseRef.current = phase;

  const clear = () => clearTimeout(timer.current);
  useEffect(() => clear, []);
  useEffect(() => pad.current?.focus({ preventScroll: true }), []);

  // Tab im Hintergrund: laufenden Durchgang ohne Wertung zurücksetzen
  useEffect(() => {
    const onHide = () => {
      if (document.hidden && (phaseRef.current === 'wait' || phaseRef.current === 'go')) {
        clear();
        setPhase('idle');
      }
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, []);

  function record(value: number) {
    const next = [...times, value];
    setTimes(next);
    setLast(value);
    setPhase('shown');
  }

  /** Startet Durchgang `r`; nach einem Frühstart kommt die Wartezeit aus der Ersatzliste. */
  function startRound(r: number, spare: boolean) {
    const wait = waitFor(plan, r, fouls, spare);
    setPhase('wait');
    timer.current = setTimeout(() => {
      goAt.current = performance.now();
      if (pad.current) pad.current.dataset.phase = 'go';
      requestAnimationFrame((ts) => (goAt.current = Math.max(goAt.current, ts)));
      setPhase('go');
      timer.current = setTimeout(() => record(MISS), MISS);
    }, wait);
  }

  function press() {
    const now = performance.now();
    switch (phaseRef.current) {
      case 'idle':
      case 'foul':
        startRound(round, foulInRound);
        return;
      case 'wait':
        clear();
        setFouls((f) => f + 1);
        setFoulInRound(true);
        setPhase('foul');
        return;
      case 'go': {
        clear();
        const reaction = now - goAt.current;
        if (judge(reaction) === 'foul') {
          setFouls((f) => f + 1);
          setFoulInRound(true);
          setPhase('foul');
          return;
        }
        record(Math.round(reaction));
        return;
      }
      case 'shown':
        if (times.length >= ROUNDS) {
          onDone(toFields(times, fouls));
          return;
        }
        setRound(times.length);
        setFoulInRound(false);
        startRound(times.length, false);
        return;
    }
  }

  const color = plan.colors[round]!;
  const done = times.length;
  const isLast = done >= ROUNDS;

  let big: string;
  let small: string;
  switch (phase) {
    case 'idle':
      big = L.pad.idle(round + 1, ROUNDS);
      small = L.pad.idleHint;
      break;
    case 'wait':
      big = L.pad.wait;
      small = L.pad.waitHint;
      break;
    case 'go':
      big = L.pad.go;
      small = '';
      break;
    case 'foul':
      big = L.pad.foul;
      small = L.pad.foulHint;
      break;
    case 'shown':
      big = last === MISS ? L.pad.miss : ms(last ?? 0);
      small = isLast ? L.pad.last : L.pad.next;
      break;
  }

  return (
    <div class="rx">
      <ol class="rx-steps" aria-label={t.games.shell.perRound}>
        {Array.from({ length: ROUNDS }, (_, i) => (
          <li
            class={i < done ? 'is-done' : i === round && phase !== 'shown' ? 'is-now' : ''}
            data-c={plan.colors[i]}
          >
            <span class="rx-step-n">{L.round(i + 1)}</span>
            <span class="rx-step-v font-mono tabular">
              {times[i] !== undefined ? ms(times[i]!) : '–'}
            </span>
          </li>
        ))}
      </ol>

      <button
        ref={pad}
        type="button"
        class="rx-pad"
        data-phase={phase}
        data-c={color}
        aria-label={L.pad.label}
        aria-describedby="rx-live"
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          e.preventDefault();
          press();
        }}
        onKeyDown={(e) => {
          if (e.key !== ' ' && e.key !== 'Enter') return;
          e.preventDefault();
          if (!e.repeat) press();
        }}
        onClick={(e) => e.preventDefault()}
      >
        <span class="rx-big tabular">{big}</span>
        {small && <span class="rx-small">{small}</span>}
      </button>

      <p id="rx-live" class="sr-only" aria-live="assertive">
        {phase === 'go' ? L.pad.go : phase === 'foul' ? L.pad.foul : phase === 'shown' ? big : ''}
      </p>
      <p class="rx-foot">
        <span>
          {L.fouls}: <span class="font-mono text-ink">{fouls}</span>
          {fouls > 0 && <span class="text-ink-subtle"> · +{ms(fouls * PENALTY)}</span>}
        </span>
      </p>
    </div>
  );
}
