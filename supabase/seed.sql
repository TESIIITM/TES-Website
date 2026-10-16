-- Current site content. Keep in step with src/lib/content/fallback.ts, which
-- renders the same content when Supabase is not configured.

insert into public.site_settings (
  github_url, repository_url, contribution_guide_url, medium_url,
  instagram_url, linkedin_url, contact_email
) values (
  'https://github.com/TESIIITM',
  'https://github.com/TESIIITM/TES-Website',
  'https://github.com/TESIIITM/TES-Website/blob/main/CONTRIBUTING.md',
  'https://medium.com/@tes.abviiitm',
  'https://www.instagram.com/tes_iiitm',
  'https://www.linkedin.com/company/tes-the-enigma-society/',
  'tes@iiitm.ac.in'
);

insert into public.members (name, role, member_group, portrait_url, linkedin_url, sort_order) values
  ('Dr. Rahul Kala', 'Faculty coordinator', 'faculty', '/assets/team/Dr.RahulKala.jpeg', 'https://www.linkedin.com/in/rkala001/', 1),
  ('Dr. Rohit Kumar', 'Faculty coordinator', 'faculty', '/assets/team/Dr.RohitKumar.png', 'https://www.linkedin.com/in/dr-rohit-kumar-smieee/', 2),
  ('Mithul Nama', 'Club head', 'student', '/assets/team/mithul.jpg', 'https://www.linkedin.com/in/mithul-nama-61362a331', 1),
  ('Rohinth S', 'Club head', 'student', '/assets/team/rohinth.jpg', 'https://www.linkedin.com/in/srohinth/', 2),
  ('Aman Dabral', 'Club head', 'student', null, 'https://www.linkedin.com/in/aman-dabral-163730323/', 3);

insert into public.stories (slug, title, category, summary, url, published_on) values
  ('opensource', 'Understanding Open Source', 'Open source', 'Start with the ideas behind shared code and collaboration.', 'https://medium.com/@tes.abviiitm/understanding-open-source-e003193b0fe9', '2026-01-30'),
  ('versioncontrol', 'Understanding the Need for Version Control: Solving the Pendrive Problem', 'Development', 'Why version control makes building together possible.', 'https://medium.com/@tes.abviiitm/understanding-the-need-for-version-control-solving-the-pendrive-problem-a4b04ed9aa7e', '2026-02-05'),
  ('gsoc', 'Amid It All, the Journey Led to GSoC ’26', 'Open source', 'A community story about a path into open source.', 'https://medium.com/@tes.abviiitm/amid-it-all-the-journey-led-to-gsoc-26-7455191d1060', '2026-06-01'),
  ('go', 'Why I Chose Go to Build My Application and Why You Might Want To As Well', 'Development', 'An exploration of Go and backend development.', 'https://medium.com/@tes.abviiitm/why-i-chose-go-to-build-my-application-and-why-you-might-want-to-as-well-e3b5c3e6d5a2', '2026-08-19');

insert into public.domains (title, detail, sort_order) values
  ('Web & app development', 'Design accessible interfaces, test performance, and ship tools people want to use.', 1),
  ('CP & DSA', 'Work through hard problems together and share the reasoning behind solutions.', 2),
  ('AI & data science', 'Explore data, question models, and turn experiments into shared knowledge.', 3),
  ('Open source & security', 'Read real code, improve a small piece, and learn from a thoughtful review.', 4);

insert into public.announcements (
  label, title, title_emphasis, summary, details,
  primary_label, primary_url, secondary_label, secondary_url,
  published_on, is_published
) values (
  'Community announcement',
  'Tech',
  'Lekhan.',
  'An online tech blogging event where original ideas have a platform. Write on code, AI, startups, security, or anything in tech that matters to you.',
  'Write an original technology blog and follow the official submission rules. Selected work can be featured on the society’s Medium page with credit. Check the form and rules for current registration availability and dates.',
  'View registration form', 'https://forms.gle/QkzT3Bcsaukr5Lib6',
  'Read official rules', 'https://robust-calcium-ce6.notion.site/Tech-Lekhan-2f53e328d0a4807481ffe287fcc92460',
  '2026-09-01',
  true
);
