import { SiteShell } from '@/components/site/site-shell';
import { getSiteContent } from '@/lib/content/queries';

export default async function HomePage() {
  const content = await getSiteContent();
  return <SiteShell content={content} />;
}
