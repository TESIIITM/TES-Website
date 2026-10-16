import type { Contributor } from '@/lib/content/types';

/** Everyone across the repositories, by total contributions, without hidden logins. */
export function combineContributors(lists: Contributor[][], hiddenLogins: string[], max: number): Contributor[] {
  const hidden = new Set(hiddenLogins.map((login) => login.toLowerCase()));
  const byLogin = new Map<string, Contributor>();
  for (const person of lists.flat()) {
    if (hidden.has(person.login.toLowerCase())) continue;
    const known = byLogin.get(person.login);
    byLogin.set(person.login, known ? { ...known, contributions: known.contributions + person.contributions } : person);
  }
  return [...byLogin.values()].sort((a, b) => b.contributions - a.contributions || a.login.localeCompare(b.login)).slice(0, max);
}
