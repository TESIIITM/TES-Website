import { describe, expect, it } from 'vitest';
import { parseLogins, parseRepositoryName } from '@/lib/github-names';

describe('parseRepositoryName', () => {
  it('accepts owner/name and links into the repository', () => {
    expect(parseRepositoryName(' TESIIITM/TES-Website ')).toBe('TESIIITM/TES-Website');
    expect(parseRepositoryName('https://github.com/TESIIITM/TES-Website')).toBe('TESIIITM/TES-Website');
    expect(parseRepositoryName('https://github.com/TESIIITM/OpenSource101/tree/main/docs')).toBe('TESIIITM/OpenSource101');
    expect(parseRepositoryName('https://github.com/TESIIITM/.github.git')).toBe('TESIIITM/.github');
  });

  it('refuses other hosts, profiles, and malformed names', () => {
    for (const input of ['https://gitlab.com/a/b', 'https://github.com/TESIIITM', 'TESIIITM', 'a/..', '-bad/name', 'a b/c', 'http://github.com/a/b']) {
      expect(parseRepositoryName(input), input).toBeNull();
    }
  });
});

describe('parseLogins', () => {
  it('splits on commas, spaces, and lines, drops @ and duplicates, and reports the rest', () => {
    expect(parseLogins('@Rohinth-S, dhananjay-123\nRohinth-S  not_valid!')).toEqual({ logins: ['Rohinth-S', 'dhananjay-123'], invalid: ['not_valid!'] });
    expect(parseLogins('  ')).toEqual({ logins: [], invalid: [] });
  });
});
