
'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import type { FormState } from '@/lib/admin/form-state';
import { Eye, EyeOff } from 'lucide-react';

type PasswordFieldProps = {
  name: string;
  label: string;
  state: FormState;
  autoComplete?: string;
  required?: boolean;
  className?: string;
  hint?: ReactNode;
  minLength?: number;
};

export function PasswordField({
  name,
  label,
  state,
  autoComplete,
  required,
  className = '',
  hint,
  minLength,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const errors = state.fieldErrors?.[name];
  const value = state.values?.[name] ?? '';
  const describedBy = [
    hint && `${name}-hint`,
    errors && `${name}-error`,
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`admin-field admin-password-field ${className}`} data-invalid={errors ? '' : undefined}>
      <label htmlFor={name}>{label}</label>
      <div className="admin-password-control">
        <input
          id={name}
          name={name}
          type={visible ? 'text' : 'password'}
          minLength={minLength}
          defaultValue={value}
          autoComplete={autoComplete}
          required={required}
          aria-invalid={errors ? true : undefined}
          aria-describedby={describedBy}
        />
        <button
          type="button"
          className="admin-password-toggle"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? (
            <EyeOff size={18} aria-hidden="true" />
          ) : (
            <Eye size={18} aria-hidden="true" />
          )}
        </button>
      </div>
      {hint && ( <p className="admin-field-hint" id={`${name}-hint`}> {hint} </p> )}
      {errors && <p className="admin-field-error" id={`${name}-error`}>{errors[0]}</p>}
    </div>
  );
}
