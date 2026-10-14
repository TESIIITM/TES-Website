'use client';

import { useActionState } from 'react';
import { Checkbox, FormMessage, TextArea, TextField } from '@/components/admin/fields';
import { SubmitButton } from '@/components/admin/submit-button';
import { initialFormState, type FormState } from '@/lib/admin/form-state';
import type { Tables } from '@/lib/supabase/database.types';

/** The fields the form fills in, from a saved story or a post in the Medium feed. */
export type StoryValues = Pick<Tables<'stories'>, 'title' | 'url' | 'summary' | 'category' | 'published_on' | 'slug' | 'is_published'>;

type Props = {
  story?: StoryValues;
  /** True when `story` is a Medium post that hasn't been saved yet. */
  isNew?: boolean;
  categories: string[];
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
};

export function StoryForm({ story, isNew = !story, categories, action }: Props) {
  const [state, formAction] = useActionState(action, initialFormState);
  return (
    <form className="admin-form" action={formAction} noValidate>
      <FormMessage state={state} />
      <TextField name="title" label="Title" required maxLength={200} className="admin-field-wide" state={state} defaultValue={story?.title} />
      <TextField name="url" label="Medium link" type="url" required placeholder="https://medium.com/@tes.abviiitm/…" className="admin-field-wide" state={state} defaultValue={story?.url} />
      <TextArea name="summary" label="Summary" required maxLength={300} rows={2} hint="One sentence under the title." className="admin-field-wide" state={state} defaultValue={story?.summary} />
      <TextField name="category" label="Category" required maxLength={40} list="story-categories" hint="Each category becomes a filter on the site." state={state} defaultValue={story?.category} />
      <datalist id="story-categories">{categories.map((category) => <option key={category} value={category} />)}</datalist>
      <TextField name="publishedOn" label="Published on" type="date" required state={state} defaultValue={story?.published_on} />
      <TextField
        name="slug"
        label="Slug"
        required
        maxLength={80}
        pattern="[a-z0-9]+(-[a-z0-9]+)*"
        hint="Short, unique, lowercase. Readers' saved lists use it, so avoid changing it later."
        state={state}
        defaultValue={story?.slug}
      />
      <Checkbox name="isPublished" label="Show on the site" state={state} defaultChecked={story?.is_published ?? true} />
      <div className="admin-form-actions"><SubmitButton>{isNew ? 'Add story' : 'Save changes'}</SubmitButton></div>
    </form>
  );
}
