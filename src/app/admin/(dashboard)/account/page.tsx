import type { Metadata } from 'next';
import { PageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/auth';
import { ChangePasswordForm } from './change-password-form';

export const metadata: Metadata = { title: 'Password' };

export default async function AccountPage() {
  const { user } = await requireAdmin();
  return (
    <>
      <PageHeader eyebrow="ACCOUNT" title="Password" description={`Change the password for ${user.email}.`} />
      <ChangePasswordForm email={user.email ?? ''} />
    </>
  );
}
