import type { Metadata } from 'next';
import { PageHeader } from '@/components/admin/page-header';
import { requireAdmin, type AdminSession } from '@/lib/auth';
import { getMediumPosts } from '@/lib/content/medium-data';
import { storyFromPost } from '@/lib/medium';
import { saveStory } from '../actions';
import { getStoryCategories } from '../categories';
import { StoryForm, type StoryValues } from '../story-form';

export const metadata: Metadata = { title: 'Add story' };

/** The form filled in from a feed post, when the dashboard links here with `?medium=<id>`. */
async function fromMedium(supabase: AdminSession['supabase'], postId: unknown): Promise<StoryValues | undefined> {
  if (typeof postId !== 'string') return undefined;
  const { data: settings } = await supabase.from('site_settings').select('medium_url').maybeSingle();
  const post = settings && (await getMediumPosts(settings.medium_url)).find((item) => item.id === postId);
  if (!post) return undefined;
  const story = storyFromPost(post);
  return { title: story.title, url: story.url, summary: story.summary, category: story.category, published_on: story.publishedOn, slug: story.slug, is_published: true };
}

export default async function NewStoryPage({ searchParams }: PageProps<'/admin/stories/new'>) {
  const { supabase } = await requireAdmin();
  const [categories, draft] = await Promise.all([getStoryCategories(supabase), searchParams.then(({ medium }) => fromMedium(supabase, medium))]);
  return (
    <>
      <PageHeader eyebrow="04 / KNOWLEDGE" title="Add story" back={{ href: '/admin/stories', label: 'Stories' }} />
      <StoryForm story={draft} isNew categories={categories} action={saveStory.bind(null, null)} />
    </>
  );
}
