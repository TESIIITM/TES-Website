import 'server-only';
import type { AdminSession } from '@/lib/auth';
import { MAX_IMAGE_BYTES, removeImage, uploadImage } from './storage-images';

type Supabase = AdminSession['supabase'];

const messages = {
  'too-large': 'Portraits must be 2 MB or smaller.',
  'not-an-image': 'Upload a JPEG, PNG, or WebP image.',
  failed: 'The portrait could not be uploaded. Try again.',
};

export async function uploadPortrait(supabase: Supabase, file: File): Promise<{ url: string } | { error: string }> {
  if (file.size > MAX_IMAGE_BYTES) return { error: messages['too-large'] };
  const result = await uploadImage(supabase, 'portraits', new Uint8Array(await file.arrayBuffer()));
  return 'error' in result ? { error: messages[result.error] } : result;
}

/** Deletes an uploaded portrait. Bundled images under /assets are left alone. */
export async function removePortrait(supabase: Supabase, url: string | null) {
  await removeImage(supabase, 'portraits', url);
}
