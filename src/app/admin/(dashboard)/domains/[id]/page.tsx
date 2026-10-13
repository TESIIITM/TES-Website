import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/auth';
import { saveDomain } from '../actions';
import { DomainForm } from '../domain-form';

export const metadata: Metadata = { title: 'Edit domain' };

export default async function EditDomainPage({ params }: PageProps<'/admin/domains/[id]'>) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data: domain } = await supabase.from('domains').select('*').eq('id', id).maybeSingle();
  if (!domain) notFound();

  return (
    <>
      <PageHeader eyebrow="07 / STACK" title={domain.title} back={{ href: '/admin/domains', label: 'Domains' }} />
      <DomainForm domain={domain} action={saveDomain.bind(null, domain.id)} />
    </>
  );
}
