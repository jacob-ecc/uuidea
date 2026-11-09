// Screenshots aller Seiten bei 375 / 768 / 1280 px gegen `astro preview`.
// Aufruf: npm run shots -- [pfad …]   (Preview muss auf :4321 laufen)
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const base = process.env.BASE_URL ?? 'http://localhost:4321';
// Pfade ohne führenden Slash angeben (Git Bash schreibt '/x' sonst in Windows-Pfade um)
const paths = (process.argv.slice(2).length ? process.argv.slice(2) : ['']).map(
  (p) => '/' + p.replace(/^\/+/, ''),
);
const widths = [375, 768, 1280];
const full = process.env.FULL !== '0';

await mkdir('screenshots', { recursive: true });
const browser = await chromium.launch();
for (const w of widths) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: w < 768 ? 812 : 900 },
    deviceScaleFactor: 1,
    hasTouch: w < 1024,
    isMobile: w < 768,
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();
  for (const p of paths) {
    await page.goto(base + p, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    const name = (p.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'home') + `-${w}.png`;
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    await page.screenshot({ path: `screenshots/${name}`, fullPage: full });
    console.log(`${name}${overflow > 0 ? `  ⚠ horizontaler Overflow: ${overflow}px` : ''}`);
  }
  await ctx.close();
}
await browser.close();
