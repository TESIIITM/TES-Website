export type SupabaseEnv = { url: string; key: string };

/** Returns `null` when the project is not connected to Supabase. */
export function getSupabaseEnv(): SupabaseEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return url && key ? { url, key } : null;
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseEnv() !== null;
}

/**
 * The project's secret key, for server code that has to write rows no visitor
 * may write themselves, such as recruitment applications. Never expose it to
 * the browser: it bypasses row level security.
 */
export function getSupabaseSecretKey(): string | null {
  return process.env.SUPABASE_SECRET_KEY || null;
}
