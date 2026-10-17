'use client';

import { useEffect, useState } from 'react';
import { Check, Link2 } from 'lucide-react';

/** Copies the form's address, or opens the phone's share sheet where there is one. */
export function ShareLink({ path = '/join', label = 'Share form', className = 'join-share' }: { path?: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2400);
    return () => clearTimeout(timer);
  }, [copied]);

  const share = async () => {
    const url = new URL(path, window.location.origin).toString();
    if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
      try {
        await navigator.share({ title: 'Join The Enigma Society', url });
        return;
      } catch {
        // Dismissed, or sharing is unavailable; copy instead.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      window.prompt('Copy this link:', url);
    }
  };

  return (
    <button type="button" className={className} onClick={share}>
      {copied ? <Check size={15} /> : <Link2 size={15} />}
      <span aria-live="polite">{copied ? 'Link copied' : label}</span>
    </button>
  );
}
