'use client';

import { useActionState, useState } from 'react';
import { Checkbox, FormMessage, TextArea } from '@/components/admin/fields';
import { SubmitButton } from '@/components/admin/submit-button';
import { initialFormState } from '@/lib/admin/form-state';
import { importanceOf, IMPORTANCE_LABELS, type Criterion } from '@/lib/recruitment/rubric';
import { saveRecruitmentSettings } from '../actions';

type Props = { isOpen: boolean; departments: string[]; criteria: Criterion[] };

function WeightField({ criterion, initial, error }: { criterion: Criterion; initial: string; error?: string }) {
  const name = `weight_${criterion.key}`;
  const [weight, setWeight] = useState(initial);
  const number = Number(weight);
  const label = Number.isInteger(number) && number >= 0 && number <= 10 ? IMPORTANCE_LABELS[importanceOf(number)] : '—';
  return (
    <tr>
      <td>{criterion.label}<small>{criterion.guidance}</small></td>
      <td>
        <label className="sr-only" htmlFor={name}>Weight for {criterion.label}, 0 to 10</label>
        <input className="admin-score-input" id={name} name={name} type="number" inputMode="numeric" min={0} max={10} step={1} value={weight}
          onChange={(event) => setWeight(event.target.value)} aria-invalid={error ? true : undefined} aria-describedby={error ? `${name}-error` : undefined} />
        {error && <small className="admin-field-error" id={`${name}-error`}>{error}</small>}
      </td>
      <td className="admin-nowrap"><span className="admin-status" data-published={label === 'High'}>{label}</span></td>
    </tr>
  );
}

export function RecruitmentSettingsForm({ isOpen, departments, criteria }: Props) {
  const [state, formAction] = useActionState(saveRecruitmentSettings, initialFormState);
  return (
    <form className="admin-form admin-form-single" action={formAction} noValidate>
      <FormMessage state={state} />
      <Checkbox name="isOpen" label="Accept applications" hint="When off, the form at /join says applications are closed." state={state} defaultChecked={isOpen} />
      <TextArea name="departments" label="Technical domains" rows={8} state={state} defaultValue={departments.join('\n')} hint="One per line, in the order applicants see them. Asked of technical team, mentor, and domain lead applicants; mentors can also pick General mentorship. Operations, Design, and Promotions are roles of their own." />

      <fieldset className="admin-fieldset">
        <legend>Rubric</legend>
        <div className="admin-field-wide">
          <p className="admin-field-hint">Weights run from 0 to 10. Applicants see only the label: 7 and up is High, 4 to 6 is Medium, below 4 is Low. A weight of 0 leaves the question out of the score. Changes apply to every application straight away.</p>
          <div className="admin-scroll">
            <table className="admin-table admin-rubric">
              <thead><tr><th scope="col">Question</th><th scope="col">Weight</th><th scope="col">Applicants see</th></tr></thead>
              <tbody>
                {criteria.map((criterion) => (
                  <WeightField
                    key={criterion.key}
                    criterion={criterion}
                    initial={state.values?.[`weight_${criterion.key}`] ?? String(criterion.weight)}
                    error={state.fieldErrors?.[`weight_${criterion.key}`]?.[0]}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </fieldset>
      <div className="admin-form-actions"><SubmitButton>Save settings</SubmitButton></div>
    </form>
  );
}
