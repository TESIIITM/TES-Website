import 'server-only';
import type { AdminSession } from '@/lib/auth';
import { downloadPreviewImage } from './link-preview';
import { MAX_IMAGE_BYTES, uploadImage, type ImageBucket } from './storage-images';

const uploadMessages = {
  'too-large': 'Images must be 2 MB or smaller.',
  'not-an-image': 'Use a JPEG, PNG, or WebP image.',
  failed: 'The image could not be uploaded. Try again.',
};

/** A fetched share image as a data URL, since the dashboard's CSP only loads images from this site. */
export async function previewImage(url: string | null): Promise<{ sourceUrl: string; dataUrl: string } | null> {
  const image = url ? await downloadPreviewImage(url) : null;
  return image && url ? { sourceUrl: url, dataUrl: `data:${image.type};base64,${Buffer.from(image.bytes).toString('base64')}` } : null;
}

/**
 * Stores the image a form chose, from the `image`, `imageSourceUrl`, and `removeImage`
 * fields. An uploaded file wins over a fetched image. `undefined` keeps the
 * current image and `null` clears it.
 */
export async function storeChosenImage(supabase: AdminSession['supabase'], bucket: ImageBucket, formData: FormData, sourceUrl: string | null): Promise<{ error: string } | { url: string | null | undefined }> {
  const file = formData.get('image');
  let bytes: Uint8Array;
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_IMAGE_BYTES) return { error: uploadMessages['too-large'] };
    bytes = new Uint8Array(await file.arrayBuffer());
  } else if (sourceUrl) {
    const image = await downloadPreviewImage(sourceUrl);
    if (!image) return { error: 'The preview image could not be copied. Fetch the preview again, or upload an image.' };
    bytes = image.bytes;
  } else {
    return { url: formData.get('removeImage') === 'on' ? null : undefined };
  }
  const upload = await uploadImage(supabase, bucket, bytes);
  return 'error' in upload ? { error: uploadMessages[upload.error] } : upload;
}
