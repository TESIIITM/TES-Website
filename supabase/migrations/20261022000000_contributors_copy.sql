-- Contributors copy that says what the grid shows and how to get on it.
-- Only rows still on the original wording change; edited copy is kept.

alter table public.github_settings alter column contributors_heading set default 'Contributors';

update public.github_settings
set contributors_heading = 'Contributors'
where contributors_heading = 'Built in the open.';

update public.github_settings
set contributors_intro = 'Everyone with a merged pull request in the society’s repositories. Yours appears here after your first one.'
where contributors_intro = 'Everyone who has shipped a change to the society’s repositories.';
