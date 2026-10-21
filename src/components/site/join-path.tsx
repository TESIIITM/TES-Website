import { ArrowUpRight, GitMerge, GitPullRequest } from 'lucide-react';
import type { SiteLinks } from '@/lib/content/types';
import type { Navigate } from './navigation';
import { NeedleIcon } from './needle-icon';
import { SectionHead } from './section-head';

type Props = { navigate: Navigate; links: SiteLinks };

/** Joining, told as the steps of a first pull request. */
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
        <div className="pr-card">
          <div className="pr-card-head">
            <span className="pr-state" aria-hidden="true">
              <span className="pr-state-open"><GitPullRequest size={15} /> Open</span>
              <span className="pr-state-merged"><GitMerge size={15} /> Merged</span>
            </span>
            <strong>Your first contribution</strong>
            <span className="pr-number">#1</span>
          </div>
          <ol className="pr-steps">
            {steps.map(({ title, detail }) => (
              <li key={title}><strong>{title}</strong><span>{detail}</span></li>
            ))}
          </ol>
          <div className="join-actions">
            <a className="pill-button pill-primary" href="/join">Join TES<span className="join-knob" aria-hidden="true"><NeedleIcon /></span></a>
            <a className="pill-button" href="#build" onClick={(event) => { event.preventDefault(); navigate('build'); }}>Explore projects</a>
            <a className="inline-link" href={links.contributionGuide} target="_blank" rel="noopener noreferrer">Contribution guide <ArrowUpRight size={15} /></a>
          </div>
        </div>
      </div>
    </section>
  );
}
