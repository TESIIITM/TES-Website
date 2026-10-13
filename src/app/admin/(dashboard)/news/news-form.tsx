'use client';

import { useActionState, useEffect, useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { Checkbox, FormMessage, TextArea, TextField } from '@/components/admin/fields';
import { SubmitButton } from '@/components/admin/submit-button';
import { initialFormState, type FormState } from '@/lib/admin/form-state';
import type { Tables } from '@/lib/supabase/database.types';
import { previewLink } from './actions';

type Props = {
  item?: Tables<'tech_news'>;
  defaultWeek: string;
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
};

type FetchedImage = { sourceUrl: string; dataUrl: string };

const TEXT_FIELDS = ['title', 'summary', 'source'] as const;

export function TechNewsForm({ item, defaultWeek, action }: Props) {
  const [state, formAction] = useActionState(action, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const [fetching, startFetching] = useTransition();
  const [notice, setNotice] = useState<{ text: string; isError: boolean } | null>(null);
  const [fetchedImage, setFetchedImage] = useState<FetchedImage | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  useEffect(() => () => { if (uploadPreview) URL.revokeObjectURL(uploadPreview); }, [uploadPreview]);

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
      if (result.image && !uploadPreview) setFetchedImage(result.image);
      setNotice({ text: result.image ? 'Filled in from the page. Check the wording before saving.' : 'Filled in from the page. It has no usable preview image; you can upload one.', isError: false });
    });
  };

  const imageErrors = state.fieldErrors?.image;
  const shownImage = uploadPreview ?? fetchedImage?.dataUrl ?? item?.image_url ?? null;

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

      <div className="admin-field admin-field-wide" data-invalid={imageErrors ? '' : undefined}>
        <label htmlFor="image">Preview image</label>
        <div className="admin-portrait-input">
          <div className="admin-portrait-preview admin-image-preview">
            {shownImage ? <Image src={shownImage} alt="" width={240} height={126} unoptimized={shownImage !== item?.image_url} /> : <span>No image</span>}
          </div>
          <div>
            <input type="hidden" name="imageSourceUrl" value={uploadPreview ? '' : fetchedImage?.sourceUrl ?? ''} />
            <input
              id="image"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              aria-describedby="image-hint"
              onChange={(event) => {
                const file = event.target.files?.[0];
                setUploadPreview(file ? URL.createObjectURL(file) : null);
              }}
            />
            <p className="admin-field-hint" id="image-hint">The page’s own image is used when you fetch the preview. Or upload a JPEG, PNG, or WebP up to 2 MB.</p>
            {imageErrors && <p className="admin-field-error">{imageErrors[0]}</p>}
            {fetchedImage && !uploadPreview && <button className="admin-link" type="button" onClick={() => setFetchedImage(null)}>Don’t use the page’s image</button>}
            {item?.image_url && !fetchedImage && !uploadPreview && <Checkbox name="removeImage" label="Remove the current image" state={initialFormState} defaultChecked={false} />}
          </div>
        </div>
      </div>

      <TextField name="sortOrder" label="Order" type="number" min={0} max={9999} inputMode="numeric" hint="Lower numbers come first within the week." state={state} defaultValue={item?.sort_order ?? 0} />
      <Checkbox name="isPublished" label="Show on the site" state={state} defaultChecked={item?.is_published ?? true} />

      <div className="admin-form-actions"><SubmitButton>{item ? 'Save changes' : 'Add link'}</SubmitButton></div>
    </form>
  );
}
