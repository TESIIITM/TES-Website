'use server';

import { invalid, failed, readValues, type FormState } from '@/lib/admin/form-state';
import { publishChanges } from '@/lib/admin/publish';
import { requireAdmin } from '@/lib/auth';
import { settingsSchema } from '@/lib/validation';

const FIELDS = ['github', 'repository', 'contributionGuide', 'medium', 'instagram', 'linkedin', 'email'] as const;

export async function saveSettings(_previous: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const values = readValues(formData, FIELDS);
  const parsed = settingsSchema.safeParse(values);
  if (!parsed.success) return invalid(parsed.error, values);

  const links = parsed.data;
  const { error } = await supabase.from('site_settings').upsert({
    id: true,
    github_url: links.github,
    repository_url: links.repository,
    contribution_guide_url: links.contributionGuide,
    medium_url: links.medium,
    instagram_url: links.instagram,
    linkedin_url: links.linkedin,
    contact_email: links.email,
  });
  if (error) return failed('The links could not be saved. Try again.', values);

  publishChanges('/admin/settings');
  return { status: 'saved', message: 'Links saved. The site is up to date.', values };
}
