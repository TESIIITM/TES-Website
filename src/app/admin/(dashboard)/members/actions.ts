'use server';

import { redirect } from 'next/navigation';
import { failed, invalid, readValues, type FormState } from '@/lib/admin/form-state';
import { removePortrait, uploadPortrait } from '@/lib/admin/portraits';
import { publishChanges } from '@/lib/admin/publish';
import { requireAdmin } from '@/lib/auth';
import type { TablesInsert } from '@/lib/supabase/database.types';
import { memberSchema } from '@/lib/validation';

const FIELDS = ['name', 'role', 'group', 'linkedinUrl', 'sortOrder', 'isPublished'] as const;
const LIST = '/admin/members';

export async function saveMember(id: string | null, _previous: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const values = readValues(formData, FIELDS);
  const parsed = memberSchema.safeParse({ ...values, isPublished: values.isPublished === 'on' });
  if (!parsed.success) return invalid(parsed.error, values);

  // `undefined` leaves the current portrait in place.
  let portraitUrl: string | null | undefined;
  const file = formData.get('portrait');
  if (file instanceof File && file.size > 0) {
    const upload = await uploadPortrait(supabase, file);
    if ('error' in upload) return failed(upload.error, values, 'portrait');
    portraitUrl = upload.url;
  } else if (formData.get('removePortrait') === 'on') {
    portraitUrl = null;
  }

  const { name, role, group, linkedinUrl, sortOrder, isPublished } = parsed.data;
  const row: TablesInsert<'members'> = {
    name,
    role,
    member_group: group,
    linkedin_url: linkedinUrl,
    sort_order: sortOrder,
    is_published: isPublished,
    ...(portraitUrl !== undefined && { portrait_url: portraitUrl }),
  };
  const replacing = id !== null && portraitUrl !== undefined;
  const previous = replacing
    ? (await supabase.from('members').select('portrait_url').eq('id', id).single()).data?.portrait_url ?? null
    : null;

  const { error } = id
    ? await supabase.from('members').update(row).eq('id', id)
    : await supabase.from('members').insert(row);

  if (error) {
    console.error('Member save failed:', error.code, error.message);
    if (portraitUrl) await removePortrait(supabase, portraitUrl);
    return failed('The member could not be saved. Try again.', values);
  }
  await removePortrait(supabase, previous);

  publishChanges(LIST);
  redirect(LIST);
}

export async function deleteMember(id: string) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('members').delete().eq('id', id).select('portrait_url').single();
  await removePortrait(supabase, data?.portrait_url ?? null);
  publishChanges(LIST);
}
