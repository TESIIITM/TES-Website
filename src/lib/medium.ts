import type { Story } from '@/lib/content/types';

export type MediumPost = {
  /** Medium's own id, the hex at the end of every post link. */
  id: string;
  title: string;
  /** The post link without Medium's tracking query. */
  url: string;
  /** ISO date, `YYYY-MM-DD`. */
  publishedOn: string;
  tags: string[];
  /** The opening paragraph as plain text. */
  summary: string;
};

const SUMMARY_LENGTH = 180;
const FALLBACK_SUMMARY = 'Read the full story on Medium.';

/** `https://medium.com/@name` → `https://medium.com/feed/@name`; custom domains serve `/feed`. */
export function mediumFeedUrl(profileUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(profileUrl);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:') return null;
  const path = url.pathname.replace(/\/+$/, '');
  if (url.hostname === 'medium.com' || url.hostname === 'www.medium.com') {
    return path ? `https://medium.com/feed${path}` : null;
  }
  return `${url.origin}${path}/feed`;
}

/** The post id in a Medium link, from `/p/<id>` or the `-<id>` at the end of the slug. */
export function mediumPostId(link: string): string | null {
  let url: URL;
  try {
    url = new URL(link);
  } catch {
    return null;
  }
  const last = url.pathname.replace(/\/+$/, '').split('/').pop() ?? '';
  const match = /(?:^|-)([0-9a-f]{8,16})$/.exec(last);
  return match ? match[1] : null;
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
    if (code[0] === '#') {
      const point = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1));
      return Number.isFinite(point) ? String.fromCodePoint(point) : entity;
    }
    return ENTITIES[code.toLowerCase()] ?? entity;
  });
}

function unwrap(value: string): string {
  const cdata = /^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/.exec(value);
  return cdata ? cdata[1] : decodeEntities(value);
}

function tag(item: string, name: string): string[] {
  const pattern = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'g');
  return [...item.matchAll(pattern)].map((match) => unwrap(match[1]).trim());
}

function plainText(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
}

function shorten(text: string, length: number): string {
  if (text.length <= length) return text;
  const cut = text.slice(0, length - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 0 ? cut.lastIndexOf(' ') : cut.length).replace(/[\s,;:.–—-]+$/, '')}…`;
}

function openingParagraph(html: string): string {
  for (const match of html.matchAll(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/g)) {
    const text = plainText(match[1]);
    if (text) return shorten(text, SUMMARY_LENGTH);
  }
  return '';
}

function isoDate(rfc822: string): string | null {
  const date = new Date(rfc822);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

/** Reads an RSS feed from Medium. Items without a post id, title, or date are skipped. */
export function parseMediumFeed(xml: string): MediumPost[] {
  const posts: MediumPost[] = [];
  for (const [, item] of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const [link = ''] = tag(item, 'link');
    const [guid = ''] = tag(item, 'guid');
    const [title = ''] = tag(item, 'title');
    const [published = ''] = tag(item, 'pubDate');
    const id = mediumPostId(link) ?? mediumPostId(guid);
    const publishedOn = isoDate(published);
    if (!id || !title || !publishedOn || !link.startsWith('https://')) continue;
    const url = new URL(link);
    url.search = '';
    url.hash = '';
    posts.push({ id, title: shorten(title, 200), url: url.toString(), publishedOn, tags: tag(item, 'category'), summary: openingParagraph(tag(item, 'content:encoded')[0] ?? '') });
  }
  return posts;
}

/** A filter for the reading list, from Medium's tags or, without them, the title. */
export function categoryFor(post: Pick<MediumPost, 'tags' | 'title'>): string {
  const tags = post.tags.map((value) => value.toLowerCase());
  if (tags.some((value) => value.includes('open-source') || value === 'gsoc')) return 'Open source';
  if (tags.some((value) => /(^|-)(ai|llm|machine-learning|artificial-intelligence|data-science)($|-)/.test(value))) return 'AI';
  if (/\bAI\b|\bmachine learning\b/i.test(post.title)) return 'AI';
  return 'Development';
}

/** The slug Medium gives a post, without its id, as the key for readers' saved lists. */
export function slugFor(post: Pick<MediumPost, 'id' | 'url'>): string {
  const last = new URL(post.url).pathname.split('/').pop() ?? '';
  const slug = last.replace(new RegExp(`-?${post.id}$`), '').slice(0, 80).replace(/-+$/, '');
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) ? slug : `medium-${post.id}`;
}

export function storyFromPost(post: MediumPost): Story {
  return {
    id: `medium-${post.id}`,
    slug: slugFor(post),
    title: post.title,
    category: categoryFor(post),
    summary: post.summary || FALLBACK_SUMMARY,
    url: post.url,
    publishedOn: post.publishedOn,
  };
}

/**
 * The reading list: stories saved in the dashboard, plus every feed post that
 * none of them stands in for and that isn't hidden. Newest first.
 */
export function mergeStories(saved: Story[], posts: MediumPost[], hiddenIds: string[]): Story[] {
  const claimed = new Set(hiddenIds);
  const slugs = new Set(saved.map((story) => story.slug));
  for (const story of saved) {
    const id = mediumPostId(story.url);
    if (id) claimed.add(id);
  }
  const fromFeed = posts.filter((post) => !claimed.has(post.id)).map(storyFromPost).filter((story) => !slugs.has(story.slug));
  return [...saved, ...fromFeed].sort((a, b) => b.publishedOn.localeCompare(a.publishedOn));
}
