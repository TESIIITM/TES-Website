'use client';

import { useActionState } from 'react';
import { FormMessage, SelectField, TextArea } from '@/components/admin/fields';
import { SubmitButton } from '@/components/admin/submit-button';
import { initialFormState, type FormState } from '@/lib/admin/form-state';
import { STATUSES, type ApplicationStatus } from '@/lib/recruitment/options';
import type { ResolvedScore } from '@/lib/recruitment/rubric';

type Row = {
  key: string;
  label: string;
  weight: number;
  importance: string;
  auto: number | null;
  ai: { score: number; reason: string } | null;
  admin: number | null;
  current: ResolvedScore | null;
};

type Props = {
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  status: ApplicationStatus;
  notes: string | null;
  rows: Row[];
};

const SOURCE = { admin: 'You', ai: 'AI', auto: 'Automatic' } as const;

export function ReviewForm({ action, status, notes, rows }: Props) {
  const [state, formAction] = useActionState(action, initialFormState);
  return (
    // Remounted after each save: React resets a select to its first default after a form action.
    <form key={JSON.stringify(state.values ?? null)} className="admin-form admin-form-single" action={formAction} noValidate>
      <FormMessage state={state} />
      <div className="admin-scroll">
        <table className="admin-table admin-rubric">
          <thead>
            <tr>
              <th scope="col">Criterion</th>
              <th scope="col">Weight</th>
              <th scope="col">Automatic</th>
              <th scope="col">AI</th>
              <th scope="col">Your score</th>
              <th scope="col">Counts</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const name = `score_${row.key}`;
              const error = state.fieldErrors?.[name]?.[0];
              return (
                <tr key={row.key}>
                  <td>{row.label}{row.ai && <small>{row.ai.reason}</small>}</td>
                  <td className="admin-nowrap">{row.weight}<small>{row.importance}</small></td>
                  <td>{row.auto ?? '—'}</td>
                  <td>{row.ai?.score ?? '—'}</td>
                  <td>
                    <label className="sr-only" htmlFor={name}>Your score for {row.label}, 0 to 10</label>
                    <input
                      className="admin-score-input"
                      id={name}
                      name={name}
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={10}
                      step={1}
                      placeholder="0–10"
                      defaultValue={state.values?.[name] ?? row.admin ?? ''}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={error ? `${name}-error` : undefined}
                    />
                    {error && <small className="admin-field-error" id={`${name}-error`}>{error}</small>}
                  </td>
                  <td className="admin-nowrap">{row.current?.score ?? '—'}{row.current?.source && <small>{SOURCE[row.current.source]}</small>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="admin-field-hint">Leave a box empty to use the AI or automatic score. Your score always wins.</p>
      <SelectField name="status" label="Status" state={state} defaultValue={status} options={STATUSES} hint="Applicants are not notified when this changes." />
      <TextArea name="adminNotes" label="Notes" maxLength={5000} rows={5} state={state} defaultValue={notes} hint="Visible to admins only." />
      <div className="admin-form-actions"><SubmitButton>Save review</SubmitButton></div>
    </form>
  );
}
