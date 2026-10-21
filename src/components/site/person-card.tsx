import Image from 'next/image';
import { initials } from '@/lib/format';
import type { Member } from '@/lib/content/types';
import { Orbit } from './orbit';

export function PersonCard({ member }: { member: Member }) {
  const body = (
    <>
      <div className="person-portrait">
        <Orbit count={36} />
        {member.portraitUrl
          ? <Image src={member.portraitUrl} alt={member.name} width={280} height={280} sizes="(max-width: 620px) 50vw, 252px" />
          : <span className="person-initials" aria-hidden="true">{initials(member.name)}</span>}
      </div>
      <h4>{member.name}</h4>
      <p>{member.role}</p>
    </>
  );
  return member.linkedinUrl
    ? <a className="person-card" href={member.linkedinUrl} target="_blank" rel="noopener noreferrer">{body}</a>
    : <div className="person-card">{body}</div>;
}
