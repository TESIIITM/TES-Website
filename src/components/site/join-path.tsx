import { ArrowUpRight, BookOpen, GitCommitHorizontal, GitMerge, GitPullRequest } from 'lucide-react';
import type { SiteLinks } from '@/lib/content/types';
import type { Navigate } from './navigation';
import { NeedleIcon } from './needle-icon';
import { SectionHead } from './section-head';

type Props = { navigate: Navigate; links: SiteLinks };

/** Joining, told as a first pull request: opened, reviewed, committed, merged. */
const steps = [
  { kind: 'open', icon: GitPullRequest, title: 'Explore the projects', detail: 'Find a repository you would like to work on.' },
  { kind: 'review', icon: BookOpen, title: 'Read the contribution guide', detail: 'How we branch, review and merge.' },
  { kind: 'commit', icon: GitCommitHorizontal, title: 'Make your first change', detail: 'A typo, a bug fix or clearer docs all count.' },
  { kind: 'merge', icon: GitMerge, title: 'Apply to join the team', detail: 'Merged. Welcome to the society.' },
] as const;

export function JoinPath({ navigate, links }: Props) {
  return (
    <section className="join-section" id="join" aria-labelledby="join-title">
      <div className="join-band">
        <SectionHead
          id="join-title"
          branch="your-first-pr"
          title={<>Small contributions.<br /><em>Shared progress.</em></>}
          lede="There is no perfect first step. Pick something small and build alongside the community."
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
          <ol className="pr-timeline">
            {steps.map(({ kind, icon: Icon, title, detail }) => (
              <li key={kind} data-kind={kind}>
                <span className="pr-badge" aria-hidden="true"><Icon size={16} /></span>
                <div><strong>{title}</strong><span>{detail}</span></div>
              </li>
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
