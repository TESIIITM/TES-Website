'use server';

import { failed, invalid, type FormState } from '@/lib/admin/form-state';
import { requireAdmin } from '@/lib/auth';
import { changePasswordSchema } from '@/lib/validation';

export async function changePassword(_previous: FormState, formData: FormData): Promise<FormState> {
  const { supabase, user } = await requireAdmin();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });
  if (!parsed.success) return invalid(parsed.error, {});

  // A signed-in session alone may not change the password; whoever is at the keyboard must know the current one.
  const { error: reauthError } = await supabase.auth.signInWithPassword({ email: user.email ?? '', password: parsed.data.currentPassword });
  if (reauthError) return failed('That is not your current password.', {}, 'currentPassword');

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (error.code === 'weak_password') return failed('Choose a stronger password. Avoid common or previously leaked ones.', {}, 'password');
    if (error.code === 'same_password') return failed('Choose a password different from your current one.', {}, 'password');
    console.error('Password change failed:', error.code, error.message);
    return failed('The password could not be changed. Try again.');
  }
  return { status: 'saved', message: 'Password changed. Use the new one next time you sign in.' };
}
