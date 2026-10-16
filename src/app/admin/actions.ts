'use server';

import { redirect } from 'next/navigation';
import { failed, invalid, readValues, type FormState } from '@/lib/admin/form-state';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { createSessionClient } from '@/lib/supabase/server';
import { newPasswordSchema, signInSchema } from '@/lib/validation';

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

/** Sets the password of whoever arrived through an invite or recovery link. */
export async function setPassword(_previous: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return failed('Supabase is not configured for this deployment.');

  const parsed = newPasswordSchema.safeParse({ password: formData.get('password'), confirmPassword: formData.get('confirmPassword') });
  if (!parsed.success) return invalid(parsed.error, {});

  const supabase = await createSessionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return failed('This link has expired. Ask an admin to send you a new one.');

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (error.code === 'weak_password') return failed('Choose a stronger password. Avoid common or previously leaked ones.', {}, 'password');
    if (error.code === 'same_password') return failed('Choose a password you have not used here before.', {}, 'password');
    console.error('Password update failed:', error.code, error.message);
    return failed('The password could not be saved. Try again.');
  }

  const { data: isAdmin } = await supabase.rpc('is_admin');
  if (!isAdmin) {
    await supabase.auth.signOut();
    redirect('/admin/login?denied=1');
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
