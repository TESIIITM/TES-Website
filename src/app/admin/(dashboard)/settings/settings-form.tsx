'use client';

import { useActionState } from 'react';
import { FormMessage, TextField } from '@/components/admin/fields';
import { SubmitButton } from '@/components/admin/submit-button';
import { initialFormState } from '@/lib/admin/form-state';
import type { SiteLinks } from '@/lib/content/types';
import { saveSettings } from './actions';

const fields: { name: keyof SiteLinks; label: string; hint: string }[] = [
  { name: 'github', label: 'GitHub organisation', hint: 'Header button, contact dialog, and Build panel.' },
  { name: 'repository', label: 'Website repository', hint: 'Footer, and the Build panel’s card when no repository is featured.' },
  { name: 'contributionGuide', label: 'Contribution guide', hint: 'Build panel, join band, and footer.' },
  { name: 'medium', label: 'Medium publication', hint: 'Learn panel and footer.' },
  { name: 'instagram', label: 'Instagram', hint: 'Contact dialog and footer.' },
  { name: 'linkedin', label: 'LinkedIn page', hint: 'Footer.' },
];

export function SettingsForm({ links }: { links: SiteLinks }) {
  const [state, formAction] = useActionState(saveSettings, initialFormState);
  return (
    <form className="admin-form" action={formAction} noValidate>
      <FormMessage state={state} />
      {fields.map((field) => (
        <TextField key={field.name} name={field.name} label={field.label} hint={field.hint} type="url" required state={state} defaultValue={links[field.name]} />
      ))}
      <TextField name="email" label="Contact email" type="email" required hint="Contact dialog, including the copy button." state={state} defaultValue={links.email} />
      <div className="admin-form-actions"><SubmitButton>Save links</SubmitButton></div>
    </form>
  );
}
