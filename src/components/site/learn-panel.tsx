'use client';

import { useId, useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight, BookOpen, Bookmark, Search } from 'lucide-react';
import { useBrowserStore } from '@/lib/browser-store';
import { formatStoryDate } from '@/lib/format';
import { readingListStore } from '@/lib/reading-list';
import type { Story } from '@/lib/content/types';
import { Eyebrow } from './eyebrow';

const ALL = 'All';
const SAVED = 'Saved';

type Props = { stories: Story[]; mediumUrl: string };

export function LearnPanel({ stories, mediumUrl }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState(ALL);
  const stored = useBrowserStore(readingListStore);
  const inputId = useId();

  const filters = useMemo(() => [ALL, ...new Set(stories.map((story) => story.category)), SAVED], [stories]);
  // Ignore saved slugs for stories that have since been removed.
  const saved = useMemo(() => {
    const known = new Set(stories.map((story) => story.slug));
    return stored.filter((slug) => known.has(slug));
  }, [stored, stories]);

  const needle = query.trim().toLowerCase();
  const visible = stories.filter((story) => {
    const inFilter = filter === ALL || (filter === SAVED ? saved.includes(story.slug) : story.category === filter);
    return inFilter && `${story.title} ${story.summary} ${story.category}`.toLowerCase().includes(needle);
  });

  const toggleSaved = (slug: string) => {
    readingListStore.set(saved.includes(slug) ? saved.filter((item) => item !== slug) : [...saved, slug]);
  };
  const reset = () => { setQuery(''); setFilter(ALL); };

  return (
    <div className="learn-panel">
      <div className="panel-heading"><div><Eyebrow>FROM THE COMMUNITY</Eyebrow><h3>Knowledge moves<br /><em>when we share it.</em></h3></div><a href={mediumUrl} target="_blank" rel="noopener noreferrer">All stories on Medium <ArrowUpRight size={16} /></a></div>
      <div className="reading-tools">
        <label className="search-field" htmlFor={inputId}><Search size={17} /><input id={inputId} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the reading list" type="search" /></label>
        <div className="filter-set" role="group" aria-label="Filter stories">
          {filters.map((item) => <button key={item} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}{item === SAVED && <span>{saved.length}</span>}</button>)}
        </div>
      </div>
      <p className="result-count" role="status">{visible.length} {visible.length === 1 ? 'STORY' : 'STORIES'} {filter === SAVED ? 'SAVED ON THIS DEVICE' : 'FROM THE SOCIETY'}</p>
      {visible.length ? (
        <div className="story-list">
          {visible.map((story) => {
            const isSaved = saved.includes(story.slug);
            return (
              <article className="story-row" key={story.id}>
                <span className="story-date">{formatStoryDate(story.publishedOn)}</span>
                <div><span className="story-category">{story.category}</span><a href={story.url} target="_blank" rel="noopener noreferrer"><h4>{story.title} <ArrowUpRight size={18} /></h4></a><p>{story.summary}</p></div>
                <button className="bookmark-button" aria-label={`${isSaved ? 'Remove' : 'Save'} ${story.title}`} aria-pressed={isSaved} onClick={() => toggleSaved(story.slug)}><Bookmark size={19} fill={isSaved ? 'currentColor' : 'none'} /></button>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-reading"><BookOpen size={25} /><h4>No stories found.</h4><p>Try a different search or clear the filters.</p><button onClick={reset}>Reset reading list <ArrowRight size={16} /></button></div>
      )}
      <p className="reading-footnote">A curated snapshot of the society’s Medium publication. Saved stories remain in this browser.</p>
    </div>
  );
}
