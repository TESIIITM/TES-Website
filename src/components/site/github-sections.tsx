import Image from 'next/image';
import { ArrowUpRight, GitFork, Star } from 'lucide-react';
import { formatCount, formatStoryDate } from '@/lib/format';
import type { ContributorsSection, RepoStats, Repository } from '@/lib/content/types';
import { Eyebrow } from './eyebrow';

export function repositoryUrl(repository: Repository) {
  return `https://github.com/${repository.fullName}`;
}

/** Live numbers under the featured repository's tags. */
export function RepoStatsRow({ stats }: { stats: RepoStats }) {
  const items = [
    ['Stars', formatCount(stats.stars)],
    ['Forks', formatCount(stats.forks)],
    ['Open issues', formatCount(stats.openIssues)],
    ['Contributors', formatCount(stats.contributors)],
    ['Last push', formatStoryDate(stats.pushedOn)],
  ];
  return (
    <dl className="repo-stats">
      {items.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
    </dl>
  );
}

/** The society's other repositories. */
export function Projects({ repositories }: { repositories: Repository[] }) {
  return (
    <>
      <div className="domains-top"><div><Eyebrow>MORE PROJECTS</Eyebrow><h3>Pick a repository. Open a pull request.</h3></div><p>Live from GitHub, refreshed every hour.</p></div>
      <ul className="project-grid">
        {repositories.map((repository) => (
          <li key={repository.id}>
            <a className="project-card" href={repositoryUrl(repository)} target="_blank" rel="noopener noreferrer">
              <span className="project-name">{repository.fullName}</span>
              <h4>{repository.title} <ArrowUpRight size={16} /></h4>
              {repository.description && <p>{repository.description}</p>}
              <span className="project-meta">
                {repository.language && <span>{repository.language}</span>}
                {repository.stats && <span><Star size={12} /> {formatCount(repository.stats.stars)}</span>}
                {repository.stats && <span><GitFork size={12} /> {formatCount(repository.stats.forks)}</span>}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}

/** Everyone who has contributed to the listed repositories. */
export function Contributors({ section }: { section: ContributorsSection }) {
  return (
    <>
      <div className="domains-top"><div><Eyebrow>CONTRIBUTORS</Eyebrow><h3>{section.heading}</h3></div>{section.intro && <p>{section.intro}</p>}</div>
      <ul className="contributor-grid">
        {section.people.map((person) => (
          <li key={person.login}>
            <a href={person.profileUrl} target="_blank" rel="noopener noreferrer">
              <Image src={person.avatarUrl} alt="" width={72} height={72} sizes="72px" />
              <strong>{person.login}</strong>
              <span>{person.contributions} {person.contributions === 1 ? 'commit' : 'commits'}</span>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
