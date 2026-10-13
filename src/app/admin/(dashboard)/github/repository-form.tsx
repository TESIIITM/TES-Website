'use client';

import { useActionState } from 'react';
import { Checkbox, FormMessage, TextArea, TextField } from '@/components/admin/fields';
import { SubmitButton } from '@/components/admin/submit-button';
import { initialFormState, type FormState } from '@/lib/admin/form-state';
import type { Tables } from '@/lib/supabase/database.types';

type Props = {
  repository?: Tables<'github_repos'>;
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
};

export function RepositoryForm({ repository, action }: Props) {
  const [state, formAction] = useActionState(action, initialFormState);
  return (
    <form className="admin-form" action={formAction} noValidate>
      <FormMessage state={state} />
      <TextField
        name="repository"
        label="Repository"
        required
        placeholder="TESIIITM/TES-Website"
        hint="owner/name, or paste its github.com link. It must be public."
        className="admin-field-wide"
        state={state}
        defaultValue={repository?.full_name}
      />
      <TextField name="title" label="Title" maxLength={80} hint="Optional. Shown instead of the repository’s name." state={state} defaultValue={repository?.title} />
      <TextField name="sortOrder" label="Order" type="number" min={0} max={9999} inputMode="numeric" hint="Lower numbers come first under More projects." state={state} defaultValue={repository?.sort_order ?? 0} />
      <TextArea name="description" label="Description" maxLength={400} rows={3} hint="Optional. Shown instead of GitHub’s description." className="admin-field-wide" state={state} defaultValue={repository?.description} />

      <fieldset className="admin-fieldset">
        <legend>Featured card</legend>
        <Checkbox name="isFeatured" label="Feature this repository" hint="Shown in the large card at the top of Build, with its live numbers. Featuring it unfeatures the current one." state={state} defaultChecked={repository?.is_featured ?? false} />
        <TextField name="headline" label="Heading" maxLength={60} placeholder="Make the web" hint="Optional. The card’s large heading." state={state} defaultValue={repository?.headline} />
        <TextField name="headlineEmphasis" label="Heading, second line" maxLength={60} placeholder="a little better." hint="Optional. Set in italics." state={state} defaultValue={repository?.headline_emphasis} />
      </fieldset>

      <Checkbox name="isPublished" label="Show on the site" state={state} defaultChecked={repository?.is_published ?? true} />
      <div className="admin-form-actions"><SubmitButton>{repository ? 'Save changes' : 'Add repository'}</SubmitButton></div>
    </form>
  );
}
