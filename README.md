# uuidea.de

UUID-Tools und kleine Spiele, deren Runden komplett aus einer UUID entstehen.
Rein statisch (Astro), Dark Theme, kein Tracking, alles läuft lokal im Browser.

> Status: **M1** – Setup, Layout, Navigation, Homepage mit Session-UUID.
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
