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

export type TechNewsItem = {
  id: string;
  title: string;
  url: string;
  summary: string | null;
  /** The publication, e.g. "The Verge". */
  source: string | null;
  imageUrl: string | null;
};

export type TechNewsIssue = {
  /** ISO date of the week's Monday. */
  weekOf: string;
  items: TechNewsItem[];
};

export type InstagramPost = {
  id: string;
  url: string;
  caption: string | null;
  imageUrl: string | null;
  /** ISO date, `YYYY-MM-DD`. */
  postedOn: string;
};

export type YouTubeVideo = {
  id: string;
  /** YouTube's 11-character ID. */
  videoId: string;
  title: string;
  channel: string | null;
  thumbnailUrl: string | null;
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
  /** The latest week with published news, or `null` when there is none. */
  techNews: TechNewsIssue | null;
  /** Newest first, shown under Gather. */
  instagramPosts: InstagramPost[];
  /** Newest first, shown under Learn. */
  videos: YouTubeVideo[];
};
