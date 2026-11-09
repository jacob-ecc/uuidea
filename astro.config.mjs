// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://uuidea.de',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [preact(), sitemap({ filter: (page) => !page.includes('/404') })],
  vite: { plugins: [tailwindcss()] },
  devToolbar: { enabled: false },
  security: {
    // Hashes für alle Inline-Skripte/-Styles werden pro Seite als <meta>-CSP erzeugt.
    // Ergänzende Header (frame-ancestors etc.) stehen in public/_headers.
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'self'",
        "img-src 'self' data: blob:",
        "font-src 'self'",
        "connect-src 'self'",
        "manifest-src 'self'",
        "worker-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
    },
  },
});
