import { useEffect, useMemo, useState } from 'preact/hooks';
import { t } from '@/i18n';
import { copy, noTranslate } from '@/islands/tools/ui';
import { buildShareUrl, clampNick, encodeResult } from '@/lib/share/codec';
import { loadNick, saveNick } from '@/lib/store/results';
import type { GameMeta } from '../types';

const L = t.games.shell.share;

/** QR-Code als SVG-Pfad; der Encoder (≈ 6 KB) wird erst beim Öffnen nachgeladen. */
function Qr({ text }: { text: string }) {
  const [qr, setQr] = useState<{ n: number; d: string } | null>(null);
  useEffect(() => {
    let alive = true;
    void import('qrcode-generator').then(({ default: qrcode }) => {
      const q = qrcode(0, 'M');
      q.addData(text, 'Byte');
      q.make();
      const n = q.getModuleCount();
      let d = '';
      for (let y = 0; y < n; y++)
        for (let x = 0; x < n; x++) if (q.isDark(y, x)) d += `M${x} ${y}h1v1h-1z`;
      if (alive) setQr({ n, d });
    });
    return () => {
      alive = false;
    };
  }, [text]);
  if (!qr) return <div class="qr qr-wait" aria-hidden="true" />;
  const m = 3; // Ruhezone
  return (
    <svg
      class="qr"
      viewBox={`${-m} ${-m} ${qr.n + 2 * m} ${qr.n + 2 * m}`}
      role="img"
      aria-label={L.qrAlt}
      shape-rendering="crispEdges"
    >
      <rect x={-m} y={-m} width={qr.n + 2 * m} height={qr.n + 2 * m} fill="#e9edf3" />
      <path d={qr.d} fill="#0a0d14" />
    </svg>
  );
}

export function SharePanel({
  game,
  uuid,
  fields,
  defaultNick,
}: {
  game: GameMeta;
  uuid: string;
  fields: number[];
  defaultNick: string;
}) {
  const [nick, setNick] = useState(loadNick);
  const [showQr, setShowQr] = useState(false);
  const canShare = typeof navigator !== 'undefined' && 'share' in navigator;
  const effective = clampNick(nick) || defaultNick;

  const url = useMemo(
    () =>
      buildShareUrl(
        location.origin,
        game.slug,
        uuid,
        encodeResult(uuid, { gameId: game.id, fields, nick: effective }),
      ),
    [game, uuid, fields, effective],
  );
  const text = L.shareText(game.name, game.headline(fields).value);

  return (
    <section class="share" aria-labelledby="share-h">
      <h3 id="share-h" class="t-h3">
        {L.title}
      </h3>
      <p class="ctl-hint mt-1">{L.lead}</p>

      <label class="ctl mt-4">
        <span class="ctl-label">{L.nick}</span>
        <input
          class="field share-nick"
          value={nick}
          placeholder={defaultNick}
          maxLength={12}
          autocomplete="nickname"
          spellcheck={false}
          aria-describedby="nick-hint"
          onInput={(e) => {
            const v = clampNick((e.currentTarget as HTMLInputElement).value);
            setNick(v);
            saveNick(v);
          }}
        />
        <span id="nick-hint" class="ctl-hint">
          {L.nickHint}
        </span>
      </label>

      <p class="share-url font-mono" {...noTranslate} data-share-url={url}>
        {url}
      </p>

      <div class="share-actions">
        <button type="button" class="btn btn-primary" onClick={() => void copy(url, L.copied)}>
          {L.copy}
        </button>
        {canShare && (
          <button
            type="button"
            class="btn btn-secondary"
            onClick={() =>
              void navigator.share({ title: `uuidea · ${game.name}`, text, url }).catch(() => {})
            }
          >
            {L.native}
          </button>
        )}
        <button
          type="button"
          class="btn btn-ghost"
          aria-expanded={showQr}
          onClick={() => setShowQr((s) => !s)}
        >
          {showQr ? L.qrHide : L.qr}
        </button>
      </div>
      {showQr && (
        <div class="share-qr">
          <Qr text={url} />
        </div>
      )}
    </section>
  );
}
