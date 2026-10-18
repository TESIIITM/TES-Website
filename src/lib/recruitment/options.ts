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

/** How far along each year is, for roles that need some time at TES first. Postgraduates can apply for any role. */
const YEAR_RANK: Record<string, number> = { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, pg: 5 };

type RoleOption = {
  value: string;
  label: string;
  /** The earliest year that can apply. */
  minYear: number;
  /** Roles in a technical domain ask which one; the rest are teams of their own. */
  domainQuestion?: string;
  /** Mentors can also mentor across domains. */
  general?: boolean;
};

export const GENERAL_MENTORSHIP = 'General mentorship';

export const ROLES = [
  { value: 'technical', label: 'Technical team', minYear: 1, domainQuestion: 'Which domain would you like to work in?' },
  { value: 'mentor', label: 'Mentor', minYear: 2, domainQuestion: 'What would you like to mentor in?', general: true },
  { value: 'domain_lead', label: 'Domain lead', minYear: 3, domainQuestion: 'Which domain would you like to lead?' },
  { value: 'operations', label: 'Operations', minYear: 1 },
  { value: 'design', label: 'Design', minYear: 1 },
  { value: 'promotions', label: 'Promotions', minYear: 1 },
] as const satisfies readonly RoleOption[];

export type Role = (typeof ROLES)[number]['value'];

export function findRole(value: string): RoleOption | undefined {
  return ROLES.find((role) => role.value === value);
}

/** The roles someone in this year can apply for; none until a year is chosen. */
export function rolesFor(year: string): RoleOption[] {
  const rank = YEAR_RANK[year];
  return rank ? ROLES.filter((role) => role.minYear <= rank) : [];
}

/** The answers to the follow-up question for a role, or none when the role has no follow-up. */
export function domainsFor(role: string, domains: string[]): string[] {
  const option = findRole(role);
  if (!option?.domainQuestion) return [];
  return option.general ?[GENERAL_MENTORSHIP, ...domains] : domains;
}

/** What is stored: the area applied to (a domain, or the team itself) and the role in it. */
export function placement(role: Role, domain: string | null): { department: string; role: string } {
  const option = findRole(role)!;
  return domain ? { department: domain, role: option.label } : { department: option.label, role: 'Team member' };
}

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
