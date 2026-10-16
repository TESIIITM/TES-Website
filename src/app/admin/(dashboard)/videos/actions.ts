'use server';

import { redirect } from 'next/navigation';
import { failed, invalid, readValues, type FormState } from '@/lib/admin/form-state';
import { PreviewError } from '@/lib/admin/link-preview';
import { previewImage, storeChosenImage } from '@/lib/admin/preview-image';
import { publishChanges } from '@/lib/admin/publish';
import { removeImage } from '@/lib/admin/storage-images';
import { readYouTubeVideo } from '@/lib/admin/youtube-preview';
import { requireAdmin } from '@/lib/auth';
import type { TablesInsert } from '@/lib/supabase/database.types';
import { youtubeLinkSchema, youtubeVideoSchema } from '@/lib/validation';
import { youtubeThumbnailUrls, youtubeWatchUrl } from '@/lib/youtube';

const FIELDS = ['url', 'title', 'channel', 'imageSourceUrl', 'publishedOn', 'isPublished'] as const;
const LIST = '/admin/videos';
const BUCKET = 'video-thumbnails';
const UNIQUE_VIOLATION = '23505';

export type VideoPreview =
  | { status: 'ok'; url: string; title: string | null; channel: string | null; image: { sourceUrl: string; dataUrl: string } | null }
  | { status: 'error'; message: string };

/** Reads a video's title, channel, and thumbnail for the form to fill in. Nothing is saved. */
export async function previewVideo(link: string): Promise<VideoPreview> {
  await requireAdmin();
  const videoId = youtubeLinkSchema.safeParse(link);
  if (!videoId.success) return { status: 'error', message: videoId.error.issues[0].message };

  try {
    const details = await readYouTubeVideo(videoId.data);
    let image = null;
    for (const url of youtubeThumbnailUrls(videoId.data)) {
      image = await previewImage(url);
      if (image) break;
    }
    return { status: 'ok', url: youtubeWatchUrl(videoId.data), ...details, image };
  } catch (error) {
    if (error instanceof PreviewError) return { status: 'error', message: error.message };
    throw error;
  }
}

export async function saveVideo(id: string | null, _previous: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const values = readValues(formData, FIELDS);
  const parsed = youtubeVideoSchema.safeParse({ ...values, isPublished: values.isPublished === 'on' });
  if (!parsed.success) return invalid(parsed.error, values);

  const { url: videoId, title, channel, imageSourceUrl, publishedOn, isPublished } = parsed.data;
  const image = await storeChosenImage(supabase, BUCKET, formData, imageSourceUrl);
  if ('error' in image) return failed(image.error, values, 'image');

  const row: TablesInsert<'youtube_videos'> = {
    video_id: videoId,
    title,
    channel,
    published_on: publishedOn,
    is_published: isPublished,
    ...(image.url !== undefined && { thumbnail_url: image.url }),
  };
  const previous = id !== null && image.url !== undefined
    ? (await supabase.from('youtube_videos').select('thumbnail_url').eq('id', id).single()).data?.thumbnail_url ?? null
    : null;

  const { error } = id
    ? await supabase.from('youtube_videos').update(row).eq('id', id)
    : await supabase.from('youtube_videos').insert(row);

  if (error) {
    if (image.url) await removeImage(supabase, BUCKET, image.url);
    if (error.code === UNIQUE_VIOLATION) return failed('This video has already been added.', values, 'url');
    console.error('Video save failed:', error.code, error.message);
    return failed('The video could not be saved. Try again.', values);
  }
  await removeImage(supabase, BUCKET, previous);

  publishChanges(LIST);
  redirect(LIST);
}

export async function deleteVideo(id: string) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('youtube_videos').delete().eq('id', id).select('thumbnail_url').single();
  await removeImage(supabase, BUCKET, data?.thumbnail_url ?? null);
  publishChanges(LIST);
}
