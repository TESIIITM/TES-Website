'use server';

import { redirect } from 'next/navigation';
import { failed, invalid, readValues, type FormState } from '@/lib/admin/form-state';
import { publishChanges } from '@/lib/admin/publish';
import { requireAdmin } from '@/lib/auth';
import { domainSchema } from '@/lib/validation';

const FIELDS = ['title', 'detail', 'sortOrder'] as const;
const LIST = '/admin/domains';

export async function saveDomain(id: string | null, _previous: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const values = readValues(formData, FIELDS);
  const parsed = domainSchema.safeParse(values);
  if (!parsed.success) return invalid(parsed.error, values);

  const { title, detail, sortOrder } = parsed.data;
  const row = { title, detail, sort_order: sortOrder };
  const { error } = id
    ? await supabase.from('domains').update(row).eq('id', id)
    : await supabase.from('domains').insert(row);
  if (error) {
    console.error('Domain save failed:', error.code, error.message);
    return failed('The domain could not be saved. Try again.', values);
  }

  publishChanges(LIST);
  redirect(LIST);
}

export async function deleteDomain(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from('domains').delete().eq('id', id);
  publishChanges(LIST);
}
