# uuidea.de – Plan

## Architektur

- **Astro 7, `output: 'static'`**, kein Adapter, kein SSR. Jede Route ist eine echte
  HTML-Datei in `dist/`. Spiel-UUID per `?id=`, Ergebnis per `#r=`.
- **Tailwind CSS 4** über `@tailwindcss/vite`, Tokens aus DESIGN.md in `@theme`.
- **Islands:** Preact (≈4 KB) für zustandsreiche UI (Tools, Game-Shell, Spiele),
  Vanilla TS für Kleinkram (Hero-UUID, Copy-Buttons, Nav). `client:visible` /
  `client:load` gezielt.
- **Kernlogik als reines TS ohne DOM** in `src/lib/` → mit Vitest testbar und von
  UI und Spielen gleichermaßen nutzbar.
- **Fonts** via `@fontsource-variable/*`, also im Build gebündelt und selbst gehostet.
- **i18n-fähig:** Alle UI-Texte in `src/i18n/de.ts` (typisiertes Wörterbuch),
  Zugriff über `t()`. Später kommt `en.ts` plus ein `/en/`-Präfix dazu.
- **Kein Tracking, keine Drittanbieter-Requests.** Eine strikte CSP in `public/_headers`.

### Seed & Share (Kurzform, die volle Spezifikation steht später in der README)

- `uuid → 16 Bytes → cyrb128 → 4×u32 → sfc32`. Ein `Rng`-Interface (`next()`,
  `int(a,b)`, `pick`, `shuffle`) ist die _einzige_ Zufallsquelle in Spielen. Eine
  ESLint-Regel verbietet `Math.random` in `src/games/**` und `src/lib/seed/**`.
- Pro Spiel wird ein Sub-Stream abgeleitet: `cyrb128(uuid + ':' + gameId + ':' + stream)`.
  So verschiebt eine Änderung in einem Teil nicht alle anderen Werte.
- Varianten/Schwierigkeit kommen aus dem Seed (nicht aus Roh-Bits), damit auch
  v7- und v1-UUIDs mit wenig Entropie in den ersten Bytes gut streuen.
- Ergebnis-Hash `#r=<base64url>`: `[formatVersion u8][gameId u8][Felder varint…][Kürzel UTF-8 ≤ 12 B][CRC-16]`.
  Die Runden-UUID steckt im Hash nicht noch einmal (sie steht in `?id=`), wird
  aber in die CRC einbezogen. Ein Link mit vertauschter ID fällt dadurch auf.
- `ResultStore`-Interface (`localStorage`-Implementierung in v1). Eine spätere
  `RemoteLeaderboard`-Implementierung (Workers + D1) kann sich daneben einhängen,
  ohne dass die Spiele umgebaut werden müssen.

## Ordnerstruktur

```
src/
  components/        Astro-Komponenten (Layout-Teile, UuidDisplay, Tile, Button …)
  islands/           Preact-Islands (tools/*, GameHost)
  games/
    registry.ts      Liste aller Spiele (id, slug, Meta, Score-Schema, load())
    shell/           GameShell, Timer, ResultCard, Compare, Share, Seed-Picker
    reaction/        ein Spiel = ein Ordner: logic.ts (rein), Game.tsx (UI), meta.ts
    memory/ sort/ sequence/ hexcolor/
  lib/
    uuid/            v1 v4 v5 v6 v7 nil max, parse/validate/decode, Formate, ULID, NanoID
    seed/            cyrb128, sfc32, Rng, deriveStream
    share/           Codec (varint, base64url, crc16), Challenge-Parsing
    store/           ResultStore (localStorage), Export/Import
    session.ts       Session-UUID (pro Seitenaufruf, in sessionStorage)
  i18n/              de.ts, t()
  layouts/           BaseLayout.astro
  pages/             index, tools, games/index, games/<slug>, about, impressum,
                     datenschutz, 404
  styles/global.css  Tailwind + Tokens
public/              _headers, _redirects, robots.txt, favicon, manifest, og/*.png
tests/unit/          Vitest
tests/e2e/           Playwright (Mobile-Viewport)
scripts/             og-image-Generator, Screenshot-Helfer
```

## Session-UUID

Beim Laden und bei jedem Refresh wird eine neue v4-UUID erzeugt und in
`sessionStorage` abgelegt. So können die Spiele sie als Spieler-ID
weiterverwenden, solange der Tab offen ist. Jeder Reload auf `/` erzeugt eine
neue. Unterseiten lesen die vorhandene UUID und erzeugen nur dann eine, wenn
noch keine existiert.

## Meilensteine

|        | Inhalt                                                                                                                                                                                                                                                   | Abnahme                                                   |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| ✅ **M1** | Setup (Astro/TS/Tailwind/ESLint/Prettier/Vitest/Playwright), Git, `.nvmrc`, `_headers`, `_redirects`, Fonts, Tokens, BaseLayout, Top-/Bottom-Nav, Footer, Homepage mit Session-UUID (Decrypt, Copy, Neu), Platzhalter für Impressum, Datenschutz und 404 | deploybar                                                 |
| ✅ **M2** | `/tools`: Generator (v1/v4/v5/v6/v7/nil/max, Bulk 1000, Formate, Download), Validator/Decoder, Konverter, ULID/NanoID                                                                                                                                    | Unit-Tests der Generatoren (RFC-9562-Testvektoren)        |
| **M3** | Seed-System, Share-Codec, ResultStore, Game-Shell, `/games`-Übersicht, Reaktionstest End-to-End inkl. Herausforderung und Vergleich                                                                                                                      | Determinismus- und Codec-Tests, E2E für das Reproduzieren |
| **M4** | Memory, Sortieren, Sequenz, Hex-Farben                                                                                                                                                                                                                   | pro Spiel ein Determinismus-Test                          |
| **M5** | Polish, About, 404, OG-Bilder, Sitemap, Manifest/PWA (optional), Lighthouse ≥ 95, README mit Deployment-Anleitung                                                                                                                                        | Lighthouse-Lauf, finaler Screenshot-Satz                  |

Nach jedem Meilenstein: `npm run build && npm run lint && npm test`, Screenshots
bei 375/768/1280px (Playwright-Skript), dann ein Commit.

## Bewusste Abweichungen und Entscheidungen

- **Preact statt Vanilla für die Spiele:** Fünf Spiele mit gemeinsamer Shell sind
  mit einer Komponenten-Library deutlich wartbarer. Preact kostet nur ≈4 KB
  gzip und wird nur auf Tool- und Spielseiten geladen.
- **QR-Code:** ein eigener, kleiner Encoder (`qrcode-generator`, ≈ 6 KB, MIT),
  der erst beim Öffnen des Share-Dialogs nachgeladen wird.
- **Kürzel des Herausforderers:** optionaler Spitzname (≤ 12 Zeichen,
  `localStorage`). Fallback sind die ersten 4 Zeichen der Session-UUID.
