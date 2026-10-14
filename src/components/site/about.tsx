'use client';

import type { Domain } from '@/lib/content/types';
import { Domains } from './domains';
import { Eyebrow } from './eyebrow';
import { SpotlightCard } from './spotlight-card';

const principles = [
  { label: '01 / NO BIAS', title: 'Your work speaks.', detail: 'What you make and share matters more than your background.' },
  { label: '02 / TRANSPARENCY', title: 'Build out loud.', detail: 'Open discussion and direct feedback shape our direction.' },
  { label: '03 / NO PRESSURE', title: 'Move with curiosity.', detail: 'Contribute at your own pace. You don’t need a title to help.' },
];

export function About({ domains }: { domains: Domain[] }) {
  return (
    <section className="about-section" id="about" aria-labelledby="about-title">
      <div className="about-head"><div><Eyebrow>01 / THE SOCIETY</Eyebrow><h2 id="about-title">Curiosity is the<br /><em>only prerequisite.</em></h2></div><p>The Enigma Society is a community-first tech space at ABV-IIITM Gwalior. We grow through open discussions, peer learning, and building together across domains.</p></div>
      <div className="principle-grid">
        {principles.map((principle) => (
          <SpotlightCard key={principle.label}><span>{principle.label}</span><h3>{principle.title}</h3><p>{principle.detail}</p></SpotlightCard>
        ))}
      </div>
      {domains.length > 0 && <Domains domains={domains} />}
    </section>
  );
}
