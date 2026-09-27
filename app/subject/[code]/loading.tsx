import { Bar, EyebrowHeader, Label, Lines, Panel, SkeletonPage, type Vars } from '../../../components/Skeleton';

// A block. Its map hangs in the air above the sheet as a slow constellation —
// the lectures on their posts, the links between them drawn on the sheet —
// over the grid of topics rising below.
const NODES = [
  { x: 11, y: 26, w: 104 },
  { x: 31, y: 64, w: 96 },
  { x: 45, y: 18, w: 118 },
  { x: 60, y: 56, w: 102 },
  { x: 76, y: 24, w: 110 },
  { x: 86, y: 70, w: 90 },
  { x: 15, y: 80, w: 84 },
];
const EDGES = [
  [0, 1],
  [0, 2],
  [2, 3],
  [1, 3],
  [2, 4],
  [3, 5],
  [4, 5],
  [1, 6],
];

export default function Loading() {
  return (
    <SkeletonPage width="max-w-5xl" label="Loading the block…">
      <Bar w={150} h={12} />
      <div className="mt-5">
        <EyebrowHeader eyebrow={70} title="46%" lines={['58%']} className="mb-4" />
        <div className="mb-8 flex flex-wrap gap-2">
          <Bar w={104} h={36} z={14} className="rounded-lg" />
          <Bar w={150} h={36} z={20} className="rounded-lg" />
        </div>
      </div>

      <Panel z={12} className="mb-8 p-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <Label w={90} dot="bg-fuchsia-500" className="" />
          <Bar w={150} h={9} />
        </div>
        <div className="relative h-60">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {EDGES.map(([a, b]) => (
              <line
                key={`${a}-${b}`}
                x1={NODES[a].x}
                y1={NODES[a].y}
                x2={NODES[b].x}
                y2={NODES[b].y}
                style={{ stroke: 'var(--line)', strokeWidth: 1.5 }}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
          <div className="sk-orbit absolute inset-0">
            {NODES.map((node, n) => (
              <span
                key={n}
                className="sk sk-z absolute h-7 rounded-lg"
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  width: node.w,
                  marginLeft: -node.w / 2,
                  marginTop: -14,
                  '--z': 18 + (n % 4) * 14,
                  '--i': n,
                } as Vars}
              />
            ))}
          </div>
        </div>
      </Panel>

      <Panel z={14} className="mb-8 p-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <Label w={140} dot="bg-[#ffcc00]" className="" />
          <Bar w={90} h={9} />
        </div>
        <Bar w="58%" h={10} className="mb-3 mt-1" />
        <div className="grid gap-2 sm:grid-cols-2">
          {[0, 1, 2, 3].map((n) => (
            <div key={n} className="sk-card sk-z flex items-center gap-3 rounded-lg px-3 py-2.5" style={{ '--z': 8 + n * 4 } as Vars}>
              <span className="h-6 w-6 shrink-0 rounded-full bg-[#ffcc00] opacity-30" />
              <Bar w={`${70 - n * 8}%`} h={11} i={n} />
            </div>
          ))}
        </div>
      </Panel>

      {[0, 1].map((g) => (
        <section key={g} className="mb-9">
          <Bar w={48} h={4} className="sk-livery mb-3 rounded-full" />
          <div className="mb-4 flex items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded-full bg-[var(--accent)] opacity-60" />
            <Bar w={180} h={14} className="sk-accent" />
            <Bar w={28} h={20} className="rounded-lg" />
          </div>
          <div className="sk-rise grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((n) => (
              <div key={n} className="sk-card sk-z flex flex-col p-5" style={{ '--z': 12, '--i': g * 3 + n } as Vars}>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--accent)] opacity-60" />
                  <Bar w="62%" h={13} className="sk-ink" />
                </div>
                <Lines widths={['94%', '70%']} h={10} className="mt-2.5" />
                <div className="mt-3 flex gap-1.5">
                  <Bar w={70} h={18} className="rounded-full" />
                  <Bar w={84} h={18} className="rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </SkeletonPage>
  );
}
