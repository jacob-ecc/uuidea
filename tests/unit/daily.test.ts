import { describe, expect, it } from 'vitest';
import { DAILY_NAMESPACE, dailyUuid, dayKey, nextDayStart, todayUuid } from '@/lib/uuid/daily';
import { NAMESPACES, v5 } from '@/lib/uuid/generate';

describe('UUID des Tages', () => {
  it('Namespace ist v5(DNS, "uuidea.de")', async () => {
    expect(await v5(NAMESPACES.DNS, 'uuidea.de')).toBe(DAILY_NAMESPACE);
  });

  it('ist fest pro Tag und eine gültige v5', async () => {
    const a = await dailyUuid('2026-11-10');
    expect(a).toBe('babe3a99-bde9-5334-a7f2-62cc89f4362a');
    expect(await dailyUuid('2026-11-10')).toBe(a);
    expect(await dailyUuid('2026-11-11')).not.toBe(a);
    expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('Tag wechselt um Mitternacht Berliner Zeit', () => {
    // 10.11. 22:59:59 UTC = 23:59:59 MEZ; eine Sekunde später ist in Berlin der 11.
    expect(dayKey(Date.UTC(2026, 10, 10, 22, 59, 59))).toBe('2026-11-10');
    expect(dayKey(Date.UTC(2026, 10, 10, 23, 0, 0))).toBe('2026-11-11');
    // Sommerzeit: Mitternacht MESZ = 22:00 UTC
    expect(dayKey(Date.UTC(2026, 6, 1, 21, 59, 59))).toBe('2026-07-01');
    expect(dayKey(Date.UTC(2026, 6, 1, 22, 0, 0))).toBe('2026-07-02');
  });

  it('todayUuid nutzt den Berliner Tag', async () => {
    expect(await todayUuid(Date.UTC(2026, 10, 10, 23, 30))).toBe(await dailyUuid('2026-11-11'));
  });

  it('nextDayStart trifft Mitternacht, auch an Umstellungstagen', () => {
    expect(nextDayStart(Date.UTC(2026, 10, 10, 12))).toBe(Date.UTC(2026, 10, 10, 23));
    // 29.03.2026: Umstellung auf Sommerzeit, der Tag hat 23 Stunden
    expect(nextDayStart(Date.UTC(2026, 2, 29, 0, 30))).toBe(Date.UTC(2026, 2, 29, 22));
    // 25.10.2026: zurück auf Winterzeit, 25 Stunden
    expect(nextDayStart(Date.UTC(2026, 9, 24, 22, 30))).toBe(Date.UTC(2026, 9, 25, 23));
  });
});
