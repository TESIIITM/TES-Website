import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/auth';
import { saveRepository } from '../actions';
import { RepositoryForm } from '../repository-form';

export const metadata: Metadata = { title: 'Edit repository' };

export default async function EditRepositoryPage({ params }: PageProps<'/admin/github/[id]'>) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data: repository } = await supabase.from('github_repos').select('*').eq('id', id).maybeSingle();
  if (!repository) notFound();

  return (
    <>
      <PageHeader eyebrow="09 / GITHUB" title={repository.full_name} back={{ href: '/admin/github', label: 'GitHub' }} />
      <RepositoryForm repository={repository} action={saveRepository.bind(null, repository.id)} />
    </>
  );
}
