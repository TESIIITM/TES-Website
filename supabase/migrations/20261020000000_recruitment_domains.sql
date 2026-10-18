-- The form now asks for a role first (technical team, mentor, domain lead,
-- operations, design, promotions). Only the technical roles ask for a domain,
-- so the department list becomes a list of technical domains.

alter table public.recruitment_settings
  alter column departments set default array[
    'Open Source', 'Web Development', 'App Development', 'AI / ML',
    'Competitive Programming', 'Cybersecurity'
  ];

-- Swap the old default for the new one; a list an admin already edited is kept.
update public.recruitment_settings
set departments = array[
    'Open Source', 'Web Development', 'App Development', 'AI / ML',
    'Competitive Programming', 'Cybersecurity'
  ],
  updated_at = now()
where departments = array[
    'Web Development', 'App Development', 'AI / ML', 'Competitive Programming',
    'Cybersecurity', 'Design', 'Content & Outreach', 'Events & Management'
  ];
