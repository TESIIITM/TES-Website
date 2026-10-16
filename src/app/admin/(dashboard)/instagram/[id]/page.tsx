import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/auth';
import { saveInstagramPost } from '../actions';
import { InstagramForm } from '../instagram-form';

export const metadata: Metadata = { title: 'Edit post' };

export default async function EditInstagramPostPage({ params }: PageProps<'/admin/instagram/[id]'>) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data: post } = await supabase.from('instagram_posts').select('*').eq('id', id).maybeSingle();
  if (!post) notFound();

  return (
    <>
      <PageHeader eyebrow="06 / INSTAGRAM" title="Edit post" back={{ href: '/admin/instagram', label: 'Instagram' }} />
      <InstagramForm post={post} action={saveInstagramPost.bind(null, post.id)} />
    </>
  );
}
