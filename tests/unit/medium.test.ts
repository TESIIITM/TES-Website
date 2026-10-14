import { describe, expect, it } from 'vitest';
import type { Story } from '@/lib/content/types';
import { categoryFor, mediumFeedUrl, mediumPostId, mergeStories, parseMediumFeed, slugFor, storyFromPost } from '@/lib/medium';

const feed = `<?xml version="1.0" encoding="UTF-8"?><rss><channel>
<title><![CDATA[Stories by TES on Medium]]></title>
<item>
  <title><![CDATA[Why We Chose Go]]></title>
  <link>https://medium.com/@tes/why-we-chose-go-e3b5c3e6d5a2?source=rss-b190e0fb7f03------2</link>
  <guid isPermaLink="false">https://medium.com/p/e3b5c3e6d5a2</guid>
  <category><![CDATA[golang]]></category>
  <pubDate>Wed, 19 Aug 2026 11:11:07 GMT</pubDate>
  <content:encoded><![CDATA[<figure><img src="x"></figure><p></p><p><em>A deep dive</em> into Go &amp; why it&#8217;s fast.</p><p>Second.</p>]]></content:encoded>
</item>
<item>
  <title><![CDATA[Untitled date]]></title>
  <link>https://medium.com/@tes/no-date-aaaaaaaaaaaa</link>
</item>
<item>
  <title>When AI Helps</title>
  <link>https://medium.com/@tes/when-ai-helps-0123456789ab</link>
  <pubDate>Mon, 06 Apr 2026 13:31:01 GMT</pubDate>
</item>
</channel></rss>`;

describe('mediumFeedUrl', () => {
  it('finds the feed for profiles, publications, and custom domains', () => {
    expect(mediumFeedUrl('https://medium.com/@tes.abviiitm')).toBe('https://medium.com/feed/@tes.abviiitm');
    expect(mediumFeedUrl('https://medium.com/some-publication/')).toBe('https://medium.com/feed/some-publication');
    expect(mediumFeedUrl('https://blog.example.org')).toBe('https://blog.example.org/feed');
    expect(mediumFeedUrl('https://medium.com/')).toBeNull();
    expect(mediumFeedUrl('http://medium.com/@tes')).toBeNull();
    expect(mediumFeedUrl('not a link')).toBeNull();
  });
});

describe('mediumPostId', () => {
  it('reads the id from post links and short links', () => {
    expect(mediumPostId('https://medium.com/@tes.abviiitm/understanding-open-source-e003193b0fe9')).toBe('e003193b0fe9');
    expect(mediumPostId('https://medium.com/p/e3b5c3e6d5a2')).toBe('e3b5c3e6d5a2');
    expect(mediumPostId('https://medium.com/@tes/post-e3b5c3e6d5a2?source=rss')).toBe('e3b5c3e6d5a2');
    expect(mediumPostId('https://medium.com/@tes')).toBeNull();
  });
});

describe('parseMediumFeed', () => {
  it('reads posts and skips items without a date', () => {
    const posts = parseMediumFeed(feed);
    expect(posts).toEqual([
      { id: 'e3b5c3e6d5a2', title: 'Why We Chose Go', url: 'https://medium.com/@tes/why-we-chose-go-e3b5c3e6d5a2', publishedOn: '2026-08-19', tags: ['golang'], summary: 'A deep dive into Go & why it’s fast.' },
      { id: '0123456789ab', title: 'When AI Helps', url: 'https://medium.com/@tes/when-ai-helps-0123456789ab', publishedOn: '2026-04-06', tags: [], summary: '' },
    ]);
  });

  it('shortens long opening paragraphs at a word', () => {
    const long = feed.replace('<em>A deep dive</em> into Go &amp; why it&#8217;s fast.', 'word '.repeat(60));
    const [post] = parseMediumFeed(long);
    expect(post.summary.length).toBeLessThanOrEqual(180);
    expect(post.summary).toMatch(/word…$/);
  });
});

describe('categoryFor', () => {
  it('maps tags, then the title, to a reading-list filter', () => {
    expect(categoryFor({ tags: ['open-source-contribution'], title: 'x' })).toBe('Open source');
    expect(categoryFor({ tags: ['gsoc'], title: 'x' })).toBe('Open source');
    expect(categoryFor({ tags: ['generative-ai'], title: 'x' })).toBe('AI');
    expect(categoryFor({ tags: [], title: 'The Hidden Cost of AI' })).toBe('AI');
    expect(categoryFor({ tags: ['paint'], title: 'Maintaining things' })).toBe('Development');
  });
});

describe('slugFor', () => {
  it('drops the id from the link slug', () => {
    expect(slugFor({ id: 'e3b5c3e6d5a2', url: 'https://medium.com/@tes/why-we-chose-go-e3b5c3e6d5a2' })).toBe('why-we-chose-go');
    expect(slugFor({ id: 'e3b5c3e6d5a2', url: 'https://medium.com/p/e3b5c3e6d5a2' })).toBe('medium-e3b5c3e6d5a2');
  });
});

describe('mergeStories', () => {
  const [go, ai] = parseMediumFeed(feed);
  const saved: Story = { id: 'row', slug: 'go', title: 'Go, edited', category: 'Development', summary: 'Edited.', url: 'https://medium.com/@tes/why-we-chose-go-e3b5c3e6d5a2', publishedOn: '2026-08-19' };
  const older: Story = { ...saved, id: 'old', slug: 'old', url: 'https://medium.com/@tes/old-111111111111', publishedOn: '2026-01-01' };

  it('adds feed posts newest first, with a summary even when the post has none', () => {
    const stories = mergeStories([older], [go, ai], []);
    expect(stories.map((story) => story.id)).toEqual(['medium-e3b5c3e6d5a2', 'medium-0123456789ab', 'old']);
    expect(stories[1].summary).toBe('Read the full story on Medium.');
  });

  it('prefers a saved story to its feed copy and leaves hidden posts out', () => {
    expect(mergeStories([saved], [go, ai], ['0123456789ab'])).toEqual([saved]);
  });

  it('never shows two stories with the same slug', () => {
    const clash = { ...older, slug: storyFromPost(ai).slug };
    expect(mergeStories([clash], [ai], []).map((story) => story.id)).toEqual(['old']);
  });
});
