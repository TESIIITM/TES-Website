export type PageMetadata = {
  title: string | null;
  summary: string | null;
  source: string | null;
  /** Absolute https URL of the page's share image. */
  imageUrl: string | null;
};

const LIMITS = { title: 200, summary: 400, source: 80 };

const NAMED_ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', hellip: '…', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“' };

function decodeEntities(text: string): string {
  return text.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, body: string) => {
    if (body[0] !== '#') return NAMED_ENTITIES[body.toLowerCase()] ?? entity;
    const code = body[1].toLowerCase() === 'x' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : entity;
  });
}

function clean(text: string | undefined, max: number): string | null {
  if (!text) return null;
  const value = decodeEntities(text).replace(/\s+/g, ' ').trim();
  if (!value) return null;
  if (value.length <= max) return value;
  // Break at a word if one ends in the second half.
  const cut = value.slice(0, max - 1);
  const space = cut.lastIndexOf(' ');
  return `${space > max / 2 ? cut.slice(0, space) : cut}…`;
}

function readAttributes(tag: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  for (const [, name, , doubled, single, bare] of tag.matchAll(/([^\s=/<>"']+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g)) {
    attributes[name.toLowerCase()] = doubled ?? single ?? bare ?? '';
  }
  return attributes;
}

function httpsUrl(value: string | undefined, base: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(decodeEntities(value.trim()), base);
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Reads the Open Graph, Twitter card, and plain HTML metadata a page shares itself with. */
export function readPageMetadata(html: string, pageUrl: string): PageMetadata {
  const headEnd = html.search(/<\/head>/i);
  const head = headEnd === -1 ? html : html.slice(0, headEnd);

  const meta: Record<string, string> = {};
  for (const [tag] of head.matchAll(/<meta\b[^>]*>/gi)) {
    const attributes = readAttributes(tag);
    const key = (attributes.property ?? attributes.name)?.toLowerCase();
    // The first value wins, as it does for the sites that render these previews.
    if (key && attributes.content !== undefined && !(key in meta)) meta[key] = attributes.content;
  }
  const titleTag = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const hostname = new URL(pageUrl).hostname.replace(/^www\./, '');

  return {
    title: clean(meta['og:title'] ?? meta['twitter:title'] ?? titleTag, LIMITS.title),
    summary: clean(meta['og:description'] ?? meta['twitter:description'] ?? meta.description, LIMITS.summary),
    source: clean(meta['og:site_name'] ?? meta['application-name'], LIMITS.source) ?? hostname,
    imageUrl: httpsUrl(meta['og:image:secure_url'] ?? meta['og:image'] ?? meta['og:image:url'] ?? meta['twitter:image'] ?? meta['twitter:image:src'], pageUrl),
  };
}
