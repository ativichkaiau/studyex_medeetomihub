import { Bar, Label, Lines, Panel, SkeletonPage, type Vars } from '../../../components/Skeleton';

// A whole lecture on one scroll. Its topics arrive as a stack of sheets, each
// set further back than the one before, with the jump links floating above
// them like tabs.
export default function Loading() {
  return (
    <SkeletonPage width="max-w-3xl" label="Loading the lecture…">
      <nav className="flex flex-wrap items-center gap-2">
        <Bar w={62} h={12} />
        <Bar w={7} h={7} />
        <Bar w={190} h={12} className="sk-accent" />
        <Bar w={44} h={18} z={8} className="rounded-lg" />
      </nav>

      <header className="mb-6 mt-4">
        <Bar h={6} z={10} className="sk-livery mb-4 rounded-full" />
        <div className="flex items-center gap-2.5">
          <span className="h-3.5 w-3.5 shrink-0 rounded-full bg-[var(--accent)] opacity-60" />
          <Bar w="42%" h={30} z={10} className="sk-ink" />
          <Bar w={72} h={22} z={14} className="rounded-lg" />
        </div>
        <Bar w="66%" h={11} className="mt-3" />
        <Bar w={168} h={30} z={12} className="sk-accent mt-3 rounded-lg" />
        <nav className="mt-4 flex flex-wrap gap-2">
          {[120, 96, 140, 108, 132, 88].map((w, n) => (
            <Bar key={n} w={w} h={30} z={12 + (n % 3) * 9} i={n} className="rounded-lg" />
          ))}
        </nav>
      </header>

      <div className="space-y-12">
        {[0, 1, 2].map((s) => (
          <section key={s} className="sk-z" style={{ '--z': 18 - s * 18 } as Vars}>
            <Bar w={64} h={4} className="sk-livery mb-3 rounded-full" />
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 shrink-0 rounded-full bg-[var(--accent)] opacity-60" />
                <Bar w={220 - s * 30} h={22} className="sk-ink" />
              </div>
              <Bar w={132} h={28} className="rounded-lg" />
            </div>
            <Panel z={10} className="p-5">
              <Label w={150} dot="bg-amber-500" />
              <Lines widths={['95%', '86%', '91%', '72%']} h={11} gap={11} i={s * 4} className="pl-5" />
            </Panel>
          </section>
        ))}
      </div>
    </SkeletonPage>
  );
}
