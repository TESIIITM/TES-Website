import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/auth';
import { saveStory } from '../actions';
import { getStoryCategories } from '../categories';
import { StoryForm } from '../story-form';

export const metadata: Metadata = { title: 'Edit story' };

export default async function EditStoryPage({ params }: PageProps<'/admin/stories/[id]'>) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const [{ data: story }, categories] = await Promise.all([
    supabase.from('stories').select('*').eq('id', id).maybeSingle(),
    getStoryCategories(supabase),
  ]);
  if (!story) notFound();

  return (
    <>
      <PageHeader eyebrow="04 / STORIES" title="Edit story" back={{ href: '/admin/stories', label: 'Stories' }} />
      <StoryForm story={story} categories={categories} action={saveStory.bind(null, story.id)} />
    </>
  );
}
