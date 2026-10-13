import type { Metadata } from 'next';
import Link from 'next/link';
import { DeleteButton } from '@/components/admin/delete-button';
import { EmptyState, PageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/auth';
import { deleteRepository } from './actions';
import { ContributorsForm, RefreshButton } from './contributors-form';

export const metadata: Metadata = { title: 'GitHub' };

export default async function GitHubPage() {
  const { supabase } = await requireAdmin();
  const [{ data: repositories, error }, { data: settings }] = await Promise.all([
    supabase.from('github_repos').select('*').order('is_featured', { ascending: false }).order('sort_order').order('full_name'),
    supabase.from('github_settings').select('*').maybeSingle(),
  ]);
  if (error) throw error;

  return (
    <>
      <PageHeader eyebrow="09 / GITHUB" title="GitHub" description="Repositories and contributors under Build. Stars, forks, issues, and contributors come from GitHub and refresh every hour." action={{ href: '/admin/github/new', label: 'Add repository' }} />
      {repositories.length === 0 ? (
        <EmptyState>No repositories yet. <Link href="/admin/github/new">Add one from GitHub</Link>.</EmptyState>
      ) : (
        <table className="admin-table">
          <thead><tr><th scope="col">Repository</th><th scope="col">Title</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {repositories.map((repository) => (
              <tr key={repository.id}>
                <td><Link href={`/admin/github/${repository.id}`}>{repository.full_name}</Link></td>
                <td>{repository.title}</td>
                <td>
                  <span className="admin-status" data-published={repository.is_published}>{repository.is_published ? 'Shown' : 'Hidden'}</span>
                  {repository.is_featured && <span className="admin-status admin-status-featured" data-published="true">Featured</span>}
                </td>
                <td className="admin-row-actions">
                  <a className="admin-link" href={`https://github.com/${repository.full_name}`} target="_blank" rel="noopener noreferrer">Open</a>
                  <Link className="admin-link" href={`/admin/github/${repository.id}`}>Edit</Link>
                  <DeleteButton action={deleteRepository.bind(null, repository.id)} itemName={repository.full_name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <section className="admin-panel">
        <h2>Contributors</h2>
        <ContributorsForm settings={settings} />
      </section>
      <section className="admin-panel">
        <h2>Live numbers</h2>
        <p className="admin-field-hint">Changes on GitHub show on the site within an hour. Refresh to fetch them now.</p>
        <RefreshButton />
      </section>
    </>
  );
}
