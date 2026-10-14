'use client';

import { useId, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Bookmark, Search } from 'lucide-react';
import { useBrowserStore } from '@/lib/browser-store';
import { formatStoryDate } from '@/lib/format';
import { readingListStore } from '@/lib/reading-list';
import type { Story, YouTubeVideo } from '@/lib/content/types';
import { Eyebrow } from './eyebrow';
import { Videos } from './videos';

const ALL = 'All';
const SAVED = 'Saved';
const PAGE_SIZE = 5;

type Props = { stories: Story[]; videos: YouTubeVideo[]; mediumUrl: string };

export function LearnPanel({ stories, videos, mediumUrl }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState(ALL);
  const [page, setPage] = useState(0);
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

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  // Unsaving on the last page can leave it empty; fall back to the last page there is.
  const current = Math.min(page, pageCount - 1);
  const shown = visible.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);
  const search = (value: string) => { setQuery(value); setPage(0); };
  const choose = (value: string) => { setFilter(value); setPage(0); };

  const toggleSaved = (slug: string) => {
    readingListStore.set(saved.includes(slug) ? saved.filter((item) => item !== slug) : [...saved, slug]);
  };
  const reset = () => { setQuery(''); setFilter(ALL); setPage(0); };

  return (
    <div className="learn-panel">
      <div className="panel-heading"><div><Eyebrow>FROM THE COMMUNITY</Eyebrow><h3>Knowledge moves<br /><em>when we share it.</em></h3></div><a href={mediumUrl} target="_blank" rel="noopener noreferrer">All stories on Medium <ArrowUpRight size={16} /></a></div>
      <div className="reading-tools">
        <label className="search-field" htmlFor={inputId}><Search size={17} /><input id={inputId} value={query} onChange={(event) => search(event.target.value)} placeholder="Search the reading list" type="search" /></label>
        <div className="filter-set" role="group" aria-label="Filter stories">
          {filters.map((item) => <button key={item} aria-pressed={filter === item} onClick={() => choose(item)}>{item}{item === SAVED && <span>{saved.length}</span>}</button>)}
        </div>
      </div>
      <p className="result-count" role="status">{visible.length} {visible.length === 1 ? 'STORY' : 'STORIES'} {filter === SAVED ? 'SAVED ON THIS DEVICE' : 'FROM THE SOCIETY'}</p>
      {visible.length ? (
        <>
          <div className="story-list">
            {shown.map((story) => {
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
          {pageCount > 1 && (
            <nav className="story-pages" aria-label="Story pages">
              <button onClick={() => setPage(current - 1)} disabled={current === 0} aria-label="Previous page"><ArrowLeft size={16} /></button>
              {Array.from({ length: pageCount }, (_, index) => (
                <button key={index} onClick={() => setPage(index)} aria-current={index === current ? 'page' : undefined}>{index + 1}</button>
              ))}
              <button onClick={() => setPage(current + 1)} disabled={current === pageCount - 1} aria-label="Next page"><ArrowRight size={16} /></button>
            </nav>
          )}
        </>
      ) : (
        <div className="empty-reading"><BookOpen size={25} /><h4>No stories found.</h4><p>Try a different search or clear the filters.</p><button onClick={reset}>Reset reading list <ArrowRight size={16} /></button></div>
      )}
      <p className="reading-footnote">New posts on the society’s Medium appear here on their own. Saved stories stay in this browser.</p>
      {videos.length > 0 && <Videos videos={videos} />}
    </div>
  );
}
