import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState, PageHeader } from '@/components/admin/page-header';
import { ShareLink } from '@/components/share-link';
import { requireAdmin } from '@/lib/auth';
import { readEvaluation } from '@/lib/recruitment/ai-prompt';
import { commitmentLabel, describeChoices, STATUSES, statusLabel, yearLabel, type ApplicationStatus } from '@/lib/recruitment/options';
import { scoreApplication } from '@/lib/recruitment/score';
import { loadCriteria } from '@/lib/recruitment/server';
import { getSupabaseSecretKey } from '@/lib/supabase/env';

export const metadata: Metadata = { title: 'Applications' };

const SORTS = { score: 'Highest score', newest: 'Newest first', oldest: 'Oldest first' } as const;
type Sort = keyof typeof SORTS;

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

export default async function ApplicationsPage({ searchParams }: PageProps<'/admin/applications'>) {
  const params = await searchParams;
  const status = STATUSES.some((entry) => entry.value === params.status) ? (params.status as ApplicationStatus) : null;
  const sort: Sort = typeof params.sort === 'string' && params.sort in SORTS ? (params.sort as Sort) : 'newest';
  const query = typeof params.q === 'string' ? params.q.trim().slice(0, 80) : '';

  const { supabase } = await requireAdmin();
  const [criteria, applications, settings] = await Promise.all([
    loadCriteria(supabase),
    supabase.from('applications').select('id, name, roll_number, year_of_study, roles, domains, department, role, weekly_hours, commitment, status, auto_scores, admin_scores, ai_evaluation, ai_status, email_status, created_at').order('created_at', { ascending: sort === 'oldest' }),
    supabase.from('recruitment_settings').select('is_open').maybeSingle(),
  ]);
  if (applications.error) throw applications.error;

  const counts = Object.fromEntries(STATUSES.map((entry) => [entry.value, 0])) as Record<ApplicationStatus, number>;
  for (const application of applications.data) counts[application.status]++;

  const needle = query.toLowerCase();
  const rows = applications.data
    .map((application) => ({ ...application, choices: describeChoices(application) }))
    .filter((application) => !status || application.status === status)
    .filter((application) => !needle || [application.name, application.roll_number, application.choices.roles, application.choices.domains].some((field) => field.toLowerCase().includes(needle)))
    .map((application) => ({ ...application, ...scoreApplication(application, criteria), evaluation: readEvaluation(application.ai_evaluation) }));
  if (sort === 'score') rows.sort((a, b) => (b.summary.score ?? -1) - (a.summary.score ?? -1));

  const href = (next: { status?: string | null; sort?: Sort }) => {
    const search = new URLSearchParams();
    const nextStatus = next.status === undefined ? status : next.status;
    if (nextStatus) search.set('status', nextStatus);
    if ((next.sort ?? sort) !== 'newest') search.set('sort', next.sort ?? sort);
    if (query) search.set('q', query);
    const string = search.toString();
    return string ? `/admin/applications?${string}` : '/admin/applications';
  };

  return (
    <>
      <PageHeader
        eyebrow="11 / RECRUITMENT"
        title="Applications"
        description="Everyone who applied through the JOIN TES form. Scores and AI notes help you read; you decide."
        action={{ href: '/admin/applications/settings', label: 'Form & rubric' }}
      />

      <div className="admin-recruit-bar">
        <span className="admin-status" data-published={settings.data?.is_open ?? false}>{settings.data?.is_open ? 'Form open' : 'Form closed'}</span>
        <Link className="admin-link" href="/join" target="_blank">Open the form ↗</Link>
        <ShareLink label="Copy form link" className="admin-link admin-share" />
      </div>
      {!getSupabaseSecretKey() && (
        <div className="admin-notice">
          <p><strong>The form cannot accept applications yet.</strong> Set <code>SUPABASE_SECRET_KEY</code> on the server as described in the README.</p>
        </div>
      )}

      <nav className="admin-filters" aria-label="Filter by status">
        <Link href={href({ status: null })} aria-current={!status ? 'page' : undefined}>All <span>{applications.data.length}</span></Link>
        {STATUSES.map((entry) => (
          <Link key={entry.value} href={href({ status: entry.value })} aria-current={status === entry.value ? 'page' : undefined}>{entry.label} <span>{counts[entry.value]}</span></Link>
        ))}
      </nav>
      <form className="admin-toolbar" action="/admin/applications">
        {status && <input type="hidden" name="status" value={status} />}
        <label className="sr-only" htmlFor="q">Search applications</label>
        <input id="q" name="q" type="search" placeholder="Search name, roll number, role, domain" defaultValue={query} />
        <label className="sr-only" htmlFor="sort">Sort</label>
        <select id="sort" name="sort" defaultValue={sort}>
          {Object.entries(SORTS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <button className="admin-button admin-button-quiet" type="submit">Apply</button>
      </form>

      {rows.length === 0 ? (
        <EmptyState>{applications.data.length === 0 ? 'No applications yet. Share the form link to get started.' : 'No applications match these filters.'}</EmptyState>
      ) : (
        <table className="admin-table admin-applications">
          <thead>
            <tr>
              <th scope="col">Applicant</th>
              <th scope="col">Year</th>
              <th scope="col">Roles and domains</th>
              <th scope="col">Availability</th>
              <th scope="col">Score</th>
              <th scope="col">AI summary</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td><Link href={`/admin/applications/${row.id}`}>{row.name}</Link><small className="admin-mono">{row.roll_number}</small></td>
                <td className="admin-nowrap">{yearLabel(row.year_of_study)}</td>
                <td>{row.choices.roles}<small>{row.choices.domains}</small></td>
                <td className="admin-nowrap">{row.weekly_hours} h / week<small>{commitmentLabel(row.commitment)}</small></td>
                <td className="admin-nowrap">
                  <strong className="admin-score">{row.summary.score ?? '—'}</strong>
                  <small>{row.summary.scored} of {row.summary.total} scored</small>
                </td>
                <td className="admin-summary">
                  {row.evaluation ? truncate(row.evaluation.summary, 160) : <span className="admin-muted">{row.ai_status === 'failed' ? 'AI evaluation failed' : row.ai_status === 'disabled' ? 'AI off' : 'Waiting for AI'}</span>}
                </td>
                <td><span className="admin-status admin-application-status" data-status={row.status}>{statusLabel(row.status)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
