'use client';

import { useActionState, useEffect, useState } from 'react';
import Image from 'next/image';
import { Checkbox, FormMessage, SelectField, TextField } from '@/components/admin/fields';
import { SubmitButton } from '@/components/admin/submit-button';
import { initialFormState, type FormState } from '@/lib/admin/form-state';
import type { Tables } from '@/lib/supabase/database.types';

type Props = {
  member?: Tables<'members'>;
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
};

const groups = [
  { value: 'student', label: 'Student member' },
  { value: 'faculty', label: 'Faculty coordinator' },
];

export function MemberForm({ member, action }: Props) {
  const [state, formAction] = useActionState(action, initialFormState);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const portraitErrors = state.fieldErrors?.portrait;
  const current = preview ?? member?.portrait_url ?? null;

  return (
    <form className="admin-form" action={formAction} noValidate>
      <FormMessage state={state} />
      <TextField name="name" label="Name" required maxLength={120} state={state} defaultValue={member?.name} />
      <TextField name="role" label="Role" required maxLength={80} hint="Shown under the name, e.g. Club head or Faculty coordinator." state={state} defaultValue={member?.role} />
      <SelectField name="group" label="Section" options={groups} hint="Faculty coordinators are listed above student members." state={state} defaultValue={member?.member_group ?? 'student'} />
      <TextField name="linkedinUrl" label="LinkedIn profile" type="url" placeholder="https://www.linkedin.com/in/…" hint="Optional. The card links here." state={state} defaultValue={member?.linkedin_url} />

      <div className="admin-field admin-field-wide" data-invalid={portraitErrors ? '' : undefined}>
        <label htmlFor="portrait">Portrait</label>
        <div className="admin-portrait-input">
          <div className="admin-portrait-preview">
            {current ? <Image src={current} alt="" width={96} height={96} unoptimized={Boolean(preview)} /> : <span>No portrait</span>}
          </div>
          <div>
            <input
              id="portrait"
              name="portrait"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              aria-describedby="portrait-hint"
              onChange={(event) => {
                const file = event.target.files?.[0];
                setPreview(file ? URL.createObjectURL(file) : null);
              }}
            />
            <p className="admin-field-hint" id="portrait-hint">Square JPEG, PNG, or WebP, up to 2 MB. Shown in greyscale until hovered.</p>
            {portraitErrors && <p className="admin-field-error">{portraitErrors[0]}</p>}
            {member?.portrait_url && !preview && <Checkbox name="removePortrait" label="Remove the current portrait" state={initialFormState} defaultChecked={false} />}
          </div>
        </div>
      </div>

      <TextField name="sortOrder" label="Order" type="number" min={0} max={9999} inputMode="numeric" hint="Lower numbers come first within the section." state={state} defaultValue={member?.sort_order ?? 0} />
      <Checkbox name="isPublished" label="Show on the site" state={state} defaultChecked={member?.is_published ?? true} />

      <div className="admin-form-actions"><SubmitButton>{member ? 'Save changes' : 'Add member'}</SubmitButton></div>
    </form>
  );
}
