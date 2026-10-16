import type { Metadata } from 'next';
import Link from 'next/link';
import { DeleteButton } from '@/components/admin/delete-button';
import { EmptyState, PageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/auth';
import { formatStoryDate } from '@/lib/format';
import { youtubeWatchUrl } from '@/lib/youtube';
import { deleteVideo } from './actions';

export const metadata: Metadata = { title: 'Videos' };

export default async function VideosPage() {
  const { supabase } = await requireAdmin();
  const { data: videos, error } = await supabase.from('youtube_videos').select('*').order('published_on', { ascending: false });
  if (error) throw error;

  return (
    <>
      <PageHeader eyebrow="07 / VIDEOS" title="Videos" description="YouTube videos under Learn. The three newest shown videos are on the site." action={{ href: '/admin/videos/new', label: 'Add video' }} />
      {videos.length === 0 ? (
        <EmptyState>No videos yet. <Link href="/admin/videos/new">Add one from YouTube</Link>.</EmptyState>
      ) : (
        <table className="admin-table">
          <thead><tr><th scope="col">Title</th><th scope="col">Channel</th><th scope="col">Date</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {videos.map((video) => (
              <tr key={video.id}>
                <td><Link href={`/admin/videos/${video.id}`}>{video.title}</Link></td>
                <td>{video.channel}</td>
                <td className="admin-nowrap">{formatStoryDate(video.published_on)}</td>
                <td><span className="admin-status" data-published={video.is_published}>{video.is_published ? 'Shown' : 'Hidden'}</span></td>
                <td className="admin-row-actions">
                  <a className="admin-link" href={youtubeWatchUrl(video.video_id)} target="_blank" rel="noopener noreferrer">Open</a>
                  <Link className="admin-link" href={`/admin/videos/${video.id}`}>Edit</Link>
                  <DeleteButton action={deleteVideo.bind(null, video.id)} itemName={`“${video.title}”`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
