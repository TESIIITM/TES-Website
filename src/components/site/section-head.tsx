import type { ReactNode } from 'react';

type Props = { id: string; title: ReactNode; lede?: ReactNode; level?: 2 | 3; className?: string };

/**
 * A section's heading: a title that is written in as it scrolls into view,
 * with an optional line beneath it.
 */
export function SectionHead({ id, title, lede, level = 2, className = '' }: Props) {
  const Heading = level === 2 ? 'h2' : 'h3';
  return (
    <div className={`section-head ${className}`}>
      <div>
        <Heading id={id} className="ink-in"><span className="ink-line">{title}</span></Heading>
      </div>
      {lede && <p className="section-lede">{lede}</p>}
    </div>
  );
}
