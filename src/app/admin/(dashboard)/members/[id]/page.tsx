import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/auth';
import { saveMember } from '../actions';
import { MemberForm } from '../member-form';

export const metadata: Metadata = { title: 'Edit member' };

export default async function EditMemberPage({ params }: PageProps<'/admin/members/[id]'>) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data: member } = await supabase.from('members').select('*').eq('id', id).maybeSingle();
  if (!member) notFound();

  return (
    <>
      <PageHeader eyebrow="02 / MEMBERS" title={member.name} back={{ href: '/admin/members', label: 'Members' }} />
      <MemberForm member={member} action={saveMember.bind(null, member.id)} />
    </>
  );
}
