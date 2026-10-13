'use server';

import { redirect } from 'next/navigation';
import { failed, invalid, readValues, type FormState } from '@/lib/admin/form-state';
import { downloadPreviewImage, PreviewError, readLinkPreview } from '@/lib/admin/link-preview';
import { publishChanges } from '@/lib/admin/publish';
import { MAX_IMAGE_BYTES, removeImage, uploadImage } from '@/lib/admin/storage-images';
import { requireAdmin, type AdminSession } from '@/lib/auth';
import type { TablesInsert } from '@/lib/supabase/database.types';
import { linkSchema, techNewsSchema } from '@/lib/validation';

const FIELDS = ['url', 'title', 'summary', 'source', 'imageSourceUrl', 'weekOf', 'sortOrder', 'isPublished'] as const;
const LIST = '/admin/news';
const BUCKET = 'news-images';

const uploadMessages = {
  'too-large': 'Images must be 2 MB or smaller.',
  'not-an-image': 'Use a JPEG, PNG, or WebP image.',
  failed: 'The image could not be uploaded. Try again.',
};

export type LinkPreview =
  | { status: 'ok'; title: string | null; summary: string | null; source: string | null; image: { sourceUrl: string; dataUrl: string } | null }
  | { status: 'error'; message: string };

/** Reads a link's title, summary, source, and share image for the form to fill in. Nothing is saved. */
export async function previewLink(link: string): Promise<LinkPreview> {
  await requireAdmin();
  const url = linkSchema.safeParse(link);
  if (!url.success) return { status: 'error', message: 'Use a full link starting with https://' };

  try {
    const { imageUrl, ...text } = await readLinkPreview(url.data);
    const image = imageUrl ? await downloadPreviewImage(imageUrl) : null;
    return {
      status: 'ok',
      ...text,
      // Sent as a data URL because the dashboard's CSP only loads images from this site.
      image: image && imageUrl ? { sourceUrl: imageUrl, dataUrl: `data:${image.type};base64,${Buffer.from(image.bytes).toString('base64')}` } : null,
    };
  } catch (error) {
    if (error instanceof PreviewError) return { status: 'error', message: error.message };
    throw error;
  }
}

/** Resolves the image to store: `undefined` keeps the current one, `null` clears it. */
async function chooseImage(supabase: AdminSession['supabase'], formData: FormData, sourceUrl: string | null): Promise<{ error: string } | { url: string | null | undefined }> {
  const file = formData.get('image');
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_IMAGE_BYTES) return { error: uploadMessages['too-large'] };
    const upload = await uploadImage(supabase, BUCKET, new Uint8Array(await file.arrayBuffer()));
    return 'error' in upload ? { error: uploadMessages[upload.error] } : { url: upload.url };
  }
  if (sourceUrl) {
    const image = await downloadPreviewImage(sourceUrl);
    if (!image) return { error: 'The preview image could not be copied. Fetch the preview again, or upload an image.' };
    const upload = await uploadImage(supabase, BUCKET, image.bytes);
    return 'error' in upload ? { error: uploadMessages[upload.error] } : { url: upload.url };
  }
  return { url: formData.get('removeImage') === 'on' ? null : undefined };
}

export async function saveTechNews(id: string | null, _previous: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const values = readValues(formData, FIELDS);
  const parsed = techNewsSchema.safeParse({ ...values, isPublished: values.isPublished === 'on' });
  if (!parsed.success) return invalid(parsed.error, values);

  const { url, title, summary, source, imageSourceUrl, weekOf, sortOrder, isPublished } = parsed.data;
  const image = await chooseImage(supabase, formData, imageSourceUrl);
  if ('error' in image) return failed(image.error, values, 'image');

  const row: TablesInsert<'tech_news'> = {
    url,
    title,
    summary,
    source,
    week_of: weekOf,
    sort_order: sortOrder,
    is_published: isPublished,
    ...(image.url !== undefined && { image_url: image.url }),
  };
  const previous = id !== null && image.url !== undefined
    ? (await supabase.from('tech_news').select('image_url').eq('id', id).single()).data?.image_url ?? null
    : null;

  const { error } = id
    ? await supabase.from('tech_news').update(row).eq('id', id)
    : await supabase.from('tech_news').insert(row);

  if (error) {
    if (image.url) await removeImage(supabase, BUCKET, image.url);
    return failed('The link could not be saved. Try again.', values);
  }
  await removeImage(supabase, BUCKET, previous);

  publishChanges(LIST);
  redirect(LIST);
}

export async function deleteTechNews(id: string) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('tech_news').delete().eq('id', id).select('image_url').single();
  await removeImage(supabase, BUCKET, data?.image_url ?? null);
  publishChanges(LIST);
}
