'use client';

import { useActionState } from 'react';
import { FormMessage, TextField } from '@/components/admin/fields';
import { SubmitButton } from '@/components/admin/submit-button';
import { initialFormState } from '@/lib/admin/form-state';
import { MIN_PASSWORD_LENGTH } from '@/lib/validation';
import { setPassword } from '../actions';

export function SetPasswordForm({ email }: { email: string }) {
  const [state, action] = useActionState(setPassword, initialFormState);
  return (
    <form className="admin-form admin-form-single" action={action} noValidate>
      <FormMessage state={state} />
      {/* Lets password managers save the new password against the right account. */}
      <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
      <TextField
        name="password"
        label="New password"
        type="password"
        autoComplete="new-password"
        minLength={MIN_PASSWORD_LENGTH}
        hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
        required
        state={state}
      />
      <TextField name="confirmPassword" label="Confirm password" type="password" autoComplete="new-password" required state={state} />
      <div className="admin-form-actions"><SubmitButton pendingLabel="Saving…">Save password</SubmitButton></div>
    </form>
  );
}
