import type { Metadata } from 'next';
import { PageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/auth';
import { saveRepository } from '../actions';
import { RepositoryForm } from '../repository-form';

export const metadata: Metadata = { title: 'Add repository' };

export default async function NewRepositoryPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader eyebrow="09 / GITHUB" title="Add repository" back={{ href: '/admin/github', label: 'GitHub' }} />
      <RepositoryForm action={saveRepository.bind(null, null)} />
    </>
  );
}
