import { ArrowUpRight } from 'lucide-react';
import type { SiteLinks } from '@/lib/content/types';
import type { Navigate } from './navigation';
import { NeedleIcon } from './needle-icon';
import { SectionHead } from './section-head';

type Props = { navigate: Navigate; links: SiteLinks };

/** Joining, plotted as a route: three waypoints, then the compass at the end. */
const steps = [
  { title: 'Explore the projects', detail: 'Find a repository you would like to work on.' },
  { title: 'Read the contribution guide', detail: 'How we branch, review and merge.' },
  { title: 'Make your first change', detail: 'A typo, a bug fix or clearer docs all count.' },
  { title: 'Apply to join the team', detail: 'Fill in the JOIN TES form while applications are open.' },
] as const;

export function JoinPath({ navigate, links }: Props) {
  return (
    <section className="join-section" id="join" aria-labelledby="join-title">
      <div className="join-band">
        <SectionHead
          id="join-title"
          title="Get involved"
          lede="Anyone can contribute to the projects. Joining the team is a separate application."
        />
        <ol className="join-route">
          {steps.map(({ title, detail }, index) => {
            const last = index === steps.length - 1;
            return (
              <li key={title} data-last={last || undefined}>
                <span className="route-mark" aria-hidden="true">{last ? <NeedleIcon size={18} /> : index + 1}</span>
                <strong>{title}</strong>
                <span className="route-detail">{detail}</span>
                {last && (
                  <div className="join-actions">
                    <a className="pill-button pill-primary" href="/join">Join TES<span className="join-knob" aria-hidden="true"><NeedleIcon /></span></a>
                    <a className="pill-button" href="#build" onClick={(event) => { event.preventDefault(); navigate('build'); }}>Explore projects</a>
                    <a className="inline-link" href={links.contributionGuide} target="_blank" rel="noopener noreferrer">Contribution guide <ArrowUpRight size={15} /></a>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
