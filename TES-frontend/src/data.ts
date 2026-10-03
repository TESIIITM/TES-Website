export const asset = (name: string) => `${import.meta.env.BASE_URL}assets/${name}`;

export const society = {
  github: 'https://github.com/TESIIITM',
  repository: 'https://github.com/TESIIITM/TES-Website',
  contributionGuide: 'https://github.com/TESIIITM/TES-Website/blob/main/CONTRIBUTING.md',
  medium: 'https://medium.com/@tes.abviiitm',
  instagram: 'https://www.instagram.com/tes_iiitm',
  linkedin: 'https://www.linkedin.com/company/tes-the-enigma-society/',
  email: 'tes.abviiitm@gmail.com',
  eventForm: 'https://forms.gle/QkzT3Bcsaukr5Lib6',
  eventRules: 'https://robust-calcium-ce6.notion.site/Tech-Lekhan-2f53e328d0a4807481ffe287fcc92460',
} as const;

export type Story = {
  id: string;
  title: string;
  category: 'Open source' | 'Development';
  date: string;
  url: string;
  summary: string;
};

export const stories: Story[] = [
  { id: 'opensource', title: 'Understanding Open Source', category: 'Open source', date: '30 JAN 2026', url: 'https://medium.com/@tes.abviiitm/understanding-open-source-e003193b0fe9', summary: 'Start with the ideas behind shared code and collaboration.' },
  { id: 'versioncontrol', title: 'Understanding the Need for Version Control: Solving the Pendrive Problem', category: 'Development', date: '05 FEB 2026', url: 'https://medium.com/@tes.abviiitm/understanding-the-need-for-version-control-solving-the-pendrive-problem-a4b04ed9aa7e', summary: 'Why version control makes building together possible.' },
  { id: 'gsoc', title: 'Amid It All, the Journey Led to GSoC ’26', category: 'Open source', date: '01 JUN 2026', url: 'https://medium.com/@tes.abviiitm/amid-it-all-the-journey-led-to-gsoc-26-7455191d1060', summary: 'A community story about a path into open source.' },
  { id: 'go', title: 'Why I Chose Go to Build My Application and Why You Might Want To As Well', category: 'Development', date: '19 AUG 2026', url: 'https://medium.com/@tes.abviiitm/why-i-chose-go-to-build-my-application-and-why-you-might-want-to-as-well-e3b5c3e6d5a2', summary: 'An exploration of Go and backend development.' },
];

export const people = [
  { name: 'Mithul Nama', role: 'Core member', portrait: asset('team/mithul.jpg'), linkedin: 'https://www.linkedin.com/in/mithul-nama-61362a331' },
  { name: 'Rohinth S', role: 'Core member', portrait: asset('team/rohinth.jpg'), linkedin: 'https://www.linkedin.com/in/srohinth/' },
  { name: 'Aman Dabral', role: 'Core member', portrait: '', linkedin: 'https://www.linkedin.com/in/aman-dabral-163730323/' },
  { name: 'Dr. Rahul Kala', role: 'Faculty coordinator', portrait: asset('team/Dr.RahulKala.jpeg'), linkedin: 'https://www.linkedin.com/in/rkala001/' },
  { name: 'Dr. Rohit Kumar', role: 'Faculty coordinator', portrait: asset('team/Dr.RohitKumar.png'), linkedin: 'https://www.linkedin.com/in/dr-rohit-kumar-smieee/' },
] as const;

export const domains = [
  { code: '01', title: 'Web & app development', detail: 'Design accessible interfaces, test performance, and ship tools people want to use.' },
  { code: '02', title: 'CP & DSA', detail: 'Work through hard problems together and share the reasoning behind solutions.' },
  { code: '03', title: 'AI & data science', detail: 'Explore data, question models, and turn experiments into shared knowledge.' },
  { code: '04', title: 'Open source & security', detail: 'Read real code, improve a small piece, and learn from a thoughtful review.' },
] as const;
