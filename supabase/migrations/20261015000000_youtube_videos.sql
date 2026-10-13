-- YouTube videos shown under Learn. An admin pastes a video link; the title,
-- channel, and thumbnail are read from YouTube's oEmbed endpoint. The site
-- shows the thumbnail and loads the player only when a visitor presses play.

create table public.youtube_videos (
  id uuid primary key default gen_random_uuid(),
  video_id text not null unique check (video_id ~ '^[A-Za-z0-9_-]{11}$'),
  title text not null check (char_length(title) between 1 and 200),
  channel text check (char_length(channel) <= 80),
  -- A copy in the video-thumbnails bucket, so the page loads nothing from YouTube until play.
  thumbnail_url text,
  published_on date not null default current_date,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index youtube_videos_listing_idx on public.youtube_videos (published_on desc);

create trigger youtube_videos_set_updated_at before update on public.youtube_videos
  for each row execute function public.set_updated_at();

alter table public.youtube_videos enable row level security;

create policy "Published YouTube videos are public" on public.youtube_videos
  for select to anon
  using (is_published);
create policy "Signed-in users see published YouTube videos, admins see all" on public.youtube_videos
  for select to authenticated
  using (is_published or (select public.is_admin()));
create policy "Admins manage YouTube videos" on public.youtube_videos
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Thumbnails --------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('video-thumbnails', 'video-thumbnails', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Admins read video thumbnail objects" on storage.objects
  for select to authenticated
  using (bucket_id = 'video-thumbnails' and (select public.is_admin()));
create policy "Admins upload video thumbnails" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'video-thumbnails' and (select public.is_admin()));
create policy "Admins replace video thumbnails" on storage.objects
  for update to authenticated
  using (bucket_id = 'video-thumbnails' and (select public.is_admin()));
create policy "Admins delete video thumbnails" on storage.objects
  for delete to authenticated
  using (bucket_id = 'video-thumbnails' and (select public.is_admin()));
