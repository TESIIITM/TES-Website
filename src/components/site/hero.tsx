'use client';

import { useRef, type PointerEvent, type SyntheticEvent } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import { AmbientCompass } from './ambient-compass';
import { Eyebrow } from './eyebrow';
import { MagneticLink } from './magnetic-link';
import type { Navigate } from './navigation';

type Props = { navigate: Navigate };

/** Where each map point sits, as a compass bearing from the centre. */
const bearings = { learn: -90, build: 0, gather: 90 } as const;
type Point = keyof typeof bearings;

export function Hero({ navigate }: Props) {
  const reduceMotion = useReducedMotion();
  const enter = (y: number) => (reduceMotion ? false : { opacity: 0, y });
  const visualRef = useRef<HTMLDivElement>(null);
  // The map drifts down and the copy up as the hero scrolls away.
  const { scrollY } = useScroll();
  const copyY = useTransform(scrollY, [0, 900], [0, reduceMotion ? 0 : -70]);
  const visualY = useTransform(scrollY, [0, 900], [0, reduceMotion ? 0 : 110]);

  // Pointer position is written to CSS variables so moving never re-renders.
  const aimAt = (event: PointerEvent<HTMLDivElement>) => {
    const visual = visualRef.current;
    if (!visual || reduceMotion || visual.dataset.aim) return;
    const bounds = visual.getBoundingClientRect();
    const x = event.clientX - bounds.left - bounds.width / 2;
    const y = event.clientY - bounds.top - bounds.height / 2;
    visual.style.setProperty('--needle', `${Math.atan2(x, -y)}rad`);
    if (event.pointerType === 'mouse') {
      visual.style.setProperty('--depth-x', (x / bounds.width).toFixed(3));
      visual.style.setProperty('--depth-y', (y / bounds.height).toFixed(3));
    }
  };
  const settle = () => {
    const visual = visualRef.current;
    visual?.style.setProperty('--depth-x', '0');
    visual?.style.setProperty('--depth-y', '0');
  };
  const point = (event: SyntheticEvent<HTMLElement>, target: Point | null) => {
    const visual = event.currentTarget.closest<HTMLElement>('.hero-visual');
    if (!visual) return;
    if (target) {
      visual.dataset.aim = target;
      visual.style.setProperty('--needle', `${bearings[target]}deg`);
    } else {
      delete visual.dataset.aim;
    }
  };
  const nodeProps = (target: Point) => ({
    onClick: () => navigate(target),
    onPointerEnter: (event: SyntheticEvent<HTMLElement>) => point(event, target),
    onPointerLeave: (event: SyntheticEvent<HTMLElement>) => point(event, null),
    onFocus: (event: SyntheticEvent<HTMLElement>) => point(event, target),
    onBlur: (event: SyntheticEvent<HTMLElement>) => point(event, null),
  });

  return (
    <section className="hero-section" id="home" aria-labelledby="hero-title">
      <div className="hero-ambient" aria-hidden="true" />
      <div className="hero-content">
        <motion.div className="hero-copy" style={{ y: copyY }}>
          <motion.div initial={enter(18)} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <Eyebrow>THE ENIGMA SOCIETY <span className="slash">/</span> ABV-IIITM GWALIOR</Eyebrow>
          </motion.div>
          <motion.h1 id="hero-title" initial={enter(30)} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.72, delay: 0.09 }}>
            Find your<br /><em>next commit.</em>
          </motion.h1>
          <motion.p className="hero-lead" initial={enter(20)} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.22 }}>
            A shared direction for curious minds. Learn together, build in public, and contribute to something that matters.
          </motion.p>
          <motion.div className="hero-actions" initial={enter(15)} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.34 }}>
            <MagneticLink className="button button-primary" href="#build" onClick={(event) => { event.preventDefault(); navigate('build'); }}>
              Start contributing <ArrowUpRight size={18} />
            </MagneticLink>
            <a className="text-action" href="#about" onClick={(event) => { event.preventDefault(); navigate('about'); }}>Explore the society <ArrowRight size={17} /></a>
          </motion.div>
        </motion.div>
        <motion.div ref={visualRef} className="hero-visual" role="group" aria-label="Contribution map" style={{ y: visualY }} onPointerMove={aimAt} onPointerDown={aimAt} onPointerLeave={settle}>
          <div className="visual-grid" aria-hidden="true" />
          <div className="visual-halo" aria-hidden="true" />
          <AmbientCompass className="compass-canvas" />
          <div className="compass-core" aria-hidden="true"><span className="compass-bearing" /><Image src="/assets/compass.svg" width={190} height={190} alt="" loading="eager" /></div>
          <svg className="map-tracks" viewBox="0 0 700 630" preserveAspectRatio="none" aria-hidden="true"><path d="M50 315 H650 M350 36 V580 M200 315 C240 315 230 375 285 375 H420 C480 375 465 315 510 315" /><circle data-point="learn" cx="80" cy="315" r="8" /><circle data-point="build" cx="350" cy="90" r="8" /><circle data-point="gather" cx="620" cy="315" r="8" /><circle cx="350" cy="550" r="8" /></svg>
          <button className="map-node map-node-learn" {...nodeProps('learn')}><strong>Learn</strong><small>Stories and videos</small></button>
          <button className="map-node map-node-build" {...nodeProps('build')}><strong>Build</strong><small>Projects and contributors</small></button>
          <button className="map-node map-node-share" {...nodeProps('gather')}><strong>Gather</strong><small>Events and announcements</small></button>
        </motion.div>
      </div>
      <div className="hero-bottom"><a href="#explore" onClick={(event) => { event.preventDefault(); navigate('build'); }}>SCROLL TO EXPLORE <ArrowDown size={17} /></a></div>
    </section>
  );
}
