import { ArrowUpRight } from 'lucide-react';
import { announcementTitle, formatStoryDate } from '@/lib/format';
import type { Announcement, InstagramPost } from '@/lib/content/types';
import { Eyebrow } from './eyebrow';
import { InstagramPosts } from './instagram-posts';

/** Announcements after the featured one, listed under it. */
const MAX_EARLIER = 3;

type Props = { announcements: Announcement[]; instagramPosts: InstagramPost[]; instagramUrl: string };

export function GatherPanel({ announcements, instagramPosts, instagramUrl }: Props) {
  const [featured, ...earlier] = announcements;
  return (
    <div className="gather-panel">
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
      {instagramPosts.length > 0 && <InstagramPosts posts={instagramPosts} instagramUrl={instagramUrl} />}
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
