import { useEffect, useRef, useState } from 'preact/hooks';

/** Stoppuhr für Spiele: startet beim ersten `begin()`, zeigt Zehntel, `end()` liefert die exakte Zeit. */
export function useStopwatch() {
  const start = useRef<number | null>(null);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed(performance.now() - (start.current ?? 0)), 100);
    return () => clearInterval(id);
  }, [running]);

  return {
    elapsed,
    begin() {
      if (start.current !== null) return;
      start.current = performance.now();
      setRunning(true);
    },
    end(): number {
      const ms = Math.round(performance.now() - (start.current ?? performance.now()));
      setRunning(false);
      setElapsed(ms);
      return ms;
    },
  };
}
