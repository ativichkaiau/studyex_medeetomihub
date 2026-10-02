import { notFound, permanentRedirect } from 'next/navigation';
import { lectureSets, lectureSetBySlug, lectureSetRedirects, subjectOfSource, subjectSlug, subjectByCode } from '../../../../content';
import { getModuleBank } from '../../../../lib/questions/bank';
import PracticeSession from '../../../../components/PracticeSession';
import SessionConfig from '../../../../components/SessionConfig';
import Page from '../../../../components/ui/Page';
import { lectureCode, lectureName } from '../../../../lib/paths';
import { pageMeta } from '../../../../lib/meta';

// Every valid page is generated at build time; anything else is a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return lectureSets.map((s) => ({ set: s.slug }));
}

export function generateMetadata({ params }: { params: { set: string } }) {
  const s = lectureSetBySlug[lectureSetRedirects[params.set] ?? params.set];
  if (!s) return { title: 'not found' };
  const total = s.items.reduce((n, m) => n + getModuleBank(m.id).length, 0);
  return pageMeta({
    title: `practice: ${s.source}`,
    description: `${total.toLocaleString('en-US')} questions across ${s.items.length} module${s.items.length === 1 ? '' : 's'} in ${s.source}, up to ${Math.min(20, total)} per session.`,
    path: `/practice/lecture/${s.slug}`,
  });
}

export default function LecturePracticePage({ params }: { params: { set: string } }) {
  const redirect = lectureSetRedirects[params.set];
  if (redirect) permanentRedirect(`/practice/lecture/${redirect}`);
  const set = lectureSetBySlug[params.set];
  if (!set) notFound();

  const questions = set.items.flatMap((m) => getModuleBank(m.id));
  const subjectCode = subjectOfSource[set.source] ?? 'unknown';
  const unit = subjectByCode[subjectCode]?.yearLabel === 'Reference' ? 'chapter' : 'lecture';
  const subjectOf = Object.fromEntries(set.items.map((m) => [m.id, subjectCode]));
  const known = subjectCode !== 'unknown';
  const code = lectureCode(set.source);

  return (
    <Page
      crumbs={[
        { label: 'practice', href: '/practice' },
        ...(known ? [{ label: subjectCode, href: `/practice/block/${subjectSlug(subjectCode)}` }] : []),
        { label: code },
      ]}
      width="w-doc"
    >
      <SessionConfig
        scope={known ? `${subjectCode}/${code}` : code}
        title={lectureName(set.source)}
        pool={questions.length}
        modules={set.items.length}
        mode={`${unit} · every module in it`}
        back={{ href: `/lecture-set/${params.set}`, label: `back to ${unit}` }}
      />
      <PracticeSession questions={questions} title={set.source} subjectOf={subjectOf} />
    </Page>
  );
}
