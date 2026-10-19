import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/auth';
import { announcementTitle } from '@/lib/format';
import { saveAnnouncement } from '../actions';
import { AnnouncementForm } from '../announcement-form';

export const metadata: Metadata = { title: 'Edit announcement' };

export default async function EditAnnouncementPage({ params }: PageProps<'/admin/announcements/[id]'>) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data: announcement } = await supabase.from('announcements').select('*').eq('id', id).maybeSingle();
  if (!announcement) notFound();

  return (
    <>
      <PageHeader
        eyebrow="03 / ANNOUNCEMENTS"
        title={announcementTitle({ title: announcement.title, titleEmphasis: announcement.title_emphasis })}
        back={{ href: '/admin/announcements', label: 'Announcements' }}
      />
      <AnnouncementForm announcement={announcement} today={announcement.published_on} action={saveAnnouncement.bind(null, announcement.id)} />
    </>
  );
}
