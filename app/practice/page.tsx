import Link from 'next/link';
import { Fragment } from 'react';
import { lecturesBySubject, subjectByCode, subjectSlug } from '../../content';
import PracticeLauncher from '../../components/PracticeLauncher';
import Page from '../../components/ui/Page';
import PageHeader from '../../components/ui/PageHeader';
import Meta from '../../components/ui/Meta';
import { getModuleBank } from '../../lib/questions/bank';
import { yearCode } from '../../lib/paths';
import { pageMeta } from '../../lib/meta';

export const metadata = pageMeta({
  title: 'practice',
  description: 'Question sessions sampled from the module bank: content, exam traps and integration links, by block, lecture or module.',
  path: '/practice',
});

const COLS = '84px minmax(0,1fr) 72px 88px 56px';
const COLS_SM = '72px minmax(0,1fr) 40px';

export default function PracticePage() {
  const blocks = Object.entries(lecturesBySubject)
    .map(([code, mods]) => {
      const questionCount = mods.reduce((sum, module) => sum + getModuleBank(module.id).length, 0);
      return {
        code,
        name: subjectByCode[code]?.name ?? code,
        slug: subjectSlug(code),
        year: subjectByCode[code]?.year ?? 0,
        yearLabel: subjectByCode[code]?.yearLabel ?? '',
        moduleCount: mods.length,
        questionCount,
      };
    })
    .sort((a, b) => a.year - b.year || a.code.localeCompare(b.code));
  const totalQuestions = blocks.reduce((sum, block) => sum + block.questionCount, 0);
  const totalModules = blocks.reduce((sum, block) => sum + block.moduleCount, 0);
  const years = [...new Set(blocks.map((b) => b.year))];

  return (
    <Page crumbs={[{ label: 'practice' }]} aside={<span>{totalQuestions.toLocaleString('en-US')} questions live</span>}>
      <PageHeader
        kicker={
          <>
            <strong>practice</strong>
            <span>question bank</span>
          </>
        }
        title="Practice"
        lede="Run a session against the question bank built from module content, exam traps and integration links. Each run samples 20 questions from the pool you pick, biased toward the links you keep missing."
      >
        <Meta
          className="mt-5"
          rows={[
            ['bank', `${totalQuestions.toLocaleString('en-US')} questions`],
            ['coverage', `${totalModules.toLocaleString('en-US')} modules`],
            ['session', '20 questions · reshuffled every run'],
            ['keys', 'a–e answer · enter next'],
          ]}
        />
      </PageHeader>

      <PracticeLauncher />

      <h2 className="sec-label">
        <span>scope: block</span>
        <span className="sec-meta">{blocks.length} blocks</span>
      </h2>
      <div className="rows" style={{ ['--cols-lg' as string]: COLS, ['--cols-sm' as string]: COLS_SM }}>
        <div className="row row-head [--cols:var(--cols-sm)] sm:[--cols:var(--cols-lg)]">
          <span>id</span>
          <span>block</span>
          <span className="hidden text-right sm:block">modules</span>
          <span className="hidden text-right sm:block">questions</span>
          <span />
        </div>
        {years.map((year) => {
          const group = blocks.filter((b) => b.year === year);
          return (
            <Fragment key={year}>
              <div className="row row-group">{year > 0 ? `${yearCode(year, group[0]?.yearLabel)} · ${group[0]?.yearLabel.toLowerCase()}` : 'other'}</div>
              {group.map((b) => (
                <Link key={b.code} href={`/practice/block/${b.slug}`} className="row group [--cols:var(--cols-sm)] sm:[--cols:var(--cols-lg)]">
                  <span className="cell-id">{b.code}</span>
                  <span className="cell-title">
                    <span className="block truncate">{b.name}</span>
                    <span className="cell-sub sm:hidden">
                      {b.questionCount.toLocaleString('en-US')} questions · {b.moduleCount} modules
                    </span>
                  </span>
                  <span className="cell-num hidden sm:block">{b.moduleCount}</span>
                  <span className="cell-num hidden sm:block">{b.questionCount.toLocaleString('en-US')}</span>
                  <span className="cell-go">
                    <span className="hidden opacity-0 transition-opacity group-hover:opacity-100 sm:inline">run </span>
                    <span className="cmd-arrow">→</span>
                  </span>
                </Link>
              ))}
            </Fragment>
          );
        })}
      </div>
    </Page>
  );
}
