'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import { AmbientCompass } from './ambient-compass';
import { Eyebrow } from './eyebrow';
import { MagneticLink } from './magnetic-link';
import type { Navigate } from './navigation';

type Props = { navigate: Navigate };

export function Hero({ navigate }: Props) {
  const reduceMotion = useReducedMotion();
  const enter = (y: number) => (reduceMotion ? false : { opacity: 0, y });

  return (
    <section className="hero-section" id="home" aria-labelledby="hero-title">
      <div className="hero-ambient" aria-hidden="true" />
      <div className="hero-content">
        <div className="hero-copy">
          <motion.div initial={enter(18)} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <Eyebrow><span className="live-dot" aria-hidden="true" />THE ENIGMA SOCIETY <span className="slash">/</span> ABV-IIITM GWALIOR</Eyebrow>
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
          <div className="hero-proof"><span className="proof-line" /><Eyebrow>OPEN CODE <span className="mini-diamond">◇</span> SHARED KNOWLEDGE <span className="mini-diamond">◇</span> COLLECTIVE PROGRESS</Eyebrow></div>
        </div>
        <div className="hero-visual" role="group" aria-label="Contribution map">
          <div className="visual-grid" aria-hidden="true" />
          <div className="visual-halo" aria-hidden="true" />
          <AmbientCompass className="compass-canvas" />
          <div className="compass-core" aria-hidden="true"><Image src="/assets/compass.svg" width={190} height={190} alt="" loading="eager" /></div>
          <svg className="map-tracks" viewBox="0 0 700 630" preserveAspectRatio="none" aria-hidden="true"><path d="M50 315 H650 M350 36 V580 M200 315 C240 315 230 375 285 375 H420 C480 375 465 315 510 315" /><circle cx="80" cy="315" r="8" /><circle cx="350" cy="90" r="8" /><circle cx="620" cy="315" r="8" /><circle cx="350" cy="550" r="8" /></svg>
          <button className="map-node map-node-learn" onClick={() => navigate('learn')}><span>01 / EXPLORE</span><strong>learn</strong><small>Find a direction</small></button>
          <button className="map-node map-node-build" onClick={() => navigate('build')}><span>02 / CONTRIBUTE</span><strong>build</strong><small>Make it yours</small></button>
          <button className="map-node map-node-share" onClick={() => navigate('gather')}><span>03 / SHARE</span><strong>merge</strong><small>Build together</small></button>
          <div className="visual-coordinate coordinate-left" aria-hidden="true">MAIN / OPEN CODE<br />CURIOUS MINDS, IN MOTION</div>
          <div className="visual-coordinate coordinate-right" aria-hidden="true">YOUR FIRST CONTRIBUTION<br />STARTS HERE.</div>
          <span className="visual-corner corner-tl" aria-hidden="true">＋</span><span className="visual-corner corner-br" aria-hidden="true">＋</span>
        </div>
      </div>
      <div className="hero-bottom"><a href="#explore" onClick={(event) => { event.preventDefault(); navigate('build'); }}>SCROLL TO EXPLORE <ArrowDown size={17} /></a><span>EST. AT ABV-IIITM GWALIOR <i>◆</i> SEE YOU AT THE TOP.</span></div>
    </section>
  );
}
