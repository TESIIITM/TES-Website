import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { connection } from 'next/server';
import { Bricolage_Grotesque, IBM_Plex_Mono } from 'next/font/google';
import { ArrowLeft } from 'lucide-react';
import { importanceOf, type Importance } from '@/lib/recruitment/rubric';
import { loadRecruitmentConfig, type RecruitmentConfig } from '@/lib/recruitment/server';
import { JoinForm } from './join-form';
import { ShareLink } from '@/components/share-link';

const bricolage = Bricolage_Grotesque({ subsets: ['latin'], variable: '--f-bricolage' });
const plex = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--f-plex' });

const title = 'Join TES — The Enigma Society';
const description = 'Apply to join The Enigma Society at ABV-IIITM Gwalior. Tell us what you have built and what you want to build with us.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/join' },
  openGraph: { title, description, type: 'website', siteName: 'The Enigma Society' },
  twitter: { card: 'summary', title, description },
};

export default async function JoinPage() {
  // Read on every request, so opening or closing applications takes effect at once.
  await connection();
  let config: RecruitmentConfig | null = null;
  try {
    config = await loadRecruitmentConfig();
  } catch (error) {
    console.error('Join page could not load its settings:', error);
  }

  // Applicants see only the importance label for each question, never the weight.
  const importance: Record<string, Importance> = Object.fromEntries((config?.criteria ?? []).map((criterion) => [criterion.key, importanceOf(criterion.weight)]));

  return (
    <div className={`join-page ${bricolage.variable} ${plex.variable}`}>
      <header className="join-topbar">
        <Link className="brand" href="/" aria-label="The Enigma Society, home">
          <Image className="brand-compass" src="/assets/compass.svg" width={38} height={38} alt="" />
          <Image className="brand-wordmark" src="/assets/enigma-wordmark.png" width={104} height={44} alt="" />
        </Link>
        <div className="join-topbar-actions">
          <ShareLink />
          <Link className="join-back" href="/"><ArrowLeft size={16} /> Back to the site</Link>
        </div>
      </header>
      <main className="join-main" id="join">
        {config?.isOpen ? (
          <JoinForm departments={config.departments} importance={importance} />
        ) : (
          <section className="join-closed">
            <h1>Applications are closed.</h1>
            <p>We are not taking applications right now. You can still contribute to TES projects on GitHub, and follow us on Instagram to hear when the next round opens.</p>
            <Link className="text-action" href="/#build">Explore the projects</Link>
          </section>
        )}
      </main>
    </div>
  );
}
