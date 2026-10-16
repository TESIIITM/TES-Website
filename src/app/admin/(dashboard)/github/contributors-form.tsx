'use client';

import { useActionState } from 'react';
import { Checkbox, FormMessage, TextArea, TextField } from '@/components/admin/fields';
import { SubmitButton } from '@/components/admin/submit-button';
import { initialFormState } from '@/lib/admin/form-state';
import type { Tables } from '@/lib/supabase/database.types';
import { refreshGitHub, saveGitHubSettings } from './actions';

export function ContributorsForm({ settings }: { settings: Tables<'github_settings'> | null }) {
  const [state, formAction] = useActionState(saveGitHubSettings, initialFormState);
  return (
    <form className="admin-form" action={formAction} noValidate>
      <FormMessage state={state} />
      <Checkbox name="showContributors" label="Show contributors on the site" hint="Everyone who has committed to the repositories above, most commits first." state={state} defaultChecked={settings?.show_contributors ?? true} />
      <TextField name="heading" label="Heading" required maxLength={80} state={state} defaultValue={settings?.contributors_heading ?? 'Built in the open.'} />
      <TextField name="maxContributors" label="How many to show" type="number" min={1} max={100} inputMode="numeric" required state={state} defaultValue={settings?.max_contributors ?? 24} />
      <TextArea name="intro" label="Introduction" maxLength={300} rows={2} hint="Optional. One sentence beside the heading." className="admin-field-wide" state={state} defaultValue={settings?.contributors_intro} />
      <TextArea
        name="hiddenLogins"
        label="Hidden people"
        rows={2}
        placeholder="octocat, another-user"
        hint="GitHub usernames to leave out, separated by commas. Bots are always left out."
        className="admin-field-wide"
        state={state}
        defaultValue={settings?.hidden_logins.join(', ')}
      />
      <div className="admin-form-actions"><SubmitButton>Save contributors section</SubmitButton></div>
    </form>
  );
}

/** GitHub numbers are cached for an hour; this fetches them again now. */
export function RefreshButton() {
  const [state, formAction] = useActionState(refreshGitHub, initialFormState);
  return (
    <form className="admin-inline-form" action={formAction}>
      <SubmitButton pendingLabel="Refreshing…">Refresh from GitHub</SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}
