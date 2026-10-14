'use client';

import type { KeyboardEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { SiteContent } from '@/lib/content/types';
import { BuildPanel } from './build-panel';
import { Eyebrow } from './eyebrow';
import { GatherPanel } from './gather-panel';
import { LearnPanel } from './learn-panel';
import { nextTabIndex, panels, type Panel } from './navigation';

type Props = { panel: Panel; onPanel: (panel: Panel) => void; content: SiteContent };

export function Explorer({ panel, onPanel, content }: Props) {
  const reduceMotion = useReducedMotion();
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = nextTabIndex(event.key, index, panels.length);
    if (next === null) return;
    event.preventDefault();
    onPanel(panels[next].value);
    document.getElementById(`tab-${panels[next].value}`)?.focus();
  };

  return (
    <section id="explore" className="explorer-section" aria-labelledby="explorer-title">
      <div className="section-title"><div><Eyebrow>02 / THE COLLECTIVE</Eyebrow><h2 id="explorer-title">The work is<br /><em>better together.</em></h2></div><p>Learn openly. Make something useful.<br />Leave a door open for the next person.</p></div>
      <div id="explore-tabs" className="explorer-tabs" role="tablist" aria-label="Explore the community">
        {panels.map((item, index) => (
          <button id={`tab-${item.value}`} role="tab" aria-selected={panel === item.value} aria-controls={`panel-${item.value}`} tabIndex={panel === item.value ? 0 : -1} onClick={() => onPanel(item.value)} onKeyDown={(event) => onKeyDown(event, index)} key={item.value}>
            <span>{item.number}</span>{item.label}
            {panel === item.value && <motion.i layoutId="tab-indicator" transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 35 }} />}
          </button>
        ))}
      </div>
      <div className="explorer-content">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={panel} id={`panel-${panel}`} role="tabpanel" aria-labelledby={`tab-${panel}`} tabIndex={0} initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -10 }} transition={{ duration: 0.24 }}>
            {panel === 'build' && <BuildPanel links={content.links} repositories={content.repositories} contributors={content.contributors} />}
            {panel === 'learn' && <LearnPanel stories={content.stories} videos={content.videos} mediumUrl={content.links.medium} />}
            {panel === 'gather' && <GatherPanel announcements={content.announcements} instagramPosts={content.instagramPosts} instagramUrl={content.links.instagram} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
