'use server';

import { redirect } from 'next/navigation';
import { failed, invalid, readValues, type FormState } from '@/lib/admin/form-state';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { createSessionClient } from '@/lib/supabase/server';
import { signInSchema } from '@/lib/validation';

export async function signIn(_previous: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return failed('Supabase is not configured for this deployment.');

  const values = readValues(formData, ['email']);
  const parsed = signInSchema.safeParse({ email: formData.get('email'), password: formData.get('password') });
  if (!parsed.success) return invalid(parsed.error, values);

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    // Anything other than bad credentials is a configuration or service problem worth seeing in the logs.
    if (error.code !== 'invalid_credentials') console.error('Sign-in failed:', error.code, error.message);
    // Supabase rate-limits attempts; keep the message the same for every failure.
    return failed('That email and password did not match an account.', values);
  }

  const { data: isAdmin, error: adminCheckError } = await supabase.rpc('is_admin');
  if (adminCheckError) console.error('Admin check failed:', adminCheckError.code, adminCheckError.message);
  if (!isAdmin) {
    await supabase.auth.signOut();
    return failed('This account does not have access to the dashboard.', values);
  }
  redirect('/admin');
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createSessionClient();
    await supabase.auth.signOut();
  }
  redirect('/admin/login');
}
