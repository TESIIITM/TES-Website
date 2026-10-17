import type { Scores } from './rubric';

const LINK = /\bhttps?:\/\/[^\s<>()"'`]+|\b(?:www\.)?github\.com\/[^\s<>()"'`]+/gi;
const TRAILING_PUNCTUATION = /[.,;:!?\]}>*_]+$/;
const LOGIN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
// github.com paths that are pages, not people.
const RESERVED = new Set([
  'about', 'apps', 'collections', 'contact', 'enterprise', 'events', 'explore', 'features', 'issues', 'login',
  'marketplace', 'new', 'notifications', 'orgs', 'pricing', 'pulls', 'search', 'settings', 'sponsors', 'topics', 'trending',
]);

/** Distinct links found in the answers, in order, with bare github.com links made absolute. */
export function extractLinks(texts: (string | null | undefined)[], max = 30): string[] {
  const links = new Set<string>();
  for (const text of texts) {
    for (const match of text?.matchAll(LINK) ?? []) {
      let link = match[0].replace(TRAILING_PUNCTUATION, '');
      if (!/^https?:\/\//i.test(link)) link = `https://${link}`;
      try {
        links.add(new URL(link).toString());
      } catch {
        // Not a URL after all.
      }
      if (links.size >= max) return [...links];
    }
  }
  return [...links];
}

/** GitHub accounts linked from the answers, lower-case. Organisations in `ignore` are left out. */
export function githubLogins(links: string[], ignore: string[] = []): string[] {
  const skip = new Set(ignore.map((owner) => owner.toLowerCase()));
  const logins = new Set<string>();
  for (const link of links) {
    let url: URL;
    try {
      url = new URL(link);
    } catch {
      continue;
    }
    if (!/^(www\.)?github\.com$/i.test(url.hostname)) continue;
    const owner = url.pathname.split('/')[1]?.toLowerCase();
    if (owner && LOGIN.test(owner) && !RESERVED.has(owner) && !skip.has(owner)) logins.add(owner);
  }
  return [...logins];
}

export type Evidence = { kind: 'github' | 'github-unverified' | 'links' | 'resume'; text: string };

export type VerifiedContribution = { login: string; repository: string; contributions: number };

/** Contributions that earn the automatic score; reviewers can always override it. */
function contributionScore(total: number): number | undefined {
  if (total <= 0) return undefined;
  if (total >= 25) return 10;
  if (total >= 10) return 9;
  if (total >= 3) return 8;
  return 7;
}

/**
 * Scores only what can be checked mechanically: weekly hours, whether a
 * resume was attached, and contributions GitHub confirms. Everything that
 * needs judgement is left to reviewers and the optional AI.
 */
export function automaticAssessment(input: {
  weeklyHours: number;
  hasResume: boolean;
  links: string[];
  logins: string[];
  verified: VerifiedContribution[];
}): { scores: Scores; evidence: Evidence[] } {
  const scores: Scores = {
    availability: Math.min(10, Math.max(0, Math.round(input.weeklyHours))),
    resume: input.hasResume ? 10 : 0,
  };
  const evidence: Evidence[] = [];

  const total = input.verified.reduce((sum, entry) => sum + entry.contributions, 0);
  const contributions = contributionScore(total);
  if (contributions !== undefined) scores.contributions = contributions;

  for (const entry of input.verified) {
    evidence.push({ kind: 'github', text: `@${entry.login} has ${entry.contributions} contribution${entry.contributions === 1 ? '' : 's'} to ${entry.repository}.` });
  }
  const verifiedLogins = new Set(input.verified.map((entry) => entry.login.toLowerCase()));
  for (const login of input.logins) {
    if (!verifiedLogins.has(login)) evidence.push({ kind: 'github-unverified', text: `@${login} is not among the contributors to the TES repositories.` });
  }
  const githubLinks = input.links.filter((link) => /^https:\/\/(www\.)?github\.com\//i.test(link)).length;
  evidence.push({
    kind: 'links',
    text: input.links.length
      ? `${input.links.length} link${input.links.length === 1 ? '' : 's'} shared${githubLinks ? `, ${githubLinks} on GitHub` : ''}.`
      : 'No links shared.',
  });
  evidence.push({ kind: 'resume', text: input.hasResume ? 'Resume attached.' : 'No resume attached.' });
  return { scores, evidence };
}

export function readEvidence(value: unknown): Evidence[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is Evidence => typeof entry?.kind === 'string' && typeof entry?.text === 'string');
}
