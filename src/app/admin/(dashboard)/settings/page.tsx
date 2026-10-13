import type { Metadata } from 'next';
import { PageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/auth';
import { fallbackContent } from '@/lib/content/fallback';
import { toSiteLinks } from '@/lib/content/mappers';
import { SettingsForm } from './settings-form';

export const metadata: Metadata = { title: 'Links' };

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('site_settings').select('*').maybeSingle();
  const links = data ? toSiteLinks(data) : fallbackContent.links;

  return (
    <>
      <PageHeader eyebrow="09 / LINKS" title="Links" description="Where the site’s buttons and footer point." />
      <SettingsForm links={links} />
    </>
  );
}
