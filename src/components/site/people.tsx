import type { Member } from '@/lib/content/types';
import { PersonCard } from './person-card';
import { SectionHead } from './section-head';

/** The faculty and students who run the society. */
export function People({ members }: { members: Member[] }) {
  const faculty = members.filter((member) => member.group === 'faculty');
  const students = members.filter((member) => member.group === 'student');

  return (
    <section className="about-section people-section" id="people" aria-labelledby="people-title">
      <SectionHead id="people-title" title={<>The people<br /><em>behind TES.</em></>} lede="Faculty who guide the society and the students who run it day to day." />
      {faculty.length > 0 && (
        <div className="people-group faculty-group" aria-labelledby="faculty-title">
          <div className="people-group-heading"><h3 id="faculty-title">Faculty coordinators</h3></div>
          <div className="people-grid faculty-grid">{faculty.map((member) => <PersonCard member={member} key={member.id} />)}</div>
        </div>
      )}
      {students.length > 0 && (
        <div className="people-group students-group" aria-labelledby="students-title">
          <div className="people-group-heading"><h3 id="students-title">Student team</h3></div>
          <div className="people-grid student-grid">{students.map((member) => <PersonCard member={member} key={member.id} />)}</div>
        </div>
      )}
    </section>
  );
}
