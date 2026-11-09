import { useEffect, useMemo, useState } from 'preact/hooks';
import { t } from '@/i18n';
import {
  v1,
  v4,
  v5,
  v6,
  v7,
  NIL,
  MAX,
  NAMESPACES,
  newTimeState,
  type NamespaceName,
} from '@/lib/uuid/generate';
import { formatUuid, type Encoding } from '@/lib/uuid/formats';
import { toBytes } from '@/lib/uuid/bytes';
import { Choice, CopyButton, Toggle, UuidText, copy, download } from './ui';

type Version = 'v4' | 'v7' | 'v1' | 'v6' | 'v5' | 'nil' | 'max';
const L = t.toolsPage.gen;
const MAX_COUNT = 1000;

const VERSIONS: { value: Version; label: string; hint: string }[] = (
  ['v4', 'v7', 'v1', 'v6', 'v5', 'nil', 'max'] as const
).map((v) => ({ value: v, label: v.startsWith('v') ? v : L.versions[v], hint: L.versions[v] }));

async function generate(
  version: Version,
  count: number,
  ns: string,
  names: string[],
): Promise<string[]> {
  switch (version) {
    case 'nil':
      return [NIL];
    case 'max':
      return [MAX];
    case 'v5':
      return Promise.all(names.map((n) => v5(ns, n)));
    case 'v7': {
      const st = { lastMs: 0, counter: 0 };
      return Array.from({ length: count }, () => v7({ state: st }));
    }
    case 'v1':
    case 'v6': {
      const st = newTimeState();
      const fn = version === 'v1' ? v1 : v6;
      return Array.from({ length: count }, () => fn({ state: st }));
    }
    default:
      return Array.from({ length: count }, () => v4());
  }
}

export default function Generator() {
  const [version, setVersion] = useState<Version>('v4');
  const [countRaw, setCountRaw] = useState('5');
  const [encoding, setEncoding] = useState<Encoding>('hex');
  const [upper, setUpper] = useState(false);
  const [noHyphens, setNoHyphens] = useState(false);
  const [braces, setBraces] = useState(false);
  const [nsName, setNsName] = useState<NamespaceName | 'custom'>('DNS');
  const [customNs, setCustomNs] = useState('');
  const [namesRaw, setNamesRaw] = useState('uuidea.de');
  const [list, setList] = useState<string[]>([]);
  const [error, setError] = useState('');

  const count = Math.min(MAX_COUNT, Math.max(1, parseInt(countRaw, 10) || 1));
  const fixed = version === 'nil' || version === 'max';
  const isV5 = version === 'v5';
  const isHex = encoding === 'hex';
  const ns = nsName === 'custom' ? customNs.trim() : NAMESPACES[nsName];
  const names = namesRaw
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_COUNT);

  const run = async () => {
    if (isV5) {
      if (!toBytes(ns)) return setError(L.nsInvalid);
      if (names.length === 0) return setError(L.empty);
    }
    setError('');
    setList(await generate(version, count, ns, names));
  };

  // neu erzeugen, wenn sich Version, Anzahl oder v5-Eingaben ändern
  useEffect(() => {
    void run();
  }, [version, count, ns, namesRaw]);

  const opts = { encoding, upper, hyphens: !noHyphens, braces };
  const shown = useMemo(
    () => list.map((u) => formatUuid(u, opts)),
    [list, encoding, upper, noHyphens, braces],
  );
  const stamp = () => new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');

  return (
    <div class="tool-panel">
      <div class="tool-controls">
        <div class="ctl">
          <span class="ctl-label">{L.version}</span>
          <Choice
            name="gen-version"
            label={L.version}
            value={version}
            options={VERSIONS}
            onChange={setVersion}
          />
          <p class="ctl-hint">{L.versions[version]}</p>
        </div>

        {isV5 ? (
          <div class="ctl-grid">
            <label class="ctl">
              <span class="ctl-label">{L.namespace}</span>
              <select
                class="field"
                value={nsName}
                onChange={(e) =>
                  setNsName(
                    (e.currentTarget as HTMLSelectElement).value as NamespaceName | 'custom',
                  )
                }
              >
                {Object.keys(NAMESPACES).map((k) => (
                  <option value={k}>{k}</option>
                ))}
                <option value="custom">{L.customNs}</option>
              </select>
            </label>
            {nsName === 'custom' && (
              <label class="ctl">
                <span class="ctl-label">{L.customNs}</span>
                <input
                  class="field font-mono"
                  value={customNs}
                  spellcheck={false}
                  autocomplete="off"
                  aria-invalid={customNs !== '' && !toBytes(customNs)}
                  placeholder="6ba7b810-9dad-11d1-80b4-00c04fd430c8"
                  onInput={(e) => setCustomNs((e.currentTarget as HTMLInputElement).value)}
                />
              </label>
            )}
            <label class="ctl ctl-wide">
              <span class="ctl-label">{L.names}</span>
              <textarea
                class="field field-area"
                rows={3}
                value={namesRaw}
                spellcheck={false}
                placeholder={L.namesPlaceholder}
                onInput={(e) => setNamesRaw((e.currentTarget as HTMLTextAreaElement).value)}
              />
            </label>
          </div>
        ) : (
          <div class="ctl">
            <label class="ctl-label" for="gen-count">
              {L.count} <span class="text-ink-subtle">· {L.countHint}</span>
            </label>
            <div class="count-row">
              <input
                id="gen-count"
                class="field count-input font-mono"
                type="number"
                inputMode="numeric"
                min={1}
                max={MAX_COUNT}
                value={countRaw}
                disabled={fixed}
                onInput={(e) => setCountRaw((e.currentTarget as HTMLInputElement).value)}
                onBlur={() => setCountRaw(String(count))}
              />
              {[1, 10, 100, 1000].map((n) => (
                <button
                  type="button"
                  class={`chip ${count === n && !fixed ? 'is-on' : ''}`}
                  disabled={fixed}
                  aria-pressed={count === n && !fixed}
                  onClick={() => setCountRaw(String(n))}
                >
                  {n}
                </button>
              ))}
            </div>
            {fixed && <p class="ctl-hint">{L.fixedHint}</p>}
          </div>
        )}

        <div class="ctl">
          <span class="ctl-label">{L.format}</span>
          <Choice
            name="gen-enc"
            label={L.format}
            value={encoding}
            onChange={setEncoding}
            options={(['hex', 'base64url', 'base58'] as const).map((e) => ({
              value: e,
              label: L.encodings[e],
            }))}
          />
          <div class="toggles">
            <Toggle checked={upper} onChange={setUpper} disabled={!isHex}>
              {L.upper}
            </Toggle>
            <Toggle checked={noHyphens} onChange={setNoHyphens} disabled={!isHex}>
              {L.noHyphens}
            </Toggle>
            <Toggle checked={braces} onChange={setBraces} disabled={!isHex}>
              {L.braces}
            </Toggle>
          </div>
        </div>
      </div>

      <div class="tool-output">
        <div class="out-head">
          <p class="text-sm text-ink-muted" aria-live="polite">
            {error ? <span class="text-danger">{error}</span> : L.generated(shown.length)}
          </p>
          <div class="out-actions">
            {!fixed && (
              <button type="button" class="btn btn-secondary" onClick={() => void run()}>
                {L.generate}
              </button>
            )}
            <CopyButton
              text={() => shown.join('\n')}
              label={L.copyAll}
              variant="primary"
              disabled={!shown.length}
            />
            <button
              type="button"
              class="btn btn-ghost"
              disabled={!shown.length}
              onClick={() =>
                download(`uuids-${version}-${stamp()}.txt`, shown.join('\n') + '\n', 'text/plain')
              }
            >
              {L.txt}
            </button>
            <button
              type="button"
              class="btn btn-ghost"
              disabled={!shown.length}
              onClick={() =>
                download(
                  `uuids-${version}-${stamp()}.csv`,
                  'nr,uuid,version\n' +
                    shown.map((u, i) => `${i + 1},${u},${version}`).join('\n') +
                    '\n',
                  'text/csv',
                )
              }
            >
              {L.csv}
            </button>
          </div>
        </div>
        <ol class="out-list" aria-label={L.h2}>
          {shown.map((u, i) => (
            <li>
              <button
                type="button"
                class="out-row"
                onClick={() => void copy(u)}
                aria-label={`${u} kopieren`}
              >
                <span class="out-nr">
                  {String(i + 1).padStart(String(shown.length).length, '0')}
                </span>
                <UuidText value={u} />
              </button>
            </li>
          ))}
        </ol>
        <p class="ctl-hint mt-3">{L.rowHint}</p>
      </div>
    </div>
  );
}
