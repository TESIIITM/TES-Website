-- Instagram posts shown as preview cards under Gather. An admin pastes a post
-- link; the caption, date, and image are read from the post's public preview.

create table public.instagram_posts (
  id uuid primary key default gen_random_uuid(),
  -- Stored in one form, https://www.instagram.com/p/<code>/, so a post is added once.
  url text not null unique check (url ~ '^https://www\.instagram\.com/(p|reel)/[A-Za-z0-9_-]+/$'),
  caption text check (char_length(caption) <= 300),
  -- A copy in the instagram-images bucket; Instagram's CDN links expire.
  image_url text,
  posted_on date not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index instagram_posts_listing_idx on public.instagram_posts (posted_on desc);

create trigger instagram_posts_set_updated_at before update on public.instagram_posts
  for each row execute function public.set_updated_at();

alter table public.instagram_posts enable row level security;

create policy "Published Instagram posts are public" on public.instagram_posts
  for select to anon
  using (is_published);
create policy "Signed-in users see published Instagram posts, admins see all" on public.instagram_posts
  for select to authenticated
  using (is_published or (select public.is_admin()));
create policy "Admins manage Instagram posts" on public.instagram_posts
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Post images -----------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('instagram-images', 'instagram-images', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Admins read Instagram image objects" on storage.objects
  for select to authenticated
  using (bucket_id = 'instagram-images' and (select public.is_admin()));
create policy "Admins upload Instagram images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'instagram-images' and (select public.is_admin()));
create policy "Admins replace Instagram images" on storage.objects
  for update to authenticated
  using (bucket_id = 'instagram-images' and (select public.is_admin()));
create policy "Admins delete Instagram images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'instagram-images' and (select public.is_admin()));
