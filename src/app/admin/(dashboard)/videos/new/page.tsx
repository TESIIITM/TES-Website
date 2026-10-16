import type { Metadata } from 'next';
import { PageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/auth';
import { saveVideo } from '../actions';
import { VideoForm } from '../video-form';

export const metadata: Metadata = { title: 'Add video' };

export default async function NewVideoPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader eyebrow="07 / VIDEOS" title="Add video" back={{ href: '/admin/videos', label: 'Videos' }} />
      <VideoForm defaultDate={new Date().toISOString().slice(0, 10)} action={saveVideo.bind(null, null)} />
    </>
  );
}
