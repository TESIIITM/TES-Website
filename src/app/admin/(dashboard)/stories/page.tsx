import type { Metadata } from 'next';
import Link from 'next/link';
import { DeleteButton } from '@/components/admin/delete-button';
import { EmptyState, PageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/auth';
import { getMediumPosts } from '@/lib/content/medium-data';
import { formatStoryDate } from '@/lib/format';
import { categoryFor, mediumPostId } from '@/lib/medium';
import { deleteStory, refreshMediumFeed, setMediumPostVisibility } from './actions';

export const metadata: Metadata = { title: 'Stories' };

export default async function StoriesPage() {
  const { supabase } = await requireAdmin();
  const [{ data: stories, error }, { data: settings }] = await Promise.all([
    supabase.from('stories').select('*').order('published_on', { ascending: false }),
    supabase.from('site_settings').select('medium_url, hidden_medium_posts').maybeSingle(),
  ]);
  if (error) throw error;

  const posts = settings ? await getMediumPosts(settings.medium_url) : [];
  const hidden = new Set(settings?.hidden_medium_posts ?? []);
  const saved = new Set(stories.map((story) => mediumPostId(story.url)).filter(Boolean));
  const rows = [
    ...stories.map((story) => ({ kind: 'saved' as const, date: story.published_on, story })),
    ...posts.filter((post) => !saved.has(post.id)).map((post) => ({ kind: 'feed' as const, date: post.publishedOn, post })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <PageHeader
        eyebrow="04 / STORIES"
        title="Stories"
        description="The reading list under Learn. New posts on Medium appear on their own within an hour. Edit one to change its category or summary."
        action={{ href: '/admin/stories/new', label: 'Add story' }}
      />
      <form action={refreshMediumFeed} className="admin-inline-form">
        <p>{posts.length > 0 ? `${posts.length} recent posts read from Medium.` : 'The Medium feed could not be read just now. Saved stories are still shown.'}</p>
        <button className="admin-link" type="submit">Check Medium now</button>
      </form>
      {rows.length === 0 ? (
        <EmptyState>No stories yet. <Link href="/admin/stories/new">Add one from Medium</Link>.</EmptyState>
      ) : (
        <table className="admin-table">
          <thead><tr><th scope="col">Title</th><th scope="col">Category</th><th scope="col">Published</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {rows.map((row) => {
              if (row.kind === 'saved') {
                const { story } = row;
                return (
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
                );
              }
              const { post } = row;
              const isHidden = hidden.has(post.id);
              return (
                <tr key={post.id}>
                  <td><a href={post.url} target="_blank" rel="noopener noreferrer">{post.title}</a></td>
                  <td>{categoryFor(post)}</td>
                  <td className="admin-nowrap">{formatStoryDate(post.publishedOn)}</td>
                  <td><span className="admin-status" data-published={!isHidden}>{isHidden ? 'Hidden' : 'From Medium'}</span></td>
                  <td className="admin-row-actions">
                    <Link className="admin-link" href={`/admin/stories/new?medium=${post.id}`}>Edit</Link>
                    <form action={setMediumPostVisibility.bind(null, post.id, !isHidden)}>
                      <button className="admin-link" type="submit">{isHidden ? 'Show' : 'Hide'}</button>
                    </form>
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
