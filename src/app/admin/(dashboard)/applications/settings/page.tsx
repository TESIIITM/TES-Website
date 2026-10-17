import type { Metadata } from 'next';
import { PageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/auth';
import { loadCriteria } from '@/lib/recruitment/server';
import { RecruitmentSettingsForm } from './settings-form';

export const metadata: Metadata = { title: 'Form & rubric' };

export default async function RecruitmentSettingsPage() {
  const { supabase } = await requireAdmin();
  const [criteria, { data: settings }] = await Promise.all([
    loadCriteria(supabase),
    supabase.from('recruitment_settings').select('is_open, departments').maybeSingle(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="11 / RECRUITMENT"
        title="Form & rubric"
        description="Open or close the form, choose the departments on offer, and set how much each question counts."
        back={{ href: '/admin/applications', label: 'Applications' }}
      />
      <RecruitmentSettingsForm isOpen={settings?.is_open ?? false} departments={settings?.departments ?? []} criteria={criteria} />
    </>
  );
}
