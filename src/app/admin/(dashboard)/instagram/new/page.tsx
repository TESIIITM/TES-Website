import type { Metadata } from 'next';
import { PageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/auth';
import { saveInstagramPost } from '../actions';
import { InstagramForm } from '../instagram-form';

export const metadata: Metadata = { title: 'Add post' };

export default async function NewInstagramPostPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader eyebrow="06 / INSTAGRAM" title="Add post" back={{ href: '/admin/instagram', label: 'Instagram' }} />
      <InstagramForm action={saveInstagramPost.bind(null, null)} />
    </>
  );
}
