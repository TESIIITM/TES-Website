'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ordinal } from '@/lib/format';

const items = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/members', label: 'Members' },
  { href: '/admin/announcements', label: 'Announcements' },
  { href: '/admin/stories', label: 'Stories' },
  { href: '/admin/news', label: 'Tech news' },
  { href: '/admin/instagram', label: 'Instagram' },
  { href: '/admin/videos', label: 'Videos' },
  { href: '/admin/domains', label: 'Domains' },
  { href: '/admin/settings', label: 'Links' },
];

export function AdminNav() {
  const pathname = usePathname();
  const isCurrent = (href: string) => (href === '/admin' ? pathname === href : pathname.startsWith(href));
  return (
    <nav className="admin-nav" aria-label="Admin">
      {items.map((item, index) => (
        <Link key={item.href} href={item.href} aria-current={isCurrent(item.href) ? 'page' : undefined}>
          <span>{ordinal(index + 1)}</span>{item.label}
        </Link>
      ))}
    </nav>
  );
}
