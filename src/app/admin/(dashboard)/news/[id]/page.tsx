import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/auth';
import { saveTechNews } from '../actions';
import { TechNewsForm } from '../news-form';

export const metadata: Metadata = { title: 'Edit link' };

export default async function EditTechNewsPage({ params }: PageProps<'/admin/news/[id]'>) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data: item } = await supabase.from('tech_news').select('*').eq('id', id).maybeSingle();
  if (!item) notFound();

  return (
    <>
      <PageHeader eyebrow="05 / TECH NEWS" title="Edit link" back={{ href: '/admin/news', label: 'Tech news' }} />
      <TechNewsForm item={item} defaultWeek={item.week_of} action={saveTechNews.bind(null, item.id)} />
    </>
  );
}
