import type { Metadata } from 'next';
import Link from 'next/link';
import { DeleteButton } from '@/components/admin/delete-button';
import { EmptyState, PageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/auth';
import { formatStoryDate } from '@/lib/format';
import { deleteStory } from './actions';

export const metadata: Metadata = { title: 'Stories' };

export default async function StoriesPage() {
  const { supabase } = await requireAdmin();
  const { data: stories, error } = await supabase.from('stories').select('*').order('published_on', { ascending: false });
  if (error) throw error;

  return (
    <>
      <PageHeader eyebrow="04 / KNOWLEDGE" title="Stories" description="The reading list under Learn. Each story links out to Medium." action={{ href: '/admin/stories/new', label: 'Add story' }} />
      {stories.length === 0 ? (
        <EmptyState>No stories yet. <Link href="/admin/stories/new">Add one from Medium</Link>.</EmptyState>
      ) : (
        <table className="admin-table">
          <thead><tr><th scope="col">Title</th><th scope="col">Category</th><th scope="col">Published</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {stories.map((story) => (
              <tr key={story.id}>
                <td><Link href={`/admin/stories/${story.id}`}>{story.title}</Link></td>
                <td>{story.category}</td>
                <td className="admin-nowrap">{formatStoryDate(story.published_on)}</td>
                <td><span className="admin-status" data-published={story.is_published}>{story.is_published ? 'Shown' : 'Hidden'}</span></td>
                <td className="admin-row-actions">
                  <Link className="admin-link" href={`/admin/stories/${story.id}`}>Edit</Link>
                  <DeleteButton action={deleteStory.bind(null, story.id)} itemName={`“${story.title}”`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
