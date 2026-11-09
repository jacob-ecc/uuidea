/**
 * Schritt-Loop der Hero-Karte (Taste: „a loop inside the small card“):
 * steht zuerst fertig da, hält 1,2 s, dann erscheinen die Schritte 0,5 s versetzt neu.
 * Ein Zyklus ≈ 3,5 s. Pause-Knopf, Neustart beim Überfahren, reduced motion: steht still.
 */
const PAUSE_ICON = '<path d="M3 2h3v10H3zM8 2h3v10H8z"></path>';
const PLAY_ICON = '<path d="M4 2l8 5-8 5z"></path>';

export function initStepsLoop(card: HTMLElement, pauseBtn: HTMLElement, reduced: boolean): void {
  const steps = [...card.querySelectorAll<HTMLElement>('[data-step]')];
  // Badge („Gültig“) zuletzt
  const ordered = [
    ...steps.filter((s) => !s.classList.contains('badge')),
    ...steps.filter((s) => s.classList.contains('badge')),
  ];
  if (reduced || ordered.length === 0) {
    pauseBtn.hidden = true;
    return;
  }
  let timers: ReturnType<typeof setTimeout>[] = [];
  let paused = false;
  const clear = () => {
    timers.forEach(clearTimeout);
    timers = [];
  };
  const cycle = (delay: number) => {
    clear();
    timers.push(
      setTimeout(() => {
        ordered.forEach((s) => s.classList.add('is-hidden'));
        ordered.forEach((s, i) =>
          timers.push(setTimeout(() => s.classList.remove('is-hidden'), 300 + i * 500)),
        );
        timers.push(setTimeout(() => cycle(1200), 300 + ordered.length * 500));
      }, delay),
    );
  };
  const setIcon = () => {
    const svg = pauseBtn.querySelector('svg');
    if (svg) svg.innerHTML = paused ? PLAY_ICON : PAUSE_ICON;
    pauseBtn.setAttribute('aria-label', paused ? 'Animation fortsetzen' : 'Animation pausieren');
  };
  pauseBtn.addEventListener('click', () => {
    paused = !paused;
    if (paused) {
      clear();
      ordered.forEach((s) => s.classList.remove('is-hidden'));
    } else cycle(0);
    setIcon();
  });
  card.addEventListener('pointerenter', () => {
    if (!paused) cycle(0);
  });
  // Nur laufen, solange sichtbar
  new IntersectionObserver(([e]) => {
    if (!e) return;
    if (e.isIntersecting && !paused) cycle(1200);
    else clear();
  }).observe(card);
}
