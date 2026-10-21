'use client';

import { useState, type CSSProperties } from 'react';

/** The society's principles, each on its own bearing of a small compass, like Build, Learn and Gather in the hero. */
const principles = [
  { name: 'No bias', line: 'Your work speaks.', detail: 'What you make and share matters more than your background.', bearing: -50 },
  { name: 'Transparency', line: 'Build out loud.', detail: 'Open discussion and direct feedback shape our direction.', bearing: 0 },
  { name: 'No pressure', line: 'Move with curiosity.', detail: 'Contribute at your own pace. You don’t need a title to help.', bearing: 50 },
];

const TICKS = Array.from({ length: 72 }, (_, i) => i * 5);

/** A point on a circle of radius r around (120, 120), with 0 degrees at the top. */
function polar(bearing: number, r: number) {
  const angle = ((bearing - 90) * Math.PI) / 180;
  return { x: 120 + r * Math.cos(angle), y: 120 + r * Math.sin(angle) };
}

export function Principles() {
  const [active, setActive] = useState(1);
  return (
    <div className="bearings">
      {/* Decorative: the list carries the content. The needle follows the principle under the pointer. */}
      <svg className="bearings-dial" viewBox="0 0 240 240" aria-hidden="true" style={{ '--bearing': `${principles[active].bearing}deg` } as CSSProperties}>
        <circle className="bearings-ring" cx="120" cy="120" r="112" />
        <circle className="bearings-ring is-inner" cx="120" cy="120" r="78" />
        {TICKS.map((tick) => {
          const outer = polar(tick, 112);
          const inner = polar(tick, tick % 45 === 0 ? 98 : 105);
          return <line key={tick} className="bearings-tick" x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y} />;
        })}
        {principles.map((principle, index) => {
          const mark = polar(principle.bearing, 112);
          return <circle key={principle.name} className="bearings-mark" data-active={index === active || undefined} cx={mark.x} cy={mark.y} r="6" />;
        })}
        <g className="bearings-needle">
          <path className="bearings-north" d="M120 46 127 120h-14Z" />
          <path className="bearings-south" d="M120 194 126 120h-12Z" />
        </g>
        <circle className="bearings-pin" cx="120" cy="120" r="7" />
      </svg>
      <h3 className="sr-only">How we work</h3>
      <ul className="bearings-list">
        {principles.map((principle, index) => (
          <li key={principle.name} data-active={index === active || undefined} onPointerEnter={() => setActive(index)}>
            <span className="bearings-name">{principle.name}</span>
            <strong>{principle.line}</strong>
            <p>{principle.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
