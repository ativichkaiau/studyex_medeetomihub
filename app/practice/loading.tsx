import { Bar, EyebrowHeader, FooterBar, Panel, SkeletonPage, type Vars } from '../../components/Skeleton';

// The question bank. Its three totals rise out of the sheet as columns, each
// extruded to its own height, over the blocks waiting in rows below.
export default function Loading() {
  return (
    <SkeletonPage width="max-w-4xl" label="Loading the question bank…">
      <EyebrowHeader eyebrow={100} title="24%" lines={['98%', '92%', '46%']} />

      <Panel z={10} className="mb-8 grid gap-4 p-5 sm:grid-cols-3">
        {[0, 1, 2].map((n) => (
          <div key={n}>
            <Bar w={72} h={9} />
            <div className="sk-rise mt-2">
              <Bar w={`${46 + n * 8}%`} h={26} z={16 + n * 16} i={n} className="sk-ink sk-column" />
            </div>
            <Bar w={112} h={9} className="mt-2" />
          </div>
        ))}
      </Panel>

      <section>
        <Bar w={112} h={9} className="mb-3" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, n) => (
            <div key={n} className="sk-card sk-z flex items-center justify-between gap-2 p-4" style={{ '--z': 10 + (n % 3) * 4, '--i': n } as Vars}>
              <div className="min-w-0 flex-1">
                <Bar w={34} h={10} className="sk-accent" />
                <Bar w={`${78 - (n % 3) * 12}%`} h={13} className="sk-ink mt-2.5" />
                <Bar w={70} h={9} className="mt-2" />
              </div>
              <div className="grid justify-items-end gap-1.5">
                <Bar w={34} h={9} />
                <Bar w={52} h={9} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <FooterBar className="mt-12" />
    </SkeletonPage>
  );
}
