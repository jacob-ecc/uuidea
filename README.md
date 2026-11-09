# uuidea.de

UUID-Tools und kleine Spiele, deren Runden komplett aus einer UUID entstehen.
Rein statisch (Astro), Dark Theme, kein Tracking, alles läuft lokal im Browser.

> Status: **M2** – Homepage (Redesign v2) und UUID-Tools (Generator, Decoder, Konverter, ULID & Nano ID).
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

| Modul | Inhalt |
|---|---|
| `generate.ts` | v1, v4, v5 (SHA-1 via Web Crypto), v6, v7, Nil, Max. v7 nutzt einen 12-Bit-Zähler (RFC 9562, Methode 1), damit Bulk-Listen in derselben Millisekunde sortiert bleiben; v1/v6 erhöhen im Bulk die 100-ns-Zeit. Zufällige Knoten-IDs setzen das Multicast-Bit (keine MAC-Adresse). |
| `decode.ts` | Erkennt Standard, ohne Bindestriche, `{…}`, `urn:uuid:`, Base64URL und Base58; liefert Version, Variante, eingebettete Zeit (v1/v6/v7), Clock-Sequenz und Knoten. |
| `formats.ts` | Ausgabeformate (Groß, ohne Bindestriche, Klammern, Base64URL, Base58, URN, Bytes). |
| `alt-ids.ts` | ULID (Crockford Base32, bitgleich zu UUID umrechenbar) und Nano ID. |

**Hinweis Base64URL vs. Base58:** Beide Kurzformen sind 22 Zeichen lang. Selten (≈ 0,1 %) ist ein
String in beiden Alphabeten gültig. Der Decoder wählt dann die Lesart, die eine plausible UUID ergibt
(Variante RFC 9562, Version 1–8), und zeigt die andere als Alternative an.
