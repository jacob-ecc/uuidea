/** Gemeinsame Bausteine der Tool-Islands (Preact). */
import type { ComponentChildren } from 'preact';
import { useState } from 'preact/hooks';
import { copyText, toast } from '@/scripts/global';
import { t } from '@/i18n';

/** HTML-Attribut translate="no" (Preact typisiert es als boolean). */
export const noTranslate = { translate: 'no' } as unknown as Record<string, never>;

const SEG =
  /^([0-9a-fA-F]{8})-([0-9a-fA-F]{4})-([0-9a-fA-F]{4})-([0-9a-fA-F]{4})-([0-9a-fA-F]{12})$/;

/** UUID in Segmentfarben; andere Formate werden schlicht gesetzt. */
export function UuidText({ value, class: cls }: { value: string; class?: string }) {
  const inner = value.replace(/^\{|\}$/g, '');
  const m = SEG.exec(inner);
  const braces = value.startsWith('{');
  return (
    <span class={`uuid ${cls ?? ''}`} {...noTranslate} aria-label={value}>
      {braces && <span class="dash">{'{'}</span>}
      {m ? (
        m.slice(1).map((seg, i) => (
          <>
            {i > 0 && <span class="dash">-</span>}
            <span class={`s${i + 1}`}>{seg}</span>
          </>
        ))
      ) : (
        <span class="uuid-plain">{inner}</span>
      )}
      {braces && <span class="dash">{'}'}</span>}
    </span>
  );
}

export async function copy(text: string, label?: string): Promise<boolean> {
  const ok = await copyText(text);
  toast(ok ? (label ?? t.a11y.copied) : t.a11y.copyFailed);
  return ok;
}

const CopyIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M9 9h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1zM5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
  </svg>
);
const CheckIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12.5 10 17.5 19 7" />
  </svg>
);

/** Kopier-Knopf mit Haken-Feedback (1,6 s) + Toast. */
export function CopyButton({
  text,
  label = t.common.copy,
  iconOnly = false,
  variant = 'secondary',
  disabled = false,
}: {
  text: string | (() => string);
  label?: string;
  iconOnly?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
}) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      class={`btn btn-${variant} ${iconOnly ? 'btn-icon' : ''}`}
      aria-label={iconOnly ? label : undefined}
      disabled={disabled}
      onClick={async () => {
        if (await copy(typeof text === 'function' ? text() : text)) {
          setDone(true);
          setTimeout(() => setDone(false), 1600);
        }
      }}
    >
      <span class={done ? 'text-success' : ''}>{done ? <CheckIcon /> : <CopyIcon />}</span>
      {!iconOnly && <span>{done ? t.common.copied : label}</span>}
    </button>
  );
}

/** Schalter als echte Checkbox (Tastatur, Screenreader), optisch als Pill. */
export function Toggle({
  checked,
  onChange,
  children,
  disabled = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: ComponentChildren;
  disabled?: boolean;
}) {
  return (
    <label class={`toggle ${disabled ? 'is-disabled' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange((e.currentTarget as HTMLInputElement).checked)}
      />
      <span class="toggle-track" aria-hidden="true">
        <span class="toggle-thumb" />
      </span>
      <span>{children}</span>
    </label>
  );
}

/** Datei-Download ohne Server (Blob-URL). */
export function download(filename: string, content: string, mime: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: `${mime};charset=utf-8` }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Segment-Control als Radiogruppe (Pfeiltasten funktionieren nativ). */
export function Choice<T extends string>({
  name,
  value,
  options,
  onChange,
  label,
}: {
  name: string;
  value: T;
  options: readonly { value: T; label: string; hint?: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <fieldset class="choice">
      <legend class="sr-only">{label}</legend>
      <div class="segmented" role="presentation">
        {options.map((o) => (
          <label title={o.hint}>
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              class="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
