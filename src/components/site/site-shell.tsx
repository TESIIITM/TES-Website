'use client';

import { useEffect, useState } from 'react';
import { announcementTitle } from '@/lib/format';
import type { SiteContent } from '@/lib/content/types';
import { About } from './about';
import { CommandPalette } from './command-palette';
import { restoreErasedHash, takeHashBeforeHydration } from './erased-hash';
import { Explorer } from './explorer';
import { Footer } from './footer';
import { Header } from './header';
import { Hero } from './hero';
import { isPanel, type Navigate, type Panel } from './navigation';

function scrollBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
}

/** The single-page site. Sections are addressed by URL hash so Back and Forward work. */
export function SiteShell({ content }: { content: SiteContent }) {
  const [panel, setPanel] = useState<Panel>('build');
  const [commandOpen, setCommandOpen] = useState(false);

  const navigate: Navigate = (target, scroll = true) => {
    if (isPanel(target)) setPanel(target);
    if (window.location.hash !== `#${target}`) window.history.pushState(null, '', `#${target}`);
    if (!scroll) return;
    const section = target === 'home' || target === 'about' ? target : 'explore';
    document.getElementById(section)?.scrollIntoView({ behavior: scrollBehavior() });
  };

  useEffect(() => {
    let frame = 0;
    const sync = (hash: string) => {
      const target = hash.slice(1);
      let section: string | undefined;
      if (isPanel(target)) {
        setPanel(target);
        section = 'explore';
      } else if (target === '' || target === 'home') {
        setPanel('build');
        section = 'home';
      } else if (target === 'about' || target === 'explore') {
        section = target;
      }
      cancelAnimationFrame(frame);
      if (section) frame = requestAnimationFrame(() => document.getElementById(section)?.scrollIntoView({ behavior: 'instant' }));
    };
    const onPopState = () => sync(window.location.hash);
    const onHashChange = (event: HashChangeEvent) => sync(restoreErasedHash(new URL(event.newURL).hash));
    sync(restoreErasedHash(takeHashBeforeHydration()));
    window.addEventListener('popstate', onPopState);
    window.addEventListener('hashchange', onHashChange);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onShortcut);
    return () => window.removeEventListener('keydown', onShortcut);
  }, []);

  const openCommand = () => setCommandOpen(true);
  const featured = content.announcements[0];

  return (
    <>
      <a className="skip-link" href="#explore">Skip to content</a>
      <Header navigate={navigate} onCommand={openCommand} githubUrl={content.links.github} />
      <main>
        <Hero navigate={navigate} onCommand={openCommand} />
        <Explorer panel={panel} onPanel={(value) => navigate(value, false)} content={content} />
        <About navigate={navigate} members={content.members} links={content.links} />
      </main>
      <Footer links={content.links} />
      {commandOpen && <CommandPalette onOpenChange={setCommandOpen} navigate={navigate} links={content.links} featuredEvent={featured ? announcementTitle(featured) : null} />}
    </>
  );
}
