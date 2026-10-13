-- The weekly tech news digest: links an admin picks each week, with a preview
-- (title, summary, source, image) read from the linked page when it is added.

create table public.tech_news (
  id uuid primary key default gen_random_uuid(),
  url text not null check (url ~ '^https://'),
  title text not null check (char_length(title) between 1 and 200),
  summary text check (char_length(summary) <= 400),
  source text check (char_length(source) <= 80),
  -- A copy in the news-images bucket, so the site never hotlinks another host.
  image_url text,
  -- The Monday of the week the link belongs to. The site shows the latest week.
  week_of date not null check (extract(isodow from week_of) = 1),
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tech_news_listing_idx on public.tech_news (week_of desc, sort_order);

create trigger tech_news_set_updated_at before update on public.tech_news
  for each row execute function public.set_updated_at();

alter table public.tech_news enable row level security;

create policy "Published tech news is public" on public.tech_news
  for select to anon
  using (is_published);
create policy "Signed-in users see published tech news, admins see all" on public.tech_news
  for select to authenticated
  using (is_published or (select public.is_admin()));
create policy "Admins manage tech news" on public.tech_news
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Preview images ------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('news-images', 'news-images', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Admins read news image objects" on storage.objects
  for select to authenticated
  using (bucket_id = 'news-images' and (select public.is_admin()));
create policy "Admins upload news images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'news-images' and (select public.is_admin()));
create policy "Admins replace news images" on storage.objects
  for update to authenticated
  using (bucket_id = 'news-images' and (select public.is_admin()));
create policy "Admins delete news images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'news-images' and (select public.is_admin()));
