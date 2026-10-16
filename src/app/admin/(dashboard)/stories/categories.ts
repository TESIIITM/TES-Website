import 'server-only';
import type { AdminSession } from '@/lib/auth';

/** Categories already in use, offered as suggestions so filters stay consistent. */
export async function getStoryCategories(supabase: AdminSession['supabase']): Promise<string[]> {
  const { data } = await supabase.from('stories').select('category');
  return [...new Set((data ?? []).map((row) => row.category))].sort();
}
