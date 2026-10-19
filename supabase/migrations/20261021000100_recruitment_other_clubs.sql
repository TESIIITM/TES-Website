-- Whether the applicant is in other clubs, and which. Not scored; reviewers use
-- it to judge how much time the applicant has. Empty for earlier applications.

alter table public.applications
  add column other_clubs boolean,
  add column other_clubs_detail text check (char_length(other_clubs_detail) <= 300);
