import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/auth';

export const metadata: Metadata = { title: 'Overview' };

export default async function OverviewPage() {
  const { supabase } = await requireAdmin();
  const countOnly = { count: 'exact', head: true } as const;
  const [members, hiddenMembers, stories, announcements, drafts, domains] = await Promise.all([
    supabase.from('members').select('*', countOnly).eq('is_published', true),
    supabase.from('members').select('*', countOnly).eq('is_published', false),
    supabase.from('stories').select('*', countOnly).eq('is_published', true),
    supabase.from('announcements').select('*', countOnly).eq('is_published', true),
    supabase.from('announcements').select('*', countOnly).eq('is_published', false),
    supabase.from('domains').select('*', countOnly),
  ]);

  const cards = [
    { href: '/admin/members', label: 'Members', value: members.count, note: hiddenMembers.count ? `${hiddenMembers.count} hidden` : 'Faculty and students' },
    { href: '/admin/announcements', label: 'Announcements', value: announcements.count, note: drafts.count ? `${drafts.count} draft` : 'Shown under Gather' },
    { href: '/admin/stories', label: 'Stories', value: stories.count, note: 'In the reading list' },
    { href: '/admin/domains', label: 'Domains', value: domains.count, note: 'Under Explore the stack' },
  ];

  return (
    <>
      <PageHeader eyebrow="01 / OVERVIEW" title="Site content" description="Everything here is live on the public site as soon as you save it." />
      <div className="admin-stats">
        {cards.map((card) => (
          <Link key={card.href} className="admin-stat" href={card.href}>
            <span className="eyebrow">{card.label}</span>
            <strong>{card.value ?? '—'}</strong>
            <small>{card.note}</small>
          </Link>
        ))}
      </div>
      <section className="admin-panel">
        <h2>Common tasks</h2>
        <ul className="admin-task-list">
          <li><Link href="/admin/members/new">Add a faculty coordinator or student member</Link></li>
          <li><Link href="/admin/announcements/new">Post an announcement</Link></li>
          <li><Link href="/admin/stories/new">Add a Medium story to the reading list</Link></li>
          <li><Link href="/admin/settings">Update social and contact links</Link></li>
        </ul>
      </section>
    </>
  );
}
