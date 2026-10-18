/* The drawings on the JOIN TES form. All of it is decoration except the outline, which links to each section. */

import type { ReactNode } from 'react';

const SECTION_NAMES = ['Basic details', 'Understanding & contribution', 'Role preferences & commitment', 'Additional information'];

const COLS = 28;
const ROWS = 7;
/** A fixed shuffle, so squares light up scattered rather than in a line. */
const ORDER = Array.from({ length: COLS * ROWS }, (_, index) => index).sort((a, b) => ((a * 7919) % 211) - ((b * 7919) % 211));
const LEVEL = (index: number) => 1 + ((index * 2654435761) >>> 0) % 4;

/** A contribution graph that fills a square for every answered question. */
function Heatmap({ done, total }: { done: number; total: number }) {
  const lit = new Set(ORDER.slice(0, Math.round((done / total) * COLS * ROWS)));
  const size = 11;
  const gap = 3;
  return (
    <figure className="join-heatmap">
      <svg viewBox={`0 0 ${COLS * (size + gap)} ${ROWS * (size + gap)}`} aria-hidden="true">
        {Array.from({ length: COLS * ROWS }, (_, index) => (
          <rect key={index} x={Math.floor(index / ROWS) * (size + gap)} y={(index % ROWS) * (size + gap)} width={size} height={size} rx="2"
            data-level={lit.has(index) ? LEVEL(index) : 0} />
        ))}
      </svg>
      <figcaption>
        <span>{done} of {total} answered</span>
        <span className="join-heatmap-scale" aria-hidden="true">Less {[0, 1, 2, 3, 4].map((level) => <i key={level} data-level={level} />)} More</span>
      </figcaption>
    </figure>
  );
}

const octicon = (d: string) => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

const ABOUT = [
  { icon: octicon('M2 3.5h4.5A1.5 1.5 0 0 1 8 5v8a1.5 1.5 0 0 0-1.5-1.5H2zM14 3.5H9.5A1.5 1.5 0 0 0 8 5v8a1.5 1.5 0 0 1 1.5-1.5H14z'), text: 'Four short sections' },
  { icon: octicon('M8 2.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zM8 5v3l2 1.5'), text: 'About 15 minutes' },
  { icon: octicon('M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8zM8 6.2a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6z'), text: 'Read only by the review team' },
  { icon: octicon('M5 2.5v6.5M5 9a2 2 0 1 0 0 4a2 2 0 1 0 0-4M11 3a1.5 1.5 0 1 0 0 3a1.5 1.5 0 1 0 0-3M11 6c0 2.5-6 1.5-6 3'), text: 'No experience threshold' },
];
const TOPICS = ['open-source', 'web', 'app', 'ai-ml', 'design', 'mentoring', 'community'];

/** Kept in view beside the form: progress, an outline of the sections, and what to expect. */
export function JoinSidebar({ done, total, sections }: { done: number; total: number; sections: boolean[] }) {
  return (
    <div className="join-sidebar">
      <Heatmap done={done} total={total} />
      <nav className="join-outline" aria-label="Form outline">
        <h2>{octicon('M2.5 4h11M2.5 8h11M2.5 12h7')} Outline</h2>
        <ol>
          {SECTION_NAMES.map((name, index) => (
            <li key={name} data-done={sections[index] || undefined}>
              <a href={`#section-${index + 1}`}>
                <span className="join-outline-check" aria-hidden="true">
                  <svg viewBox="0 0 16 16" width="16" height="16"><circle cx="8" cy="8" r="6.5" /><path d="M5.2 8.2l1.9 1.9 3.7-3.9" /></svg>
                </span>
                {name}
                {sections[index] && <span className="sr-only"> (done)</span>}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <section className="join-about" aria-label="About this form">
        <h2>About</h2>
        <p>Applications to The Enigma Society at ABV-IIITM Gwalior. People read every one.</p>
        <ul>{ABOUT.map((row) => <li key={row.text}>{row.icon}{row.text}</li>)}</ul>
        <div className="join-topics" aria-hidden="true">{TOPICS.map((topic) => <span key={topic}>{topic}</span>)}</div>
      </section>
    </div>
  );
}

const drawing = (children: ReactNode) => (
  <svg className="join-section-art" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

/** One drawing per section: who you are, what you know, where you fit, anything else. */
const SECTION_ART = [
  drawing(<><rect x="6" y="14" width="52" height="36" rx="3" /><circle cx="20" cy="29" r="6" /><path d="M11 45c.6-5 4.3-8 9-8s8.4 3 9 8" /><path d="M35 25h16M35 32h12M35 39h14" /><path d="M27 14v-4h10v4" /></>),
  drawing(<><path d="M32 17c-6-4-15-4.5-24-2.5v35c9-2 18-1.5 24 2.5 6-4 15-4.5 24-2.5v-35c-9-2-18-1.5-24 2.5z" /><path d="M32 17v35" /><path d="M19 28l-4 4 4 4M45 28l4 4-4 4" /><path d="M23 39l3-14M41 25l-3 14" strokeDasharray="1.5 2.5" /></>),
  drawing(<><circle cx="32" cy="32" r="23" /><circle cx="32" cy="32" r="16" strokeDasharray="1.5 3" />{Array.from({ length: 16 }, (_, i) => <path key={i} d={`M32 ${i % 4 === 0 ? 6 : 8}v3`} transform={`rotate(${i * 22.5} 32 32)`} />)}<path d="M32 14l4.5 18L32 50l-4.5-18z" /><path d="M32 14l4.5 18h-9z" fill="currentColor" /><circle cx="32" cy="32" r="2" /></>),
  drawing(<path d="M43 19L23.5 38.5a5.5 5.5 0 0 0 7.8 7.8l20-20a9.5 9.5 0 0 0-13.4-13.4L16.6 34.2a13.5 13.5 0 0 0 19.1 19.1L52 37" />),
];

export function SectionHeading({ index, children }: { index: number; children: ReactNode }) {
  return (
    <legend>
      <span className="join-md" aria-hidden="true">##</span>
      {children}
      {SECTION_ART[index]}
    </legend>
  );
}

/** Long-term is one unbroken line; short-term is separate dots; a mix is both. */
export function CommitmentGlyph({ value }: { value: string }) {
  return (
    <svg className="join-commit-glyph" viewBox="0 0 120 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
      {value === 'long_term' && <><circle cx="6" cy="8" r="3" /><path d="M9 8h102" /><circle cx="114" cy="8" r="3" fill="currentColor" /></>}
      {value === 'short_term' && [6, 30, 54, 78, 102].map((x) => <circle key={x} cx={x + 6} cy="8" r="3" fill={x % 48 === 6 ? 'currentColor' : 'none'} />)}
      {value === 'mixed' && <><circle cx="6" cy="8" r="3" /><path d="M9 8h46" /><circle cx="58" cy="8" r="3" fill="currentColor" /><circle cx="82" cy="8" r="3" /><circle cx="104" cy="8" r="3" /></>}
    </svg>
  );
}

/** A signature over a dotted line, beside the confirmation. */
export function Signature() {
  return (
    <svg className="join-signature" viewBox="0 0 220 60" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" aria-hidden="true">
      <path d="M8 44c14-20 22-26 26-20s-10 22-4 22 16-30 24-30-6 30 2 30 14-18 20-18 2 14 8 14 10-8 16-8" />
      <path d="M8 54h204" strokeDasharray="2 4" />
    </svg>
  );
}
