/**
 * Triptych-Collage: wechselt alle 2,8 s das Set (Überblendung 0,7 s per CSS).
 * Läuft nur sichtbar und ab 1024px; Pause-Knopf; Überfahren startet den Zyklus neu.
 * prefers-reduced-motion und Handy: Set 1 bleibt stehen.
 */
export function initCollageLoop(root: HTMLElement, pause: HTMLButtonElement): void {
  const sets = [...root.querySelectorAll<HTMLElement>('[data-set]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const wide = matchMedia('(min-width: 1024px)');
  let i = 0;
  let timer: ReturnType<typeof setInterval> | undefined;
  let visible = false;
  let paused = false;

  const show = (n: number) => {
    i = n % sets.length;
    sets.forEach((s, k) => {
      s.classList.toggle('is-on', k === i);
      s.setAttribute('aria-hidden', k === i ? 'false' : 'true');
    });
  };
  const stop = () => {
    clearInterval(timer);
    timer = undefined;
  };
  const can = () => visible && !paused && !reduced.matches && wide.matches;
  const run = () => {
    stop();
    pause.hidden = reduced.matches || !wide.matches;
    if (!can()) {
      if (reduced.matches || !wide.matches) show(0);
      return;
    }
    root.classList.add('is-cycling');
    timer = setInterval(() => show(i + 1), 2800);
  };

  new IntersectionObserver(([e]) => {
    visible = !!e?.isIntersecting;
    run();
  }).observe(root);
  reduced.addEventListener('change', run);
  wide.addEventListener('change', run);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : run()));

  root.addEventListener('pointerenter', () => {
    if (paused || !can()) return;
    show(0);
    run();
  });

  pause.addEventListener('click', () => {
    paused = !paused;
    pause.setAttribute('aria-pressed', String(paused));
    pause.setAttribute('aria-label', paused ? 'Animation fortsetzen' : 'Animation pausieren');
    pause.innerHTML = paused
      ? '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M4 2l8 5-8 5z"></path></svg>'
      : '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 2h3v10H3zM8 2h3v10H8z"></path></svg>';
    run();
  });

  show(0);
}
