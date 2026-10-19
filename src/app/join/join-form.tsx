'use client';

import { useActionState, useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { ArrowRight, Check, FileText } from 'lucide-react';
import { initialFormState, type FormState } from '@/lib/admin/form-state';
import { ANSWER_MAX, ANSWER_MIN, COMMITMENTS, MAX_DOMAINS, YEARS, domainQuestion, domainsFor, rolesFor } from '@/lib/recruitment/options';
import { IMPORTANCE_LABELS, type Importance } from '@/lib/recruitment/rubric';
import { submitApplication } from './actions';
import { CommitmentGlyph, JoinSidebar, SectionHeading, Signature } from './form-art';
import { DomainPicker, RolePicker } from './pickers';

type Props = { departments: string[]; importance: Record<string, Importance> };

/** Fields that must be filled, for the progress bar. The domain question joins them when a technical role is picked. */
const REQUIRED = ['name', 'rollNumber', 'yearOfStudy', 'email', 'knowledge', 'contributions', 'showcase', 'plan', 'roles', 'weeklyHours', 'commitment', 'otherClubs', 'consent'];
/** The required fields in each section, to mark a section done. */
const SECTIONS = [['name', 'rollNumber', 'yearOfStudy', 'email'], ['knowledge', 'contributions', 'showcase', 'plan'], ['roles', 'domains', 'weeklyHours', 'commitment', 'otherClubs', 'otherClubsDetail'], ['consent']];

function value(state: FormState, name: string) {
  return state.values?.[name] ?? '';
}

/** Checkbox picks come back from the server one per line. */
function picks(state: FormState, name: string) {
  return value(state, name).split('\n').filter(Boolean);
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

function Question({ name, label, state, hint, level, note, optional, children, wide }: QuestionProps) {
  const error = state.fieldErrors?.[name]?.[0];
  const describedBy = [hint && `${name}-hint`, error && `${name}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`join-question ${wide ? 'join-question-wide' : ''}`} data-invalid={error ? '' : undefined}>
      <div className="join-question-head">
        <label htmlFor={name} id={`${name}-label`}>{label}{optional && <span className="join-optional"> (optional)</span>}</label>
        <Weight level={level} />
        {note && <span className="join-weight join-weight-note">{note}</span>}
      </div>
      {/* Short fields sit side by side, so their hints go below to keep the inputs level. */}
      {hint && wide && <p className="join-hint" id={`${name}-hint`}>{hint}</p>}
      {children(describedBy, Boolean(error))}
      {hint && !wide && <p className="join-hint" id={`${name}-hint`}>{hint}</p>}
      {error && <p className="join-error" id={`${name}-error`}>{error}</p>}
    </div>
  );
}

function Answer({ name, state, describedBy, invalid, rows = 5, min = ANSWER_MIN, max = ANSWER_MAX, placeholder }: { name: string; state: FormState; describedBy?: string; invalid: boolean; rows?: number; min?: number; max?: number; placeholder?: string }) {
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
      <span className="join-count" aria-hidden="true">{length > 0 && length < min ? `${length} / ${min} minimum` : `${length} / ${max}`}</span>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="button button-primary join-submit" type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? 'Sending…' : 'Send application'}
    </button>
  );
}

export function JoinForm({ departments, importance }: Props) {
  const [state, formAction] = useActionState(submitApplication, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const [filled, setFilled] = useState({ done: 0, total: REQUIRED.length, sections: SECTIONS.map(() => false) });
  const [resumeName, setResumeName] = useState<string | null>(null);
  // The roles offered depend on the year, and the domains on the roles picked.
  const [year, setYear] = useState(value(state, 'yearOfStudy'));
  const [pickedRoles, setPickedRoles] = useState(picks(state, 'roles'));
  const [pickedDomains, setPickedDomains] = useState(picks(state, 'domains'));
  // Which clubs is asked only after a yes.
  const [otherClubs, setOtherClubs] = useState(value(state, 'otherClubs'));
  // A returned form keeps what was typed, but browsers clear file inputs.
  const [shownState, setShownState] = useState(state);
  if (shownState !== state) {
    setShownState(state);
    setResumeName(null);
    setYear(value(state, 'yearOfStudy'));
    setPickedRoles(picks(state, 'roles'));
    setPickedDomains(picks(state, 'domains'));
    setOtherClubs(value(state, 'otherClubs'));
  }

  const roles = rolesFor(year);
  const chosenRoles = pickedRoles.filter((role) => roles.some((option) => option.value === role));
  const domains = domainsFor(chosenRoles, departments);
  const chosenDomains = pickedDomains.filter((domain) => domains.includes(domain));

  // A pick the year or roles no longer allow is dropped for good, so it cannot come back unseen.
  const pickRoles = (next: string[]) => {
    setPickedRoles(next);
    setPickedDomains((current) => current.filter((domain) => domainsFor(next, departments).includes(domain)));
  };
  const pickYear = (next: string) => {
    setYear(next);
    pickRoles(chosenRoles.filter((role) => rolesFor(next).some((option) => option.value === role)));
  };

  const measure = () => {
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);
    const required = [
      ...REQUIRED,
      ...(domainsFor(data.getAll('roles').map(String), departments).length ? ['domains'] : []),
      ...(data.get('otherClubs') === 'yes' ? ['otherClubsDetail'] : []),
    ];
    const answered = (name: string) => String(data.get(name) ?? '').trim() !== '';
    setFilled({
      done: required.filter(answered).length,
      total: required.length,
      sections: SECTIONS.map((names) => names.filter((name) => required.includes(name)).every(answered)),
    });
  };
  // Runs after the domain question appears or goes, so the count includes it.
  useEffect(measure, [state, pickedRoles, year, otherClubs, departments]);

  if (state.status === 'saved') {
    return (
      <section className="join-done" role="status">
        <span className="join-done-mark"><Check size={28} /></span>
        <h1>Thank you{state.message ? `, ${state.message.split(/\s+/)[0]}` : ''}.</h1>
        <p>We’ve received your application. Our team will review it, and you’ll hear from us about the next steps. A confirmation email is on its way.</p>
        <p>Until then, keep building and contributing.</p>
        <Link className="text-action" href="/#build">Explore TES projects <ArrowRight size={17} /></Link>
      </section>
    );
  }

  const progress = Math.round((filled.done / filled.total) * 100);

  return (
    <div className="join-layout">
      <aside className="join-intro">
        <h1>Add yourself <br />to the README.</h1>
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
        <JoinSidebar done={filled.done} total={filled.total} sections={filled.sections} />
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

        <fieldset className="join-section" id="section-1" data-done={filled.sections[0] || undefined}>
          <SectionHeading index={0}>Basic details</SectionHeading>
          <div className="join-grid">
            <Question name="name" label="Name" state={state}>
              {(describedBy, invalid) => <input id="name" name="name" autoComplete="name" maxLength={120} required defaultValue={value(state, 'name')} aria-describedby={describedBy} aria-invalid={invalid || undefined} />}
            </Question>
            <Question name="rollNumber" label="Roll number" state={state}>
              {(describedBy, invalid) => <input id="rollNumber" name="rollNumber" maxLength={30} required placeholder="2024IMT-045" autoCapitalize="characters" defaultValue={value(state, 'rollNumber')} aria-describedby={describedBy} aria-invalid={invalid || undefined} />}
            </Question>
            <Question name="yearOfStudy" label="Year of study" state={state}>
              {(describedBy, invalid) => (
                <select id="yearOfStudy" name="yearOfStudy" required defaultValue={value(state, 'yearOfStudy')} onChange={(event) => pickYear(event.target.value)} aria-describedby={describedBy} aria-invalid={invalid || undefined}>
                  <option value="" disabled>Choose your year</option>
                  {YEARS.map((year) => <option key={year.value} value={year.value}>{year.label}</option>)}
                </select>
              )}
            </Question>
            <Question name="email" label="Contact email" state={state} hint="We send your confirmation here.">
              {(describedBy, invalid) => <input id="email" name="email" type="email" autoComplete="email" maxLength={254} required defaultValue={value(state, 'email')} aria-describedby={describedBy} aria-invalid={invalid || undefined} />}
            </Question>
          </div>
        </fieldset>

        <fieldset className="join-section" id="section-2" data-done={filled.sections[1] || undefined}>
          <SectionHeading index={1}>Understanding &amp; contribution</SectionHeading>
          <Question name="knowledge" label="What do you know about TES?" level={importance.knowledge} state={state} wide>
            {(describedBy, invalid) => <Answer name="knowledge" state={state} describedBy={describedBy} invalid={invalid} rows={4} />}
          </Question>
          <Question name="contributions" label="What contributions have you made to TES so far?" level={importance.contributions} state={state} wide
            hint="Pull requests, issues, events you helped with, posts you wrote. New here? That’s fine: tell us what you’ve explored so far and what drew you in.">
            {(describedBy, invalid) => <Answer name="contributions" state={state} describedBy={describedBy} invalid={invalid} />}
          </Question>
          <Question name="showcase" label="What work would you like to showcase?" level={importance.showcase} state={state} wide
            hint="Paste links to projects, GitHub, designs, articles, or events, and say what you did in each.">
            {(describedBy, invalid) => <Answer name="showcase" state={state} describedBy={describedBy} invalid={invalid} placeholder={'https://github.com/you/project: built the API and the tests'} />}
          </Question>
          <Question name="plan" label="How would you like to contribute to TES?" level={importance.plan} state={state} wide
            hint="Be specific: an idea, an initiative, or a problem you want to solve, and your first step.">
            {(describedBy, invalid) => <Answer name="plan" state={state} describedBy={describedBy} invalid={invalid} />}
          </Question>
        </fieldset>

        <fieldset className="join-section" id="section-3" data-done={filled.sections[2] || undefined}>
          <SectionHeading index={2}>Role preferences &amp; commitment</SectionHeading>
          <Question name="roles" label="Which roles are you applying for?" level={importance.department_fit} state={state} wide
            hint={year ? 'Pick as many as you like. Mentors are 2nd year or above, and domain leads 3rd year or above.' : undefined}>
            {(describedBy) => <RolePicker roles={roles} disabled={!year} value={chosenRoles} onChange={pickRoles} describedBy={describedBy} />}
          </Question>
          {domains.length > 0 && (
            <Question name="domains" label={domainQuestion(chosenRoles)} state={state} wide
              hint={`Pick up to ${MAX_DOMAINS}. ${chosenDomains.length} of ${MAX_DOMAINS} chosen.`}>
              {(describedBy) => <DomainPicker domains={domains} max={MAX_DOMAINS} value={chosenDomains} onChange={setPickedDomains} describedBy={describedBy} />}
            </Question>
          )}
          <div className="join-grid">
            <Question name="weeklyHours" label="How many hours can you realistically give each week?" level={importance.availability} state={state} hint="Be honest. Steady beats ambitious.">
              {(describedBy, invalid) => <input id="weeklyHours" name="weeklyHours" type="number" inputMode="numeric" min={1} max={40} step={1} required defaultValue={value(state, 'weeklyHours')} aria-describedby={describedBy} aria-invalid={invalid || undefined} />}
            </Question>
          </div>
          <div className="join-question join-question-wide" data-invalid={state.fieldErrors?.commitment ? '' : undefined}>
            <div className="join-question-head" id="commitment-label">
              <span className="join-label">Would you prefer long-term responsibilities, short-term tasks, or a mix?</span>
              <span className="join-weight join-weight-note">Not scored</span>
            </div>
            <p className="join-hint" id="commitment-hint">Used only to match you with the right work, never to turn anyone away.</p>
            <div className="join-choices" role="radiogroup" aria-labelledby="commitment-label" aria-describedby={`commitment-hint${state.fieldErrors?.commitment ? ' commitment-error' : ''}`}>
              {COMMITMENTS.map((commitment) => (
                <label key={commitment.value} className="join-choice">
                  <input type="radio" name="commitment" value={commitment.value} defaultChecked={value(state, 'commitment') === commitment.value} />
                  <span><b>{commitment.label}</b><small>{commitment.hint}</small><CommitmentGlyph value={commitment.value} /></span>
                </label>
              ))}
            </div>
            {state.fieldErrors?.commitment && <p className="join-error" id="commitment-error">{state.fieldErrors.commitment[0]}</p>}
          </div>
          <div className="join-question join-question-wide" data-invalid={state.fieldErrors?.otherClubs ? '' : undefined}>
            <div className="join-question-head" id="otherClubs-label">
              <span className="join-label">Are you part of any other club?</span>
              <span className="join-weight join-weight-note">Not scored</span>
            </div>
            <p className="join-hint" id="otherClubs-hint">Being in other clubs is fine. It helps us plan work around your time.</p>
            <div className="join-choices join-choices-two" role="radiogroup" aria-labelledby="otherClubs-label" aria-describedby={`otherClubs-hint${state.fieldErrors?.otherClubs ? ' otherClubs-error' : ''}`}>
              {[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }].map((option) => (
                <label key={option.value} className="join-choice">
                  <input type="radio" name="otherClubs" value={option.value} defaultChecked={value(state, 'otherClubs') === option.value} onChange={() => setOtherClubs(option.value)} />
                  <span><b>{option.label}</b></span>
                </label>
              ))}
            </div>
            {state.fieldErrors?.otherClubs && <p className="join-error" id="otherClubs-error">{state.fieldErrors.otherClubs[0]}</p>}
          </div>
          {otherClubs === 'yes' && (
            <Question name="otherClubsDetail" label="Which clubs, and what do you do there?" state={state} wide>
              {(describedBy, invalid) => <input id="otherClubsDetail" name="otherClubsDetail" maxLength={300} placeholder="e.g. the robotics club, events team" defaultValue={value(state, 'otherClubsDetail')} aria-describedby={describedBy} aria-invalid={invalid || undefined} />}
            </Question>
          )}
        </fieldset>

        <fieldset className="join-section" id="section-4" data-done={filled.sections[3] || undefined}>
          <SectionHeading index={3}>Additional information</SectionHeading>
          <Question name="additionalInfo" label="Anything else you’d like us to know?" state={state} optional wide>
            {(describedBy, invalid) => <Answer name="additionalInfo" state={state} describedBy={describedBy} invalid={invalid} rows={3} min={0} max={2000} />}
          </Question>
          <Question name="resume" label="Resume" level={importance.resume} state={state} optional wide hint="A PDF up to 2 MB.">
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
          <Signature />
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
