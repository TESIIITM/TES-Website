'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { failed, invalid, readValues, type FormState } from '@/lib/admin/form-state';
import { publishChanges } from '@/lib/admin/publish';
import { requireAdmin, type AdminSession } from '@/lib/auth';
import { MEDIUM_TAG } from '@/lib/content/medium-data';
import { mediumPostId } from '@/lib/medium';
import type { TablesInsert } from '@/lib/supabase/database.types';
import { mediumPostIdSchema, storySchema } from '@/lib/validation';

const FIELDS = ['slug', 'title', 'category', 'summary', 'url', 'publishedOn', 'isPublished'] as const;
const LIST = '/admin/stories';
const UNIQUE_VIOLATION = '23505';

export async function saveStory(id: string | null, _previous: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const values = readValues(formData, FIELDS);
  const parsed = storySchema.safeParse({ ...values, isPublished: values.isPublished === 'on' });
  if (!parsed.success) return invalid(parsed.error, values);

  const { slug, title, category, summary, url, publishedOn, isPublished } = parsed.data;
  const row: TablesInsert<'stories'> = { slug, title, category, summary, url, published_on: publishedOn, is_published: isPublished };
  const { error } = id
    ? await supabase.from('stories').update(row).eq('id', id)
    : await supabase.from('stories').insert(row);

  if (error?.code === UNIQUE_VIOLATION) return failed('Another story already uses this slug.', values, 'slug');
  if (error) {
    console.error('Story save failed:', error.code, error.message);
    return failed('The story could not be saved. Try again.', values);
  }

  // A hidden story must also hide its feed copy, which visitors would otherwise see.
  const postId = mediumPostId(url);
  if (postId) await setMediumPostHidden(supabase, postId, !isPublished);

  publishChanges(LIST);
  redirect(LIST);
}

export async function deleteStory(id: string) {
  const { supabase } = await requireAdmin();
  const { data: story } = await supabase.from('stories').delete().eq('id', id).select('url').maybeSingle();
  // Deleting removes the story from the site, so its feed copy stays away too.
  const postId = story && mediumPostId(story.url);
  if (postId) await setMediumPostHidden(supabase, postId, true);
  publishChanges(LIST);
}

/** Hides or shows a post that comes only from the Medium feed. */
export async function setMediumPostVisibility(postId: string, hidden: boolean) {
  const { supabase } = await requireAdmin();
  const parsed = mediumPostIdSchema.safeParse(postId);
  if (!parsed.success) return;
  await setMediumPostHidden(supabase, parsed.data, hidden);
  publishChanges(LIST);
}

/** Reads the Medium feed again instead of waiting up to an hour. */
export async function refreshMediumFeed() {
  await requireAdmin();
  updateTag(MEDIUM_TAG);
  revalidatePath(LIST);
}

async function setMediumPostHidden(supabase: AdminSession['supabase'], postId: string, hidden: boolean) {
  const { data: settings } = await supabase.from('site_settings').select('hidden_medium_posts').maybeSingle();
  if (!settings) return;
  const others = settings.hidden_medium_posts.filter((id) => id !== postId);
  const next = hidden ? [...others, postId] : others;
  if (next.length === settings.hidden_medium_posts.length && hidden === settings.hidden_medium_posts.includes(postId)) return;
  const { error } = await supabase.from('site_settings').update({ hidden_medium_posts: next }).eq('id', true);
  if (error) console.error('Could not update hidden Medium posts:', error);
}
