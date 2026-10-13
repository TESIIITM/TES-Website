const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

/**
 * The video ID from any YouTube link people copy: watch pages, youtu.be share
 * links, Shorts, live streams, and embeds. `null` if the link is not a video.
 */
export function youtubeVideoId(link: string): string | null {
  let url: URL;
  try {
    url = new URL(link.trim());
  } catch {
    return null;
  }
  if (url.protocol !== 'https:') return null;
  const host = url.hostname.replace(/^(www|m|music)\./, '');
  let id: string | null | undefined;
  if (host === 'youtu.be') id = url.pathname.split('/')[1];
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    id = url.pathname === '/watch' ? url.searchParams.get('v') : url.pathname.match(/^\/(?:shorts|live|embed)\/([^/]+)/)?.[1];
  }
  return id && VIDEO_ID.test(id) ? id : null;
}

export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/** Largest first. `maxresdefault` only exists for HD uploads. */
export function youtubeThumbnailUrls(videoId: string): string[] {
  return ['maxresdefault', 'sddefault', 'hqdefault'].map((name) => `https://i.ytimg.com/vi/${videoId}/${name}.jpg`);
}
