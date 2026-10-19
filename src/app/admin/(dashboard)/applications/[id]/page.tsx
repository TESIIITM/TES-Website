import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DeleteButton } from '@/components/admin/delete-button';
import { PageHeader } from '@/components/admin/page-header';
import { SubmitButton } from '@/components/admin/submit-button';
import { requireAdmin } from '@/lib/auth';
import { readEvaluation } from '@/lib/recruitment/ai-prompt';
import { readEvidence } from '@/lib/recruitment/evidence';
import { commitmentLabel, describeChoices, describeOtherClubs, domainQuestion, domainsFor, GENERAL_MENTORSHIP, isStalled, yearLabel } from '@/lib/recruitment/options';
import { importanceOf, IMPORTANCE_LABELS, readScores } from '@/lib/recruitment/rubric';
import { scoreApplication } from '@/lib/recruitment/score';
import { loadCriteria } from '@/lib/recruitment/server';
import { deleteApplication, rerunEvaluation, resendConfirmation, saveReview } from '../actions';
import { ReviewForm } from '../review-form';

export const metadata: Metadata = { title: 'Application' };

const dateTime = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' });

const EMAIL_STATUS: Record<string, string> = { pending: 'Sending…', sent: 'Sent', failed: 'Failed', disabled: 'Email not set up' };
const AI_STATUS: Record<string, string> = { pending: 'Running…', done: 'Done', failed: 'Failed', disabled: 'AI off' };

function Answer({ number, question, children }: { number: number; question: string; children: string | null }) {
  return (
    <div className="admin-answer">
      <h3><span>{String(number).padStart(2, '0')}</span>{question}</h3>
      {children ? <p>{children}</p> : <p className="admin-muted">No answer.</p>}
    </div>
  );
}

export default async function ApplicationPage({ params }: PageProps<'/admin/applications/[id]'>) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const [{ data: application }, criteria] = await Promise.all([
    supabase.from('applications').select('*').eq('id', id).maybeSingle(),
    loadCriteria(supabase),
  ]);
  if (!application) notFound();

  const choices = describeChoices(application);
  // Every question in the order the form asks it. The domain question is only asked next to a technical role.
  const askedDomains = domainsFor(application.roles, [GENERAL_MENTORSHIP]).length > 0 || Boolean(choices.domains);
  const answers: [string, string | null][] = [
    ['Name', application.name],
    ['Roll number', application.roll_number],
    ['Year of study', yearLabel(application.year_of_study)],
    ['Contact email', application.email],
    ['What do you know about TES?', application.knowledge],
    ['What contributions have you made to TES so far?', application.contributions],
    ['What work would you like to showcase?', application.showcase],
    ['How would you like to contribute to TES?', application.plan],
    ['Which roles are you applying for?', choices.roles || null],
    ...(askedDomains ? [[domainQuestion(application.roles), choices.domains || null] as [string, string | null]] : []),
    ['How many hours can you realistically give each week?', `${application.weekly_hours} hours`],
    ['Would you prefer long-term responsibilities, short-term tasks, or a mix?', commitmentLabel(application.commitment)],
    ['Are you part of any other club?', describeOtherClubs(application)],
    ['Anything else you’d like us to know?', application.additional_info],
  ];
  const evaluation = readEvaluation(application.ai_evaluation);
  const evidence = readEvidence(application.auto_evidence);
  const { resolved, summary } = scoreApplication(application, criteria);
  const resume = application.resume_path
    ? (await supabase.storage.from('resumes').createSignedUrl(application.resume_path, 600)).data?.signedUrl ?? null
    : null;
  const stalled = isStalled(application.updated_at);
  const canSendEmail = application.email_status !== 'pending' || stalled;
  const canRunAi = application.ai_status !== 'pending' || stalled;

  const rubricRows = criteria.map((criterion) => ({
    key: criterion.key,
    label: criterion.label,
    weight: criterion.weight,
    importance: IMPORTANCE_LABELS[importanceOf(criterion.weight)],
    auto: readScores(application.auto_scores)[criterion.key] ?? null,
    ai: evaluation?.scores[criterion.key] ?? null,
    admin: readScores(application.admin_scores)[criterion.key] ?? null,
    current: resolved.find((entry) => entry.key === criterion.key) ?? null,
  }));

  return (
    <>
      <PageHeader
        eyebrow={`${application.roll_number} / ${yearLabel(application.year_of_study).toUpperCase()}`}
        title={application.name}
        description={<><a className="admin-link" href={`mailto:${application.email}`}>{application.email}</a> · Applied {dateTime.format(new Date(application.created_at))}</>}
        back={{ href: '/admin/applications', label: 'Applications' }}
      />

      <div className="admin-stats admin-application-stats">
        <div className="admin-stat"><span className="eyebrow">Score</span><strong>{summary.score ?? '—'}</strong><small>{summary.scored} of {summary.total} criteria scored</small></div>
        <div className="admin-stat"><span className="eyebrow">Roles</span><strong className="admin-stat-text">{choices.roles}</strong><small>{choices.domains}</small></div>
        <div className="admin-stat"><span className="eyebrow">Availability</span><strong>{application.weekly_hours}<span className="admin-stat-unit"> h/wk</span></strong><small>{commitmentLabel(application.commitment)}</small><small>Other clubs: {describeOtherClubs(application)}</small></div>
        <div className="admin-stat">
          <span className="eyebrow">Confirmation email</span>
          <strong className="admin-stat-text">{EMAIL_STATUS[application.email_status] ?? application.email_status}</strong>
          {application.email_error && <small title={application.email_error}>{application.email_error.slice(0, 80)}</small>}
          {canSendEmail && (
            <form action={resendConfirmation.bind(null, application.id)}><SubmitButton pendingLabel="Sending…">{application.email_status === 'sent' ? 'Send again' : 'Retry email'}</SubmitButton></form>
          )}
        </div>
        <div className="admin-stat">
          <span className="eyebrow">AI evaluation</span>
          <strong className="admin-stat-text">{AI_STATUS[application.ai_status] ?? application.ai_status}</strong>
          {application.ai_error && <small title={application.ai_error}>{application.ai_error.slice(0, 80)}</small>}
          {canRunAi && (
            <form action={rerunEvaluation.bind(null, application.id)}><SubmitButton pendingLabel="Starting…">{application.ai_status === 'done' ? 'Run again' : application.ai_status === 'pending' ? 'Retry' : 'Run AI'}</SubmitButton></form>
          )}
        </div>
      </div>

      <div className="admin-application">
        <section className="admin-panel" aria-labelledby="answers-title">
          <h2 id="answers-title">Answers</h2>
          {answers.map(([question, answer], index) => <Answer key={question} number={index + 1} question={question}>{answer}</Answer>)}

          <div className="admin-answer">
            <h3><span>↗</span>Portfolio links</h3>
            {application.links.length ? (
              <ul className="admin-links">
                {application.links.map((link) => <li key={link}><a href={link} target="_blank" rel="noopener noreferrer nofollow">{link}</a></li>)}
              </ul>
            ) : <p className="admin-muted">No links found in the answers.</p>}
          </div>
          <div className="admin-answer">
            <h3><span>{String(answers.length + 1).padStart(2, '0')}</span>Resume</h3>
            {resume ? <p><a className="admin-link" href={resume} target="_blank" rel="noopener noreferrer">Open resume (PDF, link valid for 10 minutes) ↗</a></p> : <p className="admin-muted">{application.resume_path ? 'The resume could not be opened.' : 'No resume attached.'}</p>}
          </div>
        </section>

        <aside className="admin-application-side">
          <section className="admin-panel" aria-labelledby="checks-title">
            <h2 id="checks-title">Automatic checks</h2>
            {evidence.length ? (
              <ul className="admin-evidence">
                {evidence.map((entry) => <li key={entry.text} data-kind={entry.kind}>{entry.text}</li>)}
              </ul>
            ) : <p className="admin-muted">Not run yet.</p>}
          </section>

          <section className="admin-panel admin-ai" aria-labelledby="ai-title">
            <h2 id="ai-title">AI evaluation</h2>
            <p className="admin-ai-note">Suggestions only. Check them against the answers; nothing here changes the status.</p>
            {evaluation ? (
              <>
                {evaluation.flags.length > 0 && (
                  <ul className="admin-ai-flags" aria-label="Flags">{evaluation.flags.map((flag) => <li key={flag}>{flag}</li>)}</ul>
                )}
                <p>{evaluation.summary}</p>
                <h3>Strengths</h3>
                {evaluation.strengths.length ? <ul>{evaluation.strengths.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="admin-muted">None noted.</p>}
                <h3>Concerns</h3>
                {evaluation.concerns.length ? <ul>{evaluation.concerns.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="admin-muted">None noted.</p>}
                <h3>Evidence</h3>
                {evaluation.evidence.length ? (
                  <ul className="admin-ai-evidence">
                    {evaluation.evidence.map((item) => (
                      <li key={item.point + item.quote}>
                        {item.point}
                        <blockquote data-verified={item.verified}>“{item.quote}”</blockquote>
                        {!item.verified && <small>This quote was not found in the answers.</small>}
                      </li>
                    ))}
                  </ul>
                ) : <p className="admin-muted">No evidence cited.</p>}
                <h3>Suitability</h3>
                <p>{evaluation.suitability}</p>
                {evaluation.suggested_role && <><h3>Suggested role</h3><p>{evaluation.suggested_role}</p></>}
                <p className="admin-mono">{application.ai_model}{application.ai_evaluated_at ? ` · ${dateTime.format(new Date(application.ai_evaluated_at))}` : ''}</p>
              </>
            ) : (
              <p className="admin-muted">{application.ai_status === 'failed' ? 'The AI evaluation failed. Try running it again.' : application.ai_status === 'disabled' ? 'AI evaluation is turned off. Score the application below.' : 'The evaluation is still running. Refresh in a minute.'}</p>
            )}
          </section>
        </aside>
      </div>

      <section className="admin-panel" aria-labelledby="review-title">
        <h2 id="review-title">Your review</h2>
        <ReviewForm
          action={saveReview.bind(null, application.id)}
          status={application.status}
          notes={application.admin_notes}
          rows={rubricRows}
        />
      </section>

      <div className="admin-danger-zone">
        <DeleteButton action={deleteApplication.bind(null, application.id)} itemName={`${application.name}’s application`} label="Delete application" />
        <p className="admin-muted">Removes the answers and resume for good, e.g. if the student asks for their data to be deleted.</p>
      </div>
    </>
  );
}
