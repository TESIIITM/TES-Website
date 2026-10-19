import type { Metadata } from 'next';
import Link from 'next/link';
import { DeleteButton } from '@/components/admin/delete-button';
import { EmptyState, PageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/auth';
import { formatStoryDate } from '@/lib/format';
import { deleteTechNews } from './actions';

export const metadata: Metadata = { title: 'Tech news' };

export default async function TechNewsPage() {
  const { supabase } = await requireAdmin();
  const { data: items, error } = await supabase
    .from('tech_news')
    .select('*')
    .order('week_of', { ascending: false })
    .order('sort_order')
    .order('created_at');
  if (error) throw error;

  return (
    <>
      <PageHeader eyebrow="05 / TECH NEWS" title="Tech news" description="This week’s links, shown above The People. Only the latest week is on the site." action={{ href: '/admin/news/new', label: 'Add link' }} />
      {items.length === 0 ? (
        <EmptyState>No links yet. <Link href="/admin/news/new">Add this week’s first one</Link>.</EmptyState>
      ) : (
        <table className="admin-table">
          <thead><tr><th scope="col">Title</th><th scope="col">Source</th><th scope="col">Week of</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td><Link href={`/admin/news/${item.id}`}>{item.title}</Link></td>
                <td>{item.source}</td>
                <td className="admin-nowrap">{formatStoryDate(item.week_of)}</td>
                <td><span className="admin-status" data-published={item.is_published}>{item.is_published ? 'Shown' : 'Hidden'}</span></td>
                <td className="admin-row-actions">
                  <Link className="admin-link" href={`/admin/news/${item.id}`}>Edit</Link>
                  <DeleteButton action={deleteTechNews.bind(null, item.id)} itemName={`“${item.title}”`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
