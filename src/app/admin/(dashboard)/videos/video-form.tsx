'use client';

import { useActionState, useRef, useState, useTransition } from 'react';
import { Checkbox, FormMessage, TextField } from '@/components/admin/fields';
import { PreviewImageField, type FetchedImage } from '@/components/admin/preview-image-field';
import { SubmitButton } from '@/components/admin/submit-button';
import { initialFormState, type FormState } from '@/lib/admin/form-state';
import type { Tables } from '@/lib/supabase/database.types';
import { youtubeWatchUrl } from '@/lib/youtube';
import { previewVideo } from './actions';

type Props = {
  video?: Tables<'youtube_videos'>;
  defaultDate: string;
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
};

function field(form: HTMLFormElement, name: string) {
  return form.elements.namedItem(name) as HTMLInputElement;
}

export function VideoForm({ video, defaultDate, action }: Props) {
  const [state, formAction] = useActionState(action, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const [fetching, startFetching] = useTransition();
  const [notice, setNotice] = useState<{ text: string; isError: boolean } | null>(null);
  const [fetchedImage, setFetchedImage] = useState<FetchedImage | null>(null);

  /** Fills the form from the video. `onlyEmpty` keeps anything the admin already typed. */
  const fetchPreview = (onlyEmpty: boolean) => {
    const form = formRef.current;
    const link = form && field(form, 'url').value.trim();
    if (!form || !link) return;
    startFetching(async () => {
      const result = await previewVideo(link);
      if (result.status === 'error') {
        setNotice({ text: result.message, isError: true });
        return;
      }
      field(form, 'url').value = result.url;
      for (const [name, value] of [['title', result.title], ['channel', result.channel]] as const) {
        if (value && (!onlyEmpty || !field(form, name).value.trim())) field(form, name).value = value;
      }
      if (result.image) setFetchedImage(result.image);
      setNotice({ text: 'Filled in from YouTube. Check the title before saving.', isError: false });
    });
  };

  return (
    <form ref={formRef} className="admin-form" action={formAction} noValidate>
      <FormMessage state={state} />
      <div className="admin-field-wide admin-link-row">
        <TextField
          name="url"
          label="Video link"
          type="url"
          required
          placeholder="https://www.youtube.com/watch?v=…"
          hint="Any YouTube link works: the address bar, Share, a Short, or a live stream."
          state={state}
          defaultValue={video && youtubeWatchUrl(video.video_id)}
          onBlur={() => {
            const form = formRef.current;
            if (form && !field(form, 'title').value.trim()) fetchPreview(true);
          }}
        />
        <button className="admin-button admin-button-quiet" type="button" onClick={() => fetchPreview(false)} disabled={fetching}>
          {fetching ? 'Fetching…' : 'Fetch video'}
        </button>
      </div>
      {notice && <p className={`admin-field-wide admin-field-hint${notice.isError ? ' admin-field-error' : ''}`} role="status">{notice.text}</p>}

      <TextField name="title" label="Title" required maxLength={200} className="admin-field-wide" state={state} defaultValue={video?.title} />
      <TextField name="channel" label="Channel" maxLength={80} hint="Optional. Shown above the title." state={state} defaultValue={video?.channel} />
      <TextField name="publishedOn" label="Date" type="date" required hint="Newer videos come first; the three newest are shown." state={state} defaultValue={video?.published_on ?? defaultDate} />
      <PreviewImageField label="Thumbnail" state={state} currentUrl={video?.thumbnail_url ?? null} fetched={fetchedImage} onDiscardFetched={() => setFetchedImage(null)} width={224} height={126} sourceName="YouTube’s thumbnail" />
      <Checkbox name="isPublished" label="Show on the site" state={state} defaultChecked={video?.is_published ?? true} />

      <div className="admin-form-actions"><SubmitButton>{video ? 'Save changes' : 'Add video'}</SubmitButton></div>
    </form>
  );
}
