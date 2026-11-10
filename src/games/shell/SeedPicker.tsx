import { useState } from 'preact/hooks';
import { t } from '@/i18n';
import { CopyButton, UuidText } from '@/islands/tools/ui';
import { fromBytes, toBytes } from '@/lib/uuid/bytes';

const L = t.games.shell;

export function SeedPicker({
  uuid,
  disabled,
  onNew,
  onSession,
  onDaily,
  onCustom,
}: {
  uuid: string;
  disabled: boolean;
  onNew(): void;
  onSession(): void;
  onDaily(): void;
  onCustom(uuid: string): void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const parsed = value.trim() ? toBytes(value) : null;
  const invalid = value.trim() !== '' && !parsed;

  return (
    <div class="seed">
      <div class="seed-head">
        <p class="ctl-label">{L.seedLabel}</p>
        <CopyButton text={uuid} iconOnly variant="ghost" label={`${uuid} kopieren`} />
      </div>
      <p class="seed-uuid" aria-live="polite">
        <UuidText value={uuid} />
      </p>
      <p class="ctl-hint mt-2">{L.seedHint}</p>
      <div class="seed-actions">
        <button type="button" class="btn btn-secondary" disabled={disabled} onClick={onNew}>
          {L.newUuid}
        </button>
        <button type="button" class="btn btn-ghost" disabled={disabled} onClick={onSession}>
          {L.useSession}
        </button>
        <button type="button" class="btn btn-ghost" disabled={disabled} onClick={onDaily}>
          {L.useDaily}
        </button>
        <button
          type="button"
          class="btn btn-ghost"
          disabled={disabled}
          aria-expanded={open}
          aria-controls="seed-custom"
          onClick={() => setOpen((o) => !o)}
        >
          {L.custom}
        </button>
      </div>
      {open && (
        <form
          id="seed-custom"
          class="seed-custom"
          onSubmit={(e) => {
            e.preventDefault();
            if (!parsed) return;
            onCustom(fromBytes(parsed));
            setValue('');
            setOpen(false);
          }}
        >
          <label class="ctl">
            <span class="sr-only">{L.customLabel}</span>
            <input
              class="field font-mono"
              value={value}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              spellcheck={false}
              autocomplete="off"
              autocapitalize="off"
              aria-invalid={invalid}
              aria-describedby={invalid ? 'seed-err' : undefined}
              onInput={(e) => setValue((e.currentTarget as HTMLInputElement).value)}
            />
          </label>
          {invalid && (
            <p id="seed-err" class="seed-err">
              {L.customInvalid}
            </p>
          )}
          <button type="submit" class="btn btn-secondary" disabled={!parsed || disabled}>
            {L.customApply}
          </button>
        </form>
      )}
    </div>
  );
}
