import Link from 'next/link';
import { notFound } from 'next/navigation';
import { lectures, lectureById, lectureSetSlug, subjectOfSource, subjectSlug, subjectByCode } from '../../../content';
import LectureBody from '../../../components/LectureBody';
import ActiveIntegrationPanel from '../../../components/ActiveIntegrationPanel';
import ConceptModeController from '../../../components/concept/ConceptModeController';
import BookmarkButton from '../../../components/BookmarkButton';
import AskAboutButton from '../../../components/AskAboutButton';
import ModuleNotes from '../../../components/ModuleNotes';
import VisitTracker from '../../../components/VisitTracker';
import LearningPath from '../../../components/LearningPath';
import DocIndex from '../../../components/DocIndex';
import Page from '../../../components/ui/Page';
import Meta from '../../../components/ui/Meta';
import { onePagerForModule } from '../../../lib/concept/onepagerForModule';
import { buildLearningPath } from '../../../lib/integrations/learningPath';
import { getModuleBank } from '../../../lib/questions/bank';
import { lectureCode, lectureName, snake } from '../../../lib/paths';
import type { Crumb } from '../../../lib/paths';

// Every valid page is generated at build time; anything else is a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return lectures.map((l) => ({ id: l.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const l = lectureById[params.id];
  return { title: l ? l.title : 'module' };
}

export default function LecturePage({ params }: { params: { id: string } }) {
  const l = lectureById[params.id];
  if (!l) notFound();

  const subjectCode = subjectOfSource[l.source];
  const subject = subjectCode ? subjectByCode[subjectCode] : undefined;
  const setHref = `/lecture-set/${lectureSetSlug(l.source)}`;
  const onePager = onePagerForModule(l);
  const learningPath = buildLearningPath(l.id);
  const questions = getModuleBank(l.id).length;

  const crumbs: Crumb[] = [
    { label: 'library', href: '/library' },
    ...(subjectCode ? [{ label: subjectCode, href: `/subject/${subjectSlug(subjectCode)}` }] : []),
    { label: lectureCode(l.source), href: setHref },
    { label: snake(l.id) },
  ];

  return (
    <Page crumbs={crumbs} width="max-w-[1060px]">
      <VisitTracker moduleId={l.id} />
      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_200px] xl:gap-12">
        <article className="min-w-0">
          <header className="mb-8">
            <div className="kicker">
              <strong>module</strong>
              <span>{[subjectCode, lectureCode(l.source)].filter(Boolean).join('/')}</span>
              <span>·</span>
              <span>{l.system}</span>
            </div>
            <h1 className="page-title">{l.title}</h1>
            {l.tags.length ? (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {l.tags.map((t) => (
                  <span key={`${t.kind}-${t.label}`} className="tag" title={t.kind}>
                    {t.label}
                  </span>
                ))}
              </div>
            ) : null}
            <Meta
              className="mt-5"
              rows={[
                ...(subjectCode
                  ? ([
                      [
                        'block',
                        <Link key="b" href={`/subject/${subjectSlug(subjectCode)}`} className="xref">
                          {subjectCode}
                          {subject?.name ? ` — ${subject.name}` : ''}
                        </Link>,
                      ],
                    ] as [string, React.ReactNode][])
                  : []),
                [
                  subject?.yearLabel === 'Reference' ? 'chapter' : 'lecture',
                  <Link key="l" href={setHref} className="xref">
                    {lectureCode(l.source)} — {lectureName(l.source)}
                  </Link>,
                ],
                ['id', snake(l.id)],
                ['traps', String(l.traps.length)],
                ['questions', String(questions)],
                ['updated', l.updated],
              ]}
            />
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href={`/flashcards/${l.id}`} className="btn">
                cards <span aria-hidden="true">→</span>
              </Link>
              <Link href={`/practice/${l.id}`} className="btn">
                practice <span aria-hidden="true">→</span>
              </Link>
              <AskAboutButton />
              <BookmarkButton moduleId={l.id} />
            </div>
          </header>

          <details className="panel mb-8 xl:hidden">
            <summary className="panel-head cursor-pointer select-none border-b-0">index</summary>
            <div className="border-t border-line p-4">
              <DocIndex title="on this page" />
            </div>
          </details>

          <ConceptModeController lecture={l} onePager={onePager} toc>
            <LectureBody lecture={l} toc />
          </ConceptModeController>

          <LearningPath view={learningPath} id="learning-path" />
          <ActiveIntegrationPanel moduleId={l.id} id="integrations" />
          <ModuleNotes moduleId={l.id} id="notes" />
        </article>

        <aside className="hidden xl:block" aria-label="Module index">
          <div className="sticky top-[calc(var(--pathbar-h)+28px)]">
            <DocIndex />
          </div>
        </aside>
      </div>
    </Page>
  );
}
