import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/tools');
  await page.waitForFunction(() => !document.querySelector('astro-island[ssr]'));
});

test('Generator erzeugt 1000 v7-UUIDs, streng sortiert', async ({ page }) => {
  await page.locator('label:has(input[value=v7])').click();
  await page.getByRole('button', { name: '1000', exact: true }).click();
  const rows = page.locator('.out-row');
  await expect(rows).toHaveCount(1000);
  const ids = await rows.evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')!));
  expect(ids.every((s) => /^[0-9a-f]{8}-[0-9a-f]{4}-7/.test(s))).toBe(true);
  expect([...ids].sort()).toEqual(ids);
});

test('v5 ist deterministisch (RFC-Beispiel)', async ({ page }) => {
  await page.locator('label:has(input[value=v5])').click();
  await page.locator('textarea').fill('www.example.com');
  await expect(page.locator('.out-row').first()).toHaveAttribute(
    'aria-label',
    '2ed6657d-e927-568b-95e1-2665a8aea6a2 kopieren',
  );
});

test('Decoder liest den Zeitstempel einer v7-UUID', async ({ page }) => {
  await page.locator('#decoder input.field').fill('017f22e2-79b0-7cc3-98c4-dc0c0c07398f');
  await expect(page.locator('#decoder .kv')).toContainText('2022-02-22T19:22:22.000Z');
  await page.locator('#decoder input.field').fill('keine uuid');
  await expect(page.locator('#decoder .result-bad')).toBeVisible();
});

test('Konverter wandelt eine ULID in eine UUID', async ({ page }) => {
  await page.locator('#konverter input.field').fill('01ARZ3NDEKTSV4RRFFQ69G5FAV');
  await expect(page.locator('#conv-status')).toContainText('ULID');
  await expect(page.locator('.conv-row').first()).toContainText(
    '01563e3a-b5d3-d676-4c61-efb99302bd5b',
  );
});

test('Tools-Seite: kein horizontaler Overflow', async ({ page }) => {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
});
