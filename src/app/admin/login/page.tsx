import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { SetupNotice } from '@/components/admin/setup-notice';
import { LoginForm } from './login-form';

export const metadata: Metadata = { title: 'Sign in' };

type Props = { searchParams: Promise<{ denied?: string; link?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const configured = isSupabaseConfigured();
  const session = configured ? await getSession() : null;
  if (session?.isAdmin) redirect('/admin');
  const { denied, link } = await searchParams;

  return (
    <main className="admin-login">
      <div className="admin-login-panel">
        <div className="admin-brand">
          <Image className="brand-compass" src="/assets/compass.svg" width={37} height={37} alt="" />
          <Image className="brand-wordmark" src="/assets/enigma-wordmark.png" width={117} height={49} alt="The Enigma Society" />
        </div>
        <span className="eyebrow">CONTENT DASHBOARD</span>
        <h1>Sign in.</h1>
        {configured ? (
          <>
            <p>For society maintainers. Accounts are added by an existing admin.</p>
            {(denied || (session && !session.isAdmin)) && (
              <p className="admin-message admin-message-error" role="alert">That account does not have access to the dashboard. Sign in with an admin account.</p>
            )}
            {link === 'invalid' && (
              <p className="admin-message admin-message-error" role="alert">That link has expired or was already used. Ask an admin to send you a new one.</p>
            )}
            <LoginForm />
          </>
        ) : (
          <SetupNotice />
        )}
        <Link className="admin-link" href="/">← Back to the site</Link>
      </div>
    </main>
  );
}
