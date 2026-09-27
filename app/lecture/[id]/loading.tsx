import { Bar, Label, Lines, Panel, SkeletonPage } from '../../../components/Skeleton';

// A lecture. The study sections stack up the sheet, and the mechanism chain
// climbs off it one link at a time — each step a little higher than the last,
// the way the causal story builds.
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
        <Bar h={4} z={10} className="sk-livery mb-4 rounded-full" />
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[var(--accent)] opacity-60" />
          <Bar w={160} h={10} className="sk-accent" />
        </div>
        <div className="mt-2 flex items-start justify-between gap-3">
          <Bar w="54%" h={32} z={10} className="sk-ink" />
          <div className="flex shrink-0 gap-2">
            {[64, 78, 36, 36].map((w, n) => (
              <Bar key={n} w={w} h={36} z={14 + n * 3} i={n} className="rounded-lg" />
            ))}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[70, 96, 84, 110].map((w, n) => (
            <Bar key={n} w={w} h={20} i={n} className="rounded-full" />
          ))}
        </div>
      </header>

      <Panel z={10} className="mb-5 p-3">
        <div className="mb-2 flex justify-between gap-2">
          <Bar w={100} h={10} />
          <Bar w={140} h={10} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[82, 74, 90, 70].map((w, n) => (
            <Bar key={n} w={w} h={28} z={6} i={n} className="rounded-lg" />
          ))}
        </div>
      </Panel>

      <div className="space-y-5">
        <Panel z={16} className="p-5">
          <Label w={150} dot="bg-amber-500" />
          <Lines widths={['94%', '88%', '97%', '76%', '90%', '64%']} h={11} gap={11} className="pl-5" />
        </Panel>

        <Panel z={20} className="p-5">
          <Label w={210} dot="bg-teal-500" />
          <div className="flex flex-wrap items-center gap-2">
            {[118, 96, 132, 104, 124, 90].map((w, n) => (
              <div key={n} className="flex items-center gap-2">
                <Bar w={w} h={36} z={6 + n * 9} i={n} className="rounded-lg" />
                {n < 5 ? <Bar w={12} h={2} /> : null}
              </div>
            ))}
          </div>
          <div className="mt-4 border-l-2 border-dashed border-[var(--line)] pl-4">
            <Bar w={90} h={9} className="mb-2" />
            <div className="flex flex-wrap gap-2">
              <Bar w={120} h={34} z={12} className="rounded-lg" />
              <Bar w={140} h={34} z={20} className="rounded-lg" />
            </div>
          </div>
        </Panel>

        <Panel z={14} className="p-5">
          <Label w={230} dot="bg-sky-500" />
          <div className="divide-y divide-[var(--line)]">
            {[0, 1, 2, 3, 4].map((n) => (
              <div key={n} className="flex items-center gap-3 py-2.5">
                <Bar w={46} h={18} className="shrink-0 rounded-md" />
                <Bar w={`${84 - (n % 3) * 14}%`} h={11} i={n} />
              </div>
            ))}
          </div>
        </Panel>

        <div className="grid gap-5 sm:grid-cols-2">
          {['bg-violet-500', 'bg-emerald-500'].map((dot, c) => (
            <Panel key={dot} z={12} className="p-5">
              <Label w={110} dot={dot} />
              <Lines widths={['92%', '78%', '86%', '60%']} h={10} gap={10} i={c * 4} />
            </Panel>
          ))}
        </div>
      </div>
    </SkeletonPage>
  );
}
