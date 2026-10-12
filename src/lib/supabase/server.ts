import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from './database.types';
import { getSupabaseEnv } from './env';

function requireEnv() {
  const env = getSupabaseEnv();
  if (!env) throw new Error('Supabase is not configured. Set the variables in .env.example.');
  return env;
}

/** A client acting as the signed-in user, for the admin dashboard. */
export async function createSessionClient() {
  const { url, key } = requireEnv();
  const cookieStore = await cookies();
  return createServerClient<Database>(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options);
        } catch {
          // Server Components cannot set cookies. The proxy refreshes the session instead.
        }
      },
    },
  });
}

/**
 * An anonymous client for public reads. It never touches request cookies, so
 * its results can be cached across visitors.
 */
export function createPublicClient() {
  const { url, key } = requireEnv();
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
