'use client';

import { ArrowUpRight, Code2, GitFork } from 'lucide-react';
import type { ContributorsSection, Repository, SiteLinks } from '@/lib/content/types';
import { Eyebrow } from './eyebrow';
import { Contributors, Projects, RepoStatsRow, repositoryUrl } from './github-sections';
import { SpotlightCard } from './spotlight-card';

type Props = { links: SiteLinks; repositories: Repository[]; contributors: ContributorsSection | null };

// The card's original copy, for a featured repository without its own.
const DEFAULT_HEADLINE = 'Make the web';
const DEFAULT_EMPHASIS = 'a little better.';

export function BuildPanel({ links, repositories, contributors }: Props) {
  const featured = repositories.find((repository) => repository.isFeatured) ?? null;
  const projects = repositories.filter((repository) => repository !== featured);
  const tags = featured ? [featured.title, featured.language, featured.license].filter(Boolean) : [];
  return (
    <div className="build-panel">
      <div className="feature-grid">
        <SpotlightCard className="feature-card">
          <div className="feature-heading"><Eyebrow>FEATURED / OPEN REPOSITORY</Eyebrow><span className="source-insignia"><GitFork size={17} strokeWidth={1.5} /> TES / OPEN SOURCE</span></div>
          <h3>{featured?.headline ?? DEFAULT_HEADLINE}<br /><em>{featured?.headlineEmphasis ?? DEFAULT_EMPHASIS}</em></h3>
          {featured?.description && <p>{featured.description}</p>}
          {tags.length > 0 && <div className="feature-tags">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}
          {featured?.stats && <RepoStatsRow stats={featured.stats} />}
          <div className="feature-links"><a href={featured ? repositoryUrl(featured) : links.repository} target="_blank" rel="noopener noreferrer">Explore repository <ArrowUpRight size={17} /></a><a href={links.contributionGuide} target="_blank" rel="noopener noreferrer">Contribution guide <ArrowUpRight size={17} /></a></div>
        </SpotlightCard>
        <SpotlightCard className="terminal-card">
          <div className="terminal-bar"><div className="traffic"><i /><i /><i /></div><span>community.md</span><Code2 size={16} /></div>
          <div className="terminal-body" role="img" aria-label="A shared direction: learn alone becomes build together">
            <p><span>01</span><b># a shared direction</b></p><p><span>02</span></p><p><span>03</span><del>− learn alone</del></p><p><span>04</span><ins>+ build together</ins></p><p><span>05</span></p><p><span>06</span><b>{'// every contribution counts'}</b></p>
          </div>
          <div className="terminal-status"><span className="live-dot" /> ready to collaborate <span>main ◆</span></div>
        </SpotlightCard>
      </div>
      {projects.length > 0 && <Projects repositories={projects} />}
      {contributors && contributors.people.length > 0 && <Contributors section={contributors} />}
    </div>
  );
}
