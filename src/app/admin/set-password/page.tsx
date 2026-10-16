import type { Metadata } from 'next';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { SetPasswordForm } from './set-password-form';

export const metadata: Metadata = { title: 'Choose a password' };

export default async function SetPasswordPage() {
  const session = await getSession();
  if (!session) redirect('/admin/login?link=invalid');

  return (
    <main className="admin-login">
      <div className="admin-login-panel">
        <div className="admin-brand">
          <Image className="brand-compass" src="/assets/compass.svg" width={37} height={37} alt="" />
          <Image className="brand-wordmark" src="/assets/enigma-wordmark.png" width={117} height={49} alt="The Enigma Society" />
        </div>
        <span className="eyebrow">CONTENT DASHBOARD</span>
        <h1>Choose a password.</h1>
        <p>You will use it with <strong>{session.user.email}</strong> to sign in to the dashboard.</p>
        <SetPasswordForm email={session.user.email ?? ''} />
      </div>
    </main>
  );
}
