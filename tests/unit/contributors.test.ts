import { describe, expect, it } from 'vitest';
import { combineContributors } from '@/lib/contributors';

const person = (login: string, contributions: number) => ({ login, avatarUrl: '', profileUrl: '', contributions });

describe('combineContributors', () => {
  it('adds up contributions across repositories and sorts by them', () => {
    const people = combineContributors([[person('ada', 3), person('lin', 5)], [person('ada', 4), person('sam', 1)]], [], 10);
    expect(people.map((p) => [p.login, p.contributions])).toEqual([['ada', 7], ['lin', 5], ['sam', 1]]);
  });

  it('leaves out hidden logins whatever their case, and keeps to the limit', () => {
    const people = combineContributors([[person('Ada', 9), person('lin', 5), person('sam', 1)]], ['ada'], 1);
    expect(people.map((p) => p.login)).toEqual(['lin']);
  });
});
