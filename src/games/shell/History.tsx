import { useRef } from 'preact/hooks';
import { t } from '@/i18n';
import { download } from '@/islands/tools/ui';
import { toast } from '@/scripts/global';
import type { ResultStore, StoredResult } from '@/lib/store/results';
import type { GameMeta } from '../types';

const L = t.games.shell.history;
const when = new Intl.DateTimeFormat('de-DE', { dateStyle: 'short', timeStyle: 'short' });

export function History({
  game,
  items,
  store,
  current,
  disabled,
  onLoad,
  onChange,
}: {
  game: GameMeta;
  items: StoredResult[];
  store: ResultStore;
  current: string;
  disabled: boolean;
  onLoad(uuid: string): void;
  onChange(): void;
}) {
  const file = useRef<HTMLInputElement>(null);

  return (
    <section class="hist" aria-labelledby="hist-h">
      <div class="hist-head">
        <h2 id="hist-h" class="t-h3">
          {L.title}
        </h2>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="btn btn-ghost"
            disabled={store.list().length === 0}
            onClick={() =>
              download(
                `uuidea-ergebnisse-${new Date().toISOString().slice(0, 10)}.json`,
                store.export(),
                'application/json',
              )
            }
          >
            {L.export}
          </button>
          <button type="button" class="btn btn-ghost" onClick={() => file.current?.click()}>
            {L.import}
          </button>
          <input
            ref={file}
            type="file"
            accept="application/json,.json"
            class="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={async (e) => {
              const input = e.currentTarget as HTMLInputElement;
              const f = input.files?.[0];
              input.value = '';
              if (!f) return;
              try {
                toast(L.imported(store.import(await f.text())));
                onChange();
              } catch {
                toast(L.importFailed);
              }
            }}
          />
        </div>
      </div>

      {items.length === 0 ? (
        <p class="ctl-hint mt-3">{L.empty}</p>
      ) : (
        <ul class="hist-list">
          {items.slice(0, 8).map((r) => (
            <li key={`${r.uuid}-${r.at}`}>
              <button
                type="button"
                class={`hist-row ${r.uuid === current ? 'is-current' : ''}`}
                disabled={disabled}
                aria-label={L.load(r.uuid)}
                onClick={() => onLoad(r.uuid)}
              >
                <span class="hist-uuid font-mono">
                  <span class="text-seg-1">{r.uuid.slice(0, 8)}</span>
                  <span class="text-ink-subtle">…</span>
                </span>
                <span class="hist-when">{when.format(r.at)}</span>
                <span class="hist-score font-mono tabular">
                  {game.headline(r.fields).value}
                  {r.vs && r.vsFields && (
                    <span
                      class={
                        game.compare(r.fields, r.vsFields) <= 0 ? 'text-success' : 'text-accent-2'
                      }
                    >
                      {' '}
                      · {t.games.shell.vs} {r.vs}
                    </span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
