import type { Tables } from '@/lib/supabase/database.types';
import type { Action, Announcement, Domain, InstagramPost, Member, SiteLinks, Story, TechNewsIssue } from './types';

export function toMember(row: Tables<'members'>): Member {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    group: row.member_group,
    portraitUrl: row.portrait_url,
    linkedinUrl: row.linkedin_url,
  };
}

export function toStory(row: Tables<'stories'>): Story {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    summary: row.summary,
    url: row.url,
    publishedOn: row.published_on,
  };
}

export function toDomain(row: Tables<'domains'>): Domain {
  return { id: row.id, title: row.title, detail: row.detail };
}

function toAction(label: string | null, url: string | null): Action | null {
  return label && url ? { label, url } : null;
}

export function toAnnouncement(row: Tables<'announcements'>): Announcement {
  return {
    id: row.id,
    label: row.label,
    title: row.title,
    titleEmphasis: row.title_emphasis,
    summary: row.summary,
    details: row.details,
    primaryAction: toAction(row.primary_label, row.primary_url),
    secondaryAction: toAction(row.secondary_label, row.secondary_url),
    publishedOn: row.published_on,
  };
}

export function toSiteLinks(row: Tables<'site_settings'>): SiteLinks {
  return {
    github: row.github_url,
    repository: row.repository_url,
    contributionGuide: row.contribution_guide_url,
    medium: row.medium_url,
    instagram: row.instagram_url,
    linkedin: row.linkedin_url,
    email: row.contact_email,
  };
}

/** Keeps the most recent week. Rows must arrive newest week first. */
export function toTechNewsIssue(rows: Tables<'tech_news'>[]): TechNewsIssue | null {
  const weekOf = rows[0]?.week_of;
  if (!weekOf) return null;
  return {
    weekOf,
    items: rows
      .filter((row) => row.week_of === weekOf)
      .map((row) => ({ id: row.id, title: row.title, url: row.url, summary: row.summary, source: row.source, imageUrl: row.image_url })),
  };
}

export function toInstagramPost(row: Tables<'instagram_posts'>): InstagramPost {
  return { id: row.id, url: row.url, caption: row.caption, imageUrl: row.image_url, postedOn: row.posted_on };
}
