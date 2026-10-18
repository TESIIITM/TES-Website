import type { Enums } from '@/lib/supabase/database.types';

export type ApplicationStatus = Enums<'application_status'>;
export type Commitment = Enums<'commitment_preference'>;

export const YEARS = [
  { value: '1', label: '1st year' },
  { value: '2', label: '2nd year' },
  { value: '3', label: '3rd year' },
  { value: '4', label: '4th year' },
  { value: '5', label: '5th year' },
  { value: 'pg', label: 'Postgraduate' },
] as const;

export const COMMITMENTS: { value: Commitment; label: string; hint: string }[] = [
  { value: 'long_term', label: 'Long-term responsibilities', hint: 'Own something across the year.' },
  { value: 'short_term', label: 'Short-term tasks', hint: 'Pick up work as it comes.' },
  { value: 'mixed', label: 'A mix of both', hint: 'Some ownership, some one-off tasks.' },
];

export const STATUSES: { value: ApplicationStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'selected', label: 'Selected' },
  { value: 'rejected', label: 'Rejected' },
];

export function yearLabel(value: string): string {
  return YEARS.find((year) => year.value === value)?.label ?? value;
}

export function commitmentLabel(value: Commitment): string {
  return COMMITMENTS.find((commitment) => commitment.value === value)?.label ?? value;
}

export function statusLabel(value: ApplicationStatus): string {
  return STATUSES.find((status) => status.value === value)?.label ?? value;
}

/** The shortest answer that still says something, about one full sentence. */
export const ANSWER_MIN = 20;
/** Answers are capped so one application cannot fill the database or the AI's context. */
export const ANSWER_MAX = 3000;
export const RESUME_MAX_BYTES = 2 * 1024 * 1024;

const STALLED_AFTER_MS = 5 * 60 * 1000;

/**
 * Work that runs after a response can be cut off, e.g. when the host stops the
 * function. A step still pending this long after the row last changed is
 * offered for retry.
 */
export function isStalled(updatedAt: string, now = Date.now()): boolean {
  return now - new Date(updatedAt).getTime() > STALLED_AFTER_MS;
}
