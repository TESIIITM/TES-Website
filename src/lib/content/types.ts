export type MemberGroup = 'faculty' | 'student';

export type Member = {
  id: string;
  name: string;
  role: string;
  group: MemberGroup;
  portraitUrl: string | null;
  linkedinUrl: string | null;
};

export type Story = {
  id: string;
  /** Stable key for readers' saved lists. */
  slug: string;
  title: string;
  category: string;
  summary: string;
  url: string;
  /** ISO date, `YYYY-MM-DD`. */
  publishedOn: string;
};

export type Domain = {
  id: string;
  title: string;
  detail: string;
};

export type Action = { label: string; url: string };

export type Announcement = {
  id: string;
  label: string;
  title: string;
  /** Rendered on its own line in the serif italic. */
  titleEmphasis: string | null;
  summary: string;
  details: string | null;
  primaryAction: Action | null;
  secondaryAction: Action | null;
  publishedOn: string;
};

export type SiteLinks = {
  github: string;
  repository: string;
  contributionGuide: string;
  medium: string;
  instagram: string;
  linkedin: string;
  email: string;
};

export type SiteContent = {
  links: SiteLinks;
  members: Member[];
  stories: Story[];
  domains: Domain[];
  /** Newest first. The first one is featured in the Gather panel. */
  announcements: Announcement[];
};
