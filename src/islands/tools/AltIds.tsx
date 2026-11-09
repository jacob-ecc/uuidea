import { useState } from 'preact/hooks';
import { t } from '@/i18n';
import { v4, v7 } from '@/lib/uuid/generate';
import { nanoid, ulid } from '@/lib/uuid/alt-ids';
import { CopyButton, noTranslate } from './ui';

const L = t.toolsPage.alt;

function make() {
  return [
    { key: 'v4', name: 'UUID v4', value: v4(), bits: '122 Bit', sortable: false },
    { key: 'v7', name: 'UUID v7', value: v7(), bits: '74 Bit', sortable: true },
    { key: 'ulid', name: 'ULID', value: ulid(), bits: '80 Bit', sortable: true },
    { key: 'nanoid', name: 'Nano ID', value: nanoid(), bits: '126 Bit', sortable: false },
  ] as const;
}

export default function AltIds() {
  const [ids, setIds] = useState(make);
  return (
    <div>
      <div class="alt-grid">
        {ids.map((r) => (
          <article class="alt-card card">
            <div class="flex items-center justify-between gap-3">
              <h3 class="t-h3">{r.name}</h3>
              <span class={`badge ${r.sortable ? 'badge-accent' : ''}`}>
                {r.sortable ? `${L.cols.sortable}: ${L.yes}` : `${L.cols.sortable}: ${L.no}`}
              </span>
            </div>
            <div class="alt-value">
              <p class="font-mono text-ink" {...noTranslate}>
                {r.value}
              </p>
              <CopyButton text={r.value} iconOnly label={`${r.name} kopieren`} variant="ghost" />
            </div>
            <dl class="alt-meta">
              <div>
                <dt>{L.cols.length}</dt>
                <dd class="font-mono">{r.value.length}</dd>
              </div>
              <div>
                <dt>{L.cols.bits}</dt>
                <dd class="font-mono">{r.bits}</dd>
              </div>
            </dl>
            <p class="mt-3 text-[15px] text-ink-muted">{L.rows[r.key]}</p>
          </article>
        ))}
      </div>
      <button type="button" class="btn btn-secondary mt-6" onClick={() => setIds(make())}>
        {L.regenerate}
      </button>
    </div>
  );
}
