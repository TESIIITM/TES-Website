import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { createSessionClient } from '@/lib/supabase/server';

/** The signed-in user and whether they may edit content. Deduplicated per request. */
export const getSession = cache(async () => {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSessionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: isAdmin, error } = await supabase.rpc('is_admin');
  return { supabase, user, isAdmin: !error && isAdmin === true };
});

/**
 * Call at the top of every admin page and Server Action. Row level security
 * enforces the same rule in the database; this keeps non-admins out of the UI.
 */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect('/admin/login');
  if (!session.isAdmin) redirect('/admin/login?denied=1');
  return session;
}

export type AdminSession = Awaited<ReturnType<typeof requireAdmin>>;
