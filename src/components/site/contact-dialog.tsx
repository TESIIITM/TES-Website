'use client';

import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowUpRight, Check, Mail, X } from 'lucide-react';
import { Github, Instagram } from '@/components/brand-icons';
import type { SiteLinks } from '@/lib/content/types';
import { Eyebrow } from './eyebrow';

export function ContactDialog({ links }: { links: SiteLinks }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2400);
    return () => clearTimeout(timer);
  }, [copied]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(links.email);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger className="footer-contact">Get in touch <ArrowUpRight size={18} /></Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <Dialog.Close className="dialog-close" aria-label="Close"><X size={22} /></Dialog.Close>
          <Eyebrow>THE DOOR IS OPEN</Eyebrow>
          <Dialog.Title>Find your way in.</Dialog.Title>
          <Dialog.Description>Explore the code, follow the community, or say hello. There’s no experience threshold.</Dialog.Description>
          <a href={links.github} target="_blank" rel="noopener noreferrer"><Github size={20} /><span><b>Start with the code</b><small>Browse the society’s repositories.</small></span><ArrowUpRight size={17} /></a>
          <a href={links.instagram} target="_blank" rel="noopener noreferrer"><Instagram size={20} /><span><b>Follow the community</b><small>See announcements and updates.</small></span><ArrowUpRight size={17} /></a>
          <a href={`mailto:${links.email}?subject=Hello%20Enigma%20Society`}><Mail size={20} /><span><b>Say hello</b><small>Ask about joining or sharing an idea.</small></span><ArrowUpRight size={17} /></a>
          <button className="copy-email" onClick={copyEmail}><span>{links.email}</span>{copied ? <><Check size={15} /> Copied</> : 'Copy email'}</button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
