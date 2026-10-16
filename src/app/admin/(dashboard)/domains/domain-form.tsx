'use client';

import { useActionState } from 'react';
import { FormMessage, TextArea, TextField } from '@/components/admin/fields';
import { SubmitButton } from '@/components/admin/submit-button';
import { initialFormState, type FormState } from '@/lib/admin/form-state';
import type { Tables } from '@/lib/supabase/database.types';

type Props = {
  domain?: Tables<'domains'>;
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
};

export function DomainForm({ domain, action }: Props) {
  const [state, formAction] = useActionState(action, initialFormState);
  return (
    <form className="admin-form" action={formAction} noValidate>
      <FormMessage state={state} />
      <TextField name="title" label="Title" required maxLength={80} state={state} defaultValue={domain?.title} />
      <TextField name="sortOrder" label="Order" type="number" min={0} max={9999} inputMode="numeric" hint="The site numbers domains 01, 02, … in this order." state={state} defaultValue={domain?.sort_order ?? 0} />
      <TextArea name="detail" label="Description" required maxLength={300} rows={3} hint="Shown in the preview when the domain is selected." className="admin-field-wide" state={state} defaultValue={domain?.detail} />
      <div className="admin-form-actions"><SubmitButton>{domain ? 'Save changes' : 'Add domain'}</SubmitButton></div>
    </form>
  );
}
