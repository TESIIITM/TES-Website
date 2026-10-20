import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { formatStoryDate, ordinal } from '@/lib/format';
import type { TechNewsIssue } from '@/lib/content/types';
import { SectionHead } from './section-head';

function hostname(url: string) {
  return new URL(url).hostname.replace(/^www\./, '');
}

export function TechNews({ issue }: { issue: TechNewsIssue }) {
  return (
    <section id="news" className="news-section" aria-labelledby="news-title">
      <SectionHead
        id="news-title"
        title={<>What moved<br /><em>in tech this week.</em></>}
        lede={<><strong className="news-week">Week of {formatStoryDate(issue.weekOf)}.</strong> What the society is reading and talking about. Picked by members, refreshed every Tuesday.</>}
      />
      <ol className="news-grid">
        {issue.items.map((item, index) => (
          <li key={item.id}>
            <a className="news-card" href={item.url} target="_blank" rel="noopener noreferrer">
              <div className="news-image">
                {item.imageUrl
                  ? <Image src={item.imageUrl} alt="" fill sizes="(max-width: 620px) 90vw, (max-width: 1100px) 45vw, 480px" />
                  : <span aria-hidden="true">{(item.source ?? hostname(item.url))[0]}</span>}
              </div>
              <span className="news-meta"><b>{ordinal(index + 1)}</b>{item.source ?? hostname(item.url)}</span>
              <h3>{item.title} <ArrowUpRight size={18} /></h3>
              {item.summary && <p>{item.summary}</p>}
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
