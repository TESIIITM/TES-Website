-- Content for the public site and the accounts allowed to edit it.
--
-- Reads are public for published rows. Every write requires a signed-in user
-- listed in public.admin_users; there is no public sign-up.

create type public.member_group as enum ('faculty', 'student');

-- Admins -------------------------------------------------------------------

create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  );
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create policy "Admins can read the admin list"
  on public.admin_users for select
  to authenticated
  using ((select public.is_admin()));

-- Shared helpers -----------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Members ------------------------------------------------------------------

create table public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  role text not null check (char_length(role) between 1 and 80),
  member_group public.member_group not null,
  portrait_url text,
  linkedin_url text check (linkedin_url ~ '^https://'),
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index members_listing_idx on public.members (member_group, sort_order);

-- Stories ------------------------------------------------------------------

create table public.stories (
  id uuid primary key default gen_random_uuid(),
  -- Readers' saved lists are keyed by slug, so it stays stable across edits.
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 200),
  category text not null check (char_length(category) between 1 and 40),
  summary text not null check (char_length(summary) between 1 and 300),
  url text not null check (url ~ '^https://'),
  published_on date not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index stories_listing_idx on public.stories (published_on);

-- Domains ------------------------------------------------------------------

create table public.domains (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 80),
  detail text not null check (char_length(detail) between 1 and 300),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Announcements ------------------------------------------------------------

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  label text not null default 'Community announcement' check (char_length(label) between 1 and 60),
  title text not null check (char_length(title) between 1 and 80),
  title_emphasis text check (char_length(title_emphasis) <= 80),
  summary text not null check (char_length(summary) between 1 and 600),
  details text check (char_length(details) <= 2000),
  primary_label text,
  primary_url text check (primary_url ~ '^https://'),
  secondary_label text,
  secondary_url text check (secondary_url ~ '^https://'),
  published_on date not null default current_date,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint announcements_primary_action_complete
    check ((primary_label is null) = (primary_url is null)),
  constraint announcements_secondary_action_complete
    check ((secondary_label is null) = (secondary_url is null))
);

create index announcements_listing_idx on public.announcements (published_on desc);

-- Site settings (a single row) --------------------------------------------

create table public.site_settings (
  id boolean primary key default true check (id),
  github_url text not null check (github_url ~ '^https://'),
  repository_url text not null check (repository_url ~ '^https://'),
  contribution_guide_url text not null check (contribution_guide_url ~ '^https://'),
  medium_url text not null check (medium_url ~ '^https://'),
  instagram_url text not null check (instagram_url ~ '^https://'),
  linkedin_url text not null check (linkedin_url ~ '^https://'),
  contact_email text not null check (contact_email ~ '^[^@\s]+@[^@\s]+$'),
  updated_at timestamptz not null default now()
);

-- Triggers -----------------------------------------------------------------

create trigger members_set_updated_at before update on public.members
  for each row execute function public.set_updated_at();
create trigger stories_set_updated_at before update on public.stories
  for each row execute function public.set_updated_at();
create trigger domains_set_updated_at before update on public.domains
  for each row execute function public.set_updated_at();
create trigger announcements_set_updated_at before update on public.announcements
  for each row execute function public.set_updated_at();
create trigger site_settings_set_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

-- Row level security -------------------------------------------------------
--
-- Anonymous visitors get policies that never call is_admin(), which only
-- signed-in users may execute.

alter table public.members enable row level security;
alter table public.stories enable row level security;
alter table public.domains enable row level security;
alter table public.announcements enable row level security;
alter table public.site_settings enable row level security;

create policy "Published members are public" on public.members
  for select to anon
  using (is_published);
create policy "Signed-in users see published members, admins see all" on public.members
  for select to authenticated
  using (is_published or (select public.is_admin()));
create policy "Admins manage members" on public.members
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Published stories are public" on public.stories
  for select to anon
  using (is_published);
create policy "Signed-in users see published stories, admins see all" on public.stories
  for select to authenticated
  using (is_published or (select public.is_admin()));
create policy "Admins manage stories" on public.stories
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Domains are public" on public.domains
  for select to anon, authenticated
  using (true);
create policy "Admins manage domains" on public.domains
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Published announcements are public" on public.announcements
  for select to anon
  using (is_published);
create policy "Signed-in users see published announcements, admins see all" on public.announcements
  for select to authenticated
  using (is_published or (select public.is_admin()));
create policy "Admins manage announcements" on public.announcements
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Site settings are public" on public.site_settings
  for select to anon, authenticated
  using (true);
-- Insert covers a fresh project with no settings row yet; the primary key
-- check keeps it to one row.
create policy "Admins create site settings" on public.site_settings
  for insert to authenticated
  with check ((select public.is_admin()));
create policy "Admins update site settings" on public.site_settings
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Portrait storage ---------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portraits', 'portraits', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Public downloads bypass these policies. The Storage API reads the object row
-- before replacing or removing a file, so admins need select as well.
create policy "Admins read portrait objects" on storage.objects
  for select to authenticated
  using (bucket_id = 'portraits' and (select public.is_admin()));
create policy "Admins upload portraits" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'portraits' and (select public.is_admin()));
create policy "Admins replace portraits" on storage.objects
  for update to authenticated
  using (bucket_id = 'portraits' and (select public.is_admin()));
create policy "Admins delete portraits" on storage.objects
  for delete to authenticated
  using (bucket_id = 'portraits' and (select public.is_admin()));
