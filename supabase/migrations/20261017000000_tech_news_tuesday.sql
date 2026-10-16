-- Tech news goes out on Tuesdays, so a week now runs Tuesday to Monday and is
-- stored as its Tuesday. Existing Monday rows move to the next day, which keeps
-- each digest together under the Tuesday it was published.

alter table public.tech_news drop constraint tech_news_week_of_check;

update public.tech_news set week_of = week_of + 1;

alter table public.tech_news
  add constraint tech_news_week_of_check check (extract(isodow from week_of) = 2);

comment on column public.tech_news.week_of is 'The Tuesday that starts the week the link belongs to. The site shows the latest week.';
