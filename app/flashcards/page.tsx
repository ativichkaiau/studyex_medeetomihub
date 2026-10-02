import Link from 'next/link';
import { Fragment } from 'react';
import { lecturesBySubject, subjectByCode, subjectSlug } from '../../content';
import { buildFlashcards } from '../../lib/flashcards/build';
import Page from '../../components/ui/Page';
import PageHeader from '../../components/ui/PageHeader';
import Meta from '../../components/ui/Meta';
import LiveCount from '../../components/overview/LiveCount';
import { yearCode } from '../../lib/paths';
import { pageMeta } from '../../lib/meta';

export const metadata = pageMeta({
  title: 'cards',
  description: 'Active-recall decks built from module content: high-yield points, exam traps, findings, mechanisms and mnemonics, by block or by module.',
  path: '/flashcards',
});

// Mirrors the block deck in app/flashcards/block/[code]/page.tsx.
const PER_MODULE = 2;
const COLS = '84px minmax(0,1fr) 72px 72px 56px';
const COLS_SM = '72px minmax(0,1fr) 40px';

export default function FlashcardsLauncher() {
  const blocks = Object.entries(lecturesBySubject)
    .map(([code, mods]) => {
      const s = subjectByCode[code];
      return {
        code,
        name: s?.name ?? code,
        slug: subjectSlug(code),
        year: s?.year ?? 0,
        yearLabel: s?.yearLabel ?? '',
        modules: mods.length,
        deck: buildFlashcards(mods, PER_MODULE).length,
        all: buildFlashcards(mods).length,
      };
    })
    .sort((a, b) => a.year - b.year || a.code.localeCompare(b.code));
  const years = [...new Set(blocks.map((b) => b.year))];
  const total = blocks.reduce((n, b) => n + b.all, 0);

  return (
    <Page crumbs={[{ label: 'cards' }]} aside={<span>{total.toLocaleString('en-US')} cards indexed</span>}>
      <PageHeader
        kicker={
          <>
            <strong>cards</strong>
            <span>active recall</span>
          </>
        }
        title="Cards"
        lede="Recall decks built from module content: high-yield points, exam traps, findings, mechanisms and mnemonics. A block deck takes the two highest-value cards from each module and reshuffles every run; every module also has its full deck."
      >
        <Meta
          className="mt-5"
          rows={[
            ['cards', `${total.toLocaleString('en-US')} across ${blocks.length} blocks`],
            ['reviewed', <LiveCount key="c" of="cards" />],
            ['keys', 'space reveal · 1 again · 2 good'],
          ]}
        />
      </PageHeader>

      <div className="rows" style={{ ['--cols-lg' as string]: COLS, ['--cols-sm' as string]: COLS_SM }}>
        <div className="row row-head [--cols:var(--cols-sm)] sm:[--cols:var(--cols-lg)]">
          <span>id</span>
          <span>block deck</span>
          <span className="hidden text-right sm:block">modules</span>
          <span className="hidden text-right sm:block">cards</span>
          <span />
        </div>
        {years.map((year) => (
          <Fragment key={year}>
            <div className="row row-group">{year > 0 ? `${yearCode(year, blocks.find((b) => b.year === year)?.yearLabel)} · ${blocks.find((b) => b.year === year)?.yearLabel.toLowerCase()}` : 'other'}</div>
            {blocks
              .filter((b) => b.year === year)
              .map((b) => (
                <Link key={b.code} href={`/flashcards/block/${b.slug}`} className="row group [--cols:var(--cols-sm)] sm:[--cols:var(--cols-lg)]">
                  <span className="cell-id">{b.code}</span>
                  <span className="cell-title">
                    <span className="block truncate">{b.name}</span>
                    <span className="cell-sub sm:hidden">
                      {b.deck} cards · {b.modules} modules
                    </span>
                  </span>
                  <span className="cell-num hidden sm:block">{b.modules}</span>
                  <span className="cell-num hidden sm:block">{b.deck}</span>
                  <span className="cell-go">
                    <span className="hidden opacity-0 transition-opacity group-hover:opacity-100 sm:inline">load </span>
                    <span className="cmd-arrow">→</span>
                  </span>
                </Link>
              ))}
          </Fragment>
        ))}
      </div>
      <p className="mt-3 font-mono text-[11px] text-fg-3"># single-module decks: open any module and choose cards →</p>
    </Page>
  );
}
