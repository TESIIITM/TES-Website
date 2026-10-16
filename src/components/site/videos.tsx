'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight, Play } from 'lucide-react';
import type { YouTubeVideo } from '@/lib/content/types';
import { youtubeWatchUrl } from '@/lib/youtube';

/**
 * Videos under the Learn panel. Each shows its stored thumbnail until a visitor
 * presses play, so nothing loads from YouTube before then. The player comes
 * from youtube-nocookie.com, the only frame source the CSP allows.
 */
export function Videos({ videos }: { videos: YouTubeVideo[] }) {
  const [playing, setPlaying] = useState<string | null>(null);

  return (
    <div className="video-strip">
      <span className="video-strip-label"><Play size={13} /> FROM THE CHANNEL</span>
      <ul className="video-grid">
        {videos.map((video) => (
          <li key={video.id}>
            <div className="video-frame">
              {playing === video.id ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1&rel=0`}
                  title={video.title}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : (
                <button type="button" onClick={() => setPlaying(video.id)} aria-label={`Play ${video.title}`}>
                  {video.thumbnailUrl && <Image src={video.thumbnailUrl} alt="" fill sizes="(max-width: 620px) 90vw, (max-width: 1100px) 45vw, 460px" />}
                  <span className="video-play" aria-hidden="true"><Play size={22} fill="currentColor" /></span>
                </button>
              )}
            </div>
            {video.channel && <span className="video-channel">{video.channel}</span>}
            <h4><a href={youtubeWatchUrl(video.videoId)} target="_blank" rel="noopener noreferrer">{video.title} <ArrowUpRight size={16} /></a></h4>
          </li>
        ))}
      </ul>
    </div>
  );
}
