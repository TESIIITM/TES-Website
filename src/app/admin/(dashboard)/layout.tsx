import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AdminNav } from '@/components/admin/admin-nav';
import { requireAdmin } from '@/lib/auth';
import { signOut } from '../actions';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { user } = await requireAdmin();
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/admin" aria-label="Dashboard overview">
          <Image className="brand-compass" src="/assets/compass.svg" width={37} height={37} alt="" />
          <Image className="brand-wordmark" src="/assets/enigma-wordmark.png" width={117} height={49} alt="" />
        </Link>
        <AdminNav />
        <div className="admin-account">
          <span className="eyebrow">SIGNED IN</span>
          <p>{user.email}</p>
          <div>
            <Link className="admin-link" href="/" target="_blank">View site ↗</Link>
            <form action={signOut}><button className="admin-link" type="submit">Sign out</button></form>
          </div>
        </div>
      </aside>
      <main className="admin-main" id="admin-main">{children}</main>
    </div>
  );
}
