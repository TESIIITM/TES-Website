import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/auth';
import { saveVideo } from '../actions';
import { VideoForm } from '../video-form';

export const metadata: Metadata = { title: 'Edit video' };

export default async function EditVideoPage({ params }: PageProps<'/admin/videos/[id]'>) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data: video } = await supabase.from('youtube_videos').select('*').eq('id', id).maybeSingle();
  if (!video) notFound();

  return (
    <>
      <PageHeader eyebrow="07 / VIDEOS" title="Edit video" back={{ href: '/admin/videos', label: 'Videos' }} />
      <VideoForm video={video} defaultDate={video.published_on} action={saveVideo.bind(null, video.id)} />
    </>
  );
}
