import 'server-only';
import type { Contributor, RepoStats } from '@/lib/content/types';

const API = 'https://api.github.com';
const TIMEOUT_MS = 8000;

export class GitHubError extends Error {
  constructor(readonly status: number, path: string) {
    super(`GitHub answered ${status} for ${path}`);
  }
}

type ApiRepository = {
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  license: { spdx_id: string | null } | null;
  pushed_at: string;
  private: boolean;
};

type ApiContributor = { login: string; avatar_url: string; html_url: string; contributions: number; type: string };

/**
 * Unauthenticated requests share a limit of 60 an hour per IP, which a shared
 * host can exhaust. A token, which needs no scopes for public repositories,
 * raises it to 5,000.
 */
async function request<T>(path: string): Promise<T | null> {
  const headers: Record<string, string> = { accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28', 'user-agent': 'tes-website' };
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const response = await fetch(`${API}${path}`, { headers, cache: 'no-store', signal: AbortSignal.timeout(TIMEOUT_MS) });
  // An empty repository has no contributors yet.
  if (response.status === 204) return null;
  if (!response.ok) throw new GitHubError(response.status, path);
  return response.json() as Promise<T>;
}

function isBot(contributor: ApiContributor) {
  return contributor.type === 'Bot' || contributor.login.endsWith('[bot]');
}

/** The repository as GitHub spells it, or `null` if it does not exist or is private. */
export async function findRepository(fullName: string): Promise<{ fullName: string; description: string | null } | null> {
  try {
    const repository = await request<ApiRepository>(`/repos/${fullName}`);
    return repository && !repository.private ? { fullName: repository.full_name, description: repository.description } : null;
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404) return null;
    throw error;
  }
}

/** Live numbers for a repository and the people who contributed to it, bots left out. */
export async function fetchRepository(fullName: string): Promise<{ description: string | null; language: string | null; license: string | null; stats: RepoStats; contributors: Contributor[] }> {
  const [repository, contributors] = await Promise.all([
    request<ApiRepository>(`/repos/${fullName}`),
    request<ApiContributor[]>(`/repos/${fullName}/contributors?per_page=100`),
  ]);
  if (!repository) throw new GitHubError(204, `/repos/${fullName}`);
  const people = (contributors ?? []).filter((contributor) => !isBot(contributor)).map((contributor) => ({
    login: contributor.login,
    avatarUrl: contributor.avatar_url,
    profileUrl: contributor.html_url,
    contributions: contributor.contributions,
  }));
  return {
    description: repository.description,
    language: repository.language,
    license: repository.license?.spdx_id && repository.license.spdx_id !== 'NOASSERTION' ? repository.license.spdx_id : null,
    stats: {
      stars: repository.stargazers_count,
      forks: repository.forks_count,
      openIssues: repository.open_issues_count,
      contributors: people.length,
      pushedOn: repository.pushed_at.slice(0, 10),
    },
    contributors: people,
  };
}
