import type { ReactNode } from 'react';
import { GitBranch } from 'lucide-react';

type Props = { id: string; branch: string; title: ReactNode; lede?: ReactNode; level?: 2 | 3; className?: string };

/**
 * A section's heading: a branch chip naming the section, then a title that
 * comes in like an added line in a diff.
 */
export function SectionHead({ id, branch, title, lede, level = 2, className = '' }: Props) {
  const Heading = level === 2 ? 'h2' : 'h3';
  return (
    <div className={`section-head ${className}`}>
      <div>
        <span className="branch-chip"><GitBranch size={13} aria-hidden="true" />{branch}</span>
        <Heading id={id} className="diff-in">{title}</Heading>
      </div>
      {lede && <p className="section-lede">{lede}</p>}
    </div>
  );
}
