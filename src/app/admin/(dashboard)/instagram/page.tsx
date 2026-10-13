import type { Metadata } from 'next';
import Link from 'next/link';
import { DeleteButton } from '@/components/admin/delete-button';
import { EmptyState, PageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/auth';
import { formatStoryDate } from '@/lib/format';
import { deleteInstagramPost } from './actions';

export const metadata: Metadata = { title: 'Instagram' };

export default async function InstagramPage() {
  const { supabase } = await requireAdmin();
  const { data: posts, error } = await supabase.from('instagram_posts').select('*').order('posted_on', { ascending: false });
  if (error) throw error;

  return (
    <>
      <PageHeader eyebrow="06 / INSTAGRAM" title="Instagram" description="Post previews under Gather. The four newest shown posts are on the site." action={{ href: '/admin/instagram/new', label: 'Add post' }} />
      {posts.length === 0 ? (
        <EmptyState>No posts yet. <Link href="/admin/instagram/new">Add one from Instagram</Link>.</EmptyState>
      ) : (
        <table className="admin-table">
          <thead><tr><th scope="col">Caption</th><th scope="col">Posted</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td><Link href={`/admin/instagram/${post.id}`}>{post.caption ?? post.url}</Link></td>
                <td className="admin-nowrap">{formatStoryDate(post.posted_on)}</td>
                <td><span className="admin-status" data-published={post.is_published}>{post.is_published ? 'Shown' : 'Hidden'}</span></td>
                <td className="admin-row-actions">
                  <a className="admin-link" href={post.url} target="_blank" rel="noopener noreferrer">Open</a>
                  <Link className="admin-link" href={`/admin/instagram/${post.id}`}>Edit</Link>
                  <DeleteButton action={deleteInstagramPost.bind(null, post.id)} itemName="this post" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
