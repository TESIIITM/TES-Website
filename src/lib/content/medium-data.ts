import 'server-only';
import { unstable_cache } from 'next/cache';
import { fetchPublic } from '@/lib/admin/fetch-public';
import { mediumFeedUrl, mergeStories, parseMediumFeed, type MediumPost } from '@/lib/medium';
import type { SiteContent } from './types';

/** Invalidated by the dashboard's refresh button on the stories page. */
export const MEDIUM_TAG = 'medium';

const MAX_FEED_BYTES = 2_000_000;

// The feed address is part of the cache key, so a changed Medium link fetches afresh.
const loadMediumPosts = unstable_cache(
  async (feedUrl: string): Promise<MediumPost[]> => {
    const { bytes } = await fetchPublic(feedUrl, { accept: 'application/rss+xml, application/xml, text/xml', maxBytes: MAX_FEED_BYTES });
    const posts = parseMediumFeed(new TextDecoder().decode(bytes));
    // Throwing keeps a broken or blocked feed out of the cache.
    if (posts.length === 0) throw new Error('The Medium feed had no posts.');
    return posts;
  },
  ['medium-posts'],
  { tags: [MEDIUM_TAG], revalidate: 3600 },
);

/** The latest posts on the society's Medium, or none when the feed can't be read. */
export async function getMediumPosts(profileUrl: string): Promise<MediumPost[]> {
  const feedUrl = mediumFeedUrl(profileUrl);
  // The e2e suite turns the feed off so it never depends on the network.
  if (!feedUrl || process.env.MEDIUM_FEED === 'off') return [];
  try {
    return await loadMediumPosts(feedUrl);
  } catch (error) {
    console.error('Could not load the Medium feed:', error);
    return [];
  }
}

/** Adds Medium posts that aren't saved as stories and aren't hidden. Without the feed, the saved stories are shown. */
export async function withMediumStories(content: SiteContent, hiddenIds: string[]): Promise<SiteContent> {
  const posts = await getMediumPosts(content.links.medium);
  return { ...content, stories: mergeStories(content.stories, posts, hiddenIds) };
}
