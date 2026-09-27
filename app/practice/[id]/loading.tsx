import { Bar, FooterBar, Lines, LiveryHeader, Panel, ProgressRow, SkeletonPage, type Vars } from '../../../components/Skeleton';

// A practice run. The question card stands off the sheet and its answer
// options climb toward you in steps, one per choice.
export default function Loading() {
  return (
    <SkeletonPage width="max-w-3xl" label="Loading practice questions…">
      <LiveryHeader back={170} label={60} title="60%" lines={['95%', '66%']} />
      <ProgressRow />

      <Panel z={16} className="p-5">
        <div className="flex items-center gap-2">
          <Bar w={56} h={14} className="sk-accent rounded" />
          <Bar w={52} h={9} />
        </div>
        <Lines widths={['96%', '74%']} h={13} gap={9} className="mt-3" />
        <div className="mt-3 space-y-2">
          {[0, 1, 2, 3].map((n) => (
            <div key={n} className="sk-card sk-z flex items-center gap-2 rounded-lg px-3 py-2.5" style={{ '--z': 6 + n * 11 } as Vars}>
              <Bar w={14} h={11} className="sk-ink" />
              <Bar w={`${68 - n * 9}%`} h={11} i={n} />
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
