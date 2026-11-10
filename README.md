# uuidea.de

UUID-Tools und kleine Spiele, deren Runden komplett aus einer UUID entstehen.
Rein statisch (Astro), Dark Theme, kein Tracking, alles läuft lokal im Browser.

> Status: **M4** – Homepage, UUID-Tools und alle fünf Spiele (Reaktion, Memory, Sortieren, Sequenz, Hex-Farben) mit Seed-System, Share-Links und lokalem Verlauf.
> Die vollständige Doku (Architektur, Seed-/Share-Format, Deployment) wächst mit den Meilensteinen.

## Lokal starten

```bash
nvm use            # Node-Version aus .nvmrc (24 LTS)
npm install
npm run dev        # http://localhost:4321
```

| Befehl                        | Zweck                                                                 |
| ----------------------------- | --------------------------------------------------------------------- |
| `npm run build`               | `astro check` + statischer Build nach `dist/`                         |
| `npm run preview`             | gebauten Stand lokal ausliefern                                       |
| `npm run lint`                | ESLint + Prettier-Check                                               |
| `npm test`                    | Unit-Tests (Vitest)                                                   |
| `npm run test:e2e`            | E2E-Smoke-Tests (Playwright, Mobile-Viewport, braucht vorher `build`) |
| `npm run shots -- "" tools`   | Screenshots bei 375/768/1280 px (Preview muss laufen)                 |
| `node scripts/gen-assets.mjs` | Icons, favicon.ico und OG-Bilder neu erzeugen                         |

Gestaltungsregeln: [DESIGN.md](DESIGN.md) · Plan & Meilensteine: [PLAN.md](PLAN.md)

## Deployment (Kurzfassung, Details folgen in M5)

Cloudflare Pages → _Connect to Git_ → Repo wählen.
Framework-Preset **Astro**, Build-Command `npm run build`, Output `dist`,
Umgebungsvariable `NODE_VERSION=24`. Weitere Variablen oder Secrets braucht das Projekt nicht.

## Design-Prüfung (Taste Skill)

Die Showcase-Seiten folgen dem Taste Skill im Hybrid-Modus (siehe [DESIGN.md §11](DESIGN.md)).
Prüfen gegen den Build:

```bash
npm run build
node ~/.claude/skills/design-taste-frontend/scripts/consistency.mjs dist/index.html --root dist \
  --quick --widths 1440,390 --profile .taste-skill/chrome-check --page software \
  --category "UUID-Tools und Spiele" --primary "UUID kopieren"
```

## UUID-Tools (`/tools`)

Alles läuft lokal; die Logik liegt als reines TypeScript in `src/lib/uuid/` und ist mit Vitest getestet
(u. a. alle Beispiele aus RFC 9562, Anhang A).

| Modul         | Inhalt                                                                                                                                                                                                                                                                           |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `generate.ts` | v1, v4, v5 (SHA-1 via Web Crypto), v6, v7, Nil, Max. v7 nutzt einen 12-Bit-Zähler (RFC 9562, Methode 1), damit Bulk-Listen in derselben Millisekunde sortiert bleiben; v1/v6 erhöhen im Bulk die 100-ns-Zeit. Zufällige Knoten-IDs setzen das Multicast-Bit (keine MAC-Adresse). |
| `decode.ts`   | Erkennt Standard, ohne Bindestriche, `{…}`, `urn:uuid:`, Base64URL und Base58; liefert Version, Variante, eingebettete Zeit (v1/v6/v7), Clock-Sequenz und Knoten.                                                                                                                |
| `formats.ts`  | Ausgabeformate (Groß, ohne Bindestriche, Klammern, Base64URL, Base58, URN, Bytes).                                                                                                                                                                                               |
| `alt-ids.ts`  | ULID (Crockford Base32, bitgleich zu UUID umrechenbar) und Nano ID.                                                                                                                                                                                                              |

**Hinweis Base64URL vs. Base58:** Beide Kurzformen sind 22 Zeichen lang. Selten (≈ 0,1 %) ist ein
String in beiden Alphabeten gültig. Der Decoder wählt dann die Lesart, die eine plausible UUID ergibt
(Variante RFC 9562, Version 1–8), und zeigt die andere als Alternative an.

## UUID des Tages (Startseite)

Für alle gleich, wechselt um Mitternacht Berliner Zeit – ohne Server: `src/lib/uuid/daily.ts` rechnet
`v5(Namespace, "YYYY-MM-DD")` mit der festen Namespace-UUID `ad9c0a59-4242-5f10-a2a9-c02b313ae1af`
(= `v5(DNS, "uuidea.de")`). Nachrechenbar im Generator (v5, eigene Namespace-UUID, Name = Datum).
In den Spielen setzt „UUID des Tages“ im Seed-Picker die Tagesrunde.

## Spiele (`/games`)

Jede Runde entsteht komplett aus einer UUID. Gleiche UUID, gleiche Runde, auf jedem Gerät.

| Teil        | Ort                        | Inhalt                                                                                                                                                          |
| ----------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Seed        | `src/lib/seed/prng.ts`     | `cyrb128(uuid + ':' + spiel + ':' + zweck)` → 4 × u32 → `sfc32`. Der einzige Zufall in Spielen (ESLint verbietet `Math.random` und `crypto` in `src/games/**`). |
| Share-Codec | `src/lib/share/codec.ts`   | Ergebnis im Hash `#r=…` (siehe unten).                                                                                                                          |
| ResultStore | `src/lib/store/results.ts` | Verlauf in `localStorage` (`uuidea:results:v1`, max. 500), Export/Import als JSON. Interface für ein späteres Remote-Leaderboard.                               |
| Registry    | `src/games/registry.ts`    | Alle Spiele mit fester `id` (Byte im Share-Code – nie ändern).                                                                                                  |
| Shell       | `src/games/shell/`         | Runden-UUID wählen, Herausforderung aus dem Link, Ergebnis, Vergleich, Teilen (Link, Web Share, QR), Verlauf.                                                   |
| Spiel       | `src/games/<slug>/`        | `logic.ts` (rein, getestet), `meta.ts` (Wertung, Vergleich, Texte), `Game.tsx` (UI).                                                                            |

**Link-Format:** `/games/<slug>?id=<uuid>#r=<base64url>`. Der Code ist binär:

```
[Format u8 = 1][Spiel-ID u8][n varint][n × Feld varint][Kürzel-Länge u8][Kürzel UTF-8 ≤ 12 B][CRC-16 BE]
```

Varints sind ULEB128 (0 … 2³²−1). Die CRC (CRC-16/CCITT-FALSE) läuft über `UUID-Bytes ‖ Payload`.
Die UUID steht also nicht im Hash, ein Link mit vertauschter `?id=` fällt trotzdem als beschädigt auf.
Zusätzlich prüft jedes Spiel seine Felder auf Plausibilität (`meta.valid`).

**Reaktionstest:** fünf Durchgänge, Wartezeit 1,2–4,2 s (10-ms-Raster) und Signalfarbe aus dem Strom
`main`, Ersatz-Wartezeiten nach Frühstarts aus `retry`. Unter 100 ms zählt als Frühstart (+100 ms auf den
Schnitt), ohne Reaktion endet ein Durchgang nach 2 s. Felder: `[Schnitt+Strafe, Bester, Frühstarts, t1…t5]`.

| Spiel      | ID  | Aus der UUID                                                                                | Felder im Share-Code                          | Besser ist                                                     |
| ---------- | --- | ------------------------------------------------------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------- |
| Reaktion   | 1   | Wartezeiten, Signalfarben, Ersatz-Wartezeiten                                               | `[Schnitt+Strafe, Bester, Frühstarts, t1…t5]` | weniger ms                                                     |
| Memory     | 2   | welche 8 der 16 Hex-Ziffern, Kartenlage (4×4)                                               | `[Züge, Zeit ms]`                             | weniger Züge, dann Zeit                                        |
| Sortieren  | 3   | Startfeld des 3×3-Schiebepuzzles (lösbar, Manhattan ≥ 12); kürzeste Lösung per Breitensuche | `[Züge, Zeit ms]`                             | weniger Züge, dann Zeit; unter der kürzesten Lösung = ungültig |
| Sequenz    | 4   | Folge aus 20 Schritten (Felder 1–4)                                                         | `[geschaffte Stufen]`                         | mehr Stufen                                                    |
| Hex-Farben | 5   | 10 Farben, je 3 Ablenker (Streuung 96 → 42 pro Kanal)                                       | `[Treffer, Bedenkzeit ms]`                    | mehr Treffer, dann Zeit                                        |
