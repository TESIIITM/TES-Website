import 'server-only';
import { fetchPublic } from './fetch-public';
import { detectImageType } from './image-type';
import { readPageMetadata, type PageMetadata } from './page-metadata';
import { MAX_IMAGE_BYTES } from './storage-images';

// Metadata lives in <head>; the first few hundred kilobytes are plenty.
const MAX_PAGE_BYTES = 512 * 1024;

export class PreviewError extends Error {}

function describe(error: unknown): string {
  if (error instanceof Error && /^(Only https|That link)/.test(error.message)) return error.message;
  // Some sites refuse requests that don't come from a browser.
  const reason = error instanceof Error && error.name === 'TimeoutError' ? 'The site took too long to answer.'
    : error instanceof Error && error.message.startsWith('The site') ? error.message
    : 'The link could not be reached.';
  return `${reason} Fill in the details by hand.`;
}

/** Title, summary, source, and share image for a link, read from the page itself. */
export async function readLinkPreview(link: string): Promise<PageMetadata> {
  let page;
  try {
    page = await fetchPublic(link, { accept: 'text/html,application/xhtml+xml', maxBytes: MAX_PAGE_BYTES });
  } catch (error) {
    throw new PreviewError(describe(error));
  }
  if (!/html/i.test(page.contentType)) throw new PreviewError('That link is not a web page.');
  return readPageMetadata(new TextDecoder().decode(page.bytes), page.url);
}

/** The share image's bytes, or `null` if it is missing, too large, or not a JPEG, PNG, or WebP. */
export async function downloadPreviewImage(url: string): Promise<{ bytes: Uint8Array; type: string } | null> {
  try {
    const image = await fetchPublic(url, { accept: 'image/webp,image/png,image/jpeg', maxBytes: MAX_IMAGE_BYTES + 1 });
    const type = detectImageType(image.bytes)?.type;
    return image.truncated || !type ? null : { bytes: image.bytes, type };
  } catch {
    return null;
  }
}
