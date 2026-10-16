'use server';

import { redirect } from 'next/navigation';
import { failed, invalid, readValues, type FormState } from '@/lib/admin/form-state';
import { publishChanges, refreshGitHubData } from '@/lib/admin/publish';
import { requireAdmin } from '@/lib/auth';
import { findRepository } from '@/lib/github';
import type { TablesInsert } from '@/lib/supabase/database.types';
import { githubRepoSchema, githubSettingsSchema } from '@/lib/validation';

const REPO_FIELDS = ['repository', 'title', 'description', 'headline', 'headlineEmphasis', 'isFeatured', 'sortOrder', 'isPublished'] as const;
const SETTINGS_FIELDS = ['showContributors', 'heading', 'intro', 'hiddenLogins', 'maxContributors'] as const;
const LIST = '/admin/github';
const UNIQUE_VIOLATION = '23505';

export async function saveRepository(id: string | null, _previous: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const values = readValues(formData, REPO_FIELDS);
  const parsed = githubRepoSchema.safeParse({ ...values, isFeatured: values.isFeatured === 'on', isPublished: values.isPublished === 'on' });
  if (!parsed.success) return invalid(parsed.error, values);

  let found;
  try {
    found = await findRepository(parsed.data.repository);
  } catch {
    return failed('GitHub could not be reached to check the repository. Try again in a minute.', values);
  }
  if (!found) return failed('There is no public repository by that name on GitHub.', values, 'repository');

  const { title, description, headline, headlineEmphasis, isFeatured, sortOrder, isPublished } = parsed.data;
  const row: TablesInsert<'github_repos'> = {
    full_name: found.fullName,
    title,
    description,
    headline,
    headline_emphasis: headlineEmphasis,
    is_featured: isFeatured,
    sort_order: sortOrder,
    is_published: isPublished,
  };

  // Only one repository is featured; featuring this one unfeatures the last.
  if (isFeatured) {
    const others = supabase.from('github_repos').update({ is_featured: false }).eq('is_featured', true);
    const { error } = await (id ? others.neq('id', id) : others);
    if (error) return failed('The repository could not be saved. Try again.', values);
  }
  const { error } = id
    ? await supabase.from('github_repos').update(row).eq('id', id)
    : await supabase.from('github_repos').insert(row);

  if (error?.code === UNIQUE_VIOLATION) return failed('That repository has already been added.', values, 'repository');
  if (error) return failed('The repository could not be saved. Try again.', values);

  publishChanges(LIST);
  refreshGitHubData(LIST);
  redirect(LIST);
}

export async function deleteRepository(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from('github_repos').delete().eq('id', id);
  publishChanges(LIST);
}

export async function saveGitHubSettings(_previous: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const values = readValues(formData, SETTINGS_FIELDS);
  const parsed = githubSettingsSchema.safeParse({ ...values, showContributors: values.showContributors === 'on' });
  if (!parsed.success) return invalid(parsed.error, values);

  const { showContributors, heading, intro, hiddenLogins, maxContributors } = parsed.data;
  const { error } = await supabase.from('github_settings').upsert({
    id: true,
    show_contributors: showContributors,
    contributors_heading: heading,
    contributors_intro: intro,
    hidden_logins: hiddenLogins,
    max_contributors: maxContributors,
  });
  if (error) return failed('The contributors section could not be saved. Try again.', values);

  publishChanges(LIST);
  return { status: 'saved', message: 'Contributors section saved. The site is up to date.', values: { ...values, hiddenLogins: hiddenLogins.join(', ') } };
}

export async function refreshGitHub(): Promise<FormState> {
  await requireAdmin();
  refreshGitHubData(LIST);
  return { status: 'saved', message: 'The next visit to the site fetches fresh numbers from GitHub.' };
}
