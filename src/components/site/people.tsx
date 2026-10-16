'use client';

import { ArrowUpRight, GitFork } from 'lucide-react';
import type { Member, SiteLinks } from '@/lib/content/types';
import { Eyebrow } from './eyebrow';
import { MagneticLink } from './magnetic-link';
import type { Navigate } from './navigation';
import { PersonCard } from './person-card';

type Props = { navigate: Navigate; members: Member[]; links: SiteLinks };

/** The faculty and students behind the society, then the way in. */
export function People({ navigate, members, links }: Props) {
  const faculty = members.filter((member) => member.group === 'faculty');
  const students = members.filter((member) => member.group === 'student');

  return (
    <section className="about-section people-section" id="people" aria-labelledby="people-title">
      <div className="people-heading"><div><Eyebrow>03 / THE FACES BEHIND THE CODE</Eyebrow><h3 id="people-title">Meet the collective.</h3></div></div>
      {faculty.length > 0 && (
        <div className="people-group faculty-group" aria-labelledby="faculty-title">
          <div className="people-group-heading"><span>01 / GUIDANCE</span><h4 id="faculty-title">Faculty coordinators</h4><p>The mentors supporting the society.</p></div>
          <div className="people-grid faculty-grid">{faculty.map((member) => <PersonCard member={member} key={member.id} />)}</div>
        </div>
      )}
      {students.length > 0 && (
        <div className="people-group students-group" aria-labelledby="students-title">
          <div className="people-group-heading"><span>02 / THE BUILDERS</span><h4 id="students-title">Student members</h4><p>The students making ideas happen.</p></div>
          <div className="people-grid student-grid">{students.map((member) => <PersonCard member={member} key={member.id} />)}</div>
        </div>
      )}
      <div className="join-band">
        <div className="join-intro">
          <Eyebrow>YOUR NEXT CHAPTER</Eyebrow>
          <h2>Small contributions.<br /><em>Shared progress.</em></h2>
          <p>There is no perfect first step. Pick something small and build alongside the community.</p>
        </div>
        <div className="join-path">
          <span className="join-path-label"><GitFork size={18} /> A WAY IN</span>
          <ol>
            <li><span>01</span>Explore the projects</li>
            <li><span>02</span>Read the contribution guide</li>
            <li><span>03</span>Make your first change</li>
          </ol>
          <div className="join-actions">
            <MagneticLink className="button join-primary" href="#build" onClick={(event) => { event.preventDefault(); navigate('build'); }}>Explore projects <ArrowUpRight size={18} /></MagneticLink>
            <a className="join-secondary" href={links.contributionGuide} target="_blank" rel="noopener noreferrer">Contribution guide <ArrowUpRight size={16} /></a>
          </div>
        </div>
      </div>
    </section>
  );
}
