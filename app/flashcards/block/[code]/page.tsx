import Link from 'next/link';
import { notFound } from 'next/navigation';
import { lecturesBySubject, subjectBySlug, subjectSlug } from '../../../../content';
import { buildFlashcards } from '../../../../lib/flashcards/build';
import FlashcardSession from '../../../../components/FlashcardSession';
import Page from '../../../../components/ui/Page';
import PageHeader from '../../../../components/ui/PageHeader';

// Every valid page is generated at build time; anything else is a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(lecturesBySubject).map((code) => ({ code: subjectSlug(code) }));
}

export function generateMetadata({ params }: { params: { code: string } }) {
  const s = subjectBySlug[params.code];
  return { title: s ? `cards: ${s.code}` : 'cards' };
}

// Keep block decks focused: a couple of the highest-value cards per topic.
const PER_MODULE = 2;

export default function BlockFlashcardsPage({ params }: { params: { code: string } }) {
  const subject = subjectBySlug[params.code];
  if (!subject) notFound();

  const modules = lecturesBySubject[subject.code] ?? [];
  if (modules.length === 0) notFound();

  const cards = buildFlashcards(modules, PER_MODULE);

  return (
    <Page crumbs={[{ label: 'cards', href: '/flashcards' }, { label: subject.code }]} width="w-doc">
      <PageHeader
        kicker={
          <>
            <strong>block deck</strong>
            <span>{subject.code}</span>
            <span>·</span>
            <span>{cards.length} cards</span>
          </>
        }
        title={subject.name}
        lede={`${cards.length} cards across ${modules.length} modules — up to ${PER_MODULE} of the highest-value cards each, reshuffled every run.`}
        className="mb-6"
      >
        <p className="mt-3">
          <Link href={`/subject/${params.code}`} className="cmd">
            ← back to {subject.code}
          </Link>
        </p>
      </PageHeader>

      <FlashcardSession cards={cards} title={`${subject.code} — ${subject.name}`} />
    </Page>
  );
}
