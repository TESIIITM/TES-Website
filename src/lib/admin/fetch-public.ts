import 'server-only';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { isPublicAddress } from './public-address';

const MAX_REDIRECTS = 4;
const TIMEOUT_MS = 8000;

export type FetchedResource = { bytes: Uint8Array; contentType: string; url: string; truncated: boolean };

async function assertPublicHost(url: URL) {
  if (url.protocol !== 'https:') throw new Error('Only https links can be previewed.');
  const host = url.hostname.replace(/^\[|\]$/g, '');
  const addresses = isIP(host) ? [host] : (await lookup(host, { all: true })).map((entry) => entry.address);
  if (addresses.length === 0 || !addresses.every(isPublicAddress)) throw new Error('That link points at a private address.');
}

async function readCapped(response: Response, maxBytes: number) {
  const chunks: Uint8Array[] = [];
  let size = 0;
  let truncated = false;
  const reader = response.body?.getReader();
  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    size += value.byteLength;
    if (size >= maxBytes) {
      truncated = true;
      await reader.cancel();
      break;
    }
  }
  const bytes = new Uint8Array(Math.min(size, maxBytes));
  let offset = 0;
  for (const chunk of chunks) {
    const part = chunk.subarray(0, bytes.byteLength - offset);
    bytes.set(part, offset);
    offset += part.byteLength;
  }
  return { bytes, truncated };
}

/**
 * Fetches a page or image from the public internet for a link preview. Every
 * redirect is followed by hand so each hop is checked against private addresses.
 * A host could still change its DNS between the check and the request; the
 * feature is limited to admins, which keeps that risk small.
 */
export async function fetchPublic(link: string, { accept, maxBytes }: { accept: string; maxBytes: number }): Promise<FetchedResource> {
  let url = new URL(link);
  const signal = AbortSignal.timeout(TIMEOUT_MS);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicHost(url);
    const response = await fetch(url, {
      redirect: 'manual',
      signal,
      headers: { accept, 'user-agent': 'TESLinkPreview/1.0 (+https://tes-website-pearl.vercel.app)' },
    });
    const location = response.headers.get('location');
    if (response.status >= 300 && response.status < 400 && location) {
      await response.body?.cancel();
      url = new URL(location, url);
      continue;
    }
    if (!response.ok) throw new Error(`The site answered with ${response.status}.`);
    const { bytes, truncated } = await readCapped(response, maxBytes);
    return { bytes, truncated, contentType: response.headers.get('content-type') ?? '', url: url.toString() };
  }
  throw new Error('That link redirects too many times.');
}
