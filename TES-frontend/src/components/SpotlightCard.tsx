import { useEffect, useRef, type CSSProperties, type PointerEvent, type ReactNode } from 'react';
import { useReducedMotion } from 'motion/react';

type Props = { children: ReactNode; className?: string };

export function SpotlightCard({ children, className = '' }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const frame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  const onMove = (event: PointerEvent<HTMLElement>) => {
    if (reduceMotion || event.pointerType !== 'mouse' || !ref.current) return;
    const card = ref.current;
    const rect = card.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      card.style.setProperty('--spot-x', `${px}px`);
      card.style.setProperty('--spot-y', `${py}px`);
      card.style.setProperty('--rotate-x', `${((py / rect.height) - 0.5) * -5}deg`);
      card.style.setProperty('--rotate-y', `${((px / rect.width) - 0.5) * 5}deg`);
    });
  };
  const onLeave = () => {
    cancelAnimationFrame(frame.current);
    ref.current?.style.setProperty('--rotate-x', '0deg');
    ref.current?.style.setProperty('--rotate-y', '0deg');
  };
  return (
    <article ref={ref} className={`spotlight-card ${className}`} onPointerMove={onMove}
      onPointerLeave={onLeave} style={{ '--spot-x': '50%', '--spot-y': '50%' } as CSSProperties}>
      {children}
    </article>
  );
}
