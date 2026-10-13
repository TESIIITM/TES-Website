import 'server-only';
import { unstable_cache } from 'next/cache';
import { combineContributors } from '@/lib/contributors';
import { fetchRepository } from '@/lib/github';
import type { SiteContent } from './types';

/** Invalidated by the dashboard's refresh button and by repository changes there. */
export const GITHUB_TAG = 'github';

type LiveRepository = Awaited<ReturnType<typeof fetchRepository>>;

// The list of names is part of the cache key, so a changed list fetches afresh.
const loadRepositories = unstable_cache(
  async (fullNames: string[]): Promise<Record<string, LiveRepository | null>> => {
    const results = await Promise.allSettled(fullNames.map(fetchRepository));
    // Throwing keeps a total failure, such as a rate limit, out of the cache.
    if (results.every((result) => result.status === 'rejected')) throw (results[0] as PromiseRejectedResult).reason;
    return Object.fromEntries(results.map((result, index) => [fullNames[index], result.status === 'fulfilled' ? result.value : null]));
  },
  ['github-repositories'],
  { tags: [GITHUB_TAG], revalidate: 3600 },
);

/** Adds stars, forks, issues, and contributors from GitHub. Without GitHub, the content is shown as it is. */
export async function withGitHubData(content: SiteContent): Promise<SiteContent> {
  const names = content.repositories.map((repository) => repository.fullName);
  if (names.length === 0) return content;

  let live: Record<string, LiveRepository | null>;
  try {
    live = await loadRepositories(names);
  } catch (error) {
    console.error('Could not load GitHub data:', error);
    return content;
  }

  return {
    ...content,
    repositories: content.repositories.map((repository) => {
      const data = live[repository.fullName];
      return data
        ? { ...repository, description: repository.description ?? data.description, language: data.language, license: data.license, stats: data.stats }
        : repository;
    }),
    contributors: content.contributors && {
      ...content.contributors,
      people: combineContributors(names.map((name) => live[name]?.contributors ?? []), content.contributors.hiddenLogins, content.contributors.max),
    },
  };
}
