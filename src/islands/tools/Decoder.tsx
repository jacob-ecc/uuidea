import { useMemo, useState } from 'preact/hooks';
import { t } from '@/i18n';
import { decode, VARIANT_INFO, VERSION_INFO } from '@/lib/uuid/decode';
import { v7 } from '@/lib/uuid/generate';
import { ensureSession } from '@/lib/session';
import { CopyButton, UuidText } from './ui';

const L = t.toolsPage.dec;

function fmtTime(ms: number, sub: number | undefined, tz?: string): string {
  const d = new Date(ms);
  const base = new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'medium',
    ...(tz ? { timeZone: tz } : {}),
  }).format(d);
  const msPart = String(d.getUTCMilliseconds()).padStart(3, '0');
  const subPart = sub !== undefined ? String(sub).padStart(4, '0') : '';
  return `${base},${msPart}${subPart}`;
}

function relative(ms: number): string {
  const diff = ms - Date.now();
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat('de', { numeric: 'auto' });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31_536_000_000],
    ['month', 2_592_000_000],
    ['day', 86_400_000],
    ['hour', 3_600_000],
    ['minute', 60_000],
    ['second', 1000],
  ];
  for (const [u, size] of units)
    if (abs >= size || u === 'second') return rtf.format(Math.trunc(diff / size), u);
  return '';
}

export default function Decoder() {
  const [input, setInput] = useState('');
  const res = useMemo(() => (input.trim() ? decode(input) : null), [input]);
  const v = res?.ok ? res.value : null;
  const info = v ? VERSION_INFO[v.version] : undefined;

  return (
    <div class="tool-panel">
      <div class="tool-controls">
        <label class="ctl">
          <span class="ctl-label">{L.label}</span>
          <input
            class="field font-mono"
            value={input}
            placeholder={L.placeholder}
            spellcheck={false}
            autocomplete="off"
            autocapitalize="off"
            aria-invalid={res !== null && !res.ok}
            aria-describedby="dec-status"
            onInput={(e) => setInput((e.currentTarget as HTMLInputElement).value)}
          />
        </label>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="btn btn-secondary" onClick={() => setInput(ensureSession())}>
            {L.useSession}
          </button>
          <button type="button" class="btn btn-ghost" onClick={() => setInput(v7())}>
            {L.useV7}
          </button>
        </div>
        <p class="ctl-hint">{L.hint}</p>
      </div>

      <div class="tool-output" id="dec-status" aria-live="polite">
        {!res && <p class="text-ink-muted">{L.empty}</p>}
        {res && !res.ok && (
          <div class="result result-bad">
            <span class="badge badge-bad">{L.invalid}</span>
            <p class="mt-3 text-ink-muted">{res.error}</p>
          </div>
        )}
        {v && (
          <div class="result">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <span class="badge badge-ok">✓ {L.valid}</span>
              <CopyButton text={v.uuid} iconOnly label={`${v.uuid} kopieren`} variant="ghost" />
            </div>
            <p class="result-uuid">
              <UuidText value={v.uuid} />
            </p>

            {v.alternative && (
              <div class="notice">
                <p>{L.ambiguous(L.formats[v.alternative.format])}</p>
                <p class="mt-1">
                  <UuidText value={v.alternative.uuid} />
                </p>
                <button
                  type="button"
                  class="btn btn-ghost mt-2"
                  onClick={() => setInput(v.alternative!.uuid)}
                >
                  {L.useAlt}
                </button>
              </div>
            )}

            {(v.isNil || v.isMax) && <p class="notice">{v.isNil ? L.nil : L.max}</p>}

            <dl class="kv">
              <div>
                <dt>{L.input}</dt>
                <dd>{L.formats[v.inputFormat]}</dd>
              </div>
              {!v.isNil && !v.isMax && (
                <div>
                  <dt>{L.version}</dt>
                  <dd>
                    <span class="font-mono text-ink">v{v.version}</span>
                    {info ? ` · ${info.name}` : ''}
                    {info && <span class="kv-sub">{info.detail}</span>}
                  </dd>
                </div>
              )}
              <div>
                <dt>{L.variant}</dt>
                <dd>{VARIANT_INFO[v.variant]}</dd>
              </div>
              {v.timeMs !== undefined && (
                <div>
                  <dt>{L.time}</dt>
                  <dd>
                    <span class="font-mono text-ink">
                      {fmtTime(v.timeMs, v.subMsTicks, 'UTC')} UTC
                    </span>
                    <span class="kv-sub">
                      {L.timeLocal}: {fmtTime(v.timeMs, v.subMsTicks)} · {relative(v.timeMs)}
                    </span>
                    <span class="kv-sub font-mono">{new Date(v.timeMs).toISOString()}</span>
                  </dd>
                </div>
              )}
              {v.clockSeq !== undefined && (
                <div>
                  <dt>{L.clockSeq}</dt>
                  <dd class="font-mono">
                    {v.clockSeq} (0x{v.clockSeq.toString(16).padStart(4, '0')})
                  </dd>
                </div>
              )}
              {v.node && (
                <div>
                  <dt>{L.node}</dt>
                  <dd class="font-mono">{v.node}</dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
