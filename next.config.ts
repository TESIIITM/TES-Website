import type { NextConfig } from 'next';

type RemotePattern = NonNullable<NonNullable<NextConfig['images']>['remotePatterns']>[number];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL) : null;

// Portraits, news and Instagram images, and video thumbnails uploaded from the admin dashboard are served from Supabase Storage.
const storagePatterns: RemotePattern[] = supabaseUrl
  ? ['portraits', 'news-images', 'instagram-images', 'video-thumbnails'].map((bucket): RemotePattern => ({
      protocol: supabaseUrl.protocol === 'http:' ? 'http' : 'https',
      hostname: supabaseUrl.hostname,
      port: supabaseUrl.port,
      pathname: `/storage/v1/object/public/${bucket}/**`,
    }))
  : [];

// Contributor avatars under Build.
const githubAvatars: RemotePattern = { protocol: 'https', hostname: 'avatars.githubusercontent.com', pathname: '/u/**' };

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  ...(process.env.NODE_ENV === 'production' ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000' }] : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [...storagePatterns, githubAvatars],
    // Next.js refuses to optimize images from private addresses. Allow it only
    // when the app is explicitly pointed at a local Supabase stack.
    dangerouslyAllowLocalIP: supabaseUrl?.hostname === '127.0.0.1' || supabaseUrl?.hostname === 'localhost',
  },
  experimental: {
    // Portrait uploads are capped at 2 MB; leave room for multipart overhead.
    serverActions: { bodySizeLimit: '2.2mb' },
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  async redirects() {
    // Paths from the original multi-page site.
    return [
      { source: '/about', destination: '/#about', permanent: true },
      { source: '/articles', destination: '/#learn', permanent: true },
    ];
  },
};

export default nextConfig;
