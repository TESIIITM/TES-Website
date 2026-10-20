import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import '@fontsource-variable/inter/wght.css';
import '@/styles/reset.css';
import '@/styles/site.css';
import '@/styles/tech-news.css';
import '@/styles/instagram-posts.css';
import '@/styles/videos.css';
import '@/styles/github.css';
import '@/styles/layout.css';
import '@/styles/join.css';
import '@/styles/hero.css';
import { themeInitScript } from '@/lib/theme';

export const metadata: Metadata = {
  title: {
    default: 'The Enigma Society — Find your next commit',
    template: '%s · The Enigma Society',
  },
  description: 'The Enigma Society at ABV-IIITM Gwalior. Learn together, build in public, and contribute to open source.',
  icons: { icon: { url: '/favicon.svg', type: 'image/svg+xml' } },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return (
    // The theme script sets data-theme before hydration.
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
