# uuidea.de – Design System

> Verbindliche Gestaltungsregeln. Jede UI-Arbeit hält sich daran. Tokens leben in
> `src/styles/global.css` (`@theme`), dieses Dokument ist die Begründung dazu.

## 1. Richtung

**Referenzen:** Linear (Struktur) + x.ai (Atmosphäre).

- **Von Linear:** fast schwarzer, blaustichiger Canvas; Tiefe über eine Surface-Leiter
  und 1px-Hairlines statt Drop-Shadows; _ein_ Akzent, knapp eingesetzt; enge,
  negative Laufweite in Headlines; ruhige, dichte Präzision.
- **Von x.ai:** Mono-Eyebrows in Versalien mit weitem Tracking als „technische
  Beschriftung“; ein einziges atmosphärisches Glühen pro Viewport.
- **Eigenes Motiv – „Segment-Spektrum“:** Eine UUID besteht aus 5 Gruppen
  (8-4-4-4-12). Jede Gruppe bekommt einen eigenen Ton aus einem kühlen→warmen
  Spektrum (Sky → Aqua → Mint → Gold → Coral, bewusst ohne Violett). Dieses Spektrum ist _das_
  wiederkehrende Gestaltungselement: in UUIDs, als Hairline-Verlauf unter dem
  Header, im Glow hinter dem Hero, in Spiel-Akzenten. Sonst bleibt die Seite
  monochrom.

**Charakter:** präzise, still, ein bisschen verspielt. Wie ein gut beschriftetes
Laborgerät, das einem zuzwinkert.

## 2. Farben

### Surfaces (dunkel, blaustichig)

| Token             | Wert      | Verwendung                                |
| ----------------- | --------- | ----------------------------------------- |
| `canvas`          | `#07080C` | Seitenhintergrund (nie reines Schwarz)    |
| `surface-1`       | `#0D0F15` | Karten, Panels                            |
| `surface-2`       | `#12151D` | Gehobene Karten, Inputs, Hover/Active     |
| `surface-3`       | `#181C26` | Popover, Toasts, gedrückte Zustände       |
| `hairline`        | `#222733` | Standard-Border 1px                       |
| `hairline-strong` | `#2E3442` | Inputs, Trenner mit Gewicht, Hover-Border |

### Text

| Token        | Wert      | Kontrast auf `canvas` | Verwendung                                                                          |
| ------------ | --------- | --------------------- | ----------------------------------------------------------------------------------- |
| `ink`        | `#F2F4F8` | 18.2 : 1              | Headlines, wichtiger Text                                                           |
| `ink-muted`  | `#B8BFCC` | 10.8 : 1              | Fließtext                                                                           |
| `ink-subtle` | `#8A93A3` | 6.4 : 1               | nur Labels, Eyebrows, Captions – Fließtext immer `ink-muted` (Taste-Ziel ≥ 7 : 1)   |
| `ink-faint`  | `#5B6373` | 3.3 : 1               | **nur dekorativ** (Hintergrund-UUIDs, Platzhalter-Glyphen), nie für lesbaren Inhalt |

### Akzente

| Token                  | Wert            | Rolle                                                                               |
| ---------------------- | --------------- | ----------------------------------------------------------------------------------- |
| `accent` (Hauptakzent) | `#5CE1E6` Aqua  | Primär-CTA, Fokus-Ring, Links, aktive Navigation                                    |
| `accent-hover`         | `#8AEDF0`       | Hover/Pressed-Aufhellung                                                            |
| `on-accent`            | `#041417`       | Text auf Aqua (12.0 : 1)                                                            |
| `accent-2` (Sekundär)  | `#FF8F70` Coral | Herausforderungen, Bestleistungen, „Gegner“-Seite im Vergleich, sparsame Highlights |
| `on-accent-2`          | `#1A0904`       | Text auf Coral (8.7 : 1)                                                            |

Regel: Pro Viewport höchstens **ein** gefüllter Aqua-Button. Coral nie als
Flächenfarbe für große Bereiche, nur für Badges, Zahlen, Linien.

### Segment-Spektrum (Signature)

| Segment                    | Token   | Wert            |
| -------------------------- | ------- | --------------- |
| 1 (8 Zeichen, time_low)    | `seg-1` | `#7AB8FF` Sky   |
| 2 (4, time_mid)            | `seg-2` | `#5CE1E6` Aqua  |
| 3 (4, version + time_hi)   | `seg-3` | `#74E0A8` Mint  |
| 4 (4, variant + clock_seq) | `seg-4` | `#F2C46D` Gold  |
| 5 (12, node)               | `seg-5` | `#FF8F70` Coral |

Alle Segmentfarben haben ≥ 8.9 : 1 auf `canvas` und ≥ 7.6 : 1 auf `surface-3` (nachgerechnet).
Kein Violett/Lavendel im Seitendesign (Taste-Skill-Regel).
Bindestriche werden in `ink-subtle` gesetzt. Für Fließtext-UUIDs (klein, z. B.
in Listen) darf die Färbung entfallen (`plain`-Variante). Dann gilt `ink-muted`.

Das Spektrum als Verlauf: `linear-gradient(90deg, seg-1, seg-2, seg-3, seg-4, seg-5)`.

### Semantik

| Token     | Wert      | Verwendung          |
| --------- | --------- | ------------------- |
| `success` | `#4ADE9A` | gültig, geschafft   |
| `warning` | `#FFC857` | Frühstart, Hinweise |
| `danger`  | `#FF6B7A` | ungültig, Fehler    |

Semantische Farben erscheinen immer mit Icon oder Text, nie allein (Farbenblindheit).

## 3. Typografie

Alle Fonts selbst gehostet (via `@fontsource`, im Build gebündelt, kein Drittserver).

| Rolle                          | Familie                     | Hinweis                                                                           |
| ------------------------------ | --------------------------- | --------------------------------------------------------------------------------- |
| Sans (Display + Text)          | **Geist Variable**          | 400 / 500 / 600                                                                   |
| Mono (UUIDs, Zahlen, Eyebrows) | **JetBrains Mono Variable** | geschlossene, eindeutige Glyphen: `0` vs `O`, `1` vs `l`                          |
| Serif-Akzent                   | **Instrument Serif Italic** | genau _ein_ emotionaler Satz pro Seite (z. B. „Es gibt sie nur dieses eine Mal.“) |

### Skala (mobile → ≥768px)

| Token       | Mobile                                | Desktop | Gewicht             | Zeilenhöhe | Tracking |
| ----------- | ------------------------------------- | ------- | ------------------- | ---------- | -------- |
| `display`   | 40px                                  | 72px    | 600                 | 1.05       | -0.035em |
| `h1`        | 32px                                  | 48px    | 600                 | 1.1        | -0.03em  |
| `h2`        | 24px                                  | 32px    | 600                 | 1.2        | -0.02em  |
| `h3`        | 18px                                  | 20px    | 500                 | 1.3        | -0.01em  |
| `body-lg`   | 17px                                  | 18px    | 400                 | 1.6        | 0        |
| `body`      | 16px                                  | 16px    | 400                 | 1.6        | 0        |
| `small`     | 14px                                  | 14px    | 400                 | 1.5        | 0        |
| `eyebrow`   | 12px                                  | 12px    | 500 Mono, VERSALIEN | 1.4        | +0.14em  |
| `uuid-hero` | fluid `clamp(1.05rem, 4.6vw, 2.6rem)` |         | 500 Mono            | 1.25       | -0.01em  |
| `uuid`      | 15px                                  | 16px    | 450 Mono            | 1.5        | 0        |

Regeln:

- Zahlen in Scores/Timern: Mono + `font-variant-numeric: tabular-nums`.
- Fließtext max. 68ch breit.
- Headlines nie über 600 Gewicht.
- Der Hero-UUID muss bei 360px Breite in **eine** Zeile passen (36 Zeichen). Daher
  die fluide Größe. Darunter umbrechen nur an Bindestrichen.

## 4. Spacing

4px-Basis. Tokens (Tailwind-Standard-Skala wird genutzt, diese Stufen sind erlaubt):

`1`=4 · `2`=8 · `3`=12 · `4`=16 · `6`=24 · `8`=32 · `12`=48 · `16`=64 · `24`=96 · `32`=128

- Seiten-Gutter: 16px mobil (+ `env(safe-area-inset-*)`), 24px ab 768px, 32px ab 1280px.
- `.wrap`: `min(100% − 2 × Gutter, 1280px)`; Gutter 24px (mobil) · 48px (≥ 1024) · 80px (≥ 1280). Leseinhalte max. 68ch.
- 12-Spalten-Raster mit 24px Gap; Splits immer 7/5 auf derselben Linie.
- Sektionsabstand: 64px mobil, 96px Desktop.
- Karteninnenabstand: 20px mobil, 24px Desktop.

## 5. Radien

| Token    | Wert   | Verwendung                        |
| -------- | ------ | --------------------------------- |
| `r-sm`   | 6px    | Chips, Keycaps, kleine Tags       |
| `r-md`   | 10px   | Buttons, Inputs, Segment-Controls |
| `r-lg`   | 16px   | Karten, Panels                    |
| `r-xl`   | 24px   | Hero-Panel, Spielfläche           |
| `r-full` | 9999px | Pills, Status-Badges, Avatare     |

Buttons sind **nicht** pillenförmig (Linear-Prinzip), nur Badges/Chips.

## 6. Tiefe, Glows, Verläufe

Tiefe entsteht über **Surface-Leiter + Hairline**, nicht über schwarze Schatten.

| Stufe | Behandlung                                                                                                            |
| ----- | --------------------------------------------------------------------------------------------------------------------- |
| 0     | flach auf `canvas`                                                                                                    |
| 1     | `surface-1` + 1px `hairline` + 1px Innenlicht oben (`inset 0 1px 0 rgb(255 255 255 / .04)`)                           |
| 2     | `surface-2` + `hairline-strong` (Hover/aktiv)                                                                         |
| Glow  | `0 0 0 1px rgb(92 225 230 / .25), 0 8px 40px -8px rgb(92 225 230 / .35)` – nur Primär-CTA (Hover) & aktives Spielfeld |

Atmosphäre:

- **Hero-Aura:** vorgerendertes WebP (`public/aura.webp`, 5 KB, `scripts/gen-assets.mjs`) als
  `<img>`-Hintergrundebene des Heros, unterhalb des Headers; atmet nur über die Deckkraft.
- **Spektrum-Hairline:** 1px Verlauf unter dem Header (Opacity 0.5).
- **Hintergrund-UUIDs:** die Session-UUID als riesige Mono-Glyphen in `ink-faint`
  bei Opacity ≤ 0.05 im Footer. Rein dekorativ, `aria-hidden`.

## 7. Motion

- **Dauer:** 120ms (Micro: Press, Toggle) · 200ms (Standard: Hover, Fade) ·
  360ms (Enter: Panels, Ergebnis) · 900–1400ms nur für die Hero-UUID-Entschlüsselung.
- **Easing:** `--ease-out: cubic-bezier(.22,1,.36,1)` für Eintritte,
  `--ease-in-out: cubic-bezier(.65,0,.35,1)` für Zustandswechsel.
- **Signature-Animation „Decrypt“:** Die UUID erscheint Zeichen für Zeichen von
  links, jedes Zeichen flackert 2–4 Mal durch zufällige Hex-Glyphen, bevor es
  einrastet. Gestaffelt pro Segment. Layout bleibt stabil (feste Breite, Mono).
- **Press:** `scale(.97)` + Surface-Stufe hoch. Kein Hover-only-Feedback.
- **Copy-Feedback:** Icon morpht zu Haken, Label „Kopiert“ für 1.6s, plus
  `aria-live`-Ansage.
- Nur `transform` und `opacity` animieren.
- **`prefers-reduced-motion: reduce`:** Decrypt entfällt (UUID erscheint sofort,
  kurzer Fade 120ms), Aura statisch, keine Skalierungen; Spiel-Animationen werden
  zu Farb-/Opacity-Wechseln.

## 8. Komponenten-Regeln

### UuidDisplay (Signature)

- Mono, Segmentfarben `seg-1…5`, Bindestriche `ink-faint`.
- **Anatomie-Leiste** (Hero): unter jedem Segment ein 2px-Balken in Segmentfarbe, exakt in `ch` ausgerichtet; ab 640px mit Feldnamen (TIME_LOW · TIME_MID · VER·HI · VAR·SEQ · NODE).
- Große UUIDs (`.uuid-xl`) skalieren mit der verfügbaren Breite und bleiben immer einzeilig.
- Varianten: `hero` (groß, Decrypt), `default`, `plain` (ungefärbt), `compact`
  (nur erste 8 Zeichen + „…“).
- Immer selektierbar (`user-select: all` bei Klick auf `hero`), `translate="no"`,
  `spellcheck="false"`.
- Screenreader: die UUID als Ganzes in `aria-label`, damit sie nicht Segment für
  Segment zerstückelt vorgelesen wird.

### Buttons

| Variante    | Look                                                           |
| ----------- | -------------------------------------------------------------- |
| `primary`   | `accent`-Fläche, `on-accent`-Text, 500, `r-md`, Glow bei Hover |
| `secondary` | `surface-2`, `ink`, 1px `hairline-strong`                      |
| `ghost`     | transparent, `ink-muted` → `ink`                               |
| `icon`      | 44×44, `r-md`, `ghost`-Stil, immer mit `aria-label`            |

- Mindesthöhe **44px** (mobil 48px für Primär-CTAs).
- Label 15px/500. Icon 18px, Abstand 8px.
- Disabled: Opacity .45, `cursor: not-allowed`, kein Glow.

### Focus

- Global `:focus-visible`: 2px `accent`-Outline, 2px Offset, `r-md`. Nie entfernen.

### Karten / Tiles

- `surface-1`, `hairline`, `r-lg`, Innenlicht oben.
- Interaktive Tiles: ganze Karte ist der Link; bei Hover/Focus Border →
  `hairline-strong` und eine 1px-Spektrum-Linie oben blendet ein.
- Jede Tile hat ein Mono-Eyebrow (z. B. `TOOL / 01`) und einen kleinen
  generativen Glyph.

### Inputs

- `surface-2`, 1px `hairline-strong`, `r-md`, Höhe 48px, 16px Schrift (verhindert
  iOS-Zoom). Fokus: Border `accent` + Fokus-Ring.
- UUID-Inputs in Mono. Fehler: Border `danger` + Text darunter mit Icon.

### Segment-Control / Tabs

- Container `surface-1` + `hairline`, `r-md`, Padding 4px; aktive Option
  `surface-3` + `ink`. Horizontal scrollbar **nur innerhalb** des Controls, nie die
  Seite.

### Badges

- `r-full`, 12px Mono-Versalien, `surface-2`. Varianten: `accent` (Aqua-Text auf
  Aqua 12 %), `accent-2` (Coral), `success`/`danger`.

### Toast

- unten mittig über der Bottom-Bar, `surface-3`, `hairline-strong`, 360ms Enter,
  `role="status"`.

### Navigation

- **Mobil (< 768px):** fixierte **Bottom-Bar** mit 4 Zielen (Start, Tools,
  Spiele, Über), Icon + Label, je ≥ 56px hoch, `padding-bottom:
env(safe-area-inset-bottom)`, `surface-1` mit 80 % Deckkraft + Backdrop-Blur,
  Hairline oben. Aktiver Punkt: Aqua-Icon + kleiner Spektrum-Strich.
- **Desktop:** Top-Bar 64px, Wordmark links, Links rechts, Spektrum-Hairline unten.
- Skip-Link „Zum Inhalt springen“ als erstes fokussierbares Element.

### Game-Shell

- Spielfläche `surface-1`, `r-xl`, max. 560px breit, zentriert.
- Kopfzeile: Spielname, Runden-UUID (`compact`, antippbar → voll), Timer (Mono).
- Ergebniskarte: großer Score in Mono, darunter Kennzahlen als 2–3-Spalten-Raster;
  Herausforderer-Werte in Coral, eigene in Aqua.

## 9. Barrierefreiheit (verbindlich)

- WCAG AA: Text ≥ 4.5 : 1, große Schrift/UI ≥ 3 : 1. `ink-faint` nie für Inhalt.
- Alles per Tastatur bedienbar, sichtbarer Fokus, logische Reihenfolge.
- Touch-Targets ≥ 44×44px, Abstand ≥ 8px.
- Nichts hängt von Hover ab.
- `aria-live="polite"` für Copy, Ergebnisse, Spielstatus.
- Sprache `lang="de"`; UUIDs mit `translate="no"`.

## 10. Copy-Ton

Du-Form, knapp, warm, mit einem Augenzwinkern. Keine Marketing-Floskeln.
Technische Begriffe korrekt (Version, Variante, Namespace), aber erklärt.
Beispiel: „Das ist deine Session-UUID. Es gibt sie nur dieses eine Mal.“

## 11. Taste-Skill (Hybrid)

Der installierte Taste Skill (`design-taste-frontend`) bestimmt die **Showcase-Seiten**
(Home, Spiele-Übersicht, About). Tool- und Spielseiten sind App-UI und folgen nur seinen
Qualitäts-Checks (Kontrast, Fokus, Tap-Größen, Kanten).

- Kind `software`; `<html data-type="software">` und die Metas `page-type`/`site-kind` im Layout.
- Header `header.nav` ist fixiert. Showcase-Sektionen sind `.screen` = genau `--h × 100svh`
  (mobil mindestens `100lvh`); der Hero füllt den ersten Bildschirm allein.
- Close und Footer sind zusammen ein Bildschirm (`footer.closing`, Prop `showcase` am Layout).
- Hero-Entrance über `data-enter` + `html.m-enter` (ohne JS steht alles sofort).
- Ein gedealter Moment pro Seite (Home: `letters-assemble`), unverändert aus dem Kit in
  `public/assets/moments/` (nie editieren, nicht formatieren).
- Visuals und Mocks tragen `data-ui`; Überschriften nennen Dinge, Buttons = Verb + Objekt,
  höchstens ein Eyebrow pro Bereich.
- Prüfen mit `consistency.mjs` auf dem Build in `dist/` (Befehl in der README) – Ziel: 0 FAIL.
