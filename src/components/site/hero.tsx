'use client';

import { useRef, type PointerEvent } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { Eyebrow } from './eyebrow';
import type { Navigate } from './navigation';
import { NeedleIcon } from './needle-icon';

type Props = { navigate: Navigate };

/** The three points, evenly spaced around the compass, as bearings from north. */
const points = [
  { target: 'build', label: 'Build', detail: 'Projects and contributors', bearing: 0, left: '50%', top: '10.9%' },
  { target: 'gather', label: 'Gather', detail: 'Events and announcements', bearing: 120, left: '83.8%', top: '69.5%' },
  { target: 'learn', label: 'Learn', detail: 'Stories and videos', bearing: 240, left: '16.2%', top: '69.5%' },
] as const;
type Point = (typeof points)[number]['target'];

/** The point whose bearing is closest to an angle in degrees. */
function nearest(degrees: number): Point {
  const angle = ((degrees % 360) + 360) % 360;
  if (angle < 60 || angle >= 300) return 'build';
  return angle < 180 ? 'gather' : 'learn';
}

/** Faint stars around the compass, in its 640 unit square. */
const stars = [
  [64, 98, 1.4], [132, 40, 1], [560, 70, 1.6], [610, 190, 1], [30, 250, 1.2], [600, 420, 1.4], [520, 610, 1],
  [90, 560, 1.6], [210, 618, 1], [380, 22, 1.2], [252, 96, 1], [470, 150, 1.2], [160, 210, 1], [502, 300, 1.4],
  [120, 400, 1], [440, 520, 1.2], [250, 500, 1], [636, 560, 1.2], [12, 430, 1], [330, 634, 1.4],
];

export function Hero({ navigate }: Props) {
  const reduceMotion = useReducedMotion();
  const enter = (y: number) => (reduceMotion ? false : { opacity: 0, y });
  const compassRef = useRef<HTMLDivElement>(null);
  const needle = useRef(0);
  const locked = useRef(false);
  // The copy drifts up and the compass down as the hero scrolls away.
  const { scrollY } = useScroll();
  const copyY = useTransform(scrollY, [0, 900], [0, reduceMotion ? 0 : -70]);
  const compassY = useTransform(scrollY, [0, 900], [0, reduceMotion ? 0 : 110]);

  // The needle's angle is written to a CSS variable, so steering never re-renders. It turns the
  // short way round, so its springy transition never spins through a full circle.
  const turnTo = (bearing: number, active: Point | null) => {
    const compass = compassRef.current;
    if (!compass) return;
    needle.current += ((((bearing - needle.current) % 360) + 540) % 360) - 180;
    compass.style.setProperty('--needle', `${needle.current}deg`);
    if (active) compass.dataset.aim = active;
    else delete compass.dataset.aim;
  };
  const steer = (event: PointerEvent<HTMLDivElement>) => {
    const compass = compassRef.current;
    if (!compass || reduceMotion || locked.current) return;
    const bounds = compass.getBoundingClientRect();
    const x = event.clientX - bounds.left - bounds.width / 2;
    const y = event.clientY - bounds.top - bounds.height / 2;
    const bearing = (Math.atan2(x, -y) * 180) / Math.PI;
    compass.dataset.steering = '';
    turnTo(bearing, nearest(bearing));
  };
  const rest = () => {
    if (compassRef.current) delete compassRef.current.dataset.steering;
    turnTo(0, null);
  };
  const lock = (point: (typeof points)[number] | null) => {
    locked.current = Boolean(point);
    if (point) turnTo(point.bearing, point.target);
    else if (compassRef.current?.dataset.steering === undefined) turnTo(0, null);
  };

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
            A shared direction for curious minds. Learn together, build in public, and contribute to something that matters.{' '}
            <a href="#about" onClick={(event) => { event.preventDefault(); navigate('about'); }}>Meet the society</a>
          </motion.p>
          <motion.div className="hero-actions" initial={enter(15)} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.34 }}>
            <a className="hero-cta" href="#build" onClick={(event) => { event.preventDefault(); navigate('build'); }}>
              <span className="hero-cta-fill" aria-hidden="true" />
              <span className="hero-cta-disc" aria-hidden="true"><NeedleIcon size={22} /></span>
              <span>Start contributing<small>Pick a project, open your first PR</small></span>
            </a>
          </motion.div>
        </motion.div>
        <motion.div ref={compassRef} className="compass" role="group" aria-label="Contribution compass" style={{ y: compassY }} onPointerMove={steer} onPointerDown={steer} onPointerLeave={rest}>
          <svg className="compass-layer compass-stars" viewBox="0 0 640 640" aria-hidden="true">
            {stars.map(([cx, cy, r], index) => <circle key={index} cx={cx} cy={cy} r={r} style={{ animationDelay: `${-(index % 5) * 1.1}s` }} />)}
          </svg>
          <svg className="compass-layer compass-rings" viewBox="0 0 640 640" aria-hidden="true">
            <circle cx="320" cy="320" r="312" /><circle cx="320" cy="320" r="232" /><circle cx="320" cy="320" r="186" strokeDasharray="1 5" />
          </svg>
          <svg className="compass-layer compass-bezel" viewBox="0 0 640 640" aria-hidden="true">
            <circle cx="320" cy="320" r="296" strokeWidth="8" strokeOpacity=".22" strokeDasharray="1 9.33" />
            <circle cx="320" cy="320" r="296" strokeWidth="16" strokeOpacity=".55" strokeDasharray="1.4 50.26" />
          </svg>
          <svg className="compass-layer" viewBox="0 0 640 640" aria-hidden="true">
            <path className="compass-track" data-point="build" d="M320 320V70" />
            <path className="compass-track" data-point="gather" d="M320 320 536.5 445" />
            <path className="compass-track" data-point="learn" d="M320 320 103.5 445" />
          </svg>
          <div className="compass-face" aria-hidden="true"><Image src="/assets/compass.svg" width={190} height={190} alt="" loading="eager" /></div>
          <div className="compass-needle" aria-hidden="true">
            <svg viewBox="0 0 24 400" preserveAspectRatio="none">
              <path className="needle-north" d="M12 0 20 200H4Z" />
              <path className="needle-south" d="M12 398 19 200H5Z" />
              <circle className="needle-pin" cx="12" cy="200" r="8" />
            </svg>
          </div>
          {points.map((point) => (
            <button
              key={point.target}
              className="compass-node"
              data-point={point.target}
              style={{ left: point.left, top: point.top }}
              onClick={() => navigate(point.target)}
              onPointerEnter={() => lock(point)}
              onPointerLeave={() => lock(null)}
              onFocus={() => lock(point)}
              onBlur={() => lock(null)}
            >
              <span className="compass-dot" />
              <span className="compass-label">
                <strong>{point.label}<ArrowUpRight size={16} aria-hidden="true" /></strong>
                <small>{point.detail}</small>
              </span>
            </button>
          ))}
        </motion.div>
      </div>
      <div className="hero-bottom"><a href="#explore" onClick={(event) => { event.preventDefault(); navigate('build'); }}><ArrowDown size={15} /> SCROLL TO EXPLORE</a></div>
    </section>
  );
}
