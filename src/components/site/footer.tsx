import Image from 'next/image';
import { ArrowUpRight, GitFork } from 'lucide-react';
import type { SiteLinks } from '@/lib/content/types';
import { ContactDialog } from './contact-dialog';
import { Eyebrow } from './eyebrow';

function ExternalLink({ href, children }: { href: string; children: string }) {
  return <a href={href} target="_blank" rel="noopener noreferrer">{children} <ArrowUpRight size={16} /></a>;
}

export function Footer({ links }: { links: SiteLinks }) {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <a className="footer-logo" href="#home" aria-label="The Enigma Society, back to top">
          <Image className="footer-compass" src="/assets/compass.svg" alt="" width={50} height={50} />
          <Image className="footer-wordmark" src="/assets/enigma-wordmark.png" alt="" width={150} height={62} />
        </a>
        <p>A place to learn openly and build together at ABV-IIITM Gwalior.</p>
        <div className="footer-cta"><Eyebrow>HAVE AN IDEA?</Eyebrow><ContactDialog links={links} /></div>
      </div>
      <div className="footer-main">
        <nav className="footer-directory" aria-label="Footer navigation">
          <div>
            <Eyebrow>EXPLORE / 01</Eyebrow>
            <ExternalLink href={links.repository}>Repository</ExternalLink>
            <ExternalLink href={links.medium}>Knowledge</ExternalLink>
            <ExternalLink href={links.contributionGuide}>Contribution guide</ExternalLink>
          </div>
          <div>
            <Eyebrow>CONNECT / 02</Eyebrow>
            <ExternalLink href={links.github}>GitHub</ExternalLink>
            <ExternalLink href={links.instagram}>Instagram</ExternalLink>
            <ExternalLink href={links.linkedin}>LinkedIn</ExternalLink>
          </div>
        </nav>
        <div className="footer-statement"><span>THE ENIGMA SOCIETY / OPEN SOURCE COLLECTIVE</span><h2>Open code.<br /><em>Open minds.</em></h2><div><GitFork size={17} /> A shared direction. A place to begin.</div></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} THE ENIGMA SOCIETY · ABV-IIITM GWALIOR</span><span><GitFork size={14} /> BUILT IN THE OPEN</span><a href="#home">BACK TO TOP ↑</a></div>
    </footer>
  );
}
