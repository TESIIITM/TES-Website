import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from './database.types';
import { getSupabaseEnv } from './env';

/**
 * Refreshes the Supabase session cookie and reports whether a valid session
 * exists. `requestHeaders` carries headers the proxy already added, such as the
 * CSP nonce, and is reused whenever the response has to be rebuilt.
 */
export async function updateSession(request: NextRequest, requestHeaders: Headers) {
  const next = () => NextResponse.next({ request: { headers: requestHeaders } });
  let response = next();

  const env = getSupabaseEnv();
  if (!env) return { response, hasSession: false };

  const supabase = createServerClient<Database>(env.url, env.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        requestHeaders.set('cookie', request.headers.get('cookie') ?? '');
        response = next();
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
      },
    },
  });

  // getClaims verifies the token signature; do not trust an unverified session here.
  const { data } = await supabase.auth.getClaims();
  return { response, hasSession: Boolean(data?.claims) };
}
