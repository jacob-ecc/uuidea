# uuidea.de – Design System (v2, „Präzisionsinstrument“)

> Verbindliche Gestaltungsregeln. Tokens leben in `src/styles/global.css` (`@theme`),
> dieses Dokument ist die Begründung dazu. v2 ersetzt das erste System komplett
> (Redesign vom 09.11.2026); das Logo (fünf Segment-Balken) bleibt.

## 1. Richtung

**Referenzen:** x.ai (leichte, große Display-Type, Mono-Labels wie Code-Kommentare),
Linear (Surface-Leiter, Hairlines, knapper Akzent), OpenCode (Manpage-Präzision).
Ausgewählt über den Taste Skill (Deal, nicht Geschmack):

| Deal                 | Ergebnis                                                                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| kind                 | `software`                                                                                                                          |
| Hero                 | `collage` – Text links (5 Spalten), Produktfenster rechts (6 Spalten), vom Rahmen angeschnitten, eine kleine Ergebnis-Karte darüber |
| Palette              | `blue-black-cornflower` – fast schwarzer, blaustichiger Grund, Kornblumen-Akzent (= Sky aus dem Logo)                               |
| Type                 | `instrument` – Instrument Sans + DM Mono (selbst gehostet, nicht von Google)                                                        |
| Radius               | `sharp` (Dev-Tool) – Buttons als Pill                                                                                               |
| Nav / Footer / Close | `nav-centre` · `footer-dark` · `close-type`                                                                                         |
| Rhythmus             | `dark-band` – eine Sektion auf einem leicht helleren Band                                                                           |
| Momente              | `counter-rolls` (Statement), `marquee-row` (Formate)                                                                                |

**Charakter:** ein Messinstrument für UUIDs. Die Seite zeigt das echte Ding – den
Inspector mit Live-UUID und allen 128 Bits – statt darüber zu reden.

## 2. Farben

### Surfaces

| Token             | Wert      | Verwendung                                       |
| ----------------- | --------- | ------------------------------------------------ |
| `canvas`          | `#0A0D14` | Seitenhintergrund                                |
| `band`            | `#0E121C` | dunkles Band (Tools-Sektion)                     |
| `surface-1`       | `#131824` | Karten, Panels                                   |
| `surface-2`       | `#1A2030` | aktive Elemente, schwebende Karte                |
| `surface-3`       | `#212839` | gedrückte Zustände                               |
| `hairline`        | `#222A3A` | Standard-Border 1px                              |
| `hairline-strong` | `#313A4E` | Inputs, Buttons (secondary), Trenner mit Gewicht |
| Footer            | `#070910` | `footer-dark`                                    |

### Text (Kontrast auf `canvas`, nachgerechnet)

| Token        | Wert      | Kontrast | Verwendung                         |
| ------------ | --------- | -------- | ---------------------------------- |
| `ink`        | `#E9EDF3` | 16.5 : 1 | Headlines, Werte                   |
| `ink-muted`  | `#A3ABB9` | 8.4 : 1  | **Fließtext** (Taste-Ziel ≥ 7 : 1) |
| `ink-subtle` | `#8891A1` | 6.1 : 1  | nur Labels, Eyebrows, Captions     |
| `ink-faint`  | `#4B5468` | –        | nur dekorativ                      |

### Akzente

| Token       | Wert                | Rolle                                           |
| ----------- | ------------------- | ----------------------------------------------- |
| `accent`    | `#5AB9FC` Kornblume | Primär-Button, Fokus, aktive Elemente (9.1 : 1) |
| `on-accent` | `#0A0D14`           | Text auf Akzent (9.1 : 1)                       |
| `accent-2`  | `#FF8F70` Coral     | Herausforderungen, „Gegner“-Werte               |

### Segment-Spektrum (Signature + Logo)

`seg-1` `#5AB9FC` Sky · `seg-2` `#5CE1E6` Aqua · `seg-3` `#74E0A8` Mint ·
`seg-4` `#F2C46D` Gold · `seg-5` `#FF8F70` Coral – alle ≥ 7 : 1 auf `surface-2`.
Kein Violett. Bindestriche in `ink-subtle`.

Semantik: `success #4ADE9A`, `warning #FFC857`, `danger #FF6B7A` – nie ohne Icon/Text.

## 3. Typografie

| Rolle                       | Familie                                                         |
| --------------------------- | --------------------------------------------------------------- |
| Sans (Display + Text)       | **Instrument Sans Variable** (wdth 96 %), Display 500, Text 400 |
| Mono (UUIDs, Werte, Labels) | **DM Mono** 400/500                                             |

| Token             | Größe                | Gewicht | Zeilenhöhe | Tracking |
| ----------------- | -------------------- | ------- | ---------- | -------- |
| `t-display` (h1)  | clamp 40 → 64px      | 500     | 1.02       | −0.036em |
| Statement / Close | bis 128 / 88px       | 500     | 0.98–1.0   | −0.045em |
| `t-h2`            | clamp 28 → 44px      | 500     | 1.08       | −0.028em |
| `t-h3`            | 18px                 | 500     | 1.3        | −0.012em |
| `t-lead`          | 17 → 20px            | 400     | 1.5        | 0        |
| body              | 16px                 | 400     | 1.6        | 0        |
| `eyebrow`         | 12px Mono, VERSALIEN | 400     | 1.4        | +0.12em  |

Regeln: Headlines nie über 500. h1 höchstens 3 Zeilen (Desktop). Kennzahlen nie größer als
die h2. Große UUIDs füllen ihren Container exakt (`font-size = Breite / 21,6`, da 36 Zeichen
à 0,6em), immer einzeilig. „Session‑UUID“ mit geschütztem Bindestrich.

## 4. Raster & Spacing

- `.wrap` = `min(100% − 2 × --gut, 1280px)`; `--gut` 24 → 48 (≥ 1024) → 80px (≥ 1280).
- 12 Spalten, `--gutter` 24px (12px unter 640). Splits: Text 5 Spalten, Visual ab Spalte 7.
- Showcase-Sektionen `.screen`: ab 1024px genau `--h × 100svh`; darunter wachsen sie mit
  dem Inhalt (mind. `--hm × 100lvh`).
- 4px-Basis; Karteninnenabstand 16–24px.

## 5. Radien

`sm 4` · `md 6` · `lg 10` · `xl 14` · Buttons, Chips, Tabs: Pill (`9999px`).

## 6. Tiefe

Surface-Leiter + 1px Hairlines. Schatten nur für schwebende Ebenen (Inspector-Fenster,
Validator-Karte), weich und dunkel. Der Hero-Rahmen trägt als „lit ground“ das vorgerenderte
Verlaufsbild `public/aura.webp` (5 KB). Keine Grain-Ebene, keine weiteren Verläufe.

## 7. Motion

- 160–200ms für Hover/Press, 640ms für die Hero-Entrance (`data-enter` + `html.m-enter`).
- Buttons heben sich beim Hover 1px, drücken auf `scale(.97)`; verlinkte Karten heben sich 2px.
- **Decrypt** der Session-UUID im Inspector; die Bit-Matrix blendet ihre Bits um.
- **Validator-Loop:** fertig → 1,2 s halten → Schritte 0,5 s versetzt (Zyklus ≈ 3,5 s),
  Pause-Knopf, Neustart beim Überfahren.
- Momente aus dem Kit (`public/assets/moments/`, unverändert): `counter-rolls`, `marquee-row`.
- `prefers-reduced-motion`: alles steht in seinem Endzustand.

## 8. Komponenten

- **UUID-Darstellung:** Mono, Segmentfarben, `translate="no"`, `aria-label` mit der ganzen UUID.
- **Buttons:** `primary` (Akzent-Pill), `secondary` (Outline-Pill), `ghost`; Höhe ≥ 44px
  (CTAs 48px). Genau ein primärer Button pro Bildschirm.
- **Karten:** `surface-1`, Hairline, `r-lg`. Tool-Karten: oben ein UI-Fragment auf `canvas`
  (`data-ui`), unten Titel + Satz, Pfeil wandert beim Hover.
- **Inspector-Fenster:** Titelleiste mit Punkten, Seitenleiste (nur Desktop), Hauptbereich
  mit UUID, Anatomie-Balken, 32×4-Bit-Matrix (Version- und Varianten-Nibble umrandet) und
  Wertezeilen; rechts und unten vom Rahmen angeschnitten.
- **Chips/Badges:** Pill, 12px Mono; Varianten `accent`, `ok`, `accent-2`.
- **Navigation:** Desktop „nav-centre“ (Wordmark links, Links mittig, Outline-Pill rechts);
  mobil Bottom-Bar mit Safe-Area.
- **Footer:** Schluss-Bildschirm aus Close (große Type + zwei Buttons) und dunklem Footer
  mit der Session-UUID als Geisterschrift.

## 9. Barrierefreiheit (verbindlich)

WCAG AA (Fließtext ≥ 7 : 1), Tastaturbedienung, sichtbarer Fokus (2px Akzent), Touch-Targets
≥ 44px, nichts hängt von Hover ab, `aria-live` für Copy und neue UUID, `lang="de"`.

## 10. Copy-Ton

Du-Form, knapp, warm, präzise. Überschriften nennen Dinge, Buttons sind Verb + Objekt.

## 11. Taste Skill (Hybrid)

Showcase-Seiten (Home, Spiele-Übersicht, About) folgen dem Skill; Tool- und Spielseiten sind
App-UI und folgen nur seinen Qualitäts-Checks. Prüfen: siehe README (`gate.mjs`, Ziel PASS).
Freigestellt (`.taste-skill/waivers.json`): `row-lines` für den `marquee-row`-Moment – die Zeile
blendet an den Rändern bewusst aus.

**`/games` (eigener Deal, 10.11.2026):** Hero `triptych` (Headline · Collage aus drei Sets des Reaktionstests,
Wechsel alle 2,8 s mit Pause-Knopf · Button), Moment `iris-opens` im Abschnitt „Runde“ (vom canvas auf das
Band). Spielseiten (`/games/<slug>`) sind App-UI wie `/tools` (`src/styles/games.css`).
