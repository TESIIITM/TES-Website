import { describe, expect, it } from 'vitest';
import { toAnnouncement, toContributorsSection, toRepository, toTechNewsIssue } from '@/lib/content/mappers';
import type { Tables } from '@/lib/supabase/database.types';

function techNewsRow(overrides: Partial<Tables<'tech_news'>> = {}): Tables<'tech_news'> {
  return {
    id: 'news-1',
    title: 'A new chip',
    url: 'https://example.com/chip',
    summary: null,
    source: 'The Verge',
    image_url: null,
    week_of: '2026-10-13',
    is_published: true,
    sort_order: 1,
    created_at: '2026-10-13T00:00:00Z',
    updated_at: '2026-10-13T00:00:00Z',
    ...overrides,
  };
}

function repoRow(overrides: Partial<Tables<'github_repos'>> = {}): Tables<'github_repos'> {
  return {
    id: 'repo-1',
    full_name: 'TESIIITM/TES-Website',
    title: null,
    description: null,
    headline: null,
    headline_emphasis: null,
    is_featured: false,
    is_published: true,
    sort_order: 1,
    created_at: '2026-10-13T00:00:00Z',
    updated_at: '2026-10-13T00:00:00Z',
    ...overrides,
  };
}

function announcementRow(overrides: Partial<Tables<'announcements'>> = {}): Tables<'announcements'> {
  return {
    id: 'announcement-1',
    label: 'Event',
    title: 'Tech Lekhan',
    title_emphasis: null,
    summary: 'A summary.',
    details: null,
    primary_label: null,
    primary_url: null,
    secondary_label: null,
    secondary_url: null,
    published_on: '2026-10-13',
    is_published: true,
    created_at: '2026-10-13T00:00:00Z',
    updated_at: '2026-10-13T00:00:00Z',
    ...overrides,
  };
}

function githubSettingsRow(overrides: Partial<Tables<'github_settings'>> = {}): Tables<'github_settings'> {
  return {
    id: true,
    show_contributors: true,
    contributors_heading: 'Contributors',
    contributors_intro: null,
    hidden_logins: [],
    max_contributors: 20,
    updated_at: '2026-10-13T00:00:00Z',
    ...overrides,
  };
}

describe('toTechNewsIssue', () => {
  it('returns null for an empty list', () => {
    expect(toTechNewsIssue([])).toBeNull();
  });

  it('keeps only the rows from the newest week', () => {
    const issue = toTechNewsIssue([
      techNewsRow({ id: 'a', week_of: '2026-10-13' }),
      techNewsRow({ id: 'b', week_of: '2026-10-13' }),
      techNewsRow({ id: 'c', week_of: '2026-10-06' }),
    ]);

    expect(issue?.weekOf).toBe('2026-10-13');
    expect(issue?.items.map((item) => item.id)).toEqual(['a', 'b']);
  });

  it('maps the row fields onto the item', () => {
    const [item] = toTechNewsIssue([
      techNewsRow({ id: 'a', title: 'A new chip', url: 'https://example.com/chip', source: 'The Verge', image_url: 'https://example.com/chip.png' }),
    ])!.items;

    expect(item).toEqual({
      id: 'a',
      title: 'A new chip',
      url: 'https://example.com/chip',
      summary: null,
      source: 'The Verge',
      imageUrl: 'https://example.com/chip.png',
    });
  });
});

describe('toRepository', () => {
  it('falls back to the repo name from full_name when title is null', () => {
    const repo = toRepository(repoRow({ full_name: 'TESIIITM/TES-Website', title: null }));

    expect(repo.title).toBe('TES-Website');
    expect(repo.fullName).toBe('TESIIITM/TES-Website');
  });

  it('keeps an explicit title', () => {
    expect(toRepository(repoRow({ title: 'The club website' })).title).toBe('The club website');
  });

  it('leaves language, license, and stats unset for GitHub to fill in', () => {
    const repo = toRepository(repoRow());

    expect(repo.language).toBeNull();
    expect(repo.license).toBeNull();
    expect(repo.stats).toBeNull();
  });
});

describe('toAnnouncement', () => {
  it('creates a button only when both the label and the URL are set', () => {
    const announcement = toAnnouncement(
      announcementRow({
        primary_label: 'Register',
        primary_url: 'https://example.com/register',
        secondary_label: 'Details',
        secondary_url: null,
      }),
    );

    expect(announcement.primaryAction).toEqual({ label: 'Register', url: 'https://example.com/register' });
    expect(announcement.secondaryAction).toBeNull();
  });

  it('drops a button when the label is missing', () => {
    const announcement = toAnnouncement(announcementRow({ primary_label: null, primary_url: 'https://example.com' }));

    expect(announcement.primaryAction).toBeNull();
  });

  it('has no actions when nothing is configured', () => {
    const announcement = toAnnouncement(announcementRow());

    expect(announcement.primaryAction).toBeNull();
    expect(announcement.secondaryAction).toBeNull();
  });
});

describe('toContributorsSection', () => {
  it('returns null when the section is turned off', () => {
    expect(toContributorsSection(githubSettingsRow({ show_contributors: false }))).toBeNull();
  });

  it('maps the settings and starts with no people', () => {
    const section = toContributorsSection(
      githubSettingsRow({
        contributors_heading: 'Our contributors',
        contributors_intro: 'Everyone who helped.',
        hidden_logins: ['dependabot'],
        max_contributors: 12,
      }),
    );

    expect(section).toEqual({
      heading: 'Our contributors',
      intro: 'Everyone who helped.',
      hiddenLogins: ['dependabot'],
      max: 12,
      people: [],
    });
  });
});
