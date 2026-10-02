import Link from 'next/link';
import { lecturesBySubject, subjectSlug } from '../../../content';
import { onePagerGroups, onePagerYears } from '../../../content/onepagers';
import Page from '../../../components/ui/Page';
import PageHeader from '../../../components/ui/PageHeader';
import LibraryTabs from '../../../components/library/LibraryTabs';
import Meta from '../../../components/ui/Meta';
import { pageMeta } from '../../../lib/meta';

export const metadata = pageMeta({
  title: 'onepagers',
  description: 'The OnePager archive: compiled one-page summaries per subject, kept in Google Drive and linked to the interactive library.',
  path: '/library/onepagers',
});

// The OnePager archive: the user's own compiled summaries, kept in Google
// Drive per term/module folder. Each folder is listed as an artifact with the
// subjects it holds; subjects that also have interactive modules link in.
export default function OnePagerArchive() {
  const linked = onePagerGroups.filter((g) => g.driveUrl).length;
  const subjects = onePagerGroups.reduce((n, g) => n + g.subjects.length, 0);

  return (
    <Page crumbs={[{ label: 'library', href: '/library' }, { label: 'onepagers' }]} aside={<span>{linked}/{onePagerGroups.length} folders linked</span>}>
      <PageHeader
        kicker={
          <>
            <strong>onepager_archive</strong>
            <span>compiled artifacts</span>
          </>
        }
        title="OnePagers"
        lede="Your one-page summaries, compiled per subject and kept in Google Drive. The interactive library supplements them; it does not replace them."
        className="mb-6"
      >
        <Meta
          className="mt-5"
          rows={[
            ['source', 'google drive · opens externally'],
            ['folders', `${linked} linked · ${onePagerGroups.length - linked} pending`],
            ['subjects', String(subjects)],
          ]}
        />
      </PageHeader>
      <div className="mb-6">
        <LibraryTabs current="/library/onepagers" />
      </div>

      <div className="grid gap-8">
        {onePagerYears.map((year) => {
          const groups = onePagerGroups.filter((g) => g.year === year);
          return (
            <section key={year} aria-labelledby={`op-y${year}`} className="min-w-0">
              <h2 id={`op-y${year}`} className="sec-label">
                <span className="sec-no">Y{year}</span>
                <span>year {year}</span>
                <span className="sec-meta">{groups.filter((g) => g.driveUrl).length}/{groups.length} folders linked</span>
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {groups.map((g) => {
                  const folder = `onepagers/Y${year}/${g.term.toLowerCase().replace(/\s+/g, '_')}/`;
                  return (
                    <article key={`${g.year}-${g.term}`} className="panel min-w-0">
                      <div className="panel-head">
                        <span className="panel-title normal-case tracking-normal">{folder}</span>
                        {g.driveUrl ? <span className="tag tag-ok">linked</span> : <span className="tag tag-muted">pending</span>}
                      </div>
                      <div className="px-3.5 py-2.5">
                        <ul className="tree">
                          {g.subjects.map((s, i) => {
                            const glyph = i === g.subjects.length - 1 ? '└── ' : '├── ';
                            const indexed = (lecturesBySubject[s.code]?.length ?? 0) > 0;
                            return (
                              <li key={s.code} className="tree-row gap-0">
                                <span className="tree-glyph">{glyph}</span>
                                <span className="w-[64px] flex-none text-fg">{s.code}</span>
                                <span className="min-w-0 flex-1 truncate font-sans text-[13px] text-fg-2">{s.name}</span>
                                {indexed ? (
                                  <Link href={`/subject/${subjectSlug(s.code)}`} className="cmd ml-2 text-[11px]">
                                    study <span className="cmd-arrow">→</span>
                                  </Link>
                                ) : null}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                      <div className="flex items-center justify-between gap-3 border-t border-line px-3.5 py-2.5 font-mono text-[11px] text-fg-3">
                        <span>
                          artifact <span className="text-fg-2">onepager</span> · {g.subjects.length} subject{g.subjects.length === 1 ? '' : 's'}
                        </span>
                        {g.driveUrl ? (
                          <a href={g.driveUrl} target="_blank" rel="noopener noreferrer" className="cmd">
                            open folder <span className="cmd-arrow">↗</span>
                          </a>
                        ) : (
                          <span>folder not linked yet</span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </Page>
  );
}
