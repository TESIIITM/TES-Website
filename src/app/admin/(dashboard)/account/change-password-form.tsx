'use client';

import { useActionState } from 'react';
import { FormMessage, TextField } from '@/components/admin/fields';
import { SubmitButton } from '@/components/admin/submit-button';
import { initialFormState } from '@/lib/admin/form-state';
import { MIN_PASSWORD_LENGTH } from '@/lib/validation';
import { changePassword } from './actions';

export function ChangePasswordForm({ email }: { email: string }) {
  const [state, action] = useActionState(changePassword, initialFormState);
  return (
    // Keyed on the result so a successful change clears the fields.
    <form key={state.status === 'saved' ? 'saved' : 'editing'} className="admin-form admin-form-single" action={action} noValidate>
      <FormMessage state={state} />
      {/* Lets password managers save the new password against the right account. */}
      <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
      <TextField name="currentPassword" label="Current password" type="password" autoComplete="current-password" required state={state} />
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
      <TextField name="confirmPassword" label="Confirm new password" type="password" autoComplete="new-password" required state={state} />
      <div className="admin-form-actions"><SubmitButton pendingLabel="Saving…">Change password</SubmitButton></div>
    </form>
  );
}
