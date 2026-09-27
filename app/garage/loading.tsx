import { Bar, EyebrowHeader, FooterBar, Lines, SkeletonPage, type Vars } from '../../components/Skeleton';

// Saved. Each starred module has its bookmark ribbon hanging in the air above
// it, swaying; the notes lie flat on the sheet below.
export default function Loading() {
  return (
    <SkeletonPage width="max-w-3xl" label="Loading your saved modules…">
      <EyebrowHeader eyebrow={96} title="16%" lines={['64%']} />

      <div className="space-y-8">
        <section>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#ffcc00] opacity-70" />
            <Bar w={140} h={10} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[0, 1, 2, 3].map((n) => (
              <div key={n} className="sk-card sk-z flex items-center gap-2 p-4" style={{ '--z': 12, '--i': n } as Vars}>
                <div className="min-w-0 flex-1">
                  <Bar w={`${76 - n * 9}%`} h={12} className="sk-ink" />
                  <Bar w="48%" h={9} className="mt-2" />
                </div>
                <Bar w={34} h={16} className="rounded" />
                <div className="sk-wave">
                  <span className="sk-ribbon sk-z" style={{ '--z': 34, '--i': n, '--amp': 16 } as Vars} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)] opacity-70" />
            <Bar w={70} h={10} className="sk-accent" />
          </div>
          <div className="space-y-2.5">
            {[0, 1].map((n) => (
              <div key={n} className="sk-card sk-z p-4" style={{ '--z': 6 } as Vars}>
                <div className="flex items-center justify-between gap-2">
                  <Bar w={`${46 - n * 8}%`} h={12} className="sk-ink" />
                  <Bar w={34} h={16} className="rounded" />
                </div>
                <Lines widths={['92%', '58%']} h={10} gap={9} i={n * 2} className="mt-3" />
              </div>
            ))}
          </div>
        </section>
      </div>

      <FooterBar />
    </SkeletonPage>
  );
}
