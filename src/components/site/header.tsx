'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import Image from 'next/image';
import { ArrowUpRight, Menu, Moon, Search, Sun, X } from 'lucide-react';
import { Github } from '@/components/brand-icons';
import { useBrowserStore } from '@/lib/browser-store';
import { themeStore } from '@/lib/theme-store';
import type { Navigate, Panel } from './navigation';

const links = [
  { target: 'about', label: 'The society' },
  { target: 'build', label: 'Projects' },
  { target: 'learn', label: 'Knowledge' },
  { target: 'gather', label: 'Events' },
  { target: 'people', label: 'People' },
];

/** Sections that light up a link while they cross the middle of the screen. */
const watched = ['home', 'about', 'explore', 'news', 'people'];

type Props = { navigate: Navigate; onCommand: () => void; githubUrl: string; panel: Panel };

export function Header({ navigate, onCommand, githubUrl, panel }: Props) {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<string | null>(null);
  const current = section === 'explore' ? panel : section;

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const crossing = entries.find((entry) => entry.isIntersecting);
      if (crossing) setSection(crossing.target.id);
    }, { rootMargin: '-45% 0px -50% 0px' });
    for (const id of watched) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, []);

  const theme = useBrowserStore(themeStore);
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  const go = (event: MouseEvent, target: string) => {
    event.preventDefault();
    setOpen(false);
    navigate(target);
  };

  return (
    <header className="site-header">
      <a className="brand" href="#home" onClick={(event) => go(event, 'home')} aria-label="The Enigma Society, home">
        <Image className="brand-compass" src="/assets/compass.svg" width={43} height={43} alt="" loading="eager" />
        <Image className="brand-wordmark" src="/assets/enigma-wordmark.png" width={116} height={49} alt="" loading="eager" />
      </a>
      <nav className={`main-nav ${open ? 'is-open' : ''}`} id="main-nav" aria-label="Main navigation">
        {links.map((link) => (
          <a key={link.target} href={`#${link.target}`} onClick={(event) => go(event, link.target)} aria-current={current === link.target ? 'true' : undefined}>{link.label}</a>
        ))}
      </nav>
      <div className="header-tools">
        <button className="command-trigger" onClick={onCommand} aria-label="Open command menu" title="Search the site (Ctrl K)"><Search size={17} /></button>
        <button className="theme-button" aria-label={`Switch to ${nextTheme} theme`} onClick={() => themeStore.set(nextTheme)}>
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <a className="header-join" href="/join">Join TES</a>
        <a className="header-github" href={githubUrl} target="_blank" rel="noopener noreferrer"><Github size={17} /><span>GitHub</span><ArrowUpRight size={16} /></a>
        <button className="menu-button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen(!open)}>
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
    </header>
  );
}
