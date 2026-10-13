import 'server-only';
import { fetchPublic } from './fetch-public';
import { PreviewError } from './link-preview';
import { shorten } from './page-metadata';
import { youtubeWatchUrl } from '@/lib/youtube';

/** Title and channel from YouTube's oEmbed endpoint, which needs no API key. */
export async function readYouTubeVideo(videoId: string): Promise<{ title: string | null; channel: string | null }> {
  const endpoint = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(youtubeWatchUrl(videoId))}`;
  let body: { title?: unknown; author_name?: unknown };
  try {
    const response = await fetchPublic(endpoint, { accept: 'application/json', maxBytes: 64 * 1024 });
    body = JSON.parse(new TextDecoder().decode(response.bytes));
  } catch (error) {
    // oEmbed answers 401 for private videos and 404 for missing ones.
    if (error instanceof Error && /answered with 40[14]/.test(error.message)) throw new PreviewError('That video is private or does not exist.');
    throw new PreviewError('YouTube could not be reached. Fill in the details by hand.');
  }
  const text = (value: unknown, max: number) => (typeof value === 'string' && value.trim() ? shorten(value.trim(), max) : null);
  return { title: text(body.title, 200), channel: text(body.author_name, 80) };
}
