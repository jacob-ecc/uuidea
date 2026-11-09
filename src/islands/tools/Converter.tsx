import { useMemo, useState } from 'preact/hooks';
import { t } from '@/i18n';
import { decode } from '@/lib/uuid/decode';
import { allFormats } from '@/lib/uuid/formats';
import { bytesToUlid, ulidToBytes } from '@/lib/uuid/alt-ids';
import { fromBytes, toBytes } from '@/lib/uuid/bytes';
import { CopyButton, noTranslate } from './ui';

const L = t.toolsPage.conv;
const START = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

export default function Converter() {
  const [input, setInput] = useState(START);
  const parsed = useMemo(() => {
    const s = input.trim();
    if (!s) return null;
    const d = decode(s);
    if (d.ok) return { uuid: d.value.uuid, fromUlid: false };
    const u = ulidToBytes(s);
    return u ? { uuid: fromBytes(u), fromUlid: true } : { error: d.error };
  }, [input]);

  const rows =
    parsed && 'uuid' in parsed
      ? [
          ...allFormats(parsed.uuid),
          { key: 'ulid', label: L.ulid, value: bytesToUlid(toBytes(parsed.uuid)!) },
        ]
      : [];

  return (
    <div class="tool-panel">
      <div class="tool-controls">
        <label class="ctl">
          <span class="ctl-label">{L.label}</span>
          <input
            class="field font-mono"
            value={input}
            spellcheck={false}
            autocomplete="off"
            autocapitalize="off"
            aria-invalid={parsed !== null && 'error' in parsed}
            aria-describedby="conv-status"
            onInput={(e) => setInput((e.currentTarget as HTMLInputElement).value)}
          />
        </label>
        <p id="conv-status" class="ctl-hint" aria-live="polite">
          {parsed && 'error' in parsed ? <span class="text-danger">{parsed.error}</span> : null}
          {parsed && 'fromUlid' in parsed && parsed.fromUlid ? L.fromUlid : null}
        </p>
      </div>
      <div class="tool-output">
        <ul class="conv-list">
          {rows.map((r) => (
            <li class="conv-row">
              <div class="min-w-0">
                <p class="conv-label">{r.label}</p>
                <p class="conv-value font-mono" {...noTranslate}>
                  {r.value}
                </p>
              </div>
              <CopyButton text={r.value} iconOnly label={`${r.label} kopieren`} variant="ghost" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
