import { Bar, FooterBar, Lines, LiveryHeader, Panel, ProgressRow, SkeletonPage, type Vars } from '../../../../../components/Skeleton';

// A mixed run from the whole block. The question sits on top of the pool it
// was drawn from — a deep pile of cards squared up behind it.
export default function Loading() {
  return (
    <SkeletonPage width="max-w-3xl" label="Loading a mixed practice set…">
      <LiveryHeader back={60} label={140} title="50%" lines={['96%', '88%', '30%']} pill />

      <Panel z={8} className="mb-4 flex flex-wrap items-center justify-between gap-2 p-3">
        <Bar w="58%" h={10} />
        <Bar w={150} h={10} className="sk-accent" />
      </Panel>
      <ProgressRow />

      <div className="relative">
        {[4, 3, 2, 1].map((n) => (
          <div key={n} className="sk-card sk-fan-card" style={{ '--fx': n * 4, '--fy': n * 6, '--z': -n * 12 } as Vars} />
        ))}
        <Panel z={18} className="relative p-5">
          <div className="flex items-center gap-2">
            <Bar w={56} h={14} className="sk-accent rounded" />
            <Bar w={52} h={9} />
          </div>
          <Lines widths={['94%', '62%']} h={13} gap={9} className="mt-3" />
          <div className="mt-3 space-y-2">
            {[0, 1, 2, 3].map((n) => (
              <div key={n} className="sk-card sk-z flex items-center gap-2 rounded-lg px-3 py-2.5" style={{ '--z': 6 } as Vars}>
                <Bar w={14} h={11} className="sk-ink" />
                <Bar w={`${64 - n * 7}%`} h={11} i={n} />
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <Bar w={96} h={36} z={12} className="rounded-lg" />
          </div>
        </Panel>
      </div>

      <FooterBar />
    </SkeletonPage>
  );
}
