import 'server-only';
import type { AdminSession } from '@/lib/auth';
import { detectImageType } from './image-type';

/** The buckets' own size limit, set in the migrations. */
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

type Supabase = AdminSession['supabase'];
export type ImageBucket = 'portraits' | 'news-images' | 'instagram-images' | 'video-thumbnails';

/** Uploads a JPEG, PNG, or WebP after checking its bytes, and returns its public URL. */
export async function uploadImage(supabase: Supabase, bucket: ImageBucket, bytes: Uint8Array): Promise<{ url: string } | { error: 'too-large' | 'not-an-image' | 'failed' }> {
  if (bytes.byteLength > MAX_IMAGE_BYTES) return { error: 'too-large' };
  const image = detectImageType(bytes);
  if (!image) return { error: 'not-an-image' };

  const path = `${crypto.randomUUID()}.${image.extension}`;
  const { error } = await supabase.storage.from(bucket).upload(path, bytes, { contentType: image.type, cacheControl: '31536000' });
  if (error) return { error: 'failed' };
  return { url: supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl };
}

/** Deletes an uploaded image. URLs outside the bucket, such as bundled /assets files, are left alone. */
export async function removeImage(supabase: Supabase, bucket: ImageBucket, url: string | null) {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = url?.indexOf(marker) ?? -1;
  if (!url || index === -1) return;
  // Best effort: an orphaned file is harmless, so a failure here should not fail the save.
  await supabase.storage.from(bucket).remove([url.slice(index + marker.length)]);
}
