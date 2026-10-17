'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { after } from 'next/server';
import { failed, invalid, readValues, type FormState } from '@/lib/admin/form-state';
import { requireAdmin } from '@/lib/auth';
import type { Json } from '@/lib/supabase/database.types';
import { loadCriteria, processApplication } from '@/lib/recruitment/server';
import { applicationReviewSchema, recruitmentSettingsSchema } from '@/lib/validation';

const LIST = '/admin/applications';

export async function saveReview(id: string, _previous: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const criteria = await loadCriteria(supabase);
  const keys = criteria.map((criterion) => criterion.key);
  const values = readValues(formData, ['status', 'adminNotes', ...keys.map((key) => `score_${key}`)]);
  const parsed = applicationReviewSchema(keys).safeParse(values);
  if (!parsed.success) return invalid(parsed.error, values);

  const data = parsed.data as Record<string, unknown> & { status: string; adminNotes: string | null };
  const adminScores: Record<string, number> = {};
  for (const key of keys) {
    const score = data[`score_${key}`];
    if (typeof score === 'number') adminScores[key] = score;
  }

  const { error } = await supabase.from('applications').update({
    status: parsed.data.status,
    admin_notes: data.adminNotes,
    admin_scores: adminScores as NonNullable<Json>,
  }).eq('id', id);
  if (error) {
    console.error('Application review save failed:', error.code, error.message);
    return failed('The review could not be saved. Try again.', values);
  }

  revalidatePath(LIST);
  revalidatePath(`${LIST}/${id}`);
  return { status: 'saved', message: 'Review saved.', values };
}

/** Runs the AI evaluation again, e.g. after it failed or the rubric changed. */
export async function rerunEvaluation(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from('applications').update({ ai_status: 'pending', ai_error: null }).eq('id', id);
  after(() => processApplication(id, { checks: true, ai: true }));
  revalidatePath(`${LIST}/${id}`);
}

export async function resendConfirmation(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from('applications').update({ email_status: 'pending', email_error: null }).eq('id', id);
  after(() => processApplication(id, { email: true }));
  revalidatePath(`${LIST}/${id}`);
}

/** Removes the application and its resume, e.g. when a student asks for their data to be deleted. */
export async function deleteApplication(id: string) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('applications').select('resume_path').eq('id', id).maybeSingle();
  if (data?.resume_path) {
    const { error } = await supabase.storage.from('resumes').remove([data.resume_path]);
    if (error) console.error('Resume delete failed:', error.message);
  }
  const { error } = await supabase.from('applications').delete().eq('id', id);
  if (error) {
    console.error('Application delete failed:', error.code, error.message);
    return;
  }
  revalidatePath(LIST);
  redirect(LIST);
}

export async function saveRecruitmentSettings(_previous: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const criteria = await loadCriteria(supabase);
  const keys = criteria.map((criterion) => criterion.key);
  const values = readValues(formData, ['isOpen', 'departments', ...keys.map((key) => `weight_${key}`)]);
  const parsed = recruitmentSettingsSchema(keys).safeParse({ ...values, isOpen: values.isOpen === 'on' });
  if (!parsed.success) return invalid(parsed.error, values);

  const data = parsed.data as Record<string, unknown> & { isOpen: boolean; departments: string[] };
  const results = await Promise.all([
    supabase.from('recruitment_settings').update({ is_open: data.isOpen, departments: data.departments }).eq('id', true),
    ...keys.map((key) => supabase.from('recruitment_criteria').update({ weight: data[`weight_${key}`] as number }).eq('key', key)),
  ]);
  const failure = results.find((result) => result.error)?.error;
  if (failure) {
    console.error('Recruitment settings save failed:', failure.code, failure.message);
    return failed('The settings could not be saved. Try again.', values);
  }

  revalidatePath(LIST);
  revalidatePath('/join');
  return { status: 'saved', message: 'Saved. The form and scores use the new settings.', values };
}
