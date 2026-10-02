import Link from 'next/link';
import { notFound } from 'next/navigation';
import { lectures, lectureById, subjectOfSource } from '../../../content';
import { buildFlashcards } from '../../../lib/flashcards/build';
import FlashcardSession from '../../../components/FlashcardSession';
import Page from '../../../components/ui/Page';
import PageHeader from '../../../components/ui/PageHeader';
import { lectureCode, snake } from '../../../lib/paths';

// Every valid page is generated at build time; anything else is a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return lectures.map((l) => ({ id: l.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const l = lectureById[params.id];
  return { title: l ? `cards: ${l.title}` : 'cards' };
}

export default function ModuleFlashcardsPage({ params }: { params: { id: string } }) {
  const l = lectureById[params.id];
  if (!l) notFound();

  const cards = buildFlashcards([l]);
  const code = subjectOfSource[l.source];

  return (
    <Page
      crumbs={[
        { label: 'cards', href: '/flashcards' },
        ...(code ? [{ label: code, href: `/flashcards/block/${code.toLowerCase()}` }] : []),
        { label: snake(l.id) },
      ]}
      width="w-doc"
    >
      <PageHeader
        kicker={
          <>
            <strong>deck</strong>
            <span>{[code, lectureCode(l.source)].filter(Boolean).join('/')}</span>
            <span>·</span>
            <span>
              {cards.length} card{cards.length === 1 ? '' : 's'}
            </span>
          </>
        }
        title={l.title}
        lede="Every card this module yields — high-yield points, traps, findings and mnemonics. Recall, reveal, then grade yourself."
        className="mb-6"
      >
        <p className="mt-3">
          <Link href={`/lecture/${l.id}`} className="cmd">
            ← back to module
          </Link>
        </p>
      </PageHeader>

      <FlashcardSession cards={cards} title={l.title} />
    </Page>
  );
}
