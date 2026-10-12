import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import type { FormState } from '@/lib/admin/form-state';

type Common = {
  name: string;
  label: string;
  hint?: ReactNode;
  state: FormState;
  /** Shown until the form has been submitted; afterwards, what was typed is kept. */
  defaultValue?: string | number | null;
  className?: string;
};

function describe(name: string, state: FormState, hint?: ReactNode) {
  const errors = state.fieldErrors?.[name];
  const ids = [hint && `${name}-hint`, errors && `${name}-error`].filter(Boolean).join(' ');
  return { errors, a11y: { 'aria-invalid': errors ? true : undefined, 'aria-describedby': ids || undefined } };
}

function valueOf(name: string, state: FormState, defaultValue?: string | number | null) {
  return state.values?.[name] ?? (defaultValue == null ? '' : String(defaultValue));
}

function Frame({ name, label, hint, errors, className = '', children }: { name: string; label: string; hint?: ReactNode; errors?: string[]; className?: string; children: ReactNode }) {
  return (
    <div className={`admin-field ${className}`} data-invalid={errors ? '' : undefined}>
      <label htmlFor={name}>{label}</label>
      {children}
      {hint && <p className="admin-field-hint" id={`${name}-hint`}>{hint}</p>}
      {errors && <p className="admin-field-error" id={`${name}-error`}>{errors[0]}</p>}
    </div>
  );
}

export function TextField({ name, label, hint, state, defaultValue, className, ...input }: Common & Omit<InputHTMLAttributes<HTMLInputElement>, 'name' | 'defaultValue'>) {
  const { errors, a11y } = describe(name, state, hint);
  return (
    <Frame name={name} label={label} hint={hint} errors={errors} className={className}>
      <input id={name} name={name} defaultValue={valueOf(name, state, defaultValue)} {...a11y} {...input} />
    </Frame>
  );
}

export function TextArea({ name, label, hint, state, defaultValue, className, ...textarea }: Common & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'name' | 'defaultValue'>) {
  const { errors, a11y } = describe(name, state, hint);
  return (
    <Frame name={name} label={label} hint={hint} errors={errors} className={className}>
      <textarea id={name} name={name} defaultValue={valueOf(name, state, defaultValue)} rows={4} {...a11y} {...textarea} />
    </Frame>
  );
}

export function SelectField({ name, label, hint, state, defaultValue, className, options }: Common & { options: { value: string; label: string }[] }) {
  const { errors, a11y } = describe(name, state, hint);
  return (
    <Frame name={name} label={label} hint={hint} errors={errors} className={className}>
      <select id={name} name={name} defaultValue={valueOf(name, state, defaultValue)} {...a11y}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </Frame>
  );
}

export function Checkbox({ name, label, hint, state, defaultChecked }: Omit<Common, 'defaultValue'> & { defaultChecked: boolean }) {
  // Unchecked boxes are absent from FormData, so a submitted form without the key means "off".
  const checked = state.values ? state.values[name] === 'on' : defaultChecked;
  return (
    <div className="admin-checkbox">
      <input id={name} name={name} type="checkbox" defaultChecked={checked} aria-describedby={hint ? `${name}-hint` : undefined} />
      <label htmlFor={name}>{label}</label>
      {hint && <p className="admin-field-hint" id={`${name}-hint`}>{hint}</p>}
    </div>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  if (state.status === 'saved') return <p className="admin-message" role="status">{state.message ?? 'Saved.'}</p>;
  if (state.status === 'error' && state.message) return <p className="admin-message admin-message-error" role="alert">{state.message}</p>;
  return null;
}
