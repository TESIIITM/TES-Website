import type { CSSProperties } from 'react';

/** Contribution levels for the cells, so the lit ring reads like a real graph rather than a solid band. */
const pattern = [3, 1, 4, 2, 0, 3, 4, 1, 2, 4, 3, 0, 2, 4, 1, 3, 2, 4, 0, 3, 1, 4, 2, 3, 4, 0, 2, 1, 4, 3, 2, 0, 4, 1, 3, 2];

/**
 * A ring of contribution-graph cells around a portrait. Faint at rest; on hover
 * the cells light up clockwise, one after another.
 */
export function Orbit({ count }: { count: number }) {
  return (
    <span className="orbit" style={{ '--count': count } as CSSProperties} aria-hidden="true">
      {Array.from({ length: count }, (_, k) => (
        <i key={k} data-level={pattern[k % pattern.length] || 1} style={{ '--k': k } as CSSProperties} />
      ))}
    </span>
  );
}
