-- Stories now come from the Medium feed as well as from this table. A row here
-- with a Medium link takes the place of that post's feed copy. Posts an admin
-- hides are listed by Medium's post id on site_settings, which visitors can
-- read; hidden story rows are not visible to them.

alter table public.site_settings
  add column hidden_medium_posts text[] not null default '{}'
  check (array_to_string(hidden_medium_posts, ',') ~ '^([0-9a-f]{8,16}(,|$))*$');
