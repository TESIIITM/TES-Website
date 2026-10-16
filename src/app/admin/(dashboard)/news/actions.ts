'use server';

import { redirect } from 'next/navigation';
import { failed, invalid, readValues, type FormState } from '@/lib/admin/form-state';
import { PreviewError, readLinkPreview } from '@/lib/admin/link-preview';
import { previewImage, storeChosenImage } from '@/lib/admin/preview-image';
import { publishChanges } from '@/lib/admin/publish';
import { removeImage } from '@/lib/admin/storage-images';
import { requireAdmin } from '@/lib/auth';
import type { TablesInsert } from '@/lib/supabase/database.types';
import { linkSchema, techNewsSchema } from '@/lib/validation';

const FIELDS = ['url', 'title', 'summary', 'source', 'imageSourceUrl', 'weekOf', 'sortOrder', 'isPublished'] as const;
const LIST = '/admin/news';
const BUCKET = 'news-images';

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
    return { status: 'ok', ...text, image: await previewImage(imageUrl) };
  } catch (error) {
    if (error instanceof PreviewError) return { status: 'error', message: error.message };
    throw error;
  }
}

export async function saveTechNews(id: string | null, _previous: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const values = readValues(formData, FIELDS);
  const parsed = techNewsSchema.safeParse({ ...values, isPublished: values.isPublished === 'on' });
  if (!parsed.success) return invalid(parsed.error, values);

  const { url, title, summary, source, imageSourceUrl, weekOf, sortOrder, isPublished } = parsed.data;
  const image = await storeChosenImage(supabase, BUCKET, formData, imageSourceUrl);
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
    console.error('Tech news save failed:', error.code, error.message);
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
