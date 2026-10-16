import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { Instagram } from '@/components/brand-icons';
import { formatStoryDate } from '@/lib/format';
import type { InstagramPost } from '@/lib/content/types';

type Props = { posts: InstagramPost[]; instagramUrl: string };

/** Recent posts under the Gather panel, each linking to the post on Instagram. */
export function InstagramPosts({ posts, instagramUrl }: Props) {
  return (
    <div className="instagram-strip">
      <div className="instagram-strip-head">
        <span><Instagram size={15} /> ON INSTAGRAM</span>
        <a className="text-action" href={instagramUrl} target="_blank" rel="noopener noreferrer">Follow the society <ArrowUpRight size={16} /></a>
      </div>
      <ul className="instagram-grid">
        {posts.map((post) => (
          <li key={post.id}>
            <a className="instagram-card" href={post.url} target="_blank" rel="noopener noreferrer" aria-label={post.caption ? undefined : `Instagram post from ${formatStoryDate(post.postedOn)}`}>
              <div className="instagram-image">
                {post.imageUrl
                  ? <Image src={post.imageUrl} alt="" fill sizes="(max-width: 620px) 45vw, (max-width: 1100px) 22vw, 340px" />
                  : <Instagram size={34} strokeWidth={1.25} aria-hidden="true" />}
              </div>
              <span>{formatStoryDate(post.postedOn)}</span>
              {post.caption && <p>{post.caption}</p>}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
