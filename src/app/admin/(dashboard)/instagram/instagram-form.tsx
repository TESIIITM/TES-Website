'use client';

import { useActionState, useRef, useState, useTransition } from 'react';
import { Checkbox, FormMessage, TextArea, TextField } from '@/components/admin/fields';
import { PreviewImageField, type FetchedImage } from '@/components/admin/preview-image-field';
import { SubmitButton } from '@/components/admin/submit-button';
import { initialFormState, type FormState } from '@/lib/admin/form-state';
import type { Tables } from '@/lib/supabase/database.types';
import { previewInstagramPost } from './actions';

type Props = {
  post?: Tables<'instagram_posts'>;
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
};

function field(form: HTMLFormElement, name: string) {
  return form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement;
}

export function InstagramForm({ post, action }: Props) {
  const [state, formAction] = useActionState(action, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const [fetching, startFetching] = useTransition();
  const [notice, setNotice] = useState<{ text: string; isError: boolean } | null>(null);
  const [fetchedImage, setFetchedImage] = useState<FetchedImage | null>(null);

  /** Fills the form from the post. `onlyEmpty` keeps anything the admin already typed. */
  const fetchPreview = (onlyEmpty: boolean) => {
    const form = formRef.current;
    const link = form && field(form, 'url').value.trim();
    if (!form || !link) return;
    startFetching(async () => {
      const result = await previewInstagramPost(link);
      if (result.status === 'error') {
        setNotice({ text: result.message, isError: true });
        return;
      }
      field(form, 'url').value = result.url;
      for (const [name, value] of [['caption', result.caption], ['postedOn', result.postedOn]] as const) {
        if (value && (!onlyEmpty || !field(form, name).value.trim())) field(form, name).value = value;
      }
      if (result.image) setFetchedImage(result.image);
      setNotice({ text: result.image ? 'Filled in from the post. Check the caption before saving.' : 'Filled in from the post. It has no usable image; you can upload one.', isError: false });
    });
  };

  return (
    <form ref={formRef} className="admin-form" action={formAction} noValidate>
      <FormMessage state={state} />
      <div className="admin-field-wide admin-link-row">
        <TextField
          name="url"
          label="Post link"
          type="url"
          required
          placeholder="https://www.instagram.com/p/…"
          hint="Copy the link from the post’s share menu. The caption, date, and image are read from it."
          state={state}
          defaultValue={post?.url}
          onBlur={() => {
            const form = formRef.current;
            if (form && !field(form, 'caption').value.trim()) fetchPreview(true);
          }}
        />
        <button className="admin-button admin-button-quiet" type="button" onClick={() => fetchPreview(false)} disabled={fetching}>
          {fetching ? 'Fetching…' : 'Fetch post'}
        </button>
      </div>
      {notice && <p className={`admin-field-wide admin-field-hint${notice.isError ? ' admin-field-error' : ''}`} role="status">{notice.text}</p>}

      <TextArea name="caption" label="Caption" maxLength={300} rows={3} hint="Optional. Shortened to three lines on the site." className="admin-field-wide" state={state} defaultValue={post?.caption} />
      <TextField name="postedOn" label="Posted on" type="date" required hint="Newer posts come first; the four newest are shown." state={state} defaultValue={post?.posted_on} />
      <PreviewImageField label="Image" state={state} currentUrl={post?.image_url ?? null} fetched={fetchedImage} onDiscardFetched={() => setFetchedImage(null)} width={150} height={150} />
      <Checkbox name="isPublished" label="Show on the site" state={state} defaultChecked={post?.is_published ?? true} />

      <div className="admin-form-actions"><SubmitButton>{post ? 'Save changes' : 'Add post'}</SubmitButton></div>
    </form>
  );
}
