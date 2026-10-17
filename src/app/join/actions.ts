'use server';

import { after } from 'next/server';
import { failed, invalid, readValues, type FormState } from '@/lib/admin/form-state';
import { extractLinks } from '@/lib/recruitment/evidence';
import { RESUME_MAX_BYTES } from '@/lib/recruitment/options';
import { loadRecruitmentConfig, processApplication } from '@/lib/recruitment/server';
import { createServiceClient } from '@/lib/supabase/server';
import { applicationSchema } from '@/lib/validation';

const FIELDS = [
  'name', 'rollNumber', 'yearOfStudy', 'email',
  'knowledge', 'contributions', 'showcase', 'plan',
  'department', 'role', 'weeklyHours', 'commitment',
  'additionalInfo', 'consent',
] as const;

const CLOSED = 'Applications are not open right now. Follow TES on Instagram to hear when they are.';

async function readResume(formData: FormData): Promise<{ file: File | null; error?: string }> {
  const file = formData.get('resume');
  if (!(file instanceof File) || file.size === 0) return { file: null };
  if (file.size > RESUME_MAX_BYTES) return { file: null, error: 'Keep the resume under 2 MB.' };
  const header = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  const isPdf = String.fromCharCode(...header) === '%PDF-';
  if (file.type !== 'application/pdf' || !isPdf) return { file: null, error: 'Upload the resume as a PDF.' };
  return { file };
}

export async function submitApplication(_previous: FormState, formData: FormData): Promise<FormState> {
  // A field people never see. Bots that fill it get a normal-looking answer and nothing is saved.
  if (formData.get('website')) return { status: 'saved' };

  let config;
  try {
    config = await loadRecruitmentConfig();
  } catch (error) {
    console.error('Application form could not load its settings:', error);
    return failed('Something went wrong on our side. Try again in a few minutes.');
  }
  const client = createServiceClient();
  if (!config || !client || !config.isOpen) return failed(CLOSED);

  const values = readValues(formData, FIELDS);
  const parsed = applicationSchema(config.departments).safeParse({ ...values, consent: values.consent === 'on' });
  const resume = await readResume(formData);
  if (!parsed.success) {
    const state = invalid(parsed.error, values);
    if (resume.error) state.fieldErrors = { ...state.fieldErrors, resume: [resume.error] };
    return state;
  }
  if (resume.error) return failed(resume.error, values, 'resume');

  const data = parsed.data;
  const id = crypto.randomUUID();
  let resumePath: string | null = null;
  if (resume.file) {
    resumePath = `${id}.pdf`;
    const { error } = await client.storage.from('resumes').upload(resumePath, resume.file, { contentType: 'application/pdf' });
    if (error) {
      console.error('Resume upload failed:', error.message);
      return failed('Your resume could not be uploaded. Try again, or send the form without it.', values, 'resume');
    }
  }

  const { error } = await client.from('applications').insert({
    id,
    name: data.name,
    roll_number: data.rollNumber,
    email: data.email,
    year_of_study: data.yearOfStudy,
    knowledge: data.knowledge,
    contributions: data.contributions,
    showcase: data.showcase,
    plan: data.plan,
    links: extractLinks([data.showcase, data.contributions, data.plan, data.knowledge, data.additionalInfo]),
    department: data.department,
    role: data.role,
    weekly_hours: data.weeklyHours,
    commitment: data.commitment,
    additional_info: data.additionalInfo,
    resume_path: resumePath,
  });
  if (error) {
    if (resumePath) await client.storage.from('resumes').remove([resumePath]);
    if (error.code === '23505') {
      const field = error.message.includes('email') ? 'email' : 'rollNumber';
      const what = field === 'email' ? 'this email address' : 'this roll number';
      return failed(`We already have an application from ${what}. To change it, write to us at tes@iiitm.ac.in.`, values, field);
    }
    console.error('Application save failed:', error.code, error.message);
    return failed('Your application could not be saved. Try again in a few minutes.', values);
  }

  // The applicant does not wait for the email, GitHub checks, or the AI.
  after(() => processApplication(id));
  return { status: 'saved', message: data.name };
}
