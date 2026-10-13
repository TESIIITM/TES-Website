import type { Metadata } from 'next';
import Link from 'next/link';
import { DeleteButton } from '@/components/admin/delete-button';
import { EmptyState, PageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/auth';
import { ordinal } from '@/lib/format';
import { deleteDomain } from './actions';

export const metadata: Metadata = { title: 'Domains' };

export default async function DomainsPage() {
  const { supabase } = await requireAdmin();
  const { data: domains, error } = await supabase.from('domains').select('*').order('sort_order');
  if (error) throw error;

  return (
    <>
      <PageHeader eyebrow="07 / STACK" title="Domains" description="The technical directions listed under Build → Explore the stack." action={{ href: '/admin/domains/new', label: 'Add domain' }} />
      {domains.length === 0 ? (
        <EmptyState>No domains yet. The section is hidden on the site until you <Link href="/admin/domains/new">add one</Link>.</EmptyState>
      ) : (
        <table className="admin-table">
          <thead><tr><th scope="col">#</th><th scope="col">Title</th><th scope="col">Description</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {domains.map((domain, index) => (
              <tr key={domain.id}>
                <td className="admin-mono">{ordinal(index + 1)}</td>
                <td><Link href={`/admin/domains/${domain.id}`}>{domain.title}</Link></td>
                <td className="admin-muted">{domain.detail}</td>
                <td className="admin-row-actions">
                  <Link className="admin-link" href={`/admin/domains/${domain.id}`}>Edit</Link>
                  <DeleteButton action={deleteDomain.bind(null, domain.id)} itemName={domain.title} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
