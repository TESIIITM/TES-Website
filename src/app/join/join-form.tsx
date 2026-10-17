'use client';

import { useActionState, useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { ArrowRight, Check, FileText } from 'lucide-react';
import { initialFormState, type FormState } from '@/lib/admin/form-state';
import { ANSWER_MAX, COMMITMENTS, YEARS } from '@/lib/recruitment/options';
import { IMPORTANCE_LABELS, type Importance } from '@/lib/recruitment/rubric';
import { submitApplication } from './actions';

type Props = { departments: string[]; importance: Record<string, Importance> };

/** Fields that must be filled, for the progress bar. */
const REQUIRED = ['name', 'rollNumber', 'yearOfStudy', 'email', 'knowledge', 'contributions', 'showcase', 'plan', 'department', 'role', 'weeklyHours', 'commitment', 'consent'];

function value(state: FormState, name: string) {
  return state.values?.[name] ?? '';
}

function Weight({ level }: { level?: Importance }) {
  if (!level) return null;
  return (
    <span className="join-weight" data-level={level} title={`${IMPORTANCE_LABELS[level]} importance in how applications are reviewed`}>
      <span className="join-weight-bars" aria-hidden="true"><i /><i /><i /></span>
      {IMPORTANCE_LABELS[level]}<span className="sr-only"> importance</span>
    </span>
  );
}

type QuestionProps = {
  number: string;
  name: string;
  label: string;
  state: FormState;
  hint?: ReactNode;
  level?: Importance;
  note?: string;
  optional?: boolean;
  children: (describedBy: string | undefined, invalid: boolean) => ReactNode;
  wide?: boolean;
};

function Question({ number, name, label, state, hint, level, note, optional, children, wide }: QuestionProps) {
  const error = state.fieldErrors?.[name]?.[0];
  const describedBy = [hint && `${name}-hint`, error && `${name}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`join-question ${wide ? 'join-question-wide' : ''}`} data-invalid={error ? '' : undefined}>
      <div className="join-question-head">
        <span className="join-question-number">{number}</span>
        <label htmlFor={name}>{label}{optional && <span className="join-optional"> (optional)</span>}</label>
        <Weight level={level} />
        {note && <span className="join-weight join-weight-note">{note}</span>}
      </div>
      {hint && <p className="join-hint" id={`${name}-hint`}>{hint}</p>}
      {children(describedBy, Boolean(error))}
      {error && <p className="join-error" id={`${name}-error`}>{error}</p>}
    </div>
  );
}

function Answer({ name, state, describedBy, invalid, rows = 5, max = ANSWER_MAX, placeholder }: { name: string; state: FormState; describedBy?: string; invalid: boolean; rows?: number; max?: number; placeholder?: string }) {
  const [length, setLength] = useState(value(state, name).length);
  return (
    <div className="join-answer">
      <textarea
        id={name}
        name={name}
        rows={rows}
        maxLength={max}
        placeholder={placeholder}
        defaultValue={value(state, name)}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        onChange={(event) => setLength(event.target.value.length)}
      />
      <span className="join-count" aria-hidden="true">{length} / {max}</span>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="button button-primary join-submit" type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? 'Sending…' : 'Send application'} <ArrowRight size={18} />
    </button>
  );
}

export function JoinForm({ departments, importance }: Props) {
  const [state, formAction] = useActionState(submitApplication, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const [filled, setFilled] = useState(0);
  const [resumeName, setResumeName] = useState<string | null>(null);
  // A returned form keeps what was typed, but browsers clear file inputs.
  const [shownState, setShownState] = useState(state);
  if (shownState !== state) {
    setShownState(state);
    setResumeName(null);
  }

  const measure = () => {
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);
    setFilled(REQUIRED.filter((name) => String(data.get(name) ?? '').trim() !== '').length);
  };
  useEffect(measure, [state]);

  if (state.status === 'saved') {
    return (
      <section className="join-done" role="status">
        <span className="join-done-mark"><Check size={28} /></span>
        <span className="eyebrow">APPLICATION RECEIVED</span>
        <h1>Thank you{state.message ? `, ${state.message.split(/\s+/)[0]}` : ''}.</h1>
        <p>We’ve received your application. Our team will review it, and you’ll hear from us about the next steps. A confirmation email is on its way.</p>
        <p>Until then, keep building and contributing.</p>
        <Link className="text-action" href="/#build">Explore TES projects <ArrowRight size={17} /></Link>
      </section>
    );
  }

  const progress = Math.round((filled / REQUIRED.length) * 100);

  return (
    <div className="join-layout">
      <aside className="join-intro">
        <span className="eyebrow">RECRUITMENT <span className="slash">/</span> OPEN WEIGHTS</span>
        <h1>Join the <br /><em>society.</em></h1>
        <p className="join-lead">Tell us what you know, what you have built, and what you want to build with us. There is no experience threshold.</p>
        <div className="join-legend">
          <h2>How we read this</h2>
          <p>Each question shows how much it counts in our review. We publish the importance, not the exact numbers.</p>
          <ul>
            <li><Weight level="high" /> Weighs most</li>
            <li><Weight level="medium" /> Counts</li>
            <li><Weight level="low" /> Small part</li>
          </ul>
          <p>We look for evidence, not polish. A short answer with a link to real work beats a long one without. Write in your own words.</p>
        </div>
        <div className="join-progress" aria-hidden="true">
          <span>{progress}% complete</span>
          <div><i style={{ width: `${progress}%` }} /></div>
        </div>
      </aside>

      {/* Remounted after each attempt: React resets a select to its first default after a form action. */}
      <form key={JSON.stringify(state.values ?? null)} ref={formRef} className="join-form" action={formAction} onInput={measure} onChange={measure} noValidate>
        {state.status === 'error' && state.message && <p className="join-message" role="alert">{state.message}</p>}

        {/* Hidden from people; bots that fill it are ignored. */}
        <div className="join-trap" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <fieldset className="join-section">
          <legend><span>01</span> Basic details</legend>
          <div className="join-grid">
            <Question number="1" name="name" label="Name" state={state}>
              {(describedBy, invalid) => <input id="name" name="name" autoComplete="name" maxLength={120} required defaultValue={value(state, 'name')} aria-describedby={describedBy} aria-invalid={invalid || undefined} />}
            </Question>
            <Question number="2" name="rollNumber" label="Roll number" state={state}>
              {(describedBy, invalid) => <input id="rollNumber" name="rollNumber" maxLength={30} required placeholder="2024IMT-045" autoCapitalize="characters" defaultValue={value(state, 'rollNumber')} aria-describedby={describedBy} aria-invalid={invalid || undefined} />}
            </Question>
            <Question number="3" name="yearOfStudy" label="Year of study" state={state}>
              {(describedBy, invalid) => (
                <select id="yearOfStudy" name="yearOfStudy" required defaultValue={value(state, 'yearOfStudy')} aria-describedby={describedBy} aria-invalid={invalid || undefined}>
                  <option value="" disabled>Choose your year</option>
                  {YEARS.map((year) => <option key={year.value} value={year.value}>{year.label}</option>)}
                </select>
              )}
            </Question>
            <Question number="4" name="email" label="Contact email" state={state} hint="We send your confirmation here.">
              {(describedBy, invalid) => <input id="email" name="email" type="email" autoComplete="email" maxLength={254} required defaultValue={value(state, 'email')} aria-describedby={describedBy} aria-invalid={invalid || undefined} />}
            </Question>
          </div>
        </fieldset>

        <fieldset className="join-section">
          <legend><span>02</span> Understanding &amp; contribution</legend>
          <Question number="5" name="knowledge" label="What do you know about TES?" level={importance.knowledge} state={state} wide>
            {(describedBy, invalid) => <Answer name="knowledge" state={state} describedBy={describedBy} invalid={invalid} rows={4} />}
          </Question>
          <Question number="6" name="contributions" label="What contributions have you made to TES so far?" level={importance.contributions} state={state} wide
            hint="Pull requests, issues, events you helped with, posts you wrote. New here? That’s fine: tell us what you’ve explored so far and what drew you in.">
            {(describedBy, invalid) => <Answer name="contributions" state={state} describedBy={describedBy} invalid={invalid} />}
          </Question>
          <Question number="7" name="showcase" label="What work would you like to showcase?" level={importance.showcase} state={state} wide
            hint="Paste links to projects, GitHub, designs, articles, or events, and say what you did in each.">
            {(describedBy, invalid) => <Answer name="showcase" state={state} describedBy={describedBy} invalid={invalid} placeholder={'https://github.com/you/project: built the API and the tests'} />}
          </Question>
          <Question number="8" name="plan" label="How would you like to contribute to TES?" level={importance.plan} state={state} wide
            hint="Be specific: an idea, an initiative, or a problem you want to solve, and your first step.">
            {(describedBy, invalid) => <Answer name="plan" state={state} describedBy={describedBy} invalid={invalid} />}
          </Question>
        </fieldset>

        <fieldset className="join-section">
          <legend><span>03</span> Role preferences &amp; commitment</legend>
          <div className="join-grid">
            <Question number="9" name="department" label="Which department would you like to join?" level={importance.department_fit} state={state}>
              {(describedBy, invalid) => (
                <select id="department" name="department" required defaultValue={value(state, 'department')} aria-describedby={describedBy} aria-invalid={invalid || undefined}>
                  <option value="" disabled>Choose a department</option>
                  {departments.map((department) => <option key={department} value={department}>{department}</option>)}
                </select>
              )}
            </Question>
            <Question number="10" name="role" label="Which specific role interests you?" state={state} hint="e.g. Frontend developer, UI designer, event lead.">
              {(describedBy, invalid) => <input id="role" name="role" maxLength={120} required defaultValue={value(state, 'role')} aria-describedby={describedBy} aria-invalid={invalid || undefined} />}
            </Question>
            <Question number="11" name="weeklyHours" label="How many hours can you realistically give each week?" level={importance.availability} state={state} hint="Be honest. Steady beats ambitious.">
              {(describedBy, invalid) => <input id="weeklyHours" name="weeklyHours" type="number" inputMode="numeric" min={1} max={40} step={1} required defaultValue={value(state, 'weeklyHours')} aria-describedby={describedBy} aria-invalid={invalid || undefined} />}
            </Question>
          </div>
          <div className="join-question join-question-wide" data-invalid={state.fieldErrors?.commitment ? '' : undefined}>
            <div className="join-question-head" id="commitment-label">
              <span className="join-question-number">12</span>
              <span className="join-label">Would you prefer long-term responsibilities, short-term tasks, or a mix?</span>
              <span className="join-weight join-weight-note">Not scored</span>
            </div>
            <p className="join-hint" id="commitment-hint">Used only to match you with the right work, never to turn anyone away.</p>
            <div className="join-choices" role="radiogroup" aria-labelledby="commitment-label" aria-describedby={`commitment-hint${state.fieldErrors?.commitment ? ' commitment-error' : ''}`}>
              {COMMITMENTS.map((commitment) => (
                <label key={commitment.value} className="join-choice">
                  <input type="radio" name="commitment" value={commitment.value} defaultChecked={value(state, 'commitment') === commitment.value} />
                  <span><b>{commitment.label}</b><small>{commitment.hint}</small></span>
                </label>
              ))}
            </div>
            {state.fieldErrors?.commitment && <p className="join-error" id="commitment-error">{state.fieldErrors.commitment[0]}</p>}
          </div>
        </fieldset>

        <fieldset className="join-section">
          <legend><span>04</span> Additional information</legend>
          <Question number="13" name="additionalInfo" label="Anything else you’d like us to know?" state={state} optional wide>
            {(describedBy, invalid) => <Answer name="additionalInfo" state={state} describedBy={describedBy} invalid={invalid} rows={3} max={2000} />}
          </Question>
          <Question number="14" name="resume" label="Resume" level={importance.resume} state={state} optional wide hint="A PDF up to 2 MB.">
            {(describedBy, invalid) => (
              <label className="join-file" htmlFor="resume">
                <FileText size={18} />
                <span>{resumeName ?? 'Choose a PDF'}</span>
                <input id="resume" name="resume" type="file" accept="application/pdf" aria-describedby={describedBy} aria-invalid={invalid || undefined}
                  onChange={(event) => setResumeName(event.target.files?.[0]?.name ?? null)} />
              </label>
            )}
          </Question>
        </fieldset>

        <div className="join-submit-row">
          <div className="join-consent" data-invalid={state.fieldErrors?.consent ? '' : undefined}>
            <input id="consent" name="consent" type="checkbox" defaultChecked={value(state, 'consent') === 'on'} aria-describedby={state.fieldErrors?.consent ? 'consent-error' : 'consent-hint'} />
            <label htmlFor="consent">I confirm these answers are my own, and I agree that TES reviewers may read them.</label>
            <p className="join-hint" id="consent-hint">Your answers are seen only by the TES review team. Reviewers may use an AI tool to help summarise them, without your name, roll number, or email; people make every decision.</p>
            {state.fieldErrors?.consent && <p className="join-error" id="consent-error">{state.fieldErrors.consent[0]}</p>}
          </div>
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
