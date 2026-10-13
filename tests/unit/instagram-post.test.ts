import { describe, expect, it } from 'vitest';
import { instagramPostUrl, readInstagramPost } from '@/lib/admin/instagram-post';

describe('instagramPostUrl', () => {
  it('stores posts and reels in one form', () => {
    expect(instagramPostUrl('https://www.instagram.com/p/DebyxJhpKvD/')).toBe('https://www.instagram.com/p/DebyxJhpKvD/');
    expect(instagramPostUrl('https://instagram.com/tes_iiitm/p/DeFjXczE841?igsh=abc')).toBe('https://www.instagram.com/p/DeFjXczE841/');
    expect(instagramPostUrl('https://www.instagram.com/reel/C1a-b_2/')).toBe('https://www.instagram.com/reel/C1a-b_2/');
  });

  it('refuses profiles, other hosts, and plain http', () => {
    expect(instagramPostUrl('https://www.instagram.com/tes_iiitm/')).toBeNull();
    expect(instagramPostUrl('https://evil.com/p/abc/')).toBeNull();
    expect(instagramPostUrl('https://instagram.com.evil.com/p/abc/')).toBeNull();
    expect(instagramPostUrl('http://www.instagram.com/p/abc/')).toBeNull();
    expect(instagramPostUrl('not a link')).toBeNull();
  });
});

describe('readInstagramPost', () => {
  it('reads the caption and date from the preview summary', () => {
    const post = readInstagramPost({
      title: 'The Enigma Society IIITM on Instagram: "ignored"',
      summary: '14 likes, 0 comments - tes_iiitm on October 3, 2026: "𝗜𝗻𝘁𝗿𝗼𝗱𝘂𝗰𝗶𝗻𝗴 Tuesday Tech News\nby TES".',
      source: 'Instagram',
      imageUrl: null,
    });
    expect(post).toEqual({ caption: 'Introducing Tuesday Tech News by TES', postedOn: '2026-10-03' });
  });

  it('falls back to the title when the summary has no date', () => {
    const post = readInstagramPost({ title: 'TES on Instagram: "GSoC 2026 🎉"', summary: null, source: 'Instagram', imageUrl: null });
    expect(post).toEqual({ caption: 'GSoC 2026 🎉', postedOn: null });
  });
});
