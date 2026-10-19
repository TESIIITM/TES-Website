-- Applicants can pick several roles and up to three domains (#74). Roles are
-- stored by key; domains by name, as offered in recruitment_settings.

alter table public.applications
  add column roles text[] not null default '{}'
    check (roles <@ array['technical', 'mentor', 'domain_lead', 'operations', 'design', 'promotions']::text[]),
  add column domains text[] not null default '{}'
    check (cardinality(domains) <= 3),
  -- Kept for applications sent before roles had fixed options, whose free-text
  -- answers do not map to a role. New applications leave them empty.
  alter column department drop not null,
  alter column role drop not null;

-- Applications from the single-role form: a technical role with its domain...
update public.applications
set roles = array[case role
      when 'Technical team' then 'technical'
      when 'Mentor' then 'mentor'
      when 'Domain lead' then 'domain_lead'
    end],
  domains = array[department]
where role in ('Technical team', 'Mentor', 'Domain lead');

-- ...or a team of its own, stored with the team as the department.
update public.applications
set roles = array[case department
      when 'Operations' then 'operations'
      when 'Design' then 'design'
      when 'Promotions' then 'promotions'
    end]
where role = 'Team member' and department in ('Operations', 'Design', 'Promotions');
