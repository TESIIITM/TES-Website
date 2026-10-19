import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { DeleteButton } from '@/components/admin/delete-button';
import { EmptyState, PageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/auth';
import { initials } from '@/lib/format';
import { deleteMember } from './actions';

export const metadata: Metadata = { title: 'Members' };

export default async function MembersPage() {
  const { supabase } = await requireAdmin();
  const { data: members, error } = await supabase.from('members').select('*').order('member_group').order('sort_order').order('name');
  if (error) throw error;

  return (
    <>
      <PageHeader eyebrow="02 / MEMBERS" title="Members" description="Faculty coordinators and student members shown under Meet the collective." action={{ href: '/admin/members/new', label: 'Add member' }} />
      {members.length === 0 ? (
        <EmptyState>No members yet. <Link href="/admin/members/new">Add the first one</Link>.</EmptyState>
      ) : (
        <table className="admin-table">
          <thead><tr><th scope="col">Name</th><th scope="col">Section</th><th scope="col">Order</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id}>
                <td>
                  <div className="admin-person">
                    {member.portrait_url ? <Image src={member.portrait_url} alt="" width={40} height={40} /> : <span aria-hidden="true">{initials(member.name)}</span>}
                    <div><Link href={`/admin/members/${member.id}`}>{member.name}</Link><small>{member.role}</small></div>
                  </div>
                </td>
                <td>{member.member_group === 'faculty' ? 'Faculty' : 'Student'}</td>
                <td>{member.sort_order}</td>
                <td><span className="admin-status" data-published={member.is_published}>{member.is_published ? 'Shown' : 'Hidden'}</span></td>
                <td className="admin-row-actions">
                  <Link className="admin-link" href={`/admin/members/${member.id}`}>Edit</Link>
                  <DeleteButton action={deleteMember.bind(null, member.id)} itemName={member.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
