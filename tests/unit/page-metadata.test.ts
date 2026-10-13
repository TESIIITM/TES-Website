import { describe, expect, it } from 'vitest';
import { readPageMetadata } from '@/lib/admin/page-metadata';

const page = (head: string) => `<!doctype html><html><head>${head}</head><body><meta property="og:title" content="Not in head"></body></html>`;

describe('readPageMetadata', () => {
  it('prefers Open Graph tags and resolves the image against the page', () => {
    const html = page(`
      <title>Fallback title</title>
      <meta property="og:title" content="Rust in the &quot;kernel&quot; &amp; beyond">
      <meta content='A look at what shipped.' property='og:description'>
      <meta property="og:site_name" content="LWN.net">
      <meta property="og:image" content="/images/rust.png">`);
    expect(readPageMetadata(html, 'https://lwn.net/Articles/1/')).toEqual({
      title: 'Rust in the "kernel" & beyond',
      summary: 'A look at what shipped.',
      source: 'LWN.net',
      imageUrl: 'https://lwn.net/images/rust.png',
    });
  });

  it('falls back to Twitter cards, plain HTML, and the host name', () => {
    const html = page(`<title> Plain   title </title><meta name="description" content="Plain summary"><meta name="twitter:image" content="https://cdn.example.com/a.jpg">`);
    expect(readPageMetadata(html, 'https://www.example.com/post')).toEqual({
      title: 'Plain title',
      summary: 'Plain summary',
      source: 'example.com',
      imageUrl: 'https://cdn.example.com/a.jpg',
    });
  });

  it('ignores insecure images and returns nulls for a bare page', () => {
    const html = page('<meta property="og:image" content="http://example.com/a.jpg">');
    expect(readPageMetadata(html, 'https://example.com/')).toEqual({ title: null, summary: null, source: 'example.com', imageUrl: null });
  });

  it('shortens long text at a word boundary', () => {
    const html = page(`<meta property="og:description" content="${'word '.repeat(200)}">`);
    const { summary } = readPageMetadata(html, 'https://example.com/');
    expect(summary!.length).toBeLessThanOrEqual(400);
    expect(summary).toMatch(/word…$/);
  });

  it('decodes numeric entities', () => {
    expect(readPageMetadata(page('<title>It&#39;s &#x2014; done</title>'), 'https://example.com/').title).toBe("It's — done");
  });
});
