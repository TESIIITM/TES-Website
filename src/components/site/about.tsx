import type { Domain } from '@/lib/content/types';
import { Domains } from './domains';
import { Principles } from './principles';
import { SectionHead } from './section-head';

export function About({ domains }: { domains: Domain[] }) {
  return (
    <section className="about-section" id="about" aria-labelledby="about-title">
      <SectionHead
        id="about-title"
        title="About TES"
        lede="The Enigma Society is a community-first tech space at ABV-IIITM Gwalior. We grow through open discussions, peer learning, and building together across domains."
      />
      <Principles />
      {domains.length > 0 && <Domains domains={domains} />}
    </section>
  );
}
