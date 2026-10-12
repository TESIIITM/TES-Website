import 'server-only';
import type { AdminSession } from '@/lib/auth';
import { detectImageType } from './image-type';

const BUCKET = 'portraits';
export const MAX_PORTRAIT_BYTES = 2 * 1024 * 1024;

type Supabase = AdminSession['supabase'];

export async function uploadPortrait(supabase: Supabase, file: File): Promise<{ url: string } | { error: string }> {
  if (file.size > MAX_PORTRAIT_BYTES) return { error: 'Portraits must be 2 MB or smaller.' };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const image = detectImageType(bytes);
  if (!image) return { error: 'Upload a JPEG, PNG, or WebP image.' };

  const path = `${crypto.randomUUID()}.${image.extension}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, { contentType: image.type, cacheControl: '31536000' });
  if (error) return { error: 'The portrait could not be uploaded. Try again.' };
  return { url: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl };
}

/** Deletes an uploaded portrait. Bundled images under /assets are left alone. */
export async function removePortrait(supabase: Supabase, url: string | null) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = url?.indexOf(marker) ?? -1;
  if (!url || index === -1) return;
  // Best effort: an orphaned file is harmless, so a failure here should not fail the save.
  await supabase.storage.from(BUCKET).remove([url.slice(index + marker.length)]);
}
