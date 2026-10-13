import { shorten, type PageMetadata } from './page-metadata';

const MAX_CAPTION = 300;
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

/**
 * The one form a post's link is stored in, https://www.instagram.com/p/<code>/,
 * or `null` if the link is not an Instagram post or reel. Accepts the
 * /<username>/p/<code>/ links the profile grid uses, and drops tracking queries.
 */
export function instagramPostUrl(link: string): string | null {
  let url: URL;
  try {
    url = new URL(link.trim());
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' || !/^(www\.)?instagram\.com$/.test(url.hostname)) return null;
  const match = url.pathname.match(/^\/(?:[A-Za-z0-9._]+\/)?(p|reel|tv)\/([A-Za-z0-9_-]+)\/?$/);
  if (!match) return null;
  const kind = match[1] === 'reel' ? 'reel' : 'p';
  return `https://www.instagram.com/${kind}/${match[2]}/`;
}

function isoDate(month: string, day: string, year: string): string | null {
  const index = MONTHS.indexOf(month.toLowerCase());
  return index === -1 ? null : `${year}-${String(index + 1).padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Instagram's previews read `14 likes, 0 comments - tes_iiitm on October 13, 2026: "caption…"`.
 * Captions often use mathematical bold letters for emphasis; NFKC turns them back
 * into plain text that screen readers and search can read.
 */
export function readInstagramPost(metadata: PageMetadata): { caption: string | null; postedOn: string | null } {
  const summary = metadata.summary ?? '';
  const dated = summary.match(/ on ([A-Za-z]+) (\d{1,2}), (\d{4}): ?([\s\S]*)$/);
  const postedOn = dated ? isoDate(dated[1], dated[2], dated[3]) : null;
  const quoted = dated?.[4] ?? metadata.title?.match(/on Instagram: ([\s\S]*)$/)?.[1] ?? '';
  const caption = quoted.normalize('NFKC').replace(/^"|"\.?$/g, '').replace(/\s+/g, ' ').trim();
  return { caption: caption ? shorten(caption, MAX_CAPTION) : null, postedOn };
}
