'use client';

import { useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, Code2, Compass, GitFork } from 'lucide-react';
import { ordinal } from '@/lib/format';
import type { Domain, SiteLinks } from '@/lib/content/types';
import { Eyebrow } from './eyebrow';
import { nextTabIndex } from './navigation';
import { SpotlightCard } from './spotlight-card';

type Props = { domains: Domain[]; links: SiteLinks };

export function BuildPanel({ domains, links }: Props) {
  return (
    <div className="build-panel">
      <div className="feature-grid">
        <SpotlightCard className="feature-card">
          <div className="feature-heading"><Eyebrow>FEATURED / OPEN REPOSITORY</Eyebrow><span className="source-insignia"><GitFork size={17} strokeWidth={1.5} /> TES / OPEN SOURCE</span></div>
          <h3>Make the web<br /><em>a little better.</em></h3>
          <p>Our society website is open for exploration. Read the source, improve an interaction, fix a bug, or make the docs clearer. Start with one useful change.</p>
          <div className="feature-tags"><span>TES-Website</span><span>TypeScript</span><span>MIT</span></div>
          <div className="feature-links"><a href={links.repository} target="_blank" rel="noopener noreferrer">Explore repository <ArrowUpRight size={17} /></a><a href={links.contributionGuide} target="_blank" rel="noopener noreferrer">Contribution guide <ArrowUpRight size={17} /></a></div>
        </SpotlightCard>
        <SpotlightCard className="terminal-card">
          <div className="terminal-bar"><div className="traffic"><i /><i /><i /></div><span>community.md</span><Code2 size={16} /></div>
          <div className="terminal-body" role="img" aria-label="A shared direction: learn alone becomes build together">
            <p><span>01</span><b># a shared direction</b></p><p><span>02</span></p><p><span>03</span><del>− learn alone</del></p><p><span>04</span><ins>+ build together</ins></p><p><span>05</span></p><p><span>06</span><b>{'// every contribution counts'}</b></p>
          </div>
          <div className="terminal-status"><span className="live-dot" /> ready to collaborate <span>main ◆</span></div>
        </SpotlightCard>
      </div>
      {domains.length > 0 && <Domains domains={domains} githubUrl={links.github} />}
    </div>
  );
}

function Domains({ domains, githubUrl }: { domains: Domain[]; githubUrl: string }) {
  const [selected, setSelected] = useState(0);
  // Content can shrink between renders; never point past the end.
  const index = Math.min(selected, domains.length - 1);
  const current = domains[index];
  const code = ordinal(index + 1);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, from: number) => {
    const next = nextTabIndex(event.key, from, domains.length, { vertical: true });
    if (next === null) return;
    event.preventDefault();
    setSelected(next);
    document.getElementById(`domain-${next}`)?.focus();
  };

  return (
    <>
      <div className="domains-top"><div><Eyebrow>EXPLORE THE STACK</Eyebrow><h3>Many directions. One community.</h3></div><p>Pick a path. Your first contribution can be small.</p></div>
      <div className="domain-layout">
        <div className="domain-tabs" role="tablist" aria-label="Technical domains">
          {domains.map((domain, i) => (
            <button id={`domain-${i}`} key={domain.id} role="tab" aria-selected={index === i} aria-controls="domain-preview" tabIndex={index === i ? 0 : -1} onClick={() => setSelected(i)} onKeyDown={(event) => onKeyDown(event, i)}>
              <span>{ordinal(i + 1)}</span>{domain.title}<ArrowUpRight size={16} />
            </button>
          ))}
        </div>
        <div className="domain-preview" id="domain-preview" role="tabpanel" aria-labelledby={`domain-${index}`} tabIndex={0}>
          <AnimatePresence mode="wait">
            <motion.div key={current.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
              <Compass size={26} strokeWidth={1.3} /><span className="preview-index">FIELD NOTE / {code}</span><h4>{current.title}</h4><p>{current.detail}</p><a href={githubUrl} target="_blank" rel="noopener noreferrer">Explore the collective <ArrowUpRight size={16} /></a>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
