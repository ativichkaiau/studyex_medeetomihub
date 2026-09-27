import { Bar, EyebrowHeader, FooterBar, Label, Panel, SkeletonPage, type Vars } from '../../components/Skeleton';

// The repair queue. Tickets are stacked in priority order, and the top one
// keeps sliding out of the stack toward you — the next thing to fix.
export default function Loading() {
  return (
    <SkeletonPage width="max-w-3xl" label="Loading your repair queue…">
      <EyebrowHeader eyebrow={100} title="32%" lines={['97%', '90%', '40%']} />

      <Panel z={12} className="mb-4 p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <Label w={170} dot="bg-emerald-500" className="" />
          <Bar w={76} h={24} z={8} className="rounded-lg" />
        </div>
        <Bar w={110} h={28} z={10} className="sk-accent rounded-lg" />
      </Panel>

      <Panel z={10} className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <Label w={110} dot="bg-rose-500" className="" />
          <Bar w={90} h={9} />
        </div>
        <ul className="space-y-2.5">
          {[0, 1, 2, 3].map((n) => (
            <li
              key={n}
              className={`sk-card sk-z rounded-lg p-4 ${n === 0 ? 'sk-pull' : ''}`}
              style={{ '--z': n === 0 ? 26 : 14 - n * 4, '--i': n } as Vars}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Bar w={40} h={16} className={`rounded ${n < 2 ? 'bg-rose-500/25' : ''}`} />
                <Bar w={90} h={10} />
                <Bar w={150 - n * 14} h={12} className="sk-ink" />
                <Bar w={34} h={16} className="rounded" />
                <Bar w={60} h={24} className="ml-auto rounded-lg" />
              </div>
              <Bar w={`${84 - n * 10}%`} h={10} className="mt-3" />
            </li>
          ))}
        </ul>
      </Panel>

      <FooterBar />
    </SkeletonPage>
  );
}
