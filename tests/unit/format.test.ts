import { describe, expect, it } from 'vitest';
import { announcementTitle, formatStoryDate, initials, ordinal, weekStart } from '@/lib/format';

describe('formatStoryDate', () => {
  it('formats ISO dates the way the reading list shows them', () => {
    expect(formatStoryDate('2026-01-30')).toBe('30 JAN 2026');
    expect(formatStoryDate('2026-12-01')).toBe('01 DEC 2026');
  });
});

describe('initials', () => {
  it('skips honorifics and uses the first and last name', () => {
    expect(initials('Aman Dabral')).toBe('AD');
    expect(initials('Dr. Rahul Kala')).toBe('RK');
    expect(initials('Rohinth')).toBe('R');
    expect(initials('  ')).toBe('');
  });
});

describe('ordinal', () => {
  it('pads to two digits without truncating larger numbers', () => {
    expect(ordinal(1)).toBe('01');
    expect(ordinal(12)).toBe('12');
    expect(ordinal(100)).toBe('100');
  });
});

describe('announcementTitle', () => {
  it('joins the two title lines', () => {
    expect(announcementTitle({ title: 'Tech', titleEmphasis: 'Lekhan.' })).toBe('Tech Lekhan.');
    expect(announcementTitle({ title: 'Hackathon', titleEmphasis: null })).toBe('Hackathon');
  });
});

describe('weekStart', () => {
  it('returns the Monday on or before a date', () => {
    expect(weekStart('2026-10-12')).toBe('2026-10-12');
    expect(weekStart('2026-10-14')).toBe('2026-10-12');
    expect(weekStart('2026-10-18')).toBe('2026-10-12');
    expect(weekStart('2027-01-01')).toBe('2026-12-28');
  });
});
