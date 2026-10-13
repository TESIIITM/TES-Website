import 'server-only';
import { unstable_cache } from 'next/cache';
import { createPublicClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { fallbackContent } from './fallback';
import { withGitHubData } from './github-data';
import { toAnnouncement, toContributorsSection, toDomain, toInstagramPost, toMember, toRepository, toSiteLinks, toStory, toTechNewsIssue, toYouTubeVideo } from './mappers';
import type { SiteContent } from './types';

/** Instagram posts shown under Gather. */
const INSTAGRAM_POST_LIMIT = 4;
/** Videos shown under Learn. */
const VIDEO_LIMIT = 3;

/** Invalidated by every admin mutation. */
export const SITE_CONTENT_TAG = 'site-content';

async function fetchSiteContent(): Promise<SiteContent> {
  const supabase = createPublicClient();
  const [settings, members, stories, domains, announcements, techNews, instagramPosts, videos, repositories, githubSettings] = await Promise.all([
    supabase.from('site_settings').select('*').maybeSingle(),
    supabase.from('members').select('*').eq('is_published', true).order('sort_order').order('name'),
    supabase.from('stories').select('*').eq('is_published', true).order('published_on'),
    supabase.from('domains').select('*').order('sort_order'),
    supabase.from('announcements').select('*').eq('is_published', true).order('published_on', { ascending: false }),
    // Enough rows for the latest week; older weeks are not shown.
    supabase.from('tech_news').select('*').eq('is_published', true).order('week_of', { ascending: false }).order('sort_order').order('created_at').limit(30),
    supabase.from('instagram_posts').select('*').eq('is_published', true).order('posted_on', { ascending: false }).limit(INSTAGRAM_POST_LIMIT),
    supabase.from('youtube_videos').select('*').eq('is_published', true).order('published_on', { ascending: false }).order('created_at', { ascending: false }).limit(VIDEO_LIMIT),
    // The featured repository first.
    supabase.from('github_repos').select('*').eq('is_published', true).order('is_featured', { ascending: false }).order('sort_order').order('full_name'),
    supabase.from('github_settings').select('*').maybeSingle(),
  ]);

  const failed = [settings, members, stories, domains, announcements, techNews, instagramPosts, videos, repositories, githubSettings].find((result) => result.error);
  if (failed?.error) throw new Error(`Could not load site content: ${failed.error.message}`);

  return {
    links: settings.data ? toSiteLinks(settings.data) : fallbackContent.links,
    members: (members.data ?? []).map(toMember),
    stories: (stories.data ?? []).map(toStory),
    domains: (domains.data ?? []).map(toDomain),
    announcements: (announcements.data ?? []).map(toAnnouncement),
    techNews: toTechNewsIssue(techNews.data ?? []),
    instagramPosts: (instagramPosts.data ?? []).map(toInstagramPost),
    videos: (videos.data ?? []).map(toYouTubeVideo),
    repositories: (repositories.data ?? []).map(toRepository),
    contributors: githubSettings.data ? toContributorsSection(githubSettings.data) : null,
  };
}

const getCachedSiteContent = unstable_cache(fetchSiteContent, ['site-content'], {
  tags: [SITE_CONTENT_TAG],
  revalidate: 3600,
});

/** Content from Supabase with live GitHub numbers, or the bundled content, which never calls GitHub. */
export async function getSiteContent(): Promise<SiteContent> {
  return isSupabaseConfigured() ? withGitHubData(await getCachedSiteContent()) : fallbackContent;
}
