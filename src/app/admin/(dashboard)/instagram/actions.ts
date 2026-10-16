'use server';

import { redirect } from 'next/navigation';
import { failed, invalid, readValues, type FormState } from '@/lib/admin/form-state';
import { readInstagramPost } from '@/lib/admin/instagram-post';
import { PreviewError, readLinkPreview } from '@/lib/admin/link-preview';
import { previewImage, storeChosenImage } from '@/lib/admin/preview-image';
import { publishChanges } from '@/lib/admin/publish';
import { removeImage } from '@/lib/admin/storage-images';
import { requireAdmin } from '@/lib/auth';
import type { TablesInsert } from '@/lib/supabase/database.types';
import { instagramLinkSchema, instagramPostSchema } from '@/lib/validation';

const FIELDS = ['url', 'caption', 'imageSourceUrl', 'postedOn', 'isPublished'] as const;
const LIST = '/admin/instagram';
const BUCKET = 'instagram-images';
const UNIQUE_VIOLATION = '23505';

export type InstagramPreview =
  | { status: 'ok'; url: string; caption: string | null; postedOn: string | null; image: { sourceUrl: string; dataUrl: string } | null }
  | { status: 'error'; message: string };

/** Reads a post's caption, date, and image for the form to fill in. Nothing is saved. */
export async function previewInstagramPost(link: string): Promise<InstagramPreview> {
  await requireAdmin();
  const url = instagramLinkSchema.safeParse(link);
  if (!url.success) return { status: 'error', message: url.error.issues[0].message };

  try {
    const metadata = await readLinkPreview(url.data);
    return { status: 'ok', url: url.data, ...readInstagramPost(metadata), image: await previewImage(metadata.imageUrl) };
  } catch (error) {
    if (error instanceof PreviewError) return { status: 'error', message: error.message };
    throw error;
  }
}

export async function saveInstagramPost(id: string | null, _previous: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const values = readValues(formData, FIELDS);
  const parsed = instagramPostSchema.safeParse({ ...values, isPublished: values.isPublished === 'on' });
  if (!parsed.success) return invalid(parsed.error, values);

  const { url, caption, imageSourceUrl, postedOn, isPublished } = parsed.data;
  const image = await storeChosenImage(supabase, BUCKET, formData, imageSourceUrl);
  if ('error' in image) return failed(image.error, values, 'image');

  const row: TablesInsert<'instagram_posts'> = {
    url,
    caption,
    posted_on: postedOn,
    is_published: isPublished,
    ...(image.url !== undefined && { image_url: image.url }),
  };
  const previous = id !== null && image.url !== undefined
    ? (await supabase.from('instagram_posts').select('image_url').eq('id', id).single()).data?.image_url ?? null
    : null;

  const { error } = id
    ? await supabase.from('instagram_posts').update(row).eq('id', id)
    : await supabase.from('instagram_posts').insert(row);

  if (error) {
    if (image.url) await removeImage(supabase, BUCKET, image.url);
    if (error.code === UNIQUE_VIOLATION) return failed('This post has already been added.', values, 'url');
    console.error('Instagram post save failed:', error.code, error.message);
    return failed('The post could not be saved. Try again.', values);
  }
  await removeImage(supabase, BUCKET, previous);

  publishChanges(LIST);
  redirect(LIST);
}

export async function deleteInstagramPost(id: string) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('instagram_posts').delete().eq('id', id).select('image_url').single();
  await removeImage(supabase, BUCKET, data?.image_url ?? null);
  publishChanges(LIST);
}
