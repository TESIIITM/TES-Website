import type { Metadata } from 'next';
import { PageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/auth';
import { saveAnnouncement } from '../actions';
import { AnnouncementForm } from '../announcement-form';

export const metadata: Metadata = { title: 'Add announcement' };

export default async function NewAnnouncementPage() {
  await requireAdmin();
  const today = new Date().toISOString().slice(0, 10);
  return (
    <>
      <PageHeader eyebrow="03 / ANNOUNCEMENTS" title="Add announcement" back={{ href: '/admin/announcements', label: 'Announcements' }} />
      <AnnouncementForm today={today} action={saveAnnouncement.bind(null, null)} />
    </>
  );
}
