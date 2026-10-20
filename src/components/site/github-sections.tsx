import Image from 'next/image';
import type { CSSProperties } from 'react';
import { ArrowUpRight, CircleDot, GitCommitHorizontal, GitFork, Star, Users } from 'lucide-react';
import { formatCount, formatStoryDate } from '@/lib/format';
import type { ContributorsSection, RepoStats, Repository } from '@/lib/content/types';
import { Orbit } from './orbit';
import { SectionHead } from './section-head';

export function repositoryUrl(repository: Repository) {
  return `https://github.com/${repository.fullName}`;
}

/** GitHub's colours for the languages the society writes in. */
const languageColors: Record<string, string> = {
  TypeScript: '#3178c6', JavaScript: '#f1e05a', Python: '#3572a5', Go: '#00add8', Rust: '#dea584',
  Java: '#b07219', 'C++': '#f34b7d', C: '#555555', HTML: '#e34c26', CSS: '#663399', Kotlin: '#a97bff',
  Dart: '#00b4ab', Shell: '#89e051', 'Jupyter Notebook': '#da5b0b',
};

export function Language({ name }: { name: string }) {
  return <span className="repo-language"><i style={{ '--lang': languageColors[name] ?? 'var(--muted)' } as CSSProperties} />{name}</span>;
}

/** Live numbers for the featured repository, as GitHub-style chips. */
export function RepoStatsRow({ stats }: { stats: RepoStats }) {
  const items = [
    { label: 'Stars', value: formatCount(stats.stars), icon: Star },
    { label: 'Forks', value: formatCount(stats.forks), icon: GitFork },
    { label: 'Open issues', value: formatCount(stats.openIssues), icon: CircleDot, tone: 'open' },
    { label: 'Contributors', value: formatCount(stats.contributors), icon: Users },
    { label: 'Last push', value: formatStoryDate(stats.pushedOn), icon: GitCommitHorizontal },
  ];
  return (
    <dl className="repo-stats">
      {items.map(({ label, value, icon: Icon, tone }) => (
        <div key={label} data-tone={tone}><dt><Icon size={14} aria-hidden="true" />{label}</dt><dd>{value}</dd></div>
      ))}
    </dl>
  );
}

/** The society's other repositories. */
export function Projects({ repositories }: { repositories: Repository[] }) {
  return (
    <div className="build-block">
      <SectionHead id="projects-title" level={3} title="Pick a repository. Open a pull request." lede="Live from GitHub, refreshed every hour." />
      <ul className="project-grid">
        {repositories.map((repository) => (
          <li key={repository.id}>
            <a className="project-card" href={repositoryUrl(repository)} target="_blank" rel="noopener noreferrer">
              <span className="project-name">{repository.fullName}</span>
              <h4>{repository.title} <ArrowUpRight size={16} /></h4>
              {repository.description && <p>{repository.description}</p>}
              <span className="project-meta">
                {repository.language && <Language name={repository.language} />}
                {repository.stats && <span><Star size={13} /> {formatCount(repository.stats.stars)}</span>}
                {repository.stats && <span><GitFork size={13} /> {formatCount(repository.stats.forks)}</span>}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Everyone who has contributed to the listed repositories. */
export function Contributors({ section }: { section: ContributorsSection }) {
  return (
    <div className="build-block">
      <SectionHead id="contributors-title" level={3} title={section.heading} lede={section.intro ?? undefined} />
      <ul className="contributor-grid">
        {section.people.map((person, index) => (
          <li key={person.login} style={{ '--i': index } as CSSProperties}>
            <a href={person.profileUrl} target="_blank" rel="noopener noreferrer">
              <span className="avatar-ring"><Orbit count={20} /><Image src={person.avatarUrl} alt="" width={72} height={72} sizes="72px" /></span>
              <strong>{person.login}</strong>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
