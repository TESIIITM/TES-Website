'use client';

import { useState, type KeyboardEvent } from 'react';
import type { Domain } from '@/lib/content/types';
import { DomainArt } from './domain-art';
import { nextTabIndex } from './navigation';
import { SectionHead } from './section-head';

const DAYS = 7;

/** A steady pseudo-random number in [0, 1) for a domain and a cell. */
function noise(seed: string, cell: number) {
  let hash = 2166136261;
  for (const char of `${seed}:${cell}`) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return ((hash >>> 0) % 1000) / 1000;
}

/**
 * Contribution levels (0 to 4) for a domain's graph. Activity builds from left
 * to right: start small, and it grows.
 */
function levels(seed: string, weeks: number) {
  return Array.from({ length: weeks * DAYS }, (_, cell) => {
    const week = Math.floor(cell / DAYS);
    const value = noise(seed, cell) * 0.75 + (week / weeks) * 0.6 - 0.25;
    return Math.max(0, Math.min(4, Math.floor(value * 4.4)));
  });
}

function Graph({ seed, weeks, className = '' }: { seed: string; weeks: number; className?: string }) {
  return (
    <span className={`contrib-graph ${className}`} aria-hidden="true">
      {levels(seed, weeks).map((level, cell) => (
        <i key={cell} data-level={level} />
      ))}
    </span>
  );
}

/** The areas the society works in, one shown at a time. */
export function Domains({ domains }: { domains: Domain[] }) {
  const [selected, setSelected] = useState(0);
  // Content can shrink between renders; never point past the end.
  const index = Math.min(selected, domains.length - 1);
  const current = domains[index];

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, from: number) => {
    const next = nextTabIndex(event.key, from, domains.length, { vertical: true });
    if (next === null) return;
    event.preventDefault();
    setSelected(next);
    document.getElementById(`domain-${next}`)?.focus();
  };

  return (
    <div className="domains">
      <SectionHead id="domains-title" level={3} branch="domains" title="Where you can start." lede="Pick a direction. Your first contribution can be small, and it grows from there." />
      <div className="domain-layout">
        <div className="domain-tabs" role="tablist" aria-labelledby="domains-title" aria-orientation="vertical">
          {domains.map((domain, i) => (
            <button id={`domain-${i}`} key={domain.id} role="tab" aria-selected={index === i} aria-controls="domain-preview" tabIndex={index === i ? 0 : -1} onClick={() => setSelected(i)} onKeyDown={(event) => onKeyDown(event, i)}>
              <span className="domain-name">{domain.title}</span>
              <Graph seed={domain.id} weeks={8} className="contrib-mini" />
            </button>
          ))}
        </div>
        <div className="domain-preview" id="domain-preview" role="tabpanel" aria-labelledby={`domain-${index}`}>
          <div className="domain-copy">
            <h4>{current.title}</h4>
            <p>{current.detail}</p>
          </div>
          {/* Keyed by domain, so each drawing starts fresh. */}
          <DomainArt key={current.id} title={current.title} />
        </div>
      </div>
    </div>
  );
}
