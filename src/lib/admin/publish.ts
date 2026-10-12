import 'server-only';
import { revalidatePath, updateTag } from 'next/cache';
import { SITE_CONTENT_TAG } from '@/lib/content/queries';

/** Makes an admin change visible on the public site and refreshes the admin list it came from. */
export function publishChanges(adminPath: string) {
  updateTag(SITE_CONTENT_TAG);
  revalidatePath(adminPath);
}
