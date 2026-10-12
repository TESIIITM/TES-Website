'use server';

import { redirect } from 'next/navigation';
import { failed, invalid, readValues, type FormState } from '@/lib/admin/form-state';
import { publishChanges } from '@/lib/admin/publish';
import { requireAdmin } from '@/lib/auth';
import type { TablesInsert } from '@/lib/supabase/database.types';
import { storySchema } from '@/lib/validation';

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
  if (error) return failed('The story could not be saved. Try again.', values);

  publishChanges(LIST);
  redirect(LIST);
}

export async function deleteStory(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from('stories').delete().eq('id', id);
  publishChanges(LIST);
}
