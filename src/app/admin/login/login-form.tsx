'use client';

import { useActionState } from 'react';
import { FormMessage, TextField } from '@/components/admin/fields';
import { PasswordField } from '@/components/admin/password-field';
import { SubmitButton } from '@/components/admin/submit-button';
import { initialFormState } from '@/lib/admin/form-state';
import { signIn } from '../actions';

export function LoginForm() {
  const [state, action] = useActionState(signIn, initialFormState);
  return (
    <form className="admin-form admin-form-single" action={action} noValidate>
      <FormMessage state={state} />
      <TextField name="email" label="Email" type="email" autoComplete="username" required state={state} />
      <PasswordField name="password" label="Password" autoComplete="current-password" required state={state} />
      <div className="admin-form-actions"><SubmitButton pendingLabel="Signing in…">Sign in</SubmitButton></div>
    </form>
  );
}
