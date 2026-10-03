import { useRef, type PointerEvent, type ReactNode } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, type HTMLMotionProps } from 'motion/react';

type Props = HTMLMotionProps<'a'> & { href: string; children: ReactNode };

/** Spring movement is pointer-only; keyboard and touch preserve a stable target. */
export function MagneticLink({ href, children, className = '', ...rest }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 22, mass: 0.55 });
  const springY = useSpring(y, { stiffness: 260, damping: 22, mass: 0.55 });
  const move = (event: PointerEvent<HTMLAnchorElement>) => {
    if (reduceMotion || event.pointerType !== 'mouse' || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * 0.16);
    y.set((event.clientY - rect.top - rect.height / 2) * 0.16);
  };
  return (
    <motion.a ref={ref} href={href} className={className} style={{ x: springX, y: springY }}
      onPointerMove={move} onPointerLeave={() => { x.set(0); y.set(0); }} {...rest}>
      {children}
    </motion.a>
  );
}
