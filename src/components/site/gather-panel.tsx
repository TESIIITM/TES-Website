import Image from 'next/image';
import { ArrowUpRight, GitFork } from 'lucide-react';
import { announcementTitle, formatStoryDate } from '@/lib/format';
import type { Announcement } from '@/lib/content/types';
import { Eyebrow } from './eyebrow';

/** Announcements after the featured one, listed under it. */
const MAX_EARLIER = 3;

type Props = { announcements: Announcement[]; instagramUrl: string };

export function GatherPanel({ announcements, instagramUrl }: Props) {
  const [featured, ...earlier] = announcements;
  return (
    <div className="gather-panel">
      <EventVisual />
      {featured ? <FeaturedAnnouncement announcement={featured} /> : <NoAnnouncements instagramUrl={instagramUrl} />}
      {earlier.length > 0 && (
        <div className="activity-strip">
          {earlier.slice(0, MAX_EARLIER).map((item) => (
            <div key={item.id}>
              <span>{formatStoryDate(item.publishedOn)}</span>
              <h4>{item.primaryAction ? <a href={item.primaryAction.url} target="_blank" rel="noopener noreferrer">{announcementTitle(item)}</a> : announcementTitle(item)}</h4>
              <p>{item.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EventVisual() {
  return (
    <div className="event-visual" aria-hidden="true">
      <span>THE ENIGMA SOCIETY / OPEN DISPATCH</span>
      <div className="event-path">
        <div className="event-path-step"><small>01</small><strong>idea</strong></div>
        <div className="event-path-branch"><span /><div className="event-path-mark"><Image src="/assets/compass.svg" width={112} height={112} alt="" /><GitFork size={30} strokeWidth={1.25} /></div><span /></div>
        <div className="event-path-step"><small>02</small><strong>write</strong></div>
        <div className="event-path-step event-path-last"><small>03</small><strong>publish</strong></div>
      </div>
      <span>OPEN IDEAS → SHARED KNOWLEDGE</span>
    </div>
  );
}

function FeaturedAnnouncement({ announcement }: { announcement: Announcement }) {
  const { label, title, titleEmphasis, summary, details, primaryAction, secondaryAction } = announcement;
  return (
    <div className="event-details">
      <Eyebrow>{label}</Eyebrow>
      <h3>{title}{titleEmphasis && <><br /><em>{titleEmphasis}</em></>}</h3>
      <p>{summary}</p>
      {details && <details><summary>How it works <span>＋</span></summary><p>{details}</p></details>}
      {(primaryAction || secondaryAction) && (
        <div className="event-actions">
          {primaryAction && <a className="button button-secondary" href={primaryAction.url} target="_blank" rel="noopener noreferrer">{primaryAction.label} <ArrowUpRight size={18} /></a>}
          {secondaryAction && <a className="text-action" href={secondaryAction.url} target="_blank" rel="noopener noreferrer">{secondaryAction.label} <ArrowUpRight size={16} /></a>}
        </div>
      )}
    </div>
  );
}

function NoAnnouncements({ instagramUrl }: { instagramUrl: string }) {
  return (
    <div className="event-details">
      <Eyebrow>COMMUNITY ANNOUNCEMENT</Eyebrow>
      <h3>Stay<br /><em>tuned.</em></h3>
      <p>There is nothing open right now. Follow the society for the next event, workshop, or call for writers.</p>
      <div className="event-actions">
        <a className="text-action" href={instagramUrl} target="_blank" rel="noopener noreferrer">Follow on Instagram <ArrowUpRight size={16} /></a>
      </div>
    </div>
  );
}
