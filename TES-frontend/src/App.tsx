import { useEffect, useId, useState, type KeyboardEvent, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Check, Code2, Compass, GitFork, Github, Instagram, Mail, Menu, Moon, Search, Sun, X, Bookmark, Command } from 'lucide-react';
import { AmbientCompass } from './components/AmbientCompass';
import { MagneticLink } from './components/MagneticLink';
import { SpotlightCard } from './components/SpotlightCard';
import { CommandPalette } from './components/CommandPalette';
import { asset, domains, people, society, stories } from './data';

type Panel = 'build' | 'learn' | 'gather';
type Filter = 'All' | 'Open source' | 'Development' | 'Saved';
const panels: { value: Panel; label: string; number: string }[] = [
  { value: 'build', label: 'Build', number: '01' },
  { value: 'learn', label: 'Learn', number: '02' },
  { value: 'gather', label: 'Gather', number: '03' },
];
const filters: Filter[] = ['All', 'Open source', 'Development', 'Saved'];
const faculty = people.filter((person) => person.role === 'Faculty coordinator');
const students = people.filter((person) => person.role !== 'Faculty coordinator');

function readBookmarks(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem('tes-reading-list') || '[]');
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
  } catch { return []; }
}

function Label({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`eyebrow ${className}`}>{children}</span>;
}

function Header({ navigate, onCommand }: { navigate: (target: string) => void; onCommand: () => void }) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try { return localStorage.getItem('tes-theme') === 'light' ? 'light' : 'dark'; } catch { return 'dark'; }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#09090b' : '#eeeae0');
    try { localStorage.setItem('tes-theme', theme); } catch { /* Storage is optional. */ }
  }, [theme]);
  const go = (target: string) => { setOpen(false); navigate(target); };
  return (
    <header className="site-header">
      <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); go('home'); }} aria-label="The Enigma Society, home">
        <img className="brand-compass" src={asset('compass.svg')} width="43" height="43" alt="" />
        <img className="brand-wordmark" src={asset('enigma-wordmark.png')} width="116" height="49" alt="" />
      </a>
      <nav className={`main-nav ${open ? 'is-open' : ''}`} id="main-nav" aria-label="Main navigation">
        <a href="#about" onClick={(event) => { event.preventDefault(); go('about'); }}>The society</a>
        <a href="#build" onClick={(event) => { event.preventDefault(); go('build'); }}>Projects</a>
        <a href="#learn" onClick={(event) => { event.preventDefault(); go('learn'); }}>Knowledge</a>
        <a href="#gather" onClick={(event) => { event.preventDefault(); go('gather'); }}>Events</a>
      </nav>
      <div className="header-tools">
        <button className="command-trigger" onClick={onCommand} aria-label="Open command menu"><Command size={15} /><span>Jump to</span><kbd>⌘ K</kbd></button>
        <button className="theme-button" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <a className="header-github" href={society.github} target="_blank" rel="noopener noreferrer"><Github size={17} /><span>GitHub</span><ArrowUpRight size={16} /></a>
        <button className="menu-button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen(!open)}>
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
    </header>
  );
}

function Hero({ navigate, onCommand }: { navigate: (target: string) => void; onCommand: () => void }) {
  const reduceMotion = useReducedMotion();
  return (
    <section className="hero-section" id="home" aria-labelledby="hero-title">
      <div className="hero-ambient" aria-hidden="true" />
      <div className="hero-content">
        <div className="hero-copy">
          <motion.div initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <Label><span className="live-dot" aria-hidden="true" />THE ENIGMA SOCIETY <span className="slash">/</span> ABV-IIITM GWALIOR</Label>
          </motion.div>
          <motion.h1 id="hero-title" initial={reduceMotion ? false : { opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.72, delay: 0.09 }}>
            Find your<br /><em>next commit.</em>
          </motion.h1>
          <motion.p className="hero-lead" initial={reduceMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.22 }}>
            A shared direction for curious minds. Learn together, build in public, and contribute to something that matters.
          </motion.p>
          <motion.div className="hero-actions" initial={reduceMotion ? false : { opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.34 }}>
            <MagneticLink className="button button-primary" href="#build" onClick={(event) => { event.preventDefault(); navigate('build'); }}>
              Start contributing <ArrowUpRight size={18} />
            </MagneticLink>
            <a className="text-action" href="#about" onClick={(event) => { event.preventDefault(); navigate('about'); }}>Explore the society <ArrowRight size={17} /></a>
          </motion.div>
          <div className="hero-proof"><span className="proof-line" /><Label>OPEN CODE <span className="mini-diamond">◇</span> SHARED KNOWLEDGE <span className="mini-diamond">◇</span> COLLECTIVE PROGRESS</Label></div>
          <button className="hero-command" onClick={onCommand}><Search size={16} /> Explore by command <kbd>⌘ K</kbd></button>
        </div>
        <div className="hero-visual" aria-label="Animated compass and contribution paths">
          <div className="visual-grid" aria-hidden="true" />
          <div className="visual-halo" aria-hidden="true" />
          <AmbientCompass className="compass-canvas" />
          <div className="compass-core" aria-hidden="true"><img src={asset('compass.svg')} alt="" /></div>
          <svg className="map-tracks" viewBox="0 0 700 630" preserveAspectRatio="none" aria-hidden="true"><path d="M50 315 H650 M350 36 V580 M200 315 C240 315 230 375 285 375 H420 C480 375 465 315 510 315" /><circle cx="80" cy="315" r="8" /><circle cx="350" cy="90" r="8" /><circle cx="620" cy="315" r="8" /><circle cx="350" cy="550" r="8" /></svg>
          <button className="map-node map-node-learn" onClick={() => navigate('learn')}><span>01 / EXPLORE</span><strong>learn</strong><small>Find a direction</small></button>
          <button className="map-node map-node-build" onClick={() => navigate('build')}><span>02 / CONTRIBUTE</span><strong>build</strong><small>Make it yours</small></button>
          <button className="map-node map-node-share" onClick={() => navigate('gather')}><span>03 / SHARE</span><strong>merge</strong><small>Build together</small></button>
          <div className="visual-coordinate coordinate-left">MAIN / OPEN CODE<br />CURIOUS MINDS, IN MOTION</div>
          <div className="visual-coordinate coordinate-right">YOUR FIRST CONTRIBUTION<br />STARTS HERE.</div>
          <span className="visual-corner corner-tl" aria-hidden="true">＋</span><span className="visual-corner corner-br" aria-hidden="true">＋</span>
        </div>
      </div>
      <div className="hero-bottom"><a href="#explore" onClick={(event) => { event.preventDefault(); navigate('build'); }}>SCROLL TO EXPLORE <ArrowDown size={17} /></a><span>EST. AT ABV-IIITM GWALIOR <i>◆</i> SEE YOU AT THE TOP.</span></div>
    </section>
  );
}

function BuildPanel() {
  const [domain, setDomain] = useState(0);
  const current = domains[domain];
  const selectWithKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % domains.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + domains.length - 1) % domains.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = domains.length - 1;
    else return;
    event.preventDefault();
    setDomain(next);
    document.getElementById(`domain-${next}`)?.focus();
  };
  return (
    <div className="build-panel">
      <div className="feature-grid">
        <SpotlightCard className="feature-card">
          <div className="feature-heading"><Label>FEATURED / OPEN REPOSITORY</Label><span className="source-insignia"><GitFork size={17} strokeWidth={1.5} /> TES / OPEN SOURCE</span></div>
          <h3>Make the web<br /><em>a little better.</em></h3>
          <p>Our society website is open for exploration. Read the source, improve an interaction, fix a bug, or make the docs clearer. Start with one useful change.</p>
          <div className="feature-tags"><span>TES-Website</span><span>JavaScript</span><span>MIT</span></div>
          <div className="feature-links"><a href={society.repository} target="_blank" rel="noopener noreferrer">Explore repository <ArrowUpRight size={17} /></a><a href={society.contributionGuide} target="_blank" rel="noopener noreferrer">Contribution guide <ArrowUpRight size={17} /></a></div>
        </SpotlightCard>
        <SpotlightCard className="terminal-card">
          <div className="terminal-bar"><div className="traffic"><i /><i /><i /></div><span>community.md</span><Code2 size={16} /></div>
          <div className="terminal-body" aria-label="A shared direction: learn alone becomes build together">
            <p><span>01</span><b># a shared direction</b></p><p><span>02</span></p><p><span>03</span><del>− learn alone</del></p><p><span>04</span><ins>+ build together</ins></p><p><span>05</span></p><p><span>06</span><b>// every contribution counts</b></p>
          </div>
          <div className="terminal-status"><span className="live-dot" /> ready to collaborate <span>main ◆</span></div>
        </SpotlightCard>
      </div>
      <div className="domains-top"><div><Label>EXPLORE THE STACK</Label><h3>Many directions. One community.</h3></div><p>Pick a path. Your first contribution can be small.</p></div>
      <div className="domain-layout">
        <div className="domain-tabs" role="tablist" aria-label="Technical domains">
          {domains.map((item, index) => <button id={`domain-${index}`} key={item.code} role="tab" aria-selected={domain === index} aria-controls="domain-preview" tabIndex={domain === index ? 0 : -1} onClick={() => setDomain(index)} onKeyDown={(event) => selectWithKey(event, index)}><span>{item.code}</span>{item.title}<ArrowUpRight size={16} /></button>)}
        </div>
        <div className="domain-preview" id="domain-preview" role="tabpanel" aria-labelledby={`domain-${domain}`} tabIndex={0}>
          <AnimatePresence mode="wait"><motion.div key={current.code} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}><Compass size={26} strokeWidth={1.3} /><span className="preview-index">FIELD NOTE / {current.code}</span><h4>{current.title}</h4><p>{current.detail}</p><a href={society.github} target="_blank" rel="noopener noreferrer">Explore the collective <ArrowUpRight size={16} /></a></motion.div></AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function LearnPanel() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [saved, setSaved] = useState<string[]>(readBookmarks);
  const inputId = useId();
  const visible = stories.filter((story) => (filter === 'All' || filter === 'Saved' ? filter !== 'Saved' || saved.includes(story.id) : story.category === filter) && `${story.title} ${story.summary} ${story.category}`.toLowerCase().includes(query.trim().toLowerCase()));
  const toggleSaved = (id: string) => {
    const next = saved.includes(id) ? saved.filter((item) => item !== id) : [...saved, id];
    setSaved(next);
    try { localStorage.setItem('tes-reading-list', JSON.stringify(next)); } catch { /* Reading list works in memory. */ }
  };
  return (
    <div className="learn-panel">
      <div className="panel-heading"><div><Label>FROM THE COMMUNITY</Label><h3>Knowledge moves<br /><em>when we share it.</em></h3></div><a href={society.medium} target="_blank" rel="noopener noreferrer">All stories on Medium <ArrowUpRight size={16} /></a></div>
      <div className="reading-tools"><label className="search-field" htmlFor={inputId}><Search size={17} /><input id={inputId} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the reading list" type="search" /></label><div className="filter-set" role="group" aria-label="Filter stories">{filters.map((item) => <button key={item} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}{item === 'Saved' && <span>{saved.length}</span>}</button>)}</div></div>
      <p className="result-count" role="status">{visible.length} {visible.length === 1 ? 'STORY' : 'STORIES'} {filter === 'Saved' ? 'SAVED ON THIS DEVICE' : 'FROM THE SOCIETY'}</p>
      {visible.length ? <div className="story-list">{visible.map((story) => <article className="story-row" key={story.id}><span className="story-date">{story.date}</span><div><span className="story-category">{story.category}</span><a href={story.url} target="_blank" rel="noopener noreferrer"><h4>{story.title} <ArrowUpRight size={18} /></h4></a><p>{story.summary}</p></div><button className="bookmark-button" aria-label={`${saved.includes(story.id) ? 'Remove' : 'Save'} ${story.title}`} aria-pressed={saved.includes(story.id)} onClick={() => toggleSaved(story.id)}><Bookmark size={19} fill={saved.includes(story.id) ? 'currentColor' : 'none'} /></button></article>)}</div> : <div className="empty-reading"><BookOpen size={25} /><h4>No stories found.</h4><p>Try a different search or clear the filters.</p><button onClick={() => { setQuery(''); setFilter('All'); }}>Reset reading list <ArrowRight size={16} /></button></div>}
      <p className="reading-footnote">A curated snapshot of the society’s Medium publication. Saved stories remain in this browser.</p>
    </div>
  );
}

function GatherPanel() {
  return (
    <div className="gather-panel">
      <div className="event-visual" aria-hidden="true">
        <span>THE ENIGMA SOCIETY / OPEN DISPATCH</span>
        <div className="event-path">
          <div className="event-path-step"><small>01</small><strong>idea</strong></div>
          <div className="event-path-branch"><span /><div className="event-path-mark"><img src={asset('compass.svg')} alt="" /><GitFork size={30} strokeWidth={1.25} /></div><span /></div>
          <div className="event-path-step"><small>02</small><strong>write</strong></div>
          <div className="event-path-step event-path-last"><small>03</small><strong>publish</strong></div>
        </div>
        <span>OPEN IDEAS → SHARED KNOWLEDGE</span>
      </div>
      <div className="event-details"><Label>COMMUNITY ANNOUNCEMENT</Label><h3>Tech<br /><em>Lekhan.</em></h3><p>An online tech blogging event where original ideas have a platform. Write on code, AI, startups, security, or anything in tech that matters to you.</p><details><summary>How it works <span>＋</span></summary><p>Write an original technology blog and follow the official submission rules. Selected work can be featured on the society’s Medium page with credit. Check the form and rules for current registration availability and dates.</p></details><div className="event-actions"><a className="button button-secondary" href={society.eventForm} target="_blank" rel="noopener noreferrer">View registration form <ArrowUpRight size={18} /></a><a className="text-action" href={society.eventRules} target="_blank" rel="noopener noreferrer">Read official rules <ArrowUpRight size={16} /></a></div></div>
    </div>
  );
}

function Explorer({ panel, onPanel }: { panel: Panel; onPanel: (panel: Panel) => void }) {
  const reduceMotion = useReducedMotion();
  const onKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % panels.length;
    else if (event.key === 'ArrowLeft') next = (index + panels.length - 1) % panels.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = panels.length - 1;
    else return;
    event.preventDefault();
    onPanel(panels[next].value);
    document.getElementById(`tab-${panels[next].value}`)?.focus();
  };
  return (
    <section id="explore" className="explorer-section" aria-labelledby="explorer-title">
      <div className="section-title"><div><Label>01 / THE COLLECTIVE</Label><h2 id="explorer-title">The work is<br /><em>better together.</em></h2></div><p>Learn openly. Make something useful.<br />Leave a door open for the next person.</p></div>
      <div className="explorer-tabs" role="tablist" aria-label="Explore the community">{panels.map((item, index) => <button id={`tab-${item.value}`} role="tab" aria-selected={panel === item.value} aria-controls={`panel-${item.value}`} tabIndex={panel === item.value ? 0 : -1} onClick={() => onPanel(item.value)} onKeyDown={(event) => onKey(event, index)} key={item.value}><span>{item.number}</span>{item.label}{panel === item.value && <motion.i layoutId="tab-indicator" transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 35 }} />}</button>)}</div>
      <div className="explorer-content"><AnimatePresence mode="wait" initial={false}><motion.div key={panel} id={`panel-${panel}`} role="tabpanel" aria-labelledby={`tab-${panel}`} tabIndex={0} initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -10 }} transition={{ duration: 0.24 }}>{panel === 'build' ? <BuildPanel /> : panel === 'learn' ? <LearnPanel /> : <GatherPanel />}</motion.div></AnimatePresence></div>
    </section>
  );
}

function PersonCard({ person }: { person: (typeof people)[number] }) {
  return <a className="person-card" href={person.linkedin} target="_blank" rel="noopener noreferrer"><div className="person-portrait">{person.portrait ? <img src={person.portrait} alt={person.name} loading="lazy" width="280" height="280" /> : <span aria-label="Portrait unavailable">AD</span>}</div><h4>{person.name}</h4><p>{person.role}</p></a>;
}

function About({ navigate }: { navigate: (target: string) => void }) {
  return (
    <section className="about-section" id="about" aria-labelledby="about-title"><div className="about-head"><div><Label>02 / THE PEOPLE</Label><h2 id="about-title">Curiosity is the<br /><em>only prerequisite.</em></h2></div><p>The Enigma Society is a community-first tech space at ABV-IIITM Gwalior. We grow through open discussions, peer learning, and building together across domains.</p></div>
      <div className="principle-grid"><SpotlightCard><span>01 / NO BIAS</span><h3>Your work speaks.</h3><p>What you make and share matters more than your background.</p><ArrowUpRight size={20} /></SpotlightCard><SpotlightCard><span>02 / TRANSPARENCY</span><h3>Build out loud.</h3><p>Open discussion and direct feedback shape our direction.</p><ArrowUpRight size={20} /></SpotlightCard><SpotlightCard><span>03 / NO PRESSURE</span><h3>Move with curiosity.</h3><p>Contribute at your own pace. You don’t need a title to help.</p><ArrowUpRight size={20} /></SpotlightCard></div>
      <div className="people-heading"><div><Label>THE FACES BEHIND THE CODE</Label><h3>Meet the collective.</h3></div></div>
      <div className="people-group faculty-group" aria-labelledby="faculty-title"><div className="people-group-heading"><span>01 / GUIDANCE</span><h4 id="faculty-title">Faculty coordinators</h4><p>The mentors supporting the society.</p></div><div className="people-grid faculty-grid">{faculty.map((person) => <PersonCard person={person} key={person.name} />)}</div></div>
      <div className="people-group students-group" aria-labelledby="students-title"><div className="people-group-heading"><span>02 / THE BUILDERS</span><h4 id="students-title">Student members</h4><p>The students making ideas happen.</p></div><div className="people-grid student-grid">{students.map((person) => <PersonCard person={person} key={person.name} />)}</div></div>
      <div className="join-band">
        <div className="join-intro">
          <Label>YOUR NEXT CHAPTER</Label>
          <h2>Small contributions.<br /><em>Shared progress.</em></h2>
          <p>There is no perfect first step. Pick something small and build alongside the community.</p>
        </div>
        <div className="join-path">
          <span className="join-path-label"><GitFork size={18} /> A WAY IN</span>
          <ol>
            <li><span>01</span>Explore the projects</li>
            <li><span>02</span>Read the contribution guide</li>
            <li><span>03</span>Make your first change</li>
          </ol>
          <div className="join-actions">
            <MagneticLink className="button join-primary" href="#build" onClick={(event) => { event.preventDefault(); navigate('build'); }}>Explore projects <ArrowUpRight size={18} /></MagneticLink>
            <a className="join-secondary" href={society.contributionGuide} target="_blank" rel="noopener noreferrer">Contribution guide <ArrowUpRight size={16} /></a>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactDialog() {
  const [copied, setCopied] = useState(false);
  return <Dialog.Root><Dialog.Trigger className="footer-contact">Get in touch <ArrowUpRight size={18} /></Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="dialog-overlay" /><Dialog.Content className="dialog-content"><Dialog.Close className="dialog-close" aria-label="Close"><X size={22} /></Dialog.Close><Label>THE DOOR IS OPEN</Label><Dialog.Title>Find your way in.</Dialog.Title><Dialog.Description>Explore the code, follow the community, or say hello. There’s no experience threshold.</Dialog.Description><a href={society.github} target="_blank" rel="noopener noreferrer"><Github size={20} /><span><b>Start with the code</b><small>Browse the society’s repositories.</small></span><ArrowUpRight size={17} /></a><a href={society.instagram} target="_blank" rel="noopener noreferrer"><Instagram size={20} /><span><b>Follow the community</b><small>See announcements and updates.</small></span><ArrowUpRight size={17} /></a><a href={`mailto:${society.email}?subject=Hello%20Enigma%20Society`}><Mail size={20} /><span><b>Say hello</b><small>Ask about joining or sharing an idea.</small></span><ArrowUpRight size={17} /></a><button className="copy-email" onClick={async () => { try { await navigator.clipboard.writeText(society.email); setCopied(true); } catch { setCopied(false); } }}><span>{society.email}</span>{copied ? <><Check size={15} /> Copied</> : 'Copy email'}</button></Dialog.Content></Dialog.Portal></Dialog.Root>;
}

function Footer() {
  return <footer className="site-footer">
    <div className="footer-top">
      <a className="footer-logo" href="#home" aria-label="The Enigma Society, back to top"><img className="footer-compass" src={asset('compass.svg')} alt="" width="50" height="50" /><img className="footer-wordmark" src={asset('enigma-wordmark.png')} alt="" width="150" height="62" /></a>
      <p>A place to learn openly and build together at ABV-IIITM Gwalior.</p>
      <div className="footer-cta"><Label>HAVE AN IDEA?</Label><ContactDialog /></div>
    </div>
    <div className="footer-main">
      <nav className="footer-directory" aria-label="Footer navigation">
        <div><Label>EXPLORE / 01</Label><a href={society.repository} target="_blank" rel="noopener noreferrer">Repository <ArrowUpRight size={16} /></a><a href={society.medium} target="_blank" rel="noopener noreferrer">Knowledge <ArrowUpRight size={16} /></a><a href={society.contributionGuide} target="_blank" rel="noopener noreferrer">Contribution guide <ArrowUpRight size={16} /></a></div>
        <div><Label>CONNECT / 02</Label><a href={society.github} target="_blank" rel="noopener noreferrer">GitHub <ArrowUpRight size={16} /></a><a href={society.instagram} target="_blank" rel="noopener noreferrer">Instagram <ArrowUpRight size={16} /></a><a href={society.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <ArrowUpRight size={16} /></a></div>
      </nav>
      <div className="footer-statement"><span>THE ENIGMA SOCIETY / OPEN SOURCE COLLECTIVE</span><h2>Open code.<br /><em>Open minds.</em></h2><div><GitFork size={17} /> A shared direction. A place to begin.</div></div>
    </div>
    <div className="footer-bottom"><span>© 2026 THE ENIGMA SOCIETY · ABV-IIITM GWALIOR</span><span><GitFork size={14} /> BUILT IN THE OPEN</span><a href="#home">BACK TO TOP ↑</a></div>
  </footer>;
}

export default function App() {
  const [panel, setPanel] = useState<Panel>('build');
  const [commandOpen, setCommandOpen] = useState(false);
  const navigate = (target: string) => {
    if (target === 'build' || target === 'learn' || target === 'gather') setPanel(target);
    history.pushState(null, '', `#${target}`);
    document.getElementById(target === 'home' || target === 'about' ? target : 'explore')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  useEffect(() => {
    const sync = () => {
      const target = location.hash.slice(1);
      if (target === 'build' || target === 'learn' || target === 'gather') {
        setPanel(target);
        requestAnimationFrame(() => document.getElementById('explore')?.scrollIntoView({ behavior: 'instant' }));
      } else if (target === 'about') requestAnimationFrame(() => document.getElementById('about')?.scrollIntoView({ behavior: 'instant' }));
    };
    sync();
    addEventListener('popstate', sync);
    addEventListener('hashchange', sync);
    return () => { removeEventListener('popstate', sync); removeEventListener('hashchange', sync); };
  }, []);
  useEffect(() => {
    const shortcut = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, []);
  const onPanel = (value: Panel) => { setPanel(value); history.replaceState(null, '', `#${value}`); };
  return <><a className="skip-link" href="#explore">Skip to content</a><Header navigate={navigate} onCommand={() => setCommandOpen(true)} /><main><Hero navigate={navigate} onCommand={() => setCommandOpen(true)} /><Explorer panel={panel} onPanel={onPanel} /><About navigate={navigate} /></main><Footer />{commandOpen && <CommandPalette onOpenChange={setCommandOpen} navigate={navigate} />}</>;
}
