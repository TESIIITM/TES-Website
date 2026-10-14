'use client';

import { useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Compass } from 'lucide-react';
import { ordinal } from '@/lib/format';
import type { Domain } from '@/lib/content/types';
import { Eyebrow } from './eyebrow';
import { nextTabIndex } from './navigation';

/** The areas the society works in, one shown at a time. */
export function Domains({ domains }: { domains: Domain[] }) {
  const [selected, setSelected] = useState(0);
  // Content can shrink between renders; never point past the end.
  const index = Math.min(selected, domains.length - 1);
  const current = domains[index];
  const code = ordinal(index + 1);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, from: number) => {
    const next = nextTabIndex(event.key, from, domains.length, { vertical: true });
    if (next === null) return;
    event.preventDefault();
    setSelected(next);
    document.getElementById(`domain-${next}`)?.focus();
  };

  return (
    <>
      <div className="domains-top"><div><Eyebrow>EXPLORE THE STACK</Eyebrow><h3>Many directions. One community.</h3></div><p>Pick a path. Your first contribution can be small.</p></div>
      <div className="domain-layout">
        <div className="domain-tabs" role="tablist" aria-label="Technical domains">
          {domains.map((domain, i) => (
            <button id={`domain-${i}`} key={domain.id} role="tab" aria-selected={index === i} aria-controls="domain-preview" tabIndex={index === i ? 0 : -1} onClick={() => setSelected(i)} onKeyDown={(event) => onKeyDown(event, i)}>
              <span>{ordinal(i + 1)}</span>{domain.title}
            </button>
          ))}
        </div>
        <div className="domain-preview" id="domain-preview" role="tabpanel" aria-labelledby={`domain-${index}`} tabIndex={0}>
          <AnimatePresence mode="wait">
            <motion.div key={current.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
              <Compass size={26} strokeWidth={1.3} /><span className="preview-index">{code}</span><h4>{current.title}</h4><p>{current.detail}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
