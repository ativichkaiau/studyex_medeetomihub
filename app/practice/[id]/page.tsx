import { notFound } from 'next/navigation';
import { lectures, lectureById, subjectOfSource } from '../../../content';
import { getModuleBank } from '../../../lib/questions/bank';
import PracticeSession from '../../../components/PracticeSession';
import SessionConfig from '../../../components/SessionConfig';
import Page from '../../../components/ui/Page';
import { lectureCode, snake } from '../../../lib/paths';
import { pageMeta } from '../../../lib/meta';

// Every valid page is generated at build time; anything else is a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return lectures.map((l) => ({ id: l.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const l = lectureById[params.id];
  if (!l) return { title: 'not found' };
  const n = getModuleBank(l.id).length;
  return pageMeta({
    title: `practice: ${l.title}`,
    description: `${n} practice question${n === 1 ? '' : 's'} on ${l.title}, from its content, exam traps and integration links.`,
    path: `/practice/${l.id}`,
  });
}

export default function ModulePracticePage({ params }: { params: { id: string } }) {
  const l = lectureById[params.id];
  if (!l) notFound();

  const questions = getModuleBank(l.id);
  const code = subjectOfSource[l.source];
  const subjectOf = { [l.id]: code ?? 'unknown' };
  const scope = [code, lectureCode(l.source), snake(l.id)].filter(Boolean).join('/');

  return (
    <Page
      crumbs={[
        { label: 'practice', href: '/practice' },
        ...(code ? [{ label: code, href: `/practice/block/${code.toLowerCase()}` }] : []),
        { label: snake(l.id) },
      ]}
      width="w-doc"
    >
      <SessionConfig
        scope={scope}
        title={l.title}
        pool={questions.length}
        modules={1}
        mode="module · content, traps and links · misses can go to repair"
        back={{ href: `/lecture/${l.id}`, label: 'back to module' }}
      />
      <PracticeSession questions={questions} title={l.title} subjectOf={subjectOf} />
    </Page>
  );
}
