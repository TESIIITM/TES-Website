'use client';

import { useEffect, useRef } from 'react';
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
  { href: '/admin/github', label: 'GitHub' },
  { href: '/admin/settings', label: 'Links' },
  { href: '/admin/applications', label: 'Applications' },
];

export function AdminNav() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const isCurrent = (href: string) => (href === '/admin' ? pathname === href : pathname.startsWith(href));

  // On small screens the nav is one scrolling row; keep the current page in view.
  useEffect(() => {
    const nav = navRef.current;
    const current = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav || !current || nav.scrollWidth <= nav.clientWidth) return;
    const offset = current.getBoundingClientRect().left - nav.getBoundingClientRect().left;
    nav.scrollLeft += offset - (nav.clientWidth - current.offsetWidth) / 2;
  }, [pathname]);

  return (
    <nav className="admin-nav" aria-label="Admin" ref={navRef}>
      {items.map((item, index) => (
        <Link key={item.href} href={item.href} aria-current={isCurrent(item.href) ? 'page' : undefined}>
          <span>{ordinal(index + 1)}</span>{item.label}
        </Link>
      ))}
    </nav>
  );
}
