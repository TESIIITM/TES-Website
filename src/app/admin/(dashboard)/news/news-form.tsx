'use client';

import { useActionState, useRef, useState, useTransition } from 'react';
import { Checkbox, FormMessage, TextArea, TextField } from '@/components/admin/fields';
import { PreviewImageField, type FetchedImage } from '@/components/admin/preview-image-field';
import { SubmitButton } from '@/components/admin/submit-button';
import { initialFormState, type FormState } from '@/lib/admin/form-state';
import type { Tables } from '@/lib/supabase/database.types';
import { previewLink } from './actions';

type Props = {
  item?: Tables<'tech_news'>;
  defaultWeek: string;
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
};

const TEXT_FIELDS = ['title', 'summary', 'source'] as const;

export function TechNewsForm({ item, defaultWeek, action }: Props) {
  const [state, formAction] = useActionState(action, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const [fetching, startFetching] = useTransition();
  const [notice, setNotice] = useState<{ text: string; isError: boolean } | null>(null);
  const [fetchedImage, setFetchedImage] = useState<FetchedImage | null>(null);

  /** Fills the form from the link. `onlyEmpty` keeps anything the admin already typed. */
  const fetchPreview = (onlyEmpty: boolean) => {
    const form = formRef.current;
    const link = (form?.elements.namedItem('url') as HTMLInputElement | null)?.value.trim();
    if (!form || !link) return;
    startFetching(async () => {
      const result = await previewLink(link);
      if (result.status === 'error') {
        setNotice({ text: result.message, isError: true });
        return;
      }
      for (const name of TEXT_FIELDS) {
        const field = form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement;
        const value = result[name];
        if (value && (!onlyEmpty || !field.value.trim())) field.value = value;
      }
      if (result.image) setFetchedImage(result.image);
      setNotice({ text: result.image ? 'Filled in from the page. Check the wording before saving.' : 'Filled in from the page. It has no usable preview image; you can upload one.', isError: false });
    });
  };

  return (
    <form ref={formRef} className="admin-form" action={formAction} noValidate>
      <FormMessage state={state} />
      <div className="admin-field-wide admin-link-row">
        <TextField
          name="url"
          label="Link"
          type="url"
          required
          placeholder="https://…"
          hint="Paste the article’s address. The title, summary, and image are read from the page."
          state={state}
          defaultValue={item?.url}
          onBlur={() => {
            const title = formRef.current?.elements.namedItem('title') as HTMLInputElement | null;
            if (title && !title.value.trim()) fetchPreview(true);
          }}
        />
        <button className="admin-button admin-button-quiet" type="button" onClick={() => fetchPreview(false)} disabled={fetching}>
          {fetching ? 'Fetching…' : 'Fetch preview'}
        </button>
      </div>
      {notice && <p className={`admin-field-wide admin-field-hint${notice.isError ? ' admin-field-error' : ''}`} role="status">{notice.text}</p>}

      <TextField name="title" label="Title" required maxLength={200} className="admin-field-wide" state={state} defaultValue={item?.title} />
      <TextArea name="summary" label="Summary" maxLength={400} rows={3} hint="Optional. One or two sentences on why it matters." className="admin-field-wide" state={state} defaultValue={item?.summary} />
      <TextField name="source" label="Source" maxLength={80} hint="The publication, e.g. The Verge." state={state} defaultValue={item?.source} />
      <TextField name="weekOf" label="Week" type="date" required hint="Any day in the week; it is saved as that week’s Monday." state={state} defaultValue={item?.week_of ?? defaultWeek} />

      <PreviewImageField label="Preview image" state={state} currentUrl={item?.image_url ?? null} fetched={fetchedImage} onDiscardFetched={() => setFetchedImage(null)} width={240} height={126} />

      <TextField name="sortOrder" label="Order" type="number" min={0} max={9999} inputMode="numeric" hint="Lower numbers come first within the week." state={state} defaultValue={item?.sort_order ?? 0} />
      <Checkbox name="isPublished" label="Show on the site" state={state} defaultChecked={item?.is_published ?? true} />

      <div className="admin-form-actions"><SubmitButton>{item ? 'Save changes' : 'Add link'}</SubmitButton></div>
    </form>
  );
}
