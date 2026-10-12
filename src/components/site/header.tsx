'use client';

import { useState, type MouseEvent } from 'react';
import Image from 'next/image';
import { ArrowUpRight, Command, Menu, Moon, Sun, X } from 'lucide-react';
import { Github } from '@/components/brand-icons';
import { useBrowserStore } from '@/lib/browser-store';
import { themeStore } from '@/lib/theme-store';
import type { Navigate } from './navigation';

const links = [
  { target: 'about', label: 'The society' },
  { target: 'build', label: 'Projects' },
  { target: 'learn', label: 'Knowledge' },
  { target: 'gather', label: 'Events' },
];

type Props = { navigate: Navigate; onCommand: () => void; githubUrl: string };

export function Header({ navigate, onCommand, githubUrl }: Props) {
  const [open, setOpen] = useState(false);
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
          <a key={link.target} href={`#${link.target}`} onClick={(event) => go(event, link.target)}>{link.label}</a>
        ))}
      </nav>
      <div className="header-tools">
        <button className="command-trigger" onClick={onCommand} aria-label="Open command menu"><Command size={15} /><span>Jump to</span><kbd>⌘ K</kbd></button>
        <button className="theme-button" aria-label={`Switch to ${nextTheme} theme`} onClick={() => themeStore.set(nextTheme)}>
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <a className="header-github" href={githubUrl} target="_blank" rel="noopener noreferrer"><Github size={17} /><span>GitHub</span><ArrowUpRight size={16} /></a>
        <button className="menu-button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen(!open)}>
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
    </header>
  );
}
