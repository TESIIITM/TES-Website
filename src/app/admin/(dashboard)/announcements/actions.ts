'use server';

import { redirect } from 'next/navigation';
import { failed, invalid, readValues, type FormState } from '@/lib/admin/form-state';
import { publishChanges } from '@/lib/admin/publish';
import { requireAdmin } from '@/lib/auth';
import type { TablesInsert } from '@/lib/supabase/database.types';
import { announcementSchema } from '@/lib/validation';

const FIELDS = [
  'label', 'title', 'titleEmphasis', 'summary', 'details',
  'primaryLabel', 'primaryUrl', 'secondaryLabel', 'secondaryUrl',
  'publishedOn', 'isPublished',
] as const;
const LIST = '/admin/announcements';

export async function saveAnnouncement(id: string | null, _previous: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const values = readValues(formData, FIELDS);
  const parsed = announcementSchema.safeParse({ ...values, isPublished: values.isPublished === 'on' });
  if (!parsed.success) return invalid(parsed.error, values);

  const data = parsed.data;
  const row: TablesInsert<'announcements'> = {
    label: data.label,
    title: data.title,
    title_emphasis: data.titleEmphasis,
    summary: data.summary,
    details: data.details,
    primary_label: data.primaryLabel,
    primary_url: data.primaryUrl,
    secondary_label: data.secondaryLabel,
    secondary_url: data.secondaryUrl,
    published_on: data.publishedOn,
    is_published: data.isPublished,
  };
  const { error } = id
    ? await supabase.from('announcements').update(row).eq('id', id)
    : await supabase.from('announcements').insert(row);
  if (error) {
    console.error('Announcement save failed:', error.code, error.message);
    return failed('The announcement could not be saved. Try again.', values);
  }

  publishChanges(LIST);
  redirect(LIST);
}

export async function deleteAnnouncement(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from('announcements').delete().eq('id', id);
  publishChanges(LIST);
}
