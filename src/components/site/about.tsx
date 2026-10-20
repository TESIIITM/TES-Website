import type { Domain } from '@/lib/content/types';
import { Domains } from './domains';
import { SectionHead } from './section-head';

/** The society's principles, written as the checks every contribution passes. */
const principles = [
  { label: 'No bias', title: 'Your work speaks.', detail: 'What you make and share matters more than your background.' },
  { label: 'Transparency', title: 'Build out loud.', detail: 'Open discussion and direct feedback shape our direction.' },
  { label: 'No pressure', title: 'Move with curiosity.', detail: 'Contribute at your own pace. You don’t need a title to help.' },
];

export function About({ domains }: { domains: Domain[] }) {
  return (
    <section className="about-section" id="about" aria-labelledby="about-title">
      <SectionHead
        id="about-title"
        title={<>Curiosity is the<br /><em>only prerequisite.</em></>}
        lede="The Enigma Society is a community-first tech space at ABV-IIITM Gwalior. We grow through open discussions, peer learning, and building together across domains."
      />
      <div className="checks-card">
        <div className="checks-head">
          <span className="checks-ring" aria-hidden="true"><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" /></svg></span>
          <strong>How we work</strong>
          <span>{principles.length} principles, all passing</span>
        </div>
        <ul className="checks-list">
          {principles.map((principle) => (
            <li key={principle.label}>
              <svg className="check-mark" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.5" /><path d="m6 10.3 2.7 2.7L14.2 7.5" /></svg>
              <div><h3>{principle.title}</h3><p>{principle.detail}</p></div>
              <span className="check-label">{principle.label}</span>
            </li>
          ))}
        </ul>
      </div>
      {domains.length > 0 && <Domains domains={domains} />}
    </section>
  );
}
