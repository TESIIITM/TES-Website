import type { Metadata } from 'next';
import { PageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/auth';
import { saveDomain } from '../actions';
import { DomainForm } from '../domain-form';

export const metadata: Metadata = { title: 'Add domain' };

export default async function NewDomainPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader eyebrow="08 / STACK" title="Add domain" back={{ href: '/admin/domains', label: 'Domains' }} />
      <DomainForm action={saveDomain.bind(null, null)} />
    </>
  );
}
