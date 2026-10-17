import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { fetchRepository } from '@/lib/github';
import { createServiceClient } from '@/lib/supabase/server';
import type { Database, Json, Tables, TablesUpdate } from '@/lib/supabase/database.types';
import { evaluateApplication } from './ai';
import { sendConfirmation } from './email';
import { automaticAssessment, githubLogins, type VerifiedContribution } from './evidence';
import type { Criterion } from './rubric';

type ServiceClient = NonNullable<ReturnType<typeof createServiceClient>>;

export type RecruitmentConfig = { isOpen: boolean; departments: string[]; criteria: Criterion[] };

export async function loadCriteria(client: SupabaseClient<Database>): Promise<Criterion[]> {
  const { data, error } = await client.from('recruitment_criteria').select('key, label, guidance, weight').order('sort_order');
  if (error) throw new Error(`Could not load the rubric: ${error.message}`);
  return data;
}

/** What the public form needs, or `null` when the server cannot accept applications. */
export async function loadRecruitmentConfig(): Promise<RecruitmentConfig | null> {
  const client = createServiceClient();
  if (!client) return null;
  const [settings, criteria] = await Promise.all([
    client.from('recruitment_settings').select('is_open, departments').maybeSingle(),
    loadCriteria(client),
  ]);
  if (settings.error) throw new Error(`Could not load recruitment settings: ${settings.error.message}`);
  return { isOpen: settings.data?.is_open ?? false, departments: settings.data?.departments ?? [], criteria };
}

/** Contributions GitHub confirms for the linked accounts, across the repositories shown on the site. */
async function verifyContributions(client: ServiceClient, links: string[]): Promise<{ logins: string[]; verified: VerifiedContribution[] }> {
  const { data: repositories } = await client.from('github_repos').select('full_name').eq('is_published', true);
  const names = (repositories ?? []).map((repository) => repository.full_name);
  const owners = names.map((name) => name.split('/')[0]);
  const logins = githubLogins(links, owners);
  if (logins.length === 0 || names.length === 0) return { logins, verified: [] };

  const results = await Promise.allSettled(names.map(fetchRepository));
  const verified: VerifiedContribution[] = [];
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error('Could not check contributors for', names[index], result.reason);
      return;
    }
    for (const person of result.value.contributors) {
      if (logins.includes(person.login.toLowerCase())) {
        verified.push({ login: person.login, repository: names[index], contributions: person.contributions });
      }
    }
  });
  return { logins, verified };
}

type Steps = { checks?: boolean; email?: boolean; ai?: boolean };

/**
 * Runs after a submission has been saved: automatic checks, the confirmation
 * email, and the optional AI evaluation. Each step records its own outcome, so
 * one failing never affects the others or the saved application.
 */
export async function processApplication(id: string, steps: Steps = { checks: true, email: true, ai: true }): Promise<void> {
  const client = createServiceClient();
  if (!client) return;
  const { data: application, error } = await client.from('applications').select('*').eq('id', id).maybeSingle();
  if (error || !application) {
    console.error('Could not load application for processing:', id, error?.code, error?.message);
    return;
  }

  let facts: string[] = [];
  if (steps.checks) facts = await runChecks(client, application);
  else facts = existingFacts(application);

  await Promise.all([
    steps.email ? runEmail(client, application) : null,
    steps.ai ? runEvaluation(client, application, facts) : null,
  ]);
}

function existingFacts(application: Tables<'applications'>): string[] {
  return Array.isArray(application.auto_evidence)
    ? application.auto_evidence.flatMap((entry) => (entry && typeof entry === 'object' && !Array.isArray(entry) && entry.kind === 'github' && typeof entry.text === 'string' ? [entry.text] : []))
    : [];
}

async function update(client: ServiceClient, id: string, row: TablesUpdate<'applications'>, step: string) {
  const { error } = await client.from('applications').update(row).eq('id', id);
  if (error) console.error(`Could not record the ${step} result for application`, id, error.code, error.message);
}

async function runChecks(client: ServiceClient, application: Tables<'applications'>): Promise<string[]> {
  let github: { logins: string[]; verified: VerifiedContribution[] } = { logins: [], verified: [] };
  try {
    github = await verifyContributions(client, application.links);
  } catch (error) {
    console.error('GitHub contribution check failed for application', application.id, error);
  }
  const { scores, evidence } = automaticAssessment({
    weeklyHours: application.weekly_hours,
    hasResume: Boolean(application.resume_path),
    links: application.links,
    ...github,
  });
  await update(client, application.id, { auto_scores: scores as NonNullable<Json>, auto_evidence: evidence as unknown as NonNullable<Json> }, 'automatic check');
  return evidence.filter((entry) => entry.kind === 'github').map((entry) => entry.text);
}

async function runEmail(client: ServiceClient, application: Tables<'applications'>) {
  const result = await sendConfirmation(application.email, application.name);
  if (result.status === 'failed') console.error('Confirmation email failed for application', application.id, result.error);
  await update(client, application.id, {
    email_status: result.status,
    email_error: result.status === 'failed' ? result.error : null,
    email_sent_at: result.status === 'sent' ? new Date().toISOString() : application.email_sent_at,
  }, 'email');
}

async function runEvaluation(client: ServiceClient, application: Tables<'applications'>, verifiedFacts: string[]) {
  let criteria: Criterion[];
  try {
    criteria = await loadCriteria(client);
  } catch (error) {
    console.error(error);
    return;
  }
  const result = await evaluateApplication({
    yearOfStudy: application.year_of_study,
    knowledge: application.knowledge,
    contributions: application.contributions,
    showcase: application.showcase,
    plan: application.plan,
    department: application.department,
    role: application.role,
    weeklyHours: application.weekly_hours,
    commitment: application.commitment,
    additionalInfo: application.additional_info,
    links: application.links,
    verifiedFacts,
  }, criteria);
  if (result.status === 'failed') console.error('AI evaluation failed for application', application.id, result.error);
  await update(client, application.id, result.status === 'done'
    ? { ai_status: 'done', ai_evaluation: result.evaluation as unknown as Json, ai_model: result.model, ai_error: null, ai_evaluated_at: new Date().toISOString() }
    : result.status === 'failed'
      ? { ai_status: 'failed', ai_model: result.model, ai_error: result.error }
      : { ai_status: 'disabled' }, 'AI evaluation');
}
