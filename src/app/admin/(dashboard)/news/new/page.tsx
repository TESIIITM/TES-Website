import type { Metadata } from 'next';
import { PageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/auth';
import { weekStart } from '@/lib/format';
import { saveTechNews } from '../actions';
import { TechNewsForm } from '../news-form';

export const metadata: Metadata = { title: 'Add link' };

export default async function NewTechNewsPage() {
  await requireAdmin();
  const today = new Date().toISOString().slice(0, 10);
  return (
    <>
      <PageHeader eyebrow="05 / DIGEST" title="Add link" back={{ href: '/admin/news', label: 'Tech news' }} />
      <TechNewsForm defaultWeek={weekStart(today)} action={saveTechNews.bind(null, null)} />
    </>
  );
}
