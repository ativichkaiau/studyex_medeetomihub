import Page from '../../components/ui/Page';
import PageHeader from '../../components/ui/PageHeader';
import BlockTable from '../../components/library/BlockTable';
import LibraryTabs from '../../components/library/LibraryTabs';
import { blockRows } from '../../lib/blockRows';
import { INDEX_STATS, TRAP_COUNT } from '../../lib/indexStats';

export const metadata = { title: 'library' };

export default function LibraryPage() {
  const { rows, years } = blockRows();
  const indexed = rows.filter((r) => r.status !== 'empty').length;

  return (
    <Page crumbs={[{ label: 'library' }]} aside={<span>{indexed}/{rows.length} blocks indexed</span>}>
      <PageHeader
        kicker={
          <>
            <strong>library</strong>
            <span>indexed repository</span>
          </>
        }
        title="Library"
        lede={`${INDEX_STATS.lectures.toLocaleString('en-US')} lectures and ${INDEX_STATS.modules.toLocaleString('en-US')} modules across ${indexed} indexed blocks, with ${TRAP_COUNT.toLocaleString('en-US')} exam traps. Open a block for its lecture index.`}
        className="mb-6"
      />
      <div className="mb-6">
        <LibraryTabs current="/library" />
      </div>
      <BlockTable rows={rows} years={years} />
      <p className="mt-4 font-mono text-[11px] leading-5 text-fg-3">
        # indexed = interactive modules · spine = reference outline only · partial = spine with study notes on some chapters
      </p>
    </Page>
  );
}
