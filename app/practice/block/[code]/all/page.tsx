import { notFound } from 'next/navigation';
import { lecturesBySubject, subjectBySlug, subjectSlug } from '../../../../../content';
import { getModuleBank } from '../../../../../lib/questions/bank';
import PracticeSession from '../../../../../components/PracticeSession';
import SessionConfig from '../../../../../components/SessionConfig';
import Page from '../../../../../components/ui/Page';

// Every valid page is generated at build time; anything else is a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(lecturesBySubject).map((code) => ({ code: subjectSlug(code) }));
}

export function generateMetadata({ params }: { params: { code: string } }) {
  const s = subjectBySlug[params.code];
  return { title: s ? `practice: ${s.code} (whole block)` : 'practice' };
}

export default function BlockAllPracticePage({ params }: { params: { code: string } }) {
  const subject = subjectBySlug[params.code];
  if (!subject) notFound();

  const modules = lecturesBySubject[subject.code] ?? [];
  const questions = modules.flatMap((m) => getModuleBank(m.id));
  const subjectOf = Object.fromEntries(modules.map((m) => [m.id, subject.code]));

  return (
    <Page
      crumbs={[
        { label: 'practice', href: '/practice' },
        { label: subject.code, href: `/practice/block/${params.code}` },
        { label: 'all' },
      ]}
      width="w-doc"
    >
      <SessionConfig
        scope={`${subject.code}/*`}
        title={`${subject.name} — whole block`}
        pool={questions.length}
        modules={modules.length}
        mode="mixed · lectures, traps and cross-links"
        back={{ href: `/practice/block/${params.code}`, label: `back to ${subject.code}` }}
      />
      <PracticeSession questions={questions} title={`${subject.name} — whole block`} subjectOf={subjectOf} />
    </Page>
  );
}
