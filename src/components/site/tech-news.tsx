import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { formatStoryDate, ordinal } from '@/lib/format';
import type { TechNewsIssue } from '@/lib/content/types';
import { Eyebrow } from './eyebrow';

function hostname(url: string) {
  return new URL(url).hostname.replace(/^www\./, '');
}

export function TechNews({ issue }: { issue: TechNewsIssue }) {
  return (
    <section id="news" className="news-section" aria-labelledby="news-title">
      <div className="section-title">
        <div>
          <Eyebrow>THIS WEEK IN TECH <span className="slash">/</span> WEEK OF {formatStoryDate(issue.weekOf)}</Eyebrow>
          <h2 id="news-title">What moved<br /><em>in tech this week.</em></h2>
        </div>
        <p>What the society is reading and talking about. Picked by members, refreshed every Tuesday.</p>
      </div>
      <ol className="news-grid">
        {issue.items.map((item, index) => (
          <li key={item.id}>
            <a className="news-card" href={item.url} target="_blank" rel="noopener noreferrer">
              <div className="news-image">
                {item.imageUrl
                  ? <Image src={item.imageUrl} alt="" fill sizes="(max-width: 620px) 90vw, (max-width: 1100px) 45vw, 480px" />
                  : <span aria-hidden="true">{(item.source ?? hostname(item.url))[0]}</span>}
              </div>
              <span className="news-meta">{ordinal(index + 1)} <span className="slash">/</span> {item.source ?? hostname(item.url)}</span>
              <h3>{item.title} <ArrowUpRight size={18} /></h3>
              {item.summary && <p>{item.summary}</p>}
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
