'use client';

import { useId, useState, type KeyboardEvent } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowDownRight, ArrowUpRight, Compass, Search, X } from 'lucide-react';
import { Github } from '@/components/brand-icons';
import { ordinal } from '@/lib/format';
import type { SiteLinks } from '@/lib/content/types';
import type { Navigate } from './navigation';

type Action = { label: string; detail: string; group: string; target: string; external?: boolean };

type Props = {
  onOpenChange: (open: boolean) => void;
  navigate: Navigate;
  links: SiteLinks;
  /** Title of the featured announcement, if one is published. */
  featuredEvent: string | null;
};

function buildActions(links: SiteLinks, featuredEvent: string | null): Action[] {
  return [
    { label: 'Explore open source', detail: 'Repositories, contributors, and the contribution guide', group: 'DISCOVER', target: 'build' },
    { label: 'Read the knowledge base', detail: 'Community stories and saved reading list', group: 'DISCOVER', target: 'learn' },
    featuredEvent
      ? { label: `See ${featuredEvent.replace(/\.$/, '')}`, detail: 'Current announcement and official links', group: 'DISCOVER', target: 'gather' }
      : { label: 'See events', detail: 'Announcements from the society', group: 'DISCOVER', target: 'gather' },
    { label: 'Meet the society', detail: 'Principles and the domains we work in', group: 'DISCOVER', target: 'about' },
    { label: 'Meet the people', detail: 'Faculty, students, and the next step', group: 'DISCOVER', target: 'people' },
    { label: 'Open GitHub', detail: 'TESIIITM on GitHub', group: 'ELSEWHERE', target: links.github, external: true },
    { label: 'Read on Medium', detail: 'The society publication', group: 'ELSEWHERE', target: links.medium, external: true },
  ];
}

export function CommandPalette({ onOpenChange, navigate, links, featuredEvent }: Props) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputId = useId();
  const needle = query.trim().toLowerCase();
  const results = buildActions(links, featuredEvent).filter((action) => `${action.label} ${action.detail} ${action.target} ${action.group}`.toLowerCase().includes(needle));

  const run = (action: Action) => {
    onOpenChange(false);
    if (action.external) window.open(action.target, '_blank', 'noopener,noreferrer');
    else navigate(action.target);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const count = Math.max(results.length, 1);
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive((index) => (index + 1) % count); }
    if (event.key === 'ArrowUp') { event.preventDefault(); setActive((index) => (index + count - 1) % count); }
    if (event.key === 'Enter' && results[active]) { event.preventDefault(); run(results[active]); }
  };

  return (
    <Dialog.Root open onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="command-overlay" />
        <Dialog.Content className="command-panel" aria-describedby="command-description">
          <div className="command-top"><span><Compass size={15} /> THE ENIGMA SOCIETY / QUICK NAVIGATION</span><Dialog.Close aria-label="Close command menu"><X size={18} /></Dialog.Close></div>
          <Dialog.Title className="sr-only">Explore the society</Dialog.Title>
          <Dialog.Description id="command-description" className="sr-only">Search and select a page or community destination.</Dialog.Description>
          <label className="command-search" htmlFor={inputId}>
            <Search size={22} />
            <input id={inputId} autoFocus aria-label="Search community destinations" type="search" value={query} onChange={(event) => { setQuery(event.target.value); setActive(0); }} onKeyDown={onKeyDown} placeholder="Where would you like to go?" aria-controls="command-results" aria-activedescendant={results[active] ? `command-result-${active}` : undefined} role="combobox" aria-expanded="true" aria-autocomplete="list" />
            <kbd>ESC</kbd>
          </label>
          <div id="command-results" className="command-results" role="listbox" aria-label="Navigation results">
            {results.length ? results.map((action, index) => (
              <button type="button" id={`command-result-${index}`} key={action.label} role="option" aria-selected={active === index} onPointerMove={() => setActive(index)} onClick={() => run(action)}>
                <span className="command-index">{ordinal(index + 1)}</span>
                <span className="command-result-copy"><strong>{action.label}</strong><small>{action.detail}</small></span>
                {action.external ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
              </button>
            )) : <p className="command-empty">No route found. Try “build”, “learn”, or “people”.</p>}
          </div>
          <div className="command-foot"><span><kbd>↑</kbd><kbd>↓</kbd> TO NAVIGATE <kbd>↵</kbd> TO OPEN</span><a href={links.github} target="_blank" rel="noopener noreferrer"><Github size={15} /> OPEN SOURCE</a></div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
