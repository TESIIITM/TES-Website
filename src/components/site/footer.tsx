import Image from 'next/image';
import type { ReactNode } from 'react';
import { ArrowUpRight, BookOpen, Code2, GitPullRequest } from 'lucide-react';
import { Github, Instagram, Linkedin } from '@/components/brand-icons';
import type { SiteLinks } from '@/lib/content/types';
import { ContactDialog } from './contact-dialog';
import { FooterGraph } from './footer-graph';

type Tone = 'green' | 'purple' | 'blue';

function ExternalLink({ href, icon, tone, children }: { href: string; icon: ReactNode; tone: Tone; children: string }) {
  return <a href={href} target="_blank" rel="noopener noreferrer"><span className="footer-link-label"><span className="footer-icon" data-tone={tone}>{icon}</span>{children}</span> <ArrowUpRight size={16} /></a>;
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
        <div className="footer-cta"><span className="footer-label">Have an idea?</span><ContactDialog links={links} /></div>
      </div>
      <div className="footer-main">
        <nav className="footer-directory" aria-label="Footer navigation">
          <div>
            <span className="footer-label">Explore</span>
            <ExternalLink href={links.repository} tone="green" icon={<Code2 size={16} aria-hidden />}>Website source</ExternalLink>
            <ExternalLink href={links.medium} tone="purple" icon={<BookOpen size={16} aria-hidden />}>Stories on Medium</ExternalLink>
            <ExternalLink href={links.contributionGuide} tone="blue" icon={<GitPullRequest size={16} aria-hidden />}>Contribution guide</ExternalLink>
          </div>
          <div>
            <span className="footer-label">Connect</span>
            <ExternalLink href={links.github} tone="green" icon={<Github size={16} aria-hidden />}>GitHub</ExternalLink>
            <ExternalLink href={links.instagram} tone="purple" icon={<Instagram size={16} aria-hidden />}>Instagram</ExternalLink>
            <ExternalLink href={links.linkedin} tone="blue" icon={<Linkedin size={16} aria-hidden />}>LinkedIn</ExternalLink>
          </div>
        </nav>
        <div className="footer-statement"><FooterGraph /><h2>Open code.<br /><em>Open minds.</em></h2></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} The Enigma Society, ABV-IIITM Gwalior</span><a href="#home">Back to top ↑</a></div>
    </footer>
  );
}
