import { Bar, FooterBar, Lines, LiveryHeader, Panel, ProgressRow, SkeletonPage, type Vars } from '../../../../components/Skeleton';

// Practising one lecture. The answer options flip into place one after
// another, like the tiles of a departures board.
export default function Loading() {
  return (
    <SkeletonPage width="max-w-3xl" label="Loading lecture practice…">
      <LiveryHeader back={70} label={100} title="46%" lines={['93%']} />
      <ProgressRow />

      <Panel z={16} className="p-5">
        <div className="flex items-center gap-2">
          <Bar w={56} h={14} className="sk-accent rounded" />
          <Bar w={52} h={9} />
        </div>
        <Lines widths={['92%', '70%']} h={13} gap={9} className="mt-3" />
        <div className="sk-flaps mt-3 space-y-2">
          {[0, 1, 2, 3].map((n) => (
            <div key={n} className="sk-card sk-z flex items-center gap-2 rounded-lg px-3 py-2.5" style={{ '--z': 8, '--i': n } as Vars}>
              <Bar w={14} h={11} className="sk-ink" />
              <Bar w={`${70 - n * 8}%`} h={11} i={n} />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Bar w={96} h={36} z={14} className="rounded-lg" />
        </div>
      </Panel>

      <FooterBar />
    </SkeletonPage>
  );
}
