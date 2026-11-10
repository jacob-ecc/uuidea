import { expect, test, type Page } from '@playwright/test';
import { makePlan, ROUNDS } from '@/games/reaction/logic';

const U = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const REACT = 250;

async function open(page: Page, url: string) {
  await page.clock.install();
  await page.goto(url);
  await page.clock.pauseAt(new Date('2030-01-01T12:00:00Z'));
  await expect(page.getByRole('button', { name: 'Runde starten' })).toBeVisible();
}

/** Spielt fünf Durchgänge mit fester Reaktionszeit; die Uhr läuft nur, wenn wir sie drehen. */
async function play(page: Page, uuid: string) {
  const { waits } = makePlan(uuid);
  await page.getByRole('button', { name: 'Runde starten' }).click();
  const pad = page.locator('.rx-pad');
  await expect(pad).toBeVisible(); // Spiel-Modul ist geladen
  await page.clock.runFor(50); // Preact-Effekte (Fokus) laufen über rAF/Timer
  await expect(pad).toBeFocused();
  for (let i = 0; i < ROUNDS; i++) {
    await page.keyboard.press('Space');
    await expect(pad).toHaveAttribute('data-phase', 'wait');
    await page.clock.runFor(waits[i]! - 10);
    await expect(pad).toHaveAttribute('data-phase', 'wait');
    await page.clock.runFor(10);
    await expect(pad).toHaveAttribute('data-phase', 'go');
    await page.clock.runFor(REACT);
    await page.keyboard.press('Space');
    await expect(pad).toHaveAttribute('data-phase', 'shown');
  }
  await page.keyboard.press('Space');
  await expect(page.locator('#res-score')).toBeVisible();
}

async function traceText(page: Page) {
  await page.locator('.gs-trace summary').click();
  return page.locator('.gs-trace .kv').innerText();
}

test('Reaktionstest: gleiche UUID → gleiche Runde, Herausforderung per Link mit Vergleich', async ({
  browser,
}) => {
  const a = await (await browser.newContext()).newPage();
  await open(a, `/games/reaction?id=${U}`);
  await expect(a.locator('.seed-uuid')).toHaveAttribute('aria-live', 'polite');
  await expect(a.locator('.seed-uuid .uuid')).toHaveAttribute('aria-label', U);
  await play(a, U);

  // Messung: 250 ms nach dem Signal, abzüglich höchstens eines Frames
  const score = Number((await a.locator('#res-score').innerText()).replace(/\D/g, ''));
  expect(score).toBeGreaterThanOrEqual(REACT - 17);
  expect(score).toBeLessThanOrEqual(REACT);
  const traceA = await traceText(a);
  expect(traceA).toContain('Wartezeiten');

  await a.locator('.share-nick').fill('ada');
  const link = await a.locator('[data-share-url]').getAttribute('data-share-url');
  expect(link).toMatch(new RegExp(`/games/reaction\\?id=${U}#r=[A-Za-z0-9_-]+$`));

  // Zweiter Browser (eigener Speicher) öffnet den Link
  const b = await (await browser.newContext()).newPage();
  await open(b, new URL(link!).pathname + new URL(link!).search + new URL(link!).hash);
  await expect(b.locator('.gs-challenge')).toContainText('Herausforderung von ada');
  await expect(b.locator('.gs-challenge')).toContainText(`${score} ms`);
  await expect(b.locator('.seed-uuid .uuid')).toHaveAttribute('aria-label', U);
  await play(b, U);
  await expect(b.locator('.res-verdict')).toBeVisible();
  await expect(b.locator('.res-legend')).toContainText('ada');
  expect(await traceText(b)).toBe(traceA);

  // Verlauf merkt sich die Runde inkl. Gegner
  await expect(b.locator('.hist-row').first()).toContainText('gegen ada');
});

test('vertauschte UUID macht den Ergebnis-Link ungültig', async ({ page }) => {
  await open(page, `/games/reaction?id=${U}`);
  await play(page, U);
  const link = new URL((await page.locator('[data-share-url]').getAttribute('data-share-url'))!);
  const other = '017f22e2-79b0-7cc3-98c4-dc0c0c07398f';
  await open(page, `/games/reaction?id=${other}${link.hash}`);
  await expect(page.locator('.gs-notice')).toContainText('beschädigt');
  await expect(page.locator('.gs-challenge')).toHaveCount(0);
});

test('Frühstart wird bestraft und die Runde läuft weiter', async ({ page }) => {
  await open(page, `/games/reaction?id=${U}`);
  await page.getByRole('button', { name: 'Runde starten' }).click();
  const pad = page.locator('.rx-pad');
  await expect(pad).toBeVisible();
  await page.clock.runFor(50); // Preact-Effekte (Fokus) laufen über rAF/Timer
  await expect(pad).toBeFocused();
  await page.keyboard.press('Space');
  await expect(pad).toHaveAttribute('data-phase', 'wait');
  await page.clock.runFor(500);
  await page.keyboard.press('Space');
  await expect(pad).toHaveAttribute('data-phase', 'foul');
  await expect(page.locator('.rx-foot')).toContainText('+100 ms');
});

test('Neue UUID ändert Adresse und Runde', async ({ page }) => {
  await open(page, `/games/reaction?id=${U}`);
  await page.getByRole('button', { name: 'Neue UUID' }).click();
  await page.clock.runFor(50); // Adresse wird per Effekt aktualisiert
  await expect(page).not.toHaveURL(new RegExp(U));
  await expect(page).toHaveURL(/\?id=[0-9a-f-]{36}$/);
});

test('Spiele-Übersicht: verlinkt den Reaktionstest, kein horizontaler Overflow', async ({
  page,
}) => {
  await page.goto('/games');
  await expect(page.locator('h1')).toHaveText('Spiele aus einer UUID');
  await expect(page.locator('a.gcard-live')).toHaveAttribute('href', '/games/reaction');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
});
