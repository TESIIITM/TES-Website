import { describe, expect, it } from 'vitest';
import { youtubeVideoId } from '@/lib/youtube';

describe('youtubeVideoId', () => {
  it('reads the ID from every common link form', () => {
    for (const link of [
      'https://www.youtube.com/watch?v=jNQXAC9IVRw',
      'https://youtube.com/watch?v=jNQXAC9IVRw&t=42s&list=PL1',
      'https://m.youtube.com/watch?v=jNQXAC9IVRw',
      'https://youtu.be/jNQXAC9IVRw?si=share',
      'https://www.youtube.com/shorts/jNQXAC9IVRw',
      'https://www.youtube.com/live/jNQXAC9IVRw?feature=share',
      'https://www.youtube-nocookie.com/embed/jNQXAC9IVRw',
    ]) expect(youtubeVideoId(link), link).toBe('jNQXAC9IVRw');
  });

  it('refuses channels, playlists, other hosts, and malformed IDs', () => {
    for (const link of [
      'https://www.youtube.com/@tes_iiitm',
      'https://www.youtube.com/playlist?list=PL1',
      'https://youtube.com.evil.com/watch?v=jNQXAC9IVRw',
      'http://www.youtube.com/watch?v=jNQXAC9IVRw',
      'https://www.youtube.com/watch?v=short',
      'not a link',
    ]) expect(youtubeVideoId(link), link).toBeNull();
  });
});
