import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';

const isDev = process.env.NODE_ENV === 'development';

// Reachable without a session: sign-in, and the route that turns an emailed link into one.
const PUBLIC_ADMIN_PATHS = new Set(['/admin/login', '/admin/auth/confirm']);

function contentSecurityPolicy(nonce: string) {
  return [
    "default-src 'self'",
    // React needs eval in development only, for its debugging tools.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    // Motion and Radix animate through inline style attributes.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "connect-src 'self'",
    // Video players under Learn, loaded only when a visitor presses play.
    "frame-src https://www.youtube-nocookie.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ['upgrade-insecure-requests']),
  ].join('; ');
}

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = contentSecurityPolicy(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  let response: NextResponse;
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/admin')) {
    const session = await updateSession(request, requestHeaders);
    // A quick redirect for signed-out visitors. Pages and actions still check admin rights.
    response = !session.hasSession && !PUBLIC_ADMIN_PATHS.has(pathname)
      ? NextResponse.redirect(new URL('/admin/login', request.url))
      : session.response;
    response.headers.set('Cache-Control', 'private, no-store');
  } else {
    response = NextResponse.next({ request: { headers: requestHeaders } });
  }

  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|assets/|favicon.svg|licenses/).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
