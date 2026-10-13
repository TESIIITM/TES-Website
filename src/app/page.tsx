import { headers } from 'next/headers';
import { hashRecorderScript } from '@/components/site/erased-hash';
import { SiteShell } from '@/components/site/site-shell';
import { getSiteContent } from '@/lib/content/queries';

export default async function HomePage() {
  const [content, requestHeaders] = await Promise.all([getSiteContent(), headers()]);
  return (
    <>
      <script nonce={requestHeaders.get('x-nonce') ?? undefined} dangerouslySetInnerHTML={{ __html: hashRecorderScript }} />
      <SiteShell content={content} />
    </>
  );
}
