import type { SiteContent } from './types';

/**
 * Rendered when Supabase is not configured, so the site can be worked on and
 * tested without a database. Mirrors `supabase/seed.sql`.
 */
export const fallbackContent: SiteContent = {
  links: {
    github: 'https://github.com/TESIIITM',
    repository: 'https://github.com/TESIIITM/TES-Website',
    contributionGuide: 'https://github.com/TESIIITM/TES-Website/blob/main/CONTRIBUTING.md',
    medium: 'https://medium.com/@tes.abviiitm',
    instagram: 'https://www.instagram.com/tes_iiitm',
    linkedin: 'https://www.linkedin.com/company/tes-the-enigma-society/',
    email: 'tes@iiitm.ac.in',
  },
  members: [
    { id: 'rahul-kala', name: 'Dr. Rahul Kala', role: 'Faculty coordinator', group: 'faculty', portraitUrl: '/assets/team/Dr.RahulKala.jpeg', linkedinUrl: 'https://www.linkedin.com/in/rkala001/' },
    { id: 'rohit-kumar', name: 'Dr. Rohit Kumar', role: 'Faculty coordinator', group: 'faculty', portraitUrl: '/assets/team/Dr.RohitKumar.png', linkedinUrl: 'https://www.linkedin.com/in/dr-rohit-kumar-smieee/' },
    { id: 'mithul-nama', name: 'Mithul Nama', role: 'Club head', group: 'student', portraitUrl: '/assets/team/mithul.jpg', linkedinUrl: 'https://www.linkedin.com/in/mithul-nama-61362a331' },
    { id: 'rohinth-s', name: 'Rohinth S', role: 'Club head', group: 'student', portraitUrl: '/assets/team/rohinth.jpg', linkedinUrl: 'https://www.linkedin.com/in/srohinth/' },
    { id: 'aman-dabral', name: 'Aman Dabral', role: 'Club head', group: 'student', portraitUrl: null, linkedinUrl: 'https://www.linkedin.com/in/aman-dabral-163730323/' },
  ],
  stories: [
    { id: 'opensource', slug: 'opensource', title: 'Understanding Open Source', category: 'Open source', publishedOn: '2026-01-30', url: 'https://medium.com/@tes.abviiitm/understanding-open-source-e003193b0fe9', summary: 'Start with the ideas behind shared code and collaboration.' },
    { id: 'versioncontrol', slug: 'versioncontrol', title: 'Understanding the Need for Version Control: Solving the Pendrive Problem', category: 'Development', publishedOn: '2026-02-05', url: 'https://medium.com/@tes.abviiitm/understanding-the-need-for-version-control-solving-the-pendrive-problem-a4b04ed9aa7e', summary: 'Why version control makes building together possible.' },
    { id: 'gsoc', slug: 'gsoc', title: 'Amid It All, the Journey Led to GSoC ’26', category: 'Open source', publishedOn: '2026-06-01', url: 'https://medium.com/@tes.abviiitm/amid-it-all-the-journey-led-to-gsoc-26-7455191d1060', summary: 'A community story about a path into open source.' },
    { id: 'go', slug: 'go', title: 'Why I Chose Go to Build My Application and Why You Might Want To As Well', category: 'Development', publishedOn: '2026-08-19', url: 'https://medium.com/@tes.abviiitm/why-i-chose-go-to-build-my-application-and-why-you-might-want-to-as-well-e3b5c3e6d5a2', summary: 'An exploration of Go and backend development.' },
  ],
  domains: [
    { id: 'web', title: 'Web & app development', detail: 'Design accessible interfaces, test performance, and ship tools people want to use.' },
    { id: 'cp', title: 'CP & DSA', detail: 'Work through hard problems together and share the reasoning behind solutions.' },
    { id: 'ai', title: 'AI & data science', detail: 'Explore data, question models, and turn experiments into shared knowledge.' },
    { id: 'oss', title: 'Open source & security', detail: 'Read real code, improve a small piece, and learn from a thoughtful review.' },
  ],
  announcements: [
    {
      id: 'tech-lekhan',
      label: 'Community announcement',
      title: 'Tech',
      titleEmphasis: 'Lekhan.',
      summary: 'An online tech blogging event where original ideas have a platform. Write on code, AI, startups, security, or anything in tech that matters to you.',
      details: 'Write an original technology blog and follow the official submission rules. Selected work can be featured on the society’s Medium page with credit. Check the form and rules for current registration availability and dates.',
      primaryAction: { label: 'View registration form', url: 'https://forms.gle/QkzT3Bcsaukr5Lib6' },
      secondaryAction: { label: 'Read official rules', url: 'https://robust-calcium-ce6.notion.site/Tech-Lekhan-2f53e328d0a4807481ffe287fcc92460' },
      publishedOn: '2026-09-01',
    },
  ],
  // Added weekly from the dashboard; the seed has none.
  techNews: null,
  instagramPosts: [],
  videos: [],
};
