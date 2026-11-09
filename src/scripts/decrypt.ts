/**
 * "Decrypt"-Animation: jedes Zeichen flackert kurz durch Hex-Glyphen und rastet
 * dann ein. Layout bleibt stabil (Mono, feste Zeichenzahl).
 * Rein dekorativ – nutzt daher bewusst Math.random.
 */
const HEX = '0123456789abcdef';
const SEG_BOUNDS = [8, 13, 18, 23]; // Indizes der Bindestriche

export function renderUuidChars(root: HTMLElement): HTMLSpanElement[] {
  root.textContent = '';
  const chars: HTMLSpanElement[] = [];
  let seg = document.createElement('span');
  seg.className = 's1';
  seg.setAttribute('aria-hidden', 'true');
  root.append(seg);
  let segIdx = 1;
  for (let i = 0; i < 36; i++) {
    if (SEG_BOUNDS.includes(i)) {
      const dash = document.createElement('span');
      dash.className = 'dash';
      dash.setAttribute('aria-hidden', 'true');
      dash.textContent = '-';
      root.append(dash);
      seg = document.createElement('span');
      seg.className = `s${++segIdx}`;
      seg.setAttribute('aria-hidden', 'true');
      root.append(seg);
      continue;
    }
    const c = document.createElement('span');
    c.className = 'ch';
    c.textContent = '0';
    seg.append(c);
    chars.push(c);
  }
  return chars;
}

let running = 0;

export function decryptInto(root: HTMLElement, uuid: string, reduced: boolean): void {
  root.dataset.uuid = uuid;
  root.setAttribute('aria-label', uuid);
  const chars = root.querySelectorAll<HTMLSpanElement>('.ch').length
    ? [...root.querySelectorAll<HTMLSpanElement>('.ch')]
    : renderUuidChars(root);
  const target = uuid.replace(/-/g, '');
  const run = ++running;

  if (reduced) {
    chars.forEach((c, i) => {
      c.textContent = target[i] ?? '0';
      c.classList.remove('scramble');
    });
    root.classList.remove('is-anim');
    void root.offsetWidth;
    root.classList.add('is-fade');
    return;
  }

  root.classList.add('is-anim');
  const start = performance.now();
  const lock = chars.map((_, i) => {
    const segment = i < 8 ? 0 : i < 12 ? 1 : i < 16 ? 2 : i < 20 ? 3 : 4;
    return 120 + i * 26 + segment * 60 + Math.random() * 90;
  });
  let lastFlick = 0;

  const tick = (now: number): void => {
    if (run !== running) return;
    const t = now - start;
    const flick = now - lastFlick > 45;
    if (flick) lastFlick = now;
    let done = true;
    chars.forEach((c, i) => {
      if (t >= lock[i]!) {
        if (c.textContent !== target[i]) {
          c.textContent = target[i] ?? '0';
          c.classList.remove('scramble');
        }
      } else {
        done = false;
        if (flick && t > lock[i]! - 260) {
          c.textContent = HEX[(Math.random() * 16) | 0]!;
          c.classList.add('scramble');
        }
      }
    });
    if (!done) requestAnimationFrame(tick);
    else root.classList.remove('is-anim');
  };
  requestAnimationFrame(tick);
}
