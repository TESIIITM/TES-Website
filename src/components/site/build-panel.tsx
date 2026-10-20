import type { CSSProperties } from 'react';
import { BookMarked, Scale } from 'lucide-react';
import type { ContributorsSection, Repository, SiteLinks } from '@/lib/content/types';
import { Contributors, Language, Projects, RepoStatsRow, repositoryUrl } from './github-sections';

type Props = { links: SiteLinks; repositories: Repository[]; contributors: ContributorsSection | null };

// The card's original copy, for a featured repository without its own.
const DEFAULT_HEADLINE = 'Make the web';
const DEFAULT_EMPHASIS = 'a little better.';

/** A feature branch leaving main and merging back, with commits travelling along it. */
function BranchArt() {
  return (
    <svg className="branch-art" viewBox="0 0 240 360" aria-hidden="true">
      <path className="branch-main" d="M70 0V360" />
      <path className="branch-feature" d="M70 70C70 110 170 100 170 140V220C170 260 70 250 70 290" />
      <path className="branch-flow" d="M70 70C70 110 170 100 170 140V220C170 260 70 250 70 290" />
      <circle className="branch-commit" cx="70" cy="40" r="7" style={{ '--n': 0 } as CSSProperties} />
      <circle className="branch-commit is-feature" cx="170" cy="150" r="7" style={{ '--n': 1 } as CSSProperties} />
      <circle className="branch-commit is-feature" cx="170" cy="210" r="7" style={{ '--n': 2 } as CSSProperties} />
      <circle className="branch-commit" cx="70" cy="180" r="7" style={{ '--n': 3 } as CSSProperties} />
      <circle className="branch-merge" cx="70" cy="290" r="11" />
      <path className="branch-merge-mark" d="m65 290.5 3.5 3.5 7-7.5" />
    </svg>
  );
}

export function BuildPanel({ links, repositories, contributors }: Props) {
  const featured = repositories.find((repository) => repository.isFeatured) ?? null;
  const projects = repositories.filter((repository) => repository !== featured);
  const [owner, name] = (featured?.fullName ?? 'TESIIITM/TES-Website').split('/');
  return (
    <div className="build-panel">
      <article className="repo-card">
        <div className="repo-card-main">
          <div className="repo-head">
            <BookMarked size={18} aria-hidden="true" />
            <a href={featured ? repositoryUrl(featured) : links.repository} target="_blank" rel="noopener noreferrer">{owner} / <strong>{name}</strong></a>
            <span className="repo-chip">Public</span>
            <span className="repo-chip is-featured">Featured</span>
          </div>
          <h3>{featured?.headline ?? DEFAULT_HEADLINE}<br /><em>{featured?.headlineEmphasis ?? DEFAULT_EMPHASIS}</em></h3>
          {featured?.description && <p>{featured.description}</p>}
          {(featured?.language || featured?.license) && (
            <div className="repo-meta">
              {featured.language && <Language name={featured.language} />}
              {featured.license && <span><Scale size={14} aria-hidden="true" /> {featured.license} license</span>}
            </div>
          )}
          {featured?.stats && <RepoStatsRow stats={featured.stats} />}
          <div className="repo-actions">
            <a className="pill-button pill-primary" href={featured ? repositoryUrl(featured) : links.repository} target="_blank" rel="noopener noreferrer">Explore repository</a>
            <a className="pill-button" href={links.contributionGuide} target="_blank" rel="noopener noreferrer">Contribution guide</a>
          </div>
        </div>
        <BranchArt />
      </article>
      {projects.length > 0 && <Projects repositories={projects} />}
      {contributors && contributors.people.length > 0 && <Contributors section={contributors} />}
    </div>
  );
}
