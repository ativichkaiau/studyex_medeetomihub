import { Bar, FooterBar, Lines, LiveryHeader, ProgressRow, SkeletonPage, type Vars } from '../../../../components/Skeleton';

// A block deck. Cards from every topic are fanned out beneath the top card and
// the hand slowly opens and closes — a whole block, shuffled.
const FAN = [
  { r: -9, fx: -48, fy: 12, z: -36 },
  { r: -4, fx: -24, fy: 5, z: -18 },
  { r: 4, fx: 24, fy: 5, z: -18 },
  { r: 9, fx: 48, fy: 12, z: -36 },
];

export default function Loading() {
  return (
    <SkeletonPage width="max-w-2xl" label="Loading block flashcards…">
      <LiveryHeader back={200} label={110} title="54%" lines={['90%']} />
      <ProgressRow />

      <div className="sk-fan relative">
        {FAN.map((f, n) => (
          <div key={n} className="sk-card sk-fan-card" style={{ '--r': f.r, '--fx': f.fx, '--fy': f.fy, '--z': f.z } as Vars} />
        ))}
        <div
          className="sk-card sk-z relative flex min-h-[16rem] flex-col items-center justify-center gap-4 p-8"
          style={{ '--z': 20 } as Vars}
        >
          <div className="flex items-center gap-2">
            <Bar w={60} h={14} className="sk-accent rounded" />
            <Bar w={140} h={9} />
          </div>
          <Lines widths={['66%', '52%']} h={16} gap={10} className="w-full justify-items-center" />
          <Bar w={150} h={9} />
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <Bar w={130} h={40} z={12} className="rounded-lg" />
      </div>
      <div className="mt-4 flex justify-center">
        <Bar w={200} h={9} />
      </div>
      <FooterBar />
    </SkeletonPage>
  );
}
