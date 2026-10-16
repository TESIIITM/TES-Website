-- GitHub repositories and contributors under Build. Admins choose the
-- repositories and write the copy; stars, forks, issues, and contributors are
-- read from the GitHub API on the server and cached.

create table public.github_repos (
  id uuid primary key default gen_random_uuid(),
  -- owner/name, as GitHub spells it.
  full_name text not null unique check (full_name ~ '^[A-Za-z0-9-]+/[A-Za-z0-9._-]+$'),
  -- Shown instead of the repository name, e.g. "TES Website".
  title text check (char_length(title) between 1 and 80),
  -- Shown instead of GitHub's description.
  description text check (char_length(description) between 1 and 400),
  -- The featured repository's large heading; the emphasis is its second line.
  headline text check (char_length(headline) between 1 and 60),
  headline_emphasis text check (char_length(headline_emphasis) between 1 and 60),
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- At most one featured repository.
create unique index github_repos_one_featured_idx on public.github_repos (is_featured) where is_featured;
create index github_repos_listing_idx on public.github_repos (sort_order);

create trigger github_repos_set_updated_at before update on public.github_repos
  for each row execute function public.set_updated_at();

-- Contributors section (a single row) ----------------------------------------

create table public.github_settings (
  id boolean primary key default true check (id),
  show_contributors boolean not null default true,
  contributors_heading text not null default 'Built in the open.' check (char_length(contributors_heading) between 1 and 80),
  contributors_intro text check (char_length(contributors_intro) <= 300),
  -- GitHub logins left out of the section. Bots are always left out.
  hidden_logins text[] not null default '{}',
  max_contributors integer not null default 24 check (max_contributors between 1 and 100),
  updated_at timestamptz not null default now()
);

create trigger github_settings_set_updated_at before update on public.github_settings
  for each row execute function public.set_updated_at();

-- Row level security ----------------------------------------------------------

alter table public.github_repos enable row level security;
alter table public.github_settings enable row level security;

create policy "Published GitHub repositories are public" on public.github_repos
  for select to anon
  using (is_published);
create policy "Signed-in users see published GitHub repositories, admins see all" on public.github_repos
  for select to authenticated
  using (is_published or (select public.is_admin()));
create policy "Admins manage GitHub repositories" on public.github_repos
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "GitHub settings are public" on public.github_settings
  for select to anon, authenticated
  using (true);
create policy "Admins create GitHub settings" on public.github_settings
  for insert to authenticated
  with check ((select public.is_admin()));
create policy "Admins update GitHub settings" on public.github_settings
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- The repository the Build panel has always featured, with its original copy.
insert into public.github_repos (full_name, title, description, headline, headline_emphasis, is_featured, sort_order)
values (
  'TESIIITM/TES-Website',
  'TES-Website',
  'Our society website is open for exploration. Read the source, improve an interaction, fix a bug, or make the docs clearer. Start with one useful change.',
  'Make the web',
  'a little better.',
  true,
  1
)
on conflict (full_name) do nothing;

insert into public.github_settings (contributors_intro)
values ('Everyone who has shipped a change to the society’s repositories.')
on conflict (id) do nothing;
