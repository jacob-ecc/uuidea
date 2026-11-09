import { ensureSession, onSessionChange } from '@/lib/session';
import { t } from '@/i18n';

let toastTimer: ReturnType<typeof setTimeout> | undefined;

export function toast(msg: string): void {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback für ältere Browser / unsichere Kontexte
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.className = 'fixed -left-[9999px]';
    document.body.append(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

/** Copy-Button-Feedback: Icon/Label wechseln, Toast + aria-live. */
export async function copyWithFeedback(btn: HTMLElement | null, text: string): Promise<void> {
  const ok = await copyText(text);
  toast(ok ? t.a11y.copied : t.a11y.copyFailed);
  if (!btn || !ok) return;
  btn.dataset.copied = 'true';
  setTimeout(() => delete btn.dataset.copied, 1600);
}

function paintSession(uuid: string): void {
  document.querySelectorAll<HTMLElement>('[data-session-uuid]').forEach((el) => {
    el.textContent = uuid;
  });
  document.querySelectorAll<HTMLElement>('[data-session-ghost]').forEach((el) => {
    el.textContent = uuid;
  });
}

export function initGlobal(): void {
  paintSession(ensureSession());
  onSessionChange(paintSession);

  // Deklaratives Kopieren: <button data-copy="text"> oder data-copy-from="#id"
  document.addEventListener('click', (e) => {
    const btn = (e.target as Element | null)?.closest<HTMLElement>('[data-copy],[data-copy-from]');
    if (!btn) return;
    const from = btn.dataset.copyFrom;
    const text = from
      ? (document.querySelector<HTMLElement>(from)?.dataset.uuid ??
        document.querySelector<HTMLElement>(from)?.textContent ??
        '')
      : (btn.dataset.copy ?? '');
    if (text) void copyWithFeedback(btn, text.trim());
  });
}
