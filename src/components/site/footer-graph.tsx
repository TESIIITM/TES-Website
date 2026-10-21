'use client';

import { useRef, type CSSProperties, type PointerEvent } from 'react';

const WEEKS = 40;
const DAYS = 7;

/** A steady base level for each cell, so the graph looks lived in before anyone touches it. */
const base = Array.from({ length: WEEKS * DAYS }, (_, cell) => {
  const value = Math.sin(cell * 12.9898) * 43758.5453;
  const r = value - Math.floor(value);
  return r > 0.86 ? 2 : r > 0.62 ? 1 : 0;
});

/**
 * A contribution graph behind the footer's sign-off. A slow wave lights it up
 * on its own; moving the pointer over it raises the cells nearby, as if you
 * were committing as you go.
 */
export function FooterGraph() {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    const grid = ref.current;
    if (!grid || event.pointerType !== 'mouse' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bounds = grid.getBoundingClientRect();
    const week = ((event.clientX - bounds.left) / bounds.width) * WEEKS;
    const day = ((event.clientY - bounds.top) / bounds.height) * DAYS;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      grid.querySelectorAll<HTMLElement>('i').forEach((cell, index) => {
        const distance = Math.hypot(Math.floor(index / DAYS) + 0.5 - week, (index % DAYS) + 0.5 - day);
        if (distance < 2.6) {
          const lift = distance < 1 ? 4 : distance < 1.8 ? 3 : 2;
          cell.dataset.level = String(Math.max(base[index], lift));
          cell.dataset.lit = '';
        }
      });
    });
  };

  return (
    <div ref={ref} className="footer-graph" onPointerMove={onMove} aria-hidden="true">
      {base.map((level, cell) => (
        <i key={cell} data-level={level} style={{ '--week': Math.floor(cell / DAYS), '--day': cell % DAYS } as CSSProperties} />
      ))}
    </div>
  );
}
