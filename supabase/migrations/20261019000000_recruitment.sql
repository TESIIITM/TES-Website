-- Recruitment: the JOIN TES application form and its review dashboard.
--
-- Applications hold students' personal data, so no policy here is granted to
-- anonymous visitors. The form submits through a Server Action that uses the
-- project's secret key (SUPABASE_SECRET_KEY); admins read and review through
-- their own session, under the policies below.

create type public.application_status as enum ('pending', 'shortlisted', 'selected', 'rejected');
create type public.commitment_preference as enum ('long_term', 'short_term', 'mixed');

-- Settings (a single row) ------------------------------------------------------

create table public.recruitment_settings (
  id boolean primary key default true check (id),
  is_open boolean not null default true,
  -- Offered in the form's department question, in this order.
  departments text[] not null default array[
    'Web Development', 'App Development', 'AI / ML', 'Competitive Programming',
    'Cybersecurity', 'Design', 'Content & Outreach', 'Events & Management'
  ] check (cardinality(departments) between 1 and 30),
  updated_at timestamptz not null default now()
);

insert into public.recruitment_settings default values;

-- Rubric -----------------------------------------------------------------------
--
-- One row per scored question. Applicants see only the importance label that
-- the weight maps to (Low, Medium, High); the weights stay private.

create table public.recruitment_criteria (
  key text primary key check (key ~ '^[a-z_]+$'),
  label text not null check (char_length(label) between 1 and 80),
  -- What a reviewer (or the AI) should look for. Not shown to applicants.
  guidance text not null check (char_length(guidance) between 1 and 600),
  weight integer not null check (weight between 0 and 10),
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

insert into public.recruitment_criteria (key, label, guidance, weight, sort_order) values
  ('knowledge', 'Understanding of TES',
   'Accurate, specific knowledge of what TES does (open source, events, projects, learning). Specific facts count; generic praise does not.', 5, 1),
  ('contributions', 'Contributions so far',
   'Concrete, verifiable contributions to TES: pull requests, issues, events helped with, content written. Newcomers who explain honestly are not penalised to zero; judge their curiosity and any related work elsewhere.', 9, 2),
  ('showcase', 'Work to showcase',
   'Evidence of real work: links to projects, repositories, designs, articles, or events, and what the applicant personally did in them.', 8, 3),
  ('plan', 'Plan to contribute',
   'Specific ideas, initiatives, or problems to solve, with a realistic first step. Specific beats ambitious.', 8, 4),
  ('department_fit', 'Fit for department and role',
   'Whether the evidence elsewhere in the application supports the chosen department and role.', 4, 5),
  ('availability', 'Weekly availability',
   'Hours per week the applicant can realistically give. Scored automatically from the number entered.', 5, 6),
  ('resume', 'Resume',
   'Whether a resume was attached. Scored automatically; optional for applicants.', 1, 7);

-- Applications -------------------------------------------------------------------

create table public.applications (
  id uuid primary key default gen_random_uuid(),

  -- Basic details
  name text not null check (char_length(name) between 1 and 120),
  -- Stored upper-case so the duplicate check ignores case.
  roll_number text not null check (roll_number ~ '^[A-Z0-9/_-]{3,30}$'),
  -- Stored lower-case so the duplicate check ignores case.
  email text not null check (email ~ '^[^@\sA-Z]+@[^@\sA-Z]+$' and char_length(email) <= 254),
  year_of_study text not null check (year_of_study in ('1', '2', '3', '4', '5', 'pg')),

  -- Understanding and contribution
  knowledge text not null check (char_length(knowledge) between 1 and 3000),
  contributions text not null check (char_length(contributions) between 1 and 3000),
  showcase text not null check (char_length(showcase) between 1 and 3000),
  -- The https links found in the answers, for reviewers to open.
  links text[] not null default '{}' check (cardinality(links) <= 30),
  plan text not null check (char_length(plan) between 1 and 3000),

  -- Role preferences and commitment
  department text not null check (char_length(department) between 1 and 80),
  role text not null check (char_length(role) between 1 and 120),
  weekly_hours integer not null check (weekly_hours between 1 and 40),
  commitment public.commitment_preference not null,

  -- Additional information
  additional_info text check (char_length(additional_info) <= 2000),
  -- Object path in the private resumes bucket.
  resume_path text check (char_length(resume_path) <= 200),

  -- Review
  status public.application_status not null default 'pending',
  admin_notes text check (char_length(admin_notes) <= 5000),
  -- Scores from 0 to 10 by criterion key. A reviewer's score beats the AI's,
  -- which beats the automatic one; the total is computed from the rubric.
  auto_scores jsonb not null default '{}' check (jsonb_typeof(auto_scores) = 'object'),
  -- What the automatic checks found, e.g. verified GitHub contributions.
  auto_evidence jsonb not null default '[]' check (jsonb_typeof(auto_evidence) = 'array'),
  admin_scores jsonb not null default '{}' check (jsonb_typeof(admin_scores) = 'object'),

  -- AI-assisted evaluation, when it is enabled. It never changes the status.
  ai_status text not null default 'pending' check (ai_status in ('pending', 'done', 'failed', 'disabled')),
  ai_evaluation jsonb check (ai_evaluation is null or jsonb_typeof(ai_evaluation) = 'object'),
  ai_model text check (char_length(ai_model) <= 80),
  ai_error text check (char_length(ai_error) <= 500),
  ai_evaluated_at timestamptz,

  -- Confirmation email
  email_status text not null default 'pending' check (email_status in ('pending', 'sent', 'failed', 'disabled')),
  email_error text check (char_length(email_error) <= 500),
  email_sent_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One application per student.
create unique index applications_roll_number_key on public.applications (roll_number);
create unique index applications_email_key on public.applications (email);
create index applications_listing_idx on public.applications (status, created_at desc);

-- Triggers -----------------------------------------------------------------------

create trigger recruitment_settings_set_updated_at before update on public.recruitment_settings
  for each row execute function public.set_updated_at();
create trigger recruitment_criteria_set_updated_at before update on public.recruitment_criteria
  for each row execute function public.set_updated_at();
create trigger applications_set_updated_at before update on public.applications
  for each row execute function public.set_updated_at();

-- Row level security ---------------------------------------------------------------

alter table public.recruitment_settings enable row level security;
alter table public.recruitment_criteria enable row level security;
alter table public.applications enable row level security;

create policy "Admins read recruitment settings" on public.recruitment_settings
  for select to authenticated
  using ((select public.is_admin()));
create policy "Admins update recruitment settings" on public.recruitment_settings
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Admins read the rubric" on public.recruitment_criteria
  for select to authenticated
  using ((select public.is_admin()));
create policy "Admins update the rubric" on public.recruitment_criteria
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- No insert policy: applications arrive only through the server.
create policy "Admins read applications" on public.applications
  for select to authenticated
  using ((select public.is_admin()));
create policy "Admins review applications" on public.applications
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins delete applications" on public.applications
  for delete to authenticated
  using ((select public.is_admin()));

-- Resume storage -------------------------------------------------------------------
--
-- Private: files are uploaded by the server and opened by admins through
-- short-lived signed links.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('resumes', 'resumes', false, 2097152, array['application/pdf'])
on conflict (id) do nothing;

create policy "Admins read resumes" on storage.objects
  for select to authenticated
  using (bucket_id = 'resumes' and (select public.is_admin()));
create policy "Admins delete resumes" on storage.objects
  for delete to authenticated
  using (bucket_id = 'resumes' and (select public.is_admin()));
