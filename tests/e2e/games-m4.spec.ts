import { expect, test, type Page } from '@playwright/test';
import { makeDeck } from '@/games/memory/logic';
import { makeBoard, solve } from '@/games/sort/logic';
import { makeSequence } from '@/games/sequence/logic';
import { makeRounds } from '@/games/hexcolor/logic';

const U = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

async function start(page: Page, slug: string) {
  await page.clock.install();
  await page.goto(`/games/${slug}?id=${U}`);
  await page.clock.pauseAt(new Date('2030-01-01T12:00:00Z'));
  await page.getByRole('button', { name: 'Runde starten' }).click();
  await expect(page.locator('.gm')).toBeVisible(); // Spiel-Modul ist geladen
  await page.clock.runFor(50); // Preact-Effekte laufen über rAF/Timer
}

async function result(page: Page) {
  await page.clock.runFor(1200);
  await expect(page.locator('#res-score')).toBeVisible();
  return page.locator('#res-score').innerText();
}

test('Memory: perfektes Spiel mit der Kartenlage aus der UUID = 8 Züge', async ({ page }) => {
  await start(page, 'memory');
  const deck = makeDeck(U);
  const cards = page.locator('.mem-card');
  await expect(cards).toHaveCount(16);
  for (const d of deck.digits) {
    const [i, j] = deck.cards.flatMap((c, k) => (c === d ? [k] : []));
    await cards.nth(i!).click();
    await page.clock.runFor(300);
    await cards.nth(j!).click();
    await page.clock.runFor(300);
    await expect(cards.nth(i!)).toHaveAttribute('data-state', 'matched');
  }
  expect(await result(page)).toBe('8 Züge');
});

test('Sortieren: die kürzeste Lösung wird als solche gewertet', async ({ page }) => {
  await start(page, 'sort');
  const path = solve(makeBoard(U));
  for (const pos of path) {
    await page.locator(`.srt-tile[data-pos="${pos}"]`).click();
    await page.clock.runFor(150);
  }
  expect(await result(page)).toBe(`${path.length} Züge`);
  await page.locator('.gs-trace summary').click();
  await expect(page.locator('.gs-trace')).toContainText(`${path.length} Züge`);
});

test('Sortieren: Pfeiltasten schieben Kacheln', async ({ page }) => {
  await start(page, 'sort');
  const board = makeBoard(U);
  const blank = board.indexOf(0);
  await expect(page.locator('.srt-board')).toBeFocused();
  // Pfeil nach unten: die Kachel über der Lücke rutscht hinein (falls vorhanden)
  const key = blank >= 3 ? 'ArrowDown' : 'ArrowUp';
  await page.keyboard.press(key);
  await expect(page.locator('.gm-bar')).toContainText('Züge 1');
});

test('Sequenz: drei Stufen geschafft, dann ein Fehler = Stufe 3', async ({ page }) => {
  await start(page, 'sequence');
  const seq = makeSequence(U);
  const board = page.locator('.seq-board');
  for (let level = 1; level <= 4; level++) {
    for (let k = 0; k < 100; k++) {
      if ((await board.getAttribute('data-phase')) === 'input') break;
      await page.clock.runFor(100);
    }
    await expect(board).toHaveAttribute('data-phase', 'input');
    if (level === 4) {
      // absichtlich falsch
      await page.keyboard.press(String((seq[0]! % 4) + 1));
      break;
    }
    for (let k = 0; k < level; k++) await page.keyboard.press(String(seq[k]));
  }
  expect(await result(page)).toBe('Stufe 3');
});

test('Hex-Farben: alle zehn richtig = 10 von 10', async ({ page }) => {
  await start(page, 'hexcolor');
  for (const r of makeRounds(U)) {
    await expect(page.locator('.hx-choice').nth(r.answer)).toHaveText(new RegExp(r.target));
    await page.clock.runFor(400);
    await page.locator('.hx-choice').nth(r.answer).click();
    await expect(page.locator('.hx-feedback')).toHaveText('Richtig');
    await page.clock.runFor(800);
  }
  expect(await result(page)).toBe('10 von 10');
});

test('Herausforderung im Memory: Link öffnen zeigt Gegner und Ziel', async ({ browser }) => {
  const a = await (await browser.newContext()).newPage();
  await start(a, 'memory');
  const deck = makeDeck(U);
  const cards = a.locator('.mem-card');
  for (const d of deck.digits) {
    const [i, j] = deck.cards.flatMap((c, k) => (c === d ? [k] : []));
    await cards.nth(i!).click();
    await a.clock.runFor(400);
    await cards.nth(j!).click();
    await a.clock.runFor(400);
  }
  await result(a);
  await a.locator('.share-nick').fill('ada');
  const link = new URL((await a.locator('[data-share-url]').getAttribute('data-share-url'))!);
  const b = await (await browser.newContext()).newPage();
  await b.goto(link.pathname + link.search + link.hash);
  await expect(b.locator('.gs-challenge')).toContainText('ada hat diese Runde geschafft: 8 Züge.');
});
