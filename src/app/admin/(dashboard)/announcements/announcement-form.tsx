'use client';

import { useActionState } from 'react';
import { Checkbox, FormMessage, TextArea, TextField } from '@/components/admin/fields';
import { SubmitButton } from '@/components/admin/submit-button';
import { initialFormState, type FormState } from '@/lib/admin/form-state';
import type { Tables } from '@/lib/supabase/database.types';

type Props = {
  announcement?: Tables<'announcements'>;
  /** Default publication date for a new announcement, `YYYY-MM-DD`. */
  today: string;
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
};

export function AnnouncementForm({ announcement: item, today, action }: Props) {
  const [state, formAction] = useActionState(action, initialFormState);
  return (
    <form className="admin-form" action={formAction} noValidate>
      <FormMessage state={state} />

      <fieldset className="admin-fieldset">
        <legend>Heading</legend>
        <TextField name="label" label="Label" required maxLength={60} hint="The small uppercase line above the title." state={state} defaultValue={item?.label ?? 'Community announcement'} />
        <TextField name="publishedOn" label="Date" type="date" required hint="The newest published announcement is featured." state={state} defaultValue={item?.published_on ?? today} />
        <TextField name="title" label="Title" required maxLength={80} placeholder="Tech" state={state} defaultValue={item?.title} />
        <TextField name="titleEmphasis" label="Second line" maxLength={80} placeholder="Lekhan." hint="Optional. Set in italics on its own line." state={state} defaultValue={item?.title_emphasis} />
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>Body</legend>
        <TextArea name="summary" label="Summary" required maxLength={600} rows={3} className="admin-field-wide" state={state} defaultValue={item?.summary} />
        <TextArea name="details" label="How it works" maxLength={2000} rows={4} hint="Optional. Shown in an expandable section." className="admin-field-wide" state={state} defaultValue={item?.details} />
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>Links</legend>
        <TextField name="primaryLabel" label="Main button" maxLength={60} placeholder="View registration form" state={state} defaultValue={item?.primary_label} />
        <TextField name="primaryUrl" label="Main button link" type="url" placeholder="https://" state={state} defaultValue={item?.primary_url} />
        <TextField name="secondaryLabel" label="Secondary link" maxLength={60} placeholder="Read official rules" state={state} defaultValue={item?.secondary_label} />
        <TextField name="secondaryUrl" label="Secondary link URL" type="url" placeholder="https://" state={state} defaultValue={item?.secondary_url} />
      </fieldset>

      <Checkbox name="isPublished" label="Publish on the site" hint="Leave unchecked to keep it as a draft." state={state} defaultChecked={item?.is_published ?? false} />
      <div className="admin-form-actions"><SubmitButton>{item ? 'Save changes' : 'Add announcement'}</SubmitButton></div>
    </form>
  );
}
