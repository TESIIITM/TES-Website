import type { Metadata } from 'next';
import { PageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/auth';
import { saveMember } from '../actions';
import { MemberForm } from '../member-form';

export const metadata: Metadata = { title: 'Add member' };

export default async function NewMemberPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader eyebrow="02 / MEMBERS" title="Add member" back={{ href: '/admin/members', label: 'Members' }} />
      <MemberForm action={saveMember.bind(null, null)} />
    </>
  );
}
