import 'server-only';
import { unstable_cache } from 'next/cache';
import { createPublicClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { fallbackContent } from './fallback';
import { toAnnouncement, toDomain, toMember, toSiteLinks, toStory } from './mappers';
import type { SiteContent } from './types';

/** Invalidated by every admin mutation. */
export const SITE_CONTENT_TAG = 'site-content';

async function fetchSiteContent(): Promise<SiteContent> {
  const supabase = createPublicClient();
  const [settings, members, stories, domains, announcements] = await Promise.all([
    supabase.from('site_settings').select('*').maybeSingle(),
    supabase.from('members').select('*').eq('is_published', true).order('sort_order').order('name'),
    supabase.from('stories').select('*').eq('is_published', true).order('published_on'),
    supabase.from('domains').select('*').order('sort_order'),
    supabase.from('announcements').select('*').eq('is_published', true).order('published_on', { ascending: false }),
  ]);

  const failed = [settings, members, stories, domains, announcements].find((result) => result.error);
  if (failed?.error) throw new Error(`Could not load site content: ${failed.error.message}`);

  return {
    links: settings.data ? toSiteLinks(settings.data) : fallbackContent.links,
    members: (members.data ?? []).map(toMember),
    stories: (stories.data ?? []).map(toStory),
    domains: (domains.data ?? []).map(toDomain),
    announcements: (announcements.data ?? []).map(toAnnouncement),
  };
}

const getCachedSiteContent = unstable_cache(fetchSiteContent, ['site-content'], {
  tags: [SITE_CONTENT_TAG],
  revalidate: 3600,
});

export async function getSiteContent(): Promise<SiteContent> {
  return isSupabaseConfigured() ? getCachedSiteContent() : fallbackContent;
}
