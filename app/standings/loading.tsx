import { Bar, EyebrowHeader, FooterBar, Label, Panel, SkeletonPage, type Vars } from '../../components/Skeleton';

// Progress. The four headline numbers stand up as a bar chart — each tile
// extruded to its own height — above the block-by-block coverage.
export default function Loading() {
  return (
    <SkeletonPage width="max-w-4xl" label="Loading your progress…">
      <EyebrowHeader eyebrow={96} title="30%" lines={['96%', '52%']} />

      <div className="space-y-6">
        <div className="sk-rise grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[40, 22, 31, 14].map((z, n) => (
            <div key={n} className="sk-card sk-column sk-z rounded-lg px-4 py-4" style={{ '--z': z, '--i': n } as Vars}>
              <Bar w={70} h={9} />
              <Bar w={54} h={24} className={`mt-2 ${n === 0 ? 'bg-[#ffcc00]/30' : 'sk-ink'}`} />
              <Bar w={60} h={9} className="mt-1.5" />
            </div>
          ))}
        </div>

        <Panel z={12} className="p-5">
          <Label w={150} dot="bg-[#ffcc00]" className="mb-1" />
          <Bar w="70%" h={10} className="mb-3 mt-2" />
          <div className="space-y-3">
            {[0, 1, 2].map((n) => (
              <div key={n}>
                <div className="mb-1.5 flex gap-2">
                  <Bar w={36} h={10} className="sk-accent" />
                  <Bar w={110} h={10} />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[120, 96, 140].map((w, k) => (
                    <Bar key={k} w={w - n * 8} h={24} z={6 + k * 4} i={n * 3 + k} className="rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel z={10} className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Label w={60} dot="bg-[#ffcc00]" className="" />
            <Bar w={80} h={9} />
          </div>
          <div className="space-y-1.5">
            {Array.from({ length: 6 }, (_, n) => (
              <div key={n} className="sk-card sk-z flex items-center gap-3 rounded-lg px-3 py-2.5" style={{ '--z': 4, '--i': n } as Vars}>
                <Bar w={16} h={10} />
                <div className="min-w-0 flex-1">
                  <div className="flex gap-2">
                    <Bar w={36} h={10} className="sk-accent" />
                    <Bar w={140} h={10} />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="sk-well h-1.5 flex-1 overflow-hidden rounded-full">
                      <span className="block h-full rounded-full bg-[var(--accent)] opacity-40" style={{ width: `${86 - n * 13}%` }} />
                    </div>
                    <Bar w={36} h={9} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <FooterBar />
    </SkeletonPage>
  );
}
