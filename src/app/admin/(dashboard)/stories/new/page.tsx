import type { Metadata } from 'next';
import { PageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/auth';
import { saveStory } from '../actions';
import { getStoryCategories } from '../categories';
import { StoryForm } from '../story-form';

export const metadata: Metadata = { title: 'Add story' };

export default async function NewStoryPage() {
  const { supabase } = await requireAdmin();
  const categories = await getStoryCategories(supabase);
  return (
    <>
      <PageHeader eyebrow="04 / KNOWLEDGE" title="Add story" back={{ href: '/admin/stories', label: 'Stories' }} />
      <StoryForm categories={categories} action={saveStory.bind(null, null)} />
    </>
  );
}
