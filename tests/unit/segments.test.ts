import { describe, expect, it } from 'vitest';
import { segments, segmentHtml } from '@/lib/uuid/segments';
import { isActive } from '@/components/nav';

describe('segments', () => {
  it('teilt eine kanonische UUID in 8-4-4-4-12', () => {
    expect(segments('f47ac10b-58cc-4372-a567-0e02b2c3d479')).toEqual([
      'f47ac10b',
      '58cc',
      '4372',
      'a567',
      '0e02b2c3d479',
    ]);
  });
  it('lehnt Unsinn ab', () => {
    expect(segments('nope')).toBeNull();
    expect(segments('f47ac10b58cc4372a5670e02b2c3d479')).toBeNull();
  });
  it('rendert Segment-Markup und entschärft ungültige Eingaben', () => {
    expect(segmentHtml('00000000-0000-0000-0000-000000000000')).toContain('class="s5"');
    expect(segmentHtml('<img onerror=x>')).not.toContain('<');
  });
});

describe('isActive', () => {
  it.each([
    ['/', '/', true],
    ['/tools', '/', false],
    ['/tools', '/tools', true],
    ['/tools.html', '/tools', true],
    ['/games/memory', '/games', true],
    ['/gamesx', '/games', false],
  ])('%s vs %s → %s', (path, href, expected) => {
    expect(isActive(path, href)).toBe(expected);
  });
});
