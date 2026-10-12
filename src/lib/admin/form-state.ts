import type { z } from 'zod';

export type FieldErrors = Partial<Record<string, string[]>>;

/** Returned by admin Server Actions to `useActionState`. */
export type FormState = {
  status: 'idle' | 'error' | 'saved';
  message?: string;
  fieldErrors?: FieldErrors;
  /** What was submitted, so a failed form can be shown again as typed. */
  values?: Record<string, string>;
};

export const initialFormState: FormState = { status: 'idle' };

/** String fields from a form submission. Files and missing keys are skipped. */
export function readValues(formData: FormData, keys: readonly string[]): Record<string, string> {
  const values: Record<string, string> = {};
  for (const key of keys) {
    const value = formData.get(key);
    if (typeof value === 'string') values[key] = value;
  }
  return values;
}

export function invalid(error: z.ZodError, values: Record<string, string>): FormState {
  const fieldErrors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return { status: 'error', message: 'Check the highlighted fields.', fieldErrors, values };
}

export function failed(message: string, values?: Record<string, string>, field?: string): FormState {
  return { status: 'error', message, values, fieldErrors: field ? { [field]: [message] } : undefined };
}
