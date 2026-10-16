import type { Metadata } from 'next';
import Link from 'next/link';
import { DeleteButton } from '@/components/admin/delete-button';
import { EmptyState, PageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/auth';
import { announcementTitle, formatStoryDate } from '@/lib/format';
import { deleteAnnouncement } from './actions';

export const metadata: Metadata = { title: 'Announcements' };

export default async function AnnouncementsPage() {
  const { supabase } = await requireAdmin();
  const { data: announcements, error } = await supabase.from('announcements').select('*').order('published_on', { ascending: false });
  if (error) throw error;
  const featuredId = announcements.find((item) => item.is_published)?.id;

  return (
    <>
      <PageHeader
        eyebrow="03 / EVENTS"
        title="Announcements"
        description="The newest published announcement is featured under Gather. The next three are listed below it."
        action={{ href: '/admin/announcements/new', label: 'New announcement' }}
      />
      {announcements.length === 0 ? (
        <EmptyState>Nothing announced yet. <Link href="/admin/announcements/new">Post the first announcement</Link>.</EmptyState>
      ) : (
        <table className="admin-table">
          <thead><tr><th scope="col">Title</th><th scope="col">Date</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {announcements.map((item) => {
              const title = announcementTitle({ title: item.title, titleEmphasis: item.title_emphasis });
              return (
                <tr key={item.id}>
                  <td><Link href={`/admin/announcements/${item.id}`}>{title}</Link><small>{item.label}</small></td>
                  <td className="admin-nowrap">{formatStoryDate(item.published_on)}</td>
                  <td>
                    <span className="admin-status" data-published={item.is_published}>
                      {item.id === featuredId ? 'Featured' : item.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="admin-row-actions">
                    <Link className="admin-link" href={`/admin/announcements/${item.id}`}>Edit</Link>
                    <DeleteButton action={deleteAnnouncement.bind(null, item.id)} itemName={title} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
}
