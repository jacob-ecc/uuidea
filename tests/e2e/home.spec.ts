import { expect, test } from '@playwright/test';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

test('Homepage zeigt eine Session-UUID (v4) und erzeugt neue ohne Reload', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const hero = page.locator('#hero-uuid');
  await expect(hero).toHaveAttribute('data-uuid', UUID_RE);
  const first = await hero.getAttribute('data-uuid');
  await expect(hero).toHaveText(first!);

  await page.getByRole('button', { name: 'Neue UUID' }).click();
  await expect(hero).not.toHaveAttribute('data-uuid', first!);
  const second = await hero.getAttribute('data-uuid');
  expect(second).toMatch(UUID_RE);
  // Footer zeigt dieselbe Session-UUID
  await expect(page.locator('[data-session-uuid]')).toHaveText(second!);
});

test('Jeder Reload erzeugt eine neue Session-UUID', async ({ page }) => {
  await page.goto('/');
  const a = await page.locator('#hero-uuid').getAttribute('data-uuid');
  await page.reload();
  const b = await page.locator('#hero-uuid').getAttribute('data-uuid');
  expect(a).not.toBe(b);
});

test('Keine horizontale Scrollbar auf 360px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto('/');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
});

test('404-Seite liefert die Nil-UUID', async ({ page }) => {
  await page.goto('/404');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('00000000');
});

test('UUID des Tages: v5 aus dem Berliner Datum, verlinkt in die Tagesrunde', async ({ page }) => {
  await page.goto('/');
  const daily = page.locator('#daily-uuid');
  await expect(daily).toHaveAttribute('data-uuid', /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab]/);
  const id = await daily.getAttribute('data-uuid');
  const key = await page.locator('#daily-name').textContent();
  expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  // Für alle gleich: ein zweiter Aufruf liefert dieselbe UUID
  await page.reload();
  await expect(daily).toHaveAttribute('data-uuid', id!);
  await expect(page.locator('#daily-play')).toHaveAttribute('href', `/games/memory?id=${id}`);
});
